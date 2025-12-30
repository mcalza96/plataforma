/**
 * Pure TypeScript Value Objects for the Domain.
 * No dependencies on external frameworks.
 */

export class CourseTitle {
    private readonly value: string;

    constructor(value: string) {
        if (!value || value.length < 5) {
            throw new Error('El título debe ser más inspirador (mín. 5 caracteres)');
        }
        this.value = value;
    }

    toString(): string {
        return this.value;
    }
}

export class VideoUrl {
    private readonly value: string;

    constructor(value: string) {
        // More permissive URL pattern to support various platforms (YouTube, Loom, etc) and parameters
        const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
        if (!value || !urlPattern.test(value.trim())) {
            throw new Error('Necesitamos una URL de video (MP4/Loom) válida');
        }
        this.value = value.trim();
    }

    toString(): string {
        return this.value;
    }
}

export class LessonOrder {
    private readonly value: number;

    constructor(value: number) {
        if (!Number.isInteger(value) || value < 1) {
            throw new Error('El orden debe ser un entero positivo');
        }
        this.value = value;
    }

    toNumber(): number {
        return this.value;
    }
}
