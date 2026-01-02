import { IStudentRepository } from '../../domain/repositories/learner-repository';
import { Student } from '../../domain/entities/learner';
import { TeacherTenantDTO } from '../../domain/dtos/learner';
import { createClient } from './supabase-server';
import { PathMutation } from '../../domain/triage';

export class SupabaseLearnerRepository implements IStudentRepository {
    async getStudentById(studentId: string): Promise<Student | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('learners')
            .select('*')
            .eq('id', studentId)
            .single();

        if (error) {
            console.error('Error fetching student in repository:', error);
            return null;
        }

        return data;
    }

    async getTeachers(): Promise<TeacherTenantDTO[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                mappings:teacher_student_mapping (
                    student:learners (*)
                )
            `)
            .eq('role', 'teacher') // Filter by teacher role to be explicit
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching teachers in repository:', error);
            throw new Error('No se pudieron obtener los profesores.');
        }

        // Flatten structure: mapping -> student
        return (data || []).map((teacher: any) => ({
            ...teacher,
            students: teacher.mappings?.map((m: any) => m.student).filter(Boolean) || []
        }));
    }

    async getTeacherById(id: string): Promise<TeacherTenantDTO | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                mappings:teacher_student_mapping (
                    student:learners (*)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching teacher in repository:', error);
            throw new Error('No se pudo encontrar el profesor solicitado.');
        }

        return {
            ...data,
            students: data.mappings?.map((m: any) => m.student).filter(Boolean) || []
        };
    }

    async updateStudentLevel(studentId: string, newLevel: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('learners')
            .update({ level: newLevel })
            .eq('id', studentId);

        if (error) {
            console.error('Error updating student level in repository:', error);
            throw new Error('Error al actualizar el nivel.');
        }
    }

    async updateUserRole(userId: string, newRole: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            console.error('Error updating user role in repository:', error);
            throw new Error('Error al actualizar el rol.');
        }
    }

    async createStudent(data: {
        teacherId: string;
        displayName: string;
        avatarUrl: string;
    }): Promise<Student> {
        const supabase = await createClient();
        const { data: dbData, error } = await supabase
            .from('learners')
            .insert({
                // teacher_id removido de la tabla learners
                display_name: data.displayName,
                avatar_url: data.avatarUrl,
                level: 1
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating student in repository:', error);
            throw new Error(error.message);
        }

        return dbData;
    }

    async ensureProfileExists(data: {
        id: string;
        email: string;
        fullName: string;
    }): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase.from('profiles').upsert({
            id: data.id,
            email: data.email,
            full_name: data.fullName,
        });

        if (error) {
            console.error('Error ensuring profile existence in repository:', data.id, error);
            throw new Error(`No se pudo crear tu perfil de profesor: ${error.message}.`);
        }
    }

    async getStudentsByTeacherId(teacherId: string): Promise<Student[]> {
        const supabase = await createClient();
        // JOIN con teacher_student_mapping para obtener los estudiantes del profesor
        const { data, error } = await supabase
            .from('teacher_student_mapping')
            .select(`
                student:learners (
                    *
                )
            `)
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching students for teacher in repository:', error);
            throw new Error('Error al obtener los estudiantes.');
        }

        // Mapear resultado para devolver array de Student
        return (data || []).map((item: any) => item.student).filter(Boolean);
    }

    async getAllStudents(): Promise<Student[]> {
        const supabase = await createClient();

        // Obtenemos todos los estudiantes y sus profesores asignados
        const { data, error } = await supabase
            .from('learners')
            .select(`
                *,
                mappings:teacher_student_mapping (
                    teacher:profiles (
                        id,
                        full_name,
                        email
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all students:', error);
            throw new Error('Error al obtener el directorio de estudiantes.');
        }

        return (data || []).map((item: any) => ({
            ...item,
            teachers: item.mappings?.map((m: any) => m.teacher) || []
        }));
    }

    async executeGraphMutations(studentId: string, mutations: PathMutation[]): Promise<boolean> {
        const supabase = await createClient();
        const { TriageMutationService } = await import('../../application/services/triage-mutation-service');
        const service = new TriageMutationService(supabase);
        return service.executeMutations(studentId, mutations);
    }

    async getStandaloneAssignments(studentId: string): Promise<import('../../domain/dtos/learner').StandaloneExamAssignment[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('exam_assignments')
            .select(`
                id,
                status,
                assigned_at,
                origin_context,
                exam:exams (
                    id,
                    title,
                    config_json
                )
            `)
            .eq('student_id', studentId)
            .in('origin_context', ['standalone', 'manual_intervention'])
            .order('assigned_at', { ascending: false });

        if (error) {
            console.error('Error fetching standalone assignments:', error);
            return [];
        }

        return (data || []).map((item: any) => {
            const matrix = item.exam?.config_json || {};
            const subject = matrix.subject || 'Competencias Generales';
            const audience = matrix.targetAudience || 'General';

            return {
                assignmentId: item.id,
                examId: item.exam?.id,
                examTitle: item.exam?.title,
                subject,
                targetAudience: audience,
                status: item.status,
                assignedAt: item.assigned_at,
                originContext: item.origin_context
            };
        });
    }
}
