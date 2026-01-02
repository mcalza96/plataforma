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
