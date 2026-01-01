import { IStudentRepository } from '../../domain/repositories/learner-repository';
import { Student } from '../../domain/entities/learner';
import { TeacherTenantDTO } from '../../domain/dtos/learner';
import { createClient } from './supabase-server';

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
                students:learners (*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching teachers in repository:', error);
            throw new Error('No se pudieron obtener los profesores.');
        }

        return data || [];
    }

    async getTeacherById(id: string): Promise<TeacherTenantDTO | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                students:learners (*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching teacher in repository:', error);
            throw new Error('No se pudo encontrar el profesor solicitado.');
        }

        return data;
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
                teacher_id: data.teacherId,
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
        const { data, error } = await supabase
            .from('learners')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching students for teacher in repository:', error);
            throw new Error('Error al obtener los estudiantes.');
        }

        return data || [];
    }
}
