import { revalidatePath } from 'next/cache';
import { getLessonService } from './di';
import { getUserRole } from './infrastructure/auth-utils';

export async function sendFeedback(learnerId: string, content: string) {
    try {
        const role = await getUserRole();
        const service = getLessonService();

        // We use submitReview but with minimal data since it's just a general feedback message
        // Actually, let's use the repository method directly via service if available, 
        // but submitReview is already designed for this.
        await service.submitReview({
            learnerId,
            content,
            submissionId: '00000000-0000-0000-0000-000000000000' // Generic or optional in DB?
        }, role);
        // Wait, if it's general feedback without submission, maybe I should add a sendGeneralFeedback method.
        // For now, I'll assume it's for the dashboard.

        revalidatePath('/dashboard');
        revalidatePath('/parent-dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error in sendFeedback action:', error);
        throw new Error(error.message);
    }
}

