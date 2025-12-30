import { Learner } from '../entities/learner';
import { FamilyDTO } from '../dtos/learner';

export interface ILearnerRepository {
    getLearnerById(learnerId: string): Promise<Learner | null>;
    getFamilies(): Promise<FamilyDTO[]>;
    getFamilyById(id: string): Promise<FamilyDTO | null>;
    updateLearnerLevel(learnerId: string, newLevel: number): Promise<void>;
    updateUserRole(userId: string, newRole: string): Promise<void>;
    createLearner(data: {
        parentId: string;
        displayName: string;
        avatarUrl: string;
    }): Promise<Learner>;
    ensureProfileExists(data: {
        id: string;
        email: string;
        fullName: string;
    }): Promise<void>;
    getLearnersByParentId(parentId: string): Promise<Learner[]>;
}
