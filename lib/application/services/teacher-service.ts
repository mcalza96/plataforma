import { IStudentRepository } from '../../domain/repositories/learner-repository';
import { TeacherTenantDTO } from '../../domain/dtos/learner';
import { AuthGuard } from '../guards/auth-guard';

export class TeacherService {
    constructor(private learnerRepository: IStudentRepository) { }

    async getTeachers(userRole: string): Promise<TeacherTenantDTO[]> {
        AuthGuard.check(userRole, ['admin']);
        return this.learnerRepository.getTeachers();
    }

    async getTeacherById(id: string, userRole: string): Promise<TeacherTenantDTO | null> {
        AuthGuard.check(userRole, ['admin', 'teacher', 'instructor']);
        return this.learnerRepository.getTeacherById(id);
    }
}
