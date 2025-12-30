/**
 * Base Domain Error
 */
export class DomainError extends Error {
    constructor(message: string, public readonly code?: string) {
        super(message);
        this.name = 'DomainError';
        Object.setPrototypeOf(this, DomainError.prototype);
    }
}

/**
 * Resource not found
 */
export class NotFoundError extends DomainError {
    constructor(resource: string, identifier: string) {
        super(`${resource} con identificador ${identifier} no fue encontrado.`, 'NOT_FOUND');
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Insufficient permissions
 */
export class UnauthorizedError extends DomainError {
    constructor(message: string = 'No tienes permisos para realizar esta acción.') {
        super(message, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

/**
 * Invariant or business constraint violation
 */
export class InvariantError extends DomainError {
    constructor(message: string) {
        super(message, 'INVARIANT_VIOLATION');
        this.name = 'InvariantError';
        Object.setPrototypeOf(this, InvariantError.prototype);
    }
}
