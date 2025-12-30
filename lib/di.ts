import { SupabaseCourseRepository } from './infrastructure/supabase/supabase-course-repository';
import { SupabaseLessonRepository } from './infrastructure/supabase/supabase-lesson-repository';
import { SupabaseContentRepository } from './infrastructure/supabase/supabase-content-repository';
import {
    ICourseReader,
    ICourseWriter,
    ILearnerRepository,
    IStatsRepository
} from './repositories/course-repository';
import { ILessonRepository } from './repositories/lesson-repository';
import { IContentRepository } from './repositories/content-repository';
import { CourseService } from './services/course-service';
import { LessonService } from './services/lesson-service';
import { MetadataService } from './services/metadata-service';
import { AIOrchestratorService } from './services/ai-orchestrator-service';
import { IAIProvider } from './domain/ports';
import { LangChainAIAdapter } from './adapters/ai-adapter';

/**
 * Dependency Injection container / Service Locator.
 * Provides instances of our repositories and services.
 */

// Repositories & Adapters
let supabaseCourseRepo: SupabaseCourseRepository | null = null;
let lessonRepository: ILessonRepository | null = null;
let contentRepository: IContentRepository | null = null;
let aiProvider: IAIProvider | null = null;

// Services
let courseService: CourseService | null = null;
let lessonService: LessonService | null = null;
let metadataService: MetadataService | null = null;
let aiOrchestratorService: AIOrchestratorService | null = null;

/**
 * Getters for Segregated Course Repositories
 */
function getSupabaseCourseRepo(): SupabaseCourseRepository {
    if (!supabaseCourseRepo) supabaseCourseRepo = new SupabaseCourseRepository();
    return supabaseCourseRepo;
}

export function getCourseReader(): ICourseReader { return getSupabaseCourseRepo(); }
export function getCourseWriter(): ICourseWriter { return getSupabaseCourseRepo(); }
export function getLearnerRepository(): ILearnerRepository { return getSupabaseCourseRepo(); }
export function getStatsRepository(): IStatsRepository { return getSupabaseCourseRepo(); }

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
 * Singleton instance of the Course Service.
 */
export function getCourseService(): CourseService {
    if (!courseService) {
        courseService = new CourseService(
            getCourseReader(),
            getCourseWriter(),
            getLearnerRepository(),
            getStatsRepository()
        );
    }
    return courseService;
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
        const apiKey = process.env.GROQ_API_KEY || '';
        metadataService = new MetadataService(apiKey);
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
