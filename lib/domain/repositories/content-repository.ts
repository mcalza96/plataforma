import { AtomicLearningObject } from '../schemas/alo';
import { CreateALOInput } from '../dtos/alo';


export interface IContentRepository {
    createContent(data: CreateALOInput, creatorId: string): Promise<AtomicLearningObject>;
    getContentById(id: string): Promise<AtomicLearningObject | null>;
    getAllPublicContent(): Promise<AtomicLearningObject[]>;
    getCreatorContent(creatorId: string): Promise<AtomicLearningObject[]>;
    findRelevantItems(queryVector: number[], limit?: number): Promise<AtomicLearningObject[]>;
    deleteContent(id: string): Promise<void>;
}
