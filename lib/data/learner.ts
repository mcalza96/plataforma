import 'server-only';
import { cache } from 'react';
import { getStudentRepository } from '@/lib/infrastructure/di';
import { Student } from '@/lib/domain/entities/learner';

/**
 * Fetch student profile by ID.
 * Optimized with React.cache for per-request memoization.
 */
export const getStudentById = cache(async (studentId: string): Promise<Student | null> => {
    const repository = getStudentRepository();
    return repository.getStudentById(studentId);
});
