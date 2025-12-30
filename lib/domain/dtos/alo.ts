import { AtomicLearningObject } from '../schemas/alo';

export type CreateALOInput = Omit<AtomicLearningObject, 'id' | 'created_at' | 'created_by'> & {
    is_public?: boolean;
    payload: any;
};

export type UpsertALOInput = Partial<AtomicLearningObject> & { id: string };
