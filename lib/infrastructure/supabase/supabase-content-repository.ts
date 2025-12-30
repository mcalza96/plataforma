import { createClient } from '../../infrastructure/supabase/supabase-server';
import { AtomicLearningObject, CreateALOInput } from '../../domain/course';
import { IContentRepository } from '../../repositories/content-repository';

export class SupabaseContentRepository implements IContentRepository {
    async createContent(data: CreateALOInput, creatorId: string): Promise<AtomicLearningObject> {
        const supabase = await createClient();

        const payload = {
            title: data.title,
            description: data.description,
            type: data.type,
            payload: data.payload,
            metadata: data.metadata || {},
            is_public: data.is_public ?? false,
            created_by: creatorId,
            updated_at: new Date().toISOString()
        };

        const { data: content, error } = await supabase
            .from('content_library')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error creating content:', error);
            throw new Error(`Error al crear contenido: ${error.message}`);
        }

        return content as AtomicLearningObject;
    }

    async getContentById(id: string): Promise<AtomicLearningObject | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('content_library')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as AtomicLearningObject;
    }

    async getAllPublicContent(): Promise<AtomicLearningObject[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('content_library')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as AtomicLearningObject[];
    }

    async getCreatorContent(creatorId: string): Promise<AtomicLearningObject[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('content_library')
            .select('*')
            .eq('created_by', creatorId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as AtomicLearningObject[];
    }

    async findRelevantItems(queryVector: number[], limit: number = 5): Promise<AtomicLearningObject[]> {
        const supabase = await createClient();

        // Uso de RPC para búsqueda por proximidad de coseno
        // Debemos crear esta función en SQL si no existe
        const { data, error } = await supabase.rpc('match_content', {
            query_embedding: queryVector,
            match_threshold: 0.5,
            match_count: limit
        });

        if (error) {
            console.error('Error in vector search:', error);
            return [];
        }

        return data as AtomicLearningObject[];
    }

    async deleteContent(id: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('content_library')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
