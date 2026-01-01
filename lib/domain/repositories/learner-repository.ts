import { Student } from '../entities/learner';
import { TeacherTenantDTO } from '../dtos/learner';

export interface IStudentRepository {
    getStudentById(studentId: string): Promise<Student | null>;
    getTeachers(): Promise<TeacherTenantDTO[]>;
    getTeacherById(id: string): Promise<TeacherTenantDTO | null>;
    updateStudentLevel(studentId: string, newLevel: number): Promise<void>;
    updateUserRole(userId: string, newRole: string): Promise<void>;
    createStudent(data: {
        teacherId: string;
        displayName: string;
        avatarUrl: string;
    }): Promise<Student>;
    ensureProfileExists(data: {
        id: string;
        email: string;
        fullName: string;
    }): Promise<void>;
    getStudentsByTeacherId(teacherId: string): Promise<Student[]>;
}
