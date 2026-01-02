import { SupabaseContentRepository } from '@/lib/infrastructure/supabase/supabase-content-repository';
import { SupabaseCompetencyRepository } from '@/lib/infrastructure/supabase/supabase-competency-repository';
import { SupabaseLearnerRepository } from '@/lib/infrastructure/supabase/supabase-learner-repository';
import { SupabaseStatsRepository } from '@/lib/infrastructure/supabase/supabase-stats-repository';
import { SupabaseSubmissionRepository } from '@/lib/infrastructure/supabase/supabase-submission-repository';

import { IStudentRepository } from '@/lib/domain/repositories/learner-repository';
import { IStatsRepository } from '@/lib/domain/repositories/stats-repository';
import { IContentRepository } from '@/lib/domain/repositories/content-repository';
import { ICompetencyRepository } from '@/lib/domain/repositories/competency-repository';
import { ISubmissionRepository } from '@/lib/domain/repositories/submission-repository';

import { SubmissionService } from '@/lib/application/services/submission-service';
import { FeedbackService } from '@/lib/application/services/feedback-service';
import { MetadataService } from '@/lib/application/services/metadata';
import { AIOrchestratorService } from '@/lib/application/services/orchestrator';
import { StudentService } from '@/lib/application/services/student-service';
import { TeacherService } from '@/lib/application/services/teacher-service';
import { AdminService } from '@/lib/application/services/admin-service';

import { IAIProvider } from '@/lib/domain/repositories/ai-provider';
import { LangChainAIAdapter } from '@/lib/adapters/ai-adapter';


/**
 * Dependency Injection container / Service Locator.
 * Provides instances of our repositories and services.
 */

// Repositories & Adapters
let studentRepository: IStudentRepository | null = null;
let statsRepository: IStatsRepository | null = null;
let contentRepository: IContentRepository | null = null;
let competencyRepository: ICompetencyRepository | null = null;
let submissionRepository: ISubmissionRepository | null = null;
let aiProvider: IAIProvider | null = null;

// Services
let submissionService: SubmissionService | null = null;
let feedbackService: FeedbackService | null = null;
let metadataService: MetadataService | null = null;
let aiOrchestratorService: AIOrchestratorService | null = null;
let studentService: StudentService | null = null;
let teacherService: TeacherService | null = null;
let adminService: AdminService | null = null;

export function getStudentRepository(): IStudentRepository {
    if (!studentRepository) studentRepository = new SupabaseLearnerRepository();
    return studentRepository;
}

export function getStatsRepository(): IStatsRepository {
    if (!statsRepository) statsRepository = new SupabaseStatsRepository();
    return statsRepository;
}

export function getSubmissionRepository(): ISubmissionRepository {
    if (!submissionRepository) submissionRepository = new SupabaseSubmissionRepository();
    return submissionRepository;
}

/**
 * Singleton instance of the Competency Repository.
 */
export function getCompetencyRepository(): ICompetencyRepository {
    if (!competencyRepository) {
        competencyRepository = new SupabaseCompetencyRepository();
    }
    return competencyRepository;
}

/**
 * Singleton instance of the Student Service.
 */
export function getStudentService(): StudentService {
    if (!studentService) {
        studentService = new StudentService(
            getStudentRepository(),
            getStatsRepository()
        );
    }
    return studentService;
}

/**
 * Singleton instance of the Teacher Service.
 */
export function getTeacherService(): TeacherService {
    if (!teacherService) {
        teacherService = new TeacherService(getStudentRepository());
    }
    return teacherService;
}

/**
 * Singleton instance of the Admin Service.
 */
export function getAdminService(): AdminService {
    if (!adminService) {
        adminService = new AdminService(
            getStudentRepository(),
            getStatsRepository()
        );
    }
    return adminService;
}

/**
 * Singleton instance of the Content Repository.
 */
export function getContentRepository(): IContentRepository {
    if (!contentRepository) {
        contentRepository = new SupabaseContentRepository();
    }
    return contentRepository;
}

/**
 * Singleton instance of the AI Provider (Adapter).
 */
export function getAIProvider(): IAIProvider {
    if (!aiProvider) {
        const groqKey = process.env.GROQ_API_KEY || '';
        const openaiKey = process.env.OPENAI_API_KEY || '';
        aiProvider = new LangChainAIAdapter(groqKey, openaiKey);
    }
    return aiProvider;
}

/**
 * Singleton instance of the Metadata Service (Groq).
 */
export function getMetadataService(): MetadataService {
    if (!metadataService) {
        metadataService = new MetadataService();
    }
    return metadataService;
}

/**
 * Singleton instance of the AI Orchestrator Service.
 */
export function getAIOrchestratorService(): AIOrchestratorService {
    if (!aiOrchestratorService) {
        aiOrchestratorService = new AIOrchestratorService(
            getAIProvider(),
            getContentRepository()
        );
    }
    return aiOrchestratorService;
}

/**
 * Singleton instance of the Submission Service.
 */
export function getSubmissionService(): SubmissionService {
    if (!submissionService) {
        submissionService = new SubmissionService(getSubmissionRepository());
    }
    return submissionService;
}

/**
 * Singleton instance of the Feedback Service.
 */
export function getFeedbackService(): FeedbackService {
    if (!feedbackService) {
        feedbackService = new FeedbackService(getSubmissionRepository());
    }
    return feedbackService;
}
