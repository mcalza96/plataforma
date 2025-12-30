import { Course } from './course';

/**
 * Learner Entity - Rich Domain Model
 */
export class Learner {
    constructor(
        public readonly id: string,
        public readonly parent_id: string,
        public display_name: string,
        public level: number,
        public avatar_url?: string
    ) { }

    /**
     * Business Rule: Check if the learner has enough level to access a course.
     */
    public canAccess(course: Course): boolean {
        return this.level >= course.level_required;
    }

    /**
     * Business Rule: Upgrades learner level with validation.
     */
    public upgradeLevel(newLevel: number): void {
        if (newLevel < 1 || newLevel > 10) {
            throw new Error('El nivel debe estar entre 1 y 10.');
        }
        if (newLevel <= this.level) {
            return; // Only upgrades allowed
        }
        this.level = newLevel;
    }
}

/**
 * Profile Entity - Rich Domain Model
 */
export class Profile {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public full_name: string | null,
        public role: string
    ) { }

    public isAdmin(): boolean {
        return this.role === 'admin';
    }

    public isInstructor(): boolean {
        return this.role === 'instructor' || this.role === 'admin';
    }

    public isFamily(): boolean {
        return this.role === 'family';
    }
}
