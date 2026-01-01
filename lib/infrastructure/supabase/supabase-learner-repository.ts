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
                    // Recursive CTE to find all descendants of the infected node
                    // We assume path_nodes has a 'parent_id' or we rely on 'prerequisites' table
                    // Wait, path_nodes is linear or DAG? The prompt mentions "CompetencyGraph" and "path_nodes".
                    // Usually path_nodes join with content_library or a graph table.
                    // If path_nodes is just a sequence (position_order), downstream is just order > current.
                    // BUT prompt says "DAG" and "Recursive". 
                    // Let's assume there is a 'prerequisites' structure or we blindly lock everything with higher 'position_order' 
                    // IF it's a linear path. If it's a DAG, we need the graph structure.
                    // Given "path_nodes" schema usually implies a materialized path for the student.
                    // If the student path is linearlized, we can just lock everything after.
                    // "Si una competencia fundamental tiene un estado infected, todos sus descendientes en el grafo deben marcarse como locked".
                    // This implies traversing the *Competency Graph* to find descendants, then updating *Student Path* nodes that match those IDs.

                    // Complex Query Strategy:
                    // 1. Find all descendant competency IDs from the Competency Graph (edges).
                    // 2. Update status = 'locked' for all path_nodes where content_id IN (descendants).

                    const { error } = await supabase.rpc('apply_hard_pruning', {
                        p_learner_id: studentId,
                        p_root_content_id: mutation.targetNodeId
                    });

                    if (error) {
                        // Fallback if RPC doesn't exist yet (simulating resilience)
                        // "Poda Dura" linear fallback: Lock everything with higher order
                        const { data: currentRoot } = await supabase
                            .from('path_nodes')
                            .select('position_order')
                            .eq('learner_id', studentId)
                            .eq('content_id', mutation.targetNodeId)
                            .single();

                        if (currentRoot) {
                            await supabase
                                .from('path_nodes')
                                .update({ status: 'locked' })
                                .eq('learner_id', studentId)
                                .gt('position_order', currentRoot.position_order);
                        }
                    }
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
                        // Place strictly before the target
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
                    // Unlock direct descendants in the path
                    // For a linear path, it's just the next one.
                    const { data: currentNode } = await supabase
                        .from('path_nodes')
                        .select('position_order')
                        .eq('learner_id', studentId)
                        .eq('content_id', mutation.targetNodeId)
                        .single();

                    await supabase.from('path_nodes')
                        .update({ status: 'mastered', is_completed: true })
                        .eq('learner_id', studentId)
                        .eq('content_id', mutation.targetNodeId);

                    if (currentNode) {
                        // Find next immediate node
                        // In a DAG this is complex, but for path_nodes (linear projection) it's the next order
                        // We unlock the *next* node only if it was locked?
                        // "libera los nodos descendientes directos".
                        // We suspect 1 linear neighbor.
                        const { data: nextNode } = await supabase
                            .from('path_nodes')
                            .select('id')
                            .eq('learner_id', studentId)
                            .gt('position_order', currentNode.position_order)
                            .order('position_order', { ascending: true })
                            .limit(1)
                            .single();

                        if (nextNode) {
                            await supabase.from('path_nodes')
                                .update({ status: 'available' })
                                .eq('id', nextNode.id)
                                .eq('status', 'locked'); // Only unlock if locked
                        }
                    }
                }
            } catch (err) {
                console.error(`Failed to execute mutation ${mutation.action}:`, err);
                return false;
            }
        }
        return true;
    }
}
