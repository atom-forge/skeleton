import {rpc} from '@atom-forge/rpc';
import type {ModuleError} from '../module/module-error';

const defaultMessages: Record<string, string> = {
	PERMISSION_DENIED: 'Nincs jogosultságod ehhez a művelethez.',
	USER_NOT_FOUND: 'A felhasználó nem található.',
	NOT_FOUND: 'A keresett elem nem található.',
};

export function moduleErrorToRpc(
	error: ModuleError,
	messages: Record<string, string> = {},
	fallback = 'A műveletet nem sikerült végrehajtani.',
) {
	const message = messages[error.code] ?? defaultMessages[error.code] ?? fallback;
	if (error.is('PERMISSION_DENIED')) return rpc.error.permissionDenied({message});
	return rpc.error.make(error.code, message);
}
