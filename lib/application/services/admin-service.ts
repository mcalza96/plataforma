import { IStudentRepository } from '../../domain/repositories/learner-repository';
import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { AuthGuard } from '../guards/auth-guard';

export class AdminService {
    constructor(
        private learnerRepository: IStudentRepository,
        private statsRepository: IStatsRepository
    ) { }

    async updateUserRole(targetUserId: string, targetNewRole: string, currentUserId: string, currentUserRole: string): Promise<void> {
        AuthGuard.check(currentUserRole, ['admin']);
        if (currentUserId === targetUserId && targetNewRole !== 'admin') {
            throw new Error('No puedes quitarte el rol de administrador a ti mismo.');
        }
        return this.learnerRepository.updateUserRole(targetUserId, targetNewRole);
    }

    async getGlobalStats(currentUserRole: string, teacherId?: string) {
        AuthGuard.check(currentUserRole, ['admin']);
        return this.statsRepository.getGlobalStats(teacherId);
    }

    /**
     * EMPIRICAL CALIBRATION ENGINE (Phase 6)
     * Analyzes cohort performance to detect broken items and drift.
     */
    async runCalibrationCycle(examId: string, teacherId: string): Promise<boolean> {
        const { createClient } = await import('@/lib/infrastructure/supabase/supabase-server');
        const { ItemCalibrationService } = await import('./analytics/item-calibration-service');
        const supabase = await createClient();

        console.log(`[AdminService] Triggering calibration cycle for exam ${examId}`);
        return ItemCalibrationService.runCalibrationCycle(supabase, examId);
    }
}
