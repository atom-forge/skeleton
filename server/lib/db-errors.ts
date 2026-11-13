/** The name of the constraint a failed write broke when the failure is a unique violation (Postgres 23505); null for any other error. */
export function uniqueViolation(error: unknown): string | null {
	for (let e = error as { code?: unknown; sqlState?: unknown; constraint?: unknown; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
		if (e.code === '23505' || e.sqlState === '23505') return typeof e.constraint === 'string' ? e.constraint : '';
	}
	return null;
}
