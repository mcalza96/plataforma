/**
 * Simple permission guard for Use Cases.
 */
export type UserRole = 'admin' | 'instructor' | 'student' | 'teacher';

export class AuthGuard {
    /**
     * Checks if the user has the required role.
     * Throws an error if not authorized.
     */
    static check(userRole: string, allowedRoles: UserRole[]): void {
        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new Error(`Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`);
        }
    }
}

/**
 * Higher-Order Function to wrap use cases with permission checks.
 */
export function withPermission<T, R>(
    useCase: { execute: (data: T) => Promise<R> },
    allowedRoles: UserRole[]
) {
    return async (data: T, userRole: string): Promise<R> => {
        AuthGuard.check(userRole, allowedRoles);
        return useCase.execute(data);
    };
}
