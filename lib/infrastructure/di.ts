import { SupabaseCourseRepository } from '@/lib/infrastructure/supabase/supabase-course-repository';
import { SupabaseLessonRepository } from '@/lib/infrastructure/supabase/supabase-lesson-repository';
import { SupabaseContentRepository } from '@/lib/infrastructure/supabase/supabase-content-repository';
import { SupabaseCompetencyRepository } from '@/lib/infrastructure/supabase/supabase-competency-repository';
import { SupabaseLearnerRepository } from '@/lib/infrastructure/supabase/supabase-learner-repository';
import { SupabaseStatsRepository } from '@/lib/infrastructure/supabase/supabase-stats-repository';

import {
    ICourseReader,
    ICourseWriter
} from '@/lib/domain/repositories/course-repository';
import { ILearnerRepository } from '@/lib/domain/repositories/learner-repository';
import { IStatsRepository } from '@/lib/domain/repositories/stats-repository';
import { ILessonRepository } from '@/lib/domain/repositories/lesson-repository';
import { IContentRepository } from '@/lib/domain/repositories/content-repository';
import { ICompetencyRepository } from '@/lib/domain/repositories/competency-repository';

import { CourseService } from '@/lib/application/services/course-service';
import { LessonService } from '@/lib/application/services/lesson-service';
import { SubmissionService } from '@/lib/application/services/submission-service';
import { FeedbackService } from '@/lib/application/services/feedback-service';
import { MetadataService } from '@/lib/application/services/metadata';
import { AIOrchestratorService } from '@/lib/application/services/orchestrator';
import { LearnerService } from '@/lib/application/services/learner-service';
import { FamilyService } from '@/lib/application/services/family-service';
import { AdminService } from '@/lib/application/services/admin-service';

import { IAIProvider } from '@/lib/domain/repositories/ai-provider';
import { LangChainAIAdapter } from '@/lib/adapters/ai-adapter';


/**
 * Dependency Injection container / Service Locator.
 * Provides instances of our repositories and services.
 */

// Repositories & Adapters
let supabaseCourseRepo: SupabaseCourseRepository | null = null;
let learnerRepository: ILearnerRepository | null = null;
let statsRepository: IStatsRepository | null = null;
let lessonRepository: ILessonRepository | null = null;
let contentRepository: IContentRepository | null = null;
let competencyRepository: ICompetencyRepository | null = null;
let aiProvider: IAIProvider | null = null;

// Services
let courseService: CourseService | null = null;
let lessonService: LessonService | null = null;
let submissionService: SubmissionService | null = null;
let feedbackService: FeedbackService | null = null;
let metadataService: MetadataService | null = null;
let aiOrchestratorService: AIOrchestratorService | null = null;
let learnerService: LearnerService | null = null;
let familyService: FamilyService | null = null;
let adminService: AdminService | null = null;

/**
 * Getters for Segregated Course Repositories
 */
export function getCourseReader(): ICourseReader {
    if (!supabaseCourseRepo) supabaseCourseRepo = new SupabaseCourseRepository();
    return supabaseCourseRepo;
}

export function getCourseWriter(): ICourseWriter {
    if (!supabaseCourseRepo) supabaseCourseRepo = new SupabaseCourseRepository();
    return supabaseCourseRepo;
}

export function getLearnerRepository(): ILearnerRepository {
    if (!learnerRepository) learnerRepository = new SupabaseLearnerRepository();
    return learnerRepository;
}

export function getStatsRepository(): IStatsRepository {
    if (!statsRepository) statsRepository = new SupabaseStatsRepository();
    return statsRepository;
}

/**
 * Singleton instance of the Lesson Repository.
 */
export function getLessonRepository(): ILessonRepository {
    if (!lessonRepository) {
        lessonRepository = new SupabaseLessonRepository();
    }
    return lessonRepository;
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
 * Singleton instance of the Course Service.
 */
export function getCourseService(): CourseService {
    if (!courseService) {
        courseService = new CourseService(
            getCourseReader(),
            getCourseWriter()
        );
    }
    return courseService;
}

/**
 * Singleton instance of the Learner Service.
 */
export function getLearnerService(): LearnerService {
    if (!learnerService) {
        learnerService = new LearnerService(
            getLearnerRepository(),
            getStatsRepository(),
            getCourseReader()
        );
    }
    return learnerService;
}

/**
 * Singleton instance of the Family Service.
 */
export function getFamilyService(): FamilyService {
    if (!familyService) {
        familyService = new FamilyService(getLearnerRepository());
    }
    return familyService;
}

/**
 * Singleton instance of the Admin Service.
 */
export function getAdminService(): AdminService {
    if (!adminService) {
        adminService = new AdminService(
            getLearnerRepository(),
            getStatsRepository()
        );
    }
    return adminService;
}

/**
 * Singleton instance of the Lesson Service.
 */
export function getLessonService(): LessonService {
    if (!lessonService) {
        lessonService = new LessonService(getLessonRepository(), getCourseReader());
    }
    return lessonService;
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
        submissionService = new SubmissionService(getLessonRepository());
    }
    return submissionService;
}

/**
 * Singleton instance of the Feedback Service.
 */
export function getFeedbackService(): FeedbackService {
    if (!feedbackService) {
        feedbackService = new FeedbackService(getLessonRepository());
    }
    return feedbackService;
}
