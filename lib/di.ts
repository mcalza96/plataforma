import { SupabaseCourseRepository } from './infrastructure/supabase/supabase-course-repository';
import { SupabaseLessonRepository } from './infrastructure/supabase/supabase-lesson-repository';
import { SupabaseContentRepository } from './infrastructure/supabase/supabase-content-repository';
import { SupabaseCompetencyRepository } from './infrastructure/supabase/supabase-competency-repository';
import { SupabaseLearnerRepository } from './infrastructure/supabase/supabase-learner-repository';
import { SupabaseStatsRepository } from './infrastructure/supabase/supabase-stats-repository';

import {
    ICourseReader,
    ICourseWriter
} from './domain/repositories/course-repository';
import { ILearnerRepository } from './domain/repositories/learner-repository';
import { IStatsRepository } from './domain/repositories/stats-repository';
import { ILessonRepository } from './domain/repositories/lesson-repository';
import { IContentRepository } from './domain/repositories/content-repository';
import { ICompetencyRepository } from './domain/repositories/competency-repository';

import { CourseService } from './application/services/course-service';
import { LessonService } from './application/services/lesson-service';
import { MetadataService } from './application/services/metadata';
import { AIOrchestratorService } from './application/services/ai-orchestrator-service';
import { LearnerService } from './application/services/learner-service';
import { FamilyService } from './application/services/family-service';
import { AdminService } from './application/services/admin-service';

import { IAIProvider } from './domain/repositories/ai-provider';
import { LangChainAIAdapter } from './adapters/ai-adapter';


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
