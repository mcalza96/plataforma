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
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlPattern.test(value)) {
            throw new Error('Necesitamos una URL de video (MP4/Loom) válida');
        }
        // Basic check for video platforms if needed
        this.value = value;
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
