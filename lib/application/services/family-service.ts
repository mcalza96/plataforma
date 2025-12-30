import { ILearnerRepository } from '../../domain/repositories/learner-repository';
import { FamilyDTO } from '../../domain/dtos/learner';
import { AuthGuard } from '../guards/auth-guard';

export class FamilyService {
    constructor(private learnerRepository: ILearnerRepository) { }

    async getFamilies(userRole: string): Promise<FamilyDTO[]> {
        AuthGuard.check(userRole, ['admin']);
        return this.learnerRepository.getFamilies();
    }

    async getFamilyById(id: string, userRole: string): Promise<FamilyDTO | null> {
        AuthGuard.check(userRole, ['admin']);
        return this.learnerRepository.getFamilyById(id);
    }
}
