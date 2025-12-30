import { ILearnerRepository } from '../../domain/repositories/learner-repository';
import { Learner } from '../../domain/entities/learner';
import { FamilyDTO } from '../../domain/dtos/learner';
import { createClient } from './supabase-server';

export class SupabaseLearnerRepository implements ILearnerRepository {
    async getLearnerById(learnerId: string): Promise<Learner | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('learners')
            .select('*')
            .eq('id', learnerId)
            .single();

        if (error) {
            console.error('Error fetching learner in repository:', error);
            return null;
        }

        return data;
    }

    async getFamilies(): Promise<FamilyDTO[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                learners (*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching families in repository:', error);
            throw new Error('No se pudieron obtener las familias.');
        }

        return data || [];
    }

    async getFamilyById(id: string): Promise<FamilyDTO | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                learners (*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching family in repository:', error);
            throw new Error('No se pudo encontrar la familia solicitada.');
        }

        return data;
    }

    async updateLearnerLevel(learnerId: string, newLevel: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('learners')
            .update({ level: newLevel })
            .eq('id', learnerId);

        if (error) {
            console.error('Error updating learner level in repository:', error);
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

    async createLearner(data: {
        parentId: string;
        displayName: string;
        avatarUrl: string;
    }): Promise<Learner> {
        const supabase = await createClient();
        const { data: dbData, error } = await supabase
            .from('learners')
            .insert({
                parent_id: data.parentId,
                display_name: data.displayName,
                avatar_url: data.avatarUrl,
                level: 1
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating learner in repository:', error);
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
            throw new Error(`No se pudo crear tu perfil de padre: ${error.message}.`);
        }
    }

    async getLearnersByParentId(parentId: string): Promise<Learner[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('learners')
            .select('*')
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching learners for parent in repository:', error);
            throw new Error('Error al obtener los alumnos.');
        }

        return data || [];
    }
}
