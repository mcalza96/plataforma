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

    async executeGraphMutations(studentId: string, mutations: PathMutation[]): Promise<boolean> {
        const supabase = await createClient();

        for (const mutation of mutations) {
            try {
                // 1. FOG OF WAR: Hard Pruning (Recursive Lock)
                if (mutation.action === 'LOCK_DOWNSTREAM') {
                    // In a real implementation: call rpc('lock_downstream_nodes', { start_node_id: mutation.targetNodeId })
                    // For now, we simulate a "Kill Switch" for the specific competency
                    await supabase.from('path_nodes')
                        .update({ status: 'locked' })
                        .eq('learner_id', studentId)
                        .eq('content_id', mutation.targetNodeId);
                }

                // 2. INJECTION: Refutation or Scaffolding
                else if (mutation.action === 'INSERT_NODE' && mutation.metadata.contentId) {
                    const { data: targetNode } = await supabase
                        .from('path_nodes')
                        .select('id, position_order')
                        .eq('learner_id', studentId)
                        .eq('content_id', mutation.targetNodeId)
                        .single();

                    if (targetNode) {
                        const newOrder = (targetNode.position_order || 0) - 0.5;

                        await supabase.from('path_nodes').insert({
                            learner_id: studentId,
                            content_id: mutation.metadata.contentId,
                            status: mutation.metadata.newStatus || 'available',
                            position_order: newOrder,
                            title: mutation.metadata.title || `Refuerzo: ${mutation.reason}`,
                            type: 'remediation'
                        });
                    }
                }

                // 3. MASTERY: Unlock Next
                else if (mutation.action === 'UNLOCK_NEXT') {
                    await supabase.from('path_nodes')
                        .update({ status: 'mastered', is_completed: true })
                        .match({ learner_id: studentId, content_id: mutation.targetNodeId });
                }
            } catch (err) {
                console.error(`Failed to execute mutation ${mutation.action}:`, err);
                return false;
            }
        }
        return true;
    }
}
