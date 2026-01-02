import { Student } from '../entities/learner';
import { TeacherTenantDTO } from '../dtos/learner';
import { PathMutation } from '../triage';

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
    getAllStudents(): Promise<Student[]>; // Admin usage


    // Remediation Logic
    executeGraphMutations(studentId: string, mutations: PathMutation[]): Promise<boolean>;

    // Standalone Diagnostics
    getStandaloneAssignments(studentId: string): Promise<import('../dtos/learner').StandaloneExamAssignment[]>;
}
