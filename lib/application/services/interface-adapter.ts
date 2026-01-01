import { Student } from '@/lib/domain/entities/learner';

export type UIMode = 'MISSION' | 'EXPLORER' | 'DASHBOARD';

export class InterfaceAdaptationService {
    /**
     * Infers the optimal UI mode based on the student's age and cognitive profile.
     * 
     * Rules:
     * - 9-12 years: MISSION (High guidance, concrete metaphors)
     * - 13-15 years: EXPLORER (Balanced, technical focus)
     * - 16-18+ years: DASHBOARD (High density, full analytics)
     * 
     * Fallback: EXPLORER mode is used if age is undefined or out of range,
     * assuming a "safe middle ground".
     */
    static getInterfaceMode(student: Student): UIMode {
        if (!student.age) {
            // Default fallback if age is missing
            return 'EXPLORER';
        }

        if (student.age >= 9 && student.age <= 12) {
            return 'MISSION';
        }

        if (student.age >= 13 && student.age <= 15) {
            return 'EXPLORER';
        }

        if (student.age >= 16) {
            return 'DASHBOARD';
        }

        // For very young or unspecified cases outside ranges
        return 'MISSION';
    }

    /**
     * Returns configuration tokens for the UI based on the mode.
     * Useful for spacing, visibility toggles, and copy.
     */
    static getConfig(mode: UIMode) {
        switch (mode) {
            case 'MISSION':
                return {
                    density: 'comfortable',
                    showCognitiveMirror: false, // Too complex
                    showFullKnowledgeGraph: false, // Just next step
                    copystyle: 'game-like', // "Misión del día"
                    gridColumns: 'grid-cols-1 max-w-2xl'
                };
            case 'EXPLORER':
                return {
                    density: 'standard',
                    showCognitiveMirror: true, // Simplified version maybe
                    showFullKnowledgeGraph: true,
                    copystyle: 'technical',
                    gridColumns: 'grid-cols-1 lg:grid-cols-2'
                };
            case 'DASHBOARD':
                return {
                    density: 'compact',
                    showCognitiveMirror: true,
                    showFullKnowledgeGraph: true,
                    copystyle: 'analytical',
                    gridColumns: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                };
        }
    }
}
