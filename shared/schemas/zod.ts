import { z } from 'zod';

/**
 * Zod with Hungarian messages: every schema in `shared/schemas` imports `z` from here, so the error map is set
 * wherever a schema is parsed (RPC handlers on the server, forms in the browser). Fields with their own wording
 * pass it as the check's message; everything else falls back to these short sentences, written to stand under a
 * labelled field.
 */
z.config({
	customError: (issue) => {
		const missing = issue.input === undefined || issue.input === null || (typeof issue.input === 'string' && !issue.input.trim());
		switch (issue.code) {
			case 'invalid_type':
				if (missing) return 'Kötelező mező.';
				if (issue.expected === 'date') return 'Érvénytelen dátum.';
				if (issue.expected === 'number' || issue.expected === 'int') return 'Számot adj meg.';
				return 'Érvénytelen érték.';
			case 'too_small': {
				const min = Number(issue.minimum);
				if (issue.origin === 'string') return min <= 1 ? 'Kötelező mező.' : `Legalább ${min} karakter legyen.`;
				if (issue.origin === 'array' || issue.origin === 'set') return min <= 1 ? 'Válassz legalább egyet.' : `Legalább ${min} elemet válassz.`;
				return `Legalább ${min} legyen.`;
			}
			case 'too_big': {
				const max = Number(issue.maximum);
				if (issue.origin === 'string') return `Legfeljebb ${max} karakter lehet.`;
				if (issue.origin === 'array' || issue.origin === 'set') return `Legfeljebb ${max} elemet választhatsz.`;
				return `Legfeljebb ${max} lehet.`;
			}
			case 'invalid_format':
				if (issue.format === 'email') return 'Érvénytelen e-mail cím.';
				if (issue.format === 'url') return 'Érvénytelen webcím.';
				if (issue.format === 'uuid' || issue.format === 'guid') return 'Érvénytelen azonosító.';
				return 'Érvénytelen formátum.';
			case 'invalid_value':
				return 'Válassz a lehetőségek közül.';
			default:
				return 'Érvénytelen érték.';
		}
	}
});

export { z };

/** Record id. */
export const id = () => z.uuid();

/** Required text, trimmed; `required` is the message when it is left empty. */
export const requiredText = (max: number, required = 'Kötelező mező.') => z.string().trim().min(1, required).max(max);

/** Optional text, trimmed (may be empty). */
export const optionalText = (max: number) => z.string().trim().max(max);

/** An uploaded file. */
export const upload = () => z.instanceof(File, { message: 'Válassz fájlt.' });

/** Page number of a paged list. */
export const pageNumber = () => z.number().int().min(1);

/** Arguments of a call that acts on one record. */
export const IdSchema = z.object({ id: id() });

/** Arguments of a call that takes none. */
export const EmptySchema = z.object({});
