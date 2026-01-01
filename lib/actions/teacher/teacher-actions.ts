'use server';

import { getStudentService, getFeedbackService } from '@/lib/infrastructure/di';
import { StudentStats, KnowledgeDelta, LearningFrontier } from '@/lib/domain/dtos/learner';

export async function getStudentFullStats(studentId: string): Promise<StudentStats> {
    const service = getStudentService();
    return await service.getStudentFullStats(studentId);
}

export async function getTeacherFeedback(studentId: string) {
    const service = getFeedbackService();
    return await service.getStudentFeedback(studentId);
}

export async function getStudentAchievements(studentId: string) {
    const service = getStudentService();
    return await service.getStudentAchievements(studentId);
}

export async function getKnowledgeDelta(studentId: string): Promise<KnowledgeDelta[]> {
    const service = getStudentService();
    return await service.calculateKnowledgeDelta(studentId);
}

export async function getLearningFrontier(studentId: string): Promise<LearningFrontier[]> {
    const service = getStudentService();
    return await service.getStudentFrontier(studentId);
}
