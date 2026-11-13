export const ModuleErrors = {
	PermissionDenied: 'PERMISSION_DENIED',
	UserNotFound: 'USER_NOT_FOUND',
	NotFound: 'NOT_FOUND',
} as const;

export type StandardModuleErrorCode = typeof ModuleErrors[keyof typeof ModuleErrors];
export type ModuleErrorCode = StandardModuleErrorCode | (string & {});

export class ModuleError {
	constructor(
		readonly code: ModuleErrorCode,
		readonly details?: unknown,
	) {
	}

	is(code: ModuleErrorCode): boolean {
		return code === this.code;
	}
}

type ModuleErrorFactory = {
	(code: ModuleErrorCode, details?: unknown): ModuleError;
	permissionDenied(details?: unknown): ModuleError;
	userNotFound(details?: unknown): ModuleError;
	notFound(details?: unknown): ModuleError;
};

export const moduleError = Object.assign(
	(code: ModuleErrorCode, details?: unknown) => new ModuleError(code, details),
	{
		permissionDenied: (details?: unknown) => new ModuleError(ModuleErrors.PermissionDenied, details),
		userNotFound: (details?: unknown) => new ModuleError(ModuleErrors.UserNotFound, details),
		notFound: (details?: unknown) => new ModuleError(ModuleErrors.NotFound, details),
	},
) as ModuleErrorFactory;

export function isModuleError(value: unknown): value is ModuleError {
	return value instanceof ModuleError;
}
