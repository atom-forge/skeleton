import { clientLogger, createClient } from '@atom-forge/rpc';
import type { Api } from '#server/application/api/index';

// A típusos RPC-kliens: minden szerverhívás ezen megy (/rpc). A hibák magyar üzenete a szerverről jön (moduleError → rpc-error),
// ami ott nincs, annak itt van tartalék szövege.
export const [api, apiConfig] = createClient<Api>('/rpc');
if (import.meta.env.DEV) apiConfig.$ = clientLogger('/rpc');

type RpcLikeResult = {
	isOK: () => boolean;
	isError: (code?: string) => boolean;
	status?: string;
	result?: unknown;
	error?: unknown;
};

const fallbackMessages: Record<string, string> = {
	INVALID_ARGUMENT: 'Ellenőrizd a megadott adatokat.',
	PERMISSION_DENIED: 'Nincs jogosultságod ehhez a művelethez.',
	INTERNAL_ERROR: 'Szerverhiba történt, próbáld újra.',
	NETWORK_ERROR: 'Nem sikerült kapcsolódni a szerverhez. Ellenőrizd a hálózatot.',
	NOT_FOUND: 'A keresett elem nem található.'
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function readMessage(value: unknown): string | null {
	if (!isRecord(value)) return null;
	const message = value.message;
	return typeof message === 'string' && message.trim().length > 0 ? message : null;
}

function humanizeCode(code: string | undefined): string | null {
	if (!code || code === 'OK') return null;
	if (fallbackMessages[code]) return fallbackMessages[code];
	if (code.startsWith('HTTP:')) {
		const status = code.slice(5);
		if (status === '401') return 'Jelentkezz be újra.';
		if (status === '403') return fallbackMessages.PERMISSION_DENIED!;
		if (status === '404') return 'A kért erőforrás nem található.';
		return 'A kérést nem sikerült teljesíteni.';
	}
	return null;
}

/** The Hungarian message of a failed RPC result. */
export function getRpcErrorMessage(res: RpcLikeResult | unknown, fallback = 'A kérést nem sikerült teljesíteni.'): string {
	if (!isRecord(res)) return fallback;
	const code = typeof res.status === 'string' ? res.status : undefined;
	const resultMessage = readMessage(res.result);
	if (resultMessage && resultMessage !== code) return resultMessage;
	// a zod séma utasította el: az első hiba (magyar) üzenete
	const issues = isRecord(res.result) ? res.result.issues : null;
	if (Array.isArray(issues) && issues.length) {
		const first = readMessage(issues[0]);
		if (first) return first;
	}
	const errorMessage = readMessage(res.error);
	if (errorMessage && errorMessage !== code) return errorMessage;
	return humanizeCode(code) ?? fallback;
}

/** The message of a caught exception (network failure and the like). */
export function getCaughtErrorMessage(error: unknown, fallback = 'A kérést nem sikerült teljesíteni.'): string {
	const message = readMessage(error);
	if (message) return message;
	if (error instanceof TypeError) return fallbackMessages.NETWORK_ERROR!;
	return fallback;
}
