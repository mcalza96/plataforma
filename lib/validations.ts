/**
 * Application Validations.
 * This file acts as a bridge to domain schemas to maintain backward compatibility,
 * but business rules are centralized in lib/domain.
 */

export { AuthSchema } from './domain/auth';
export {
    CourseSchema,
    LessonSchema,
    FeedbackSchema
} from './domain/schemas/course';
export { ALOSchema } from './domain/schemas/alo';

export {
    DiagnosisSchema,
    ProposalSchema
} from './domain/assessment';
