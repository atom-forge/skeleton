import { makeServerMiddleware } from '@atom-forge/rpc';
import { defineApiSupport } from '../layers';
import type { ActorUser } from '#server/application/modules/user/types';

export const SESSION_COOKIE = 'session';

export function parseCookies(header: string): Record<string, string> {
	return Object.fromEntries(
		header.split(';').filter(Boolean).map(part => {
			const idx = part.indexOf('=');
			if (idx < 0) return [part.trim(), ''];
			return [part.slice(0, idx).trim(), decodeURIComponent(part.slice(idx + 1).trim())];
		}),
	);
}

/**
 * Puts the request's user and Actor into `ctx.env` for every RPC call. Sign-in is not built yet: `resolveUser` is the
 * single place where the session token will be turned into a user; until then every caller is anonymous.
 */
export const sessionSupport = defineApiSupport((_config, modules, self) => {
	async function resolveUser(_token: string | null): Promise<ActorUser | null> {
		return null;
	}

	return {
		sessionMiddleware: makeServerMiddleware(async (ctx, next) => {
			const token = parseCookies(ctx.request.headers.get('cookie') ?? '')[SESSION_COOKIE] ?? null;
			const user = await resolveUser(token);
			if (user) ctx.env.set(self.constants.USER_KEY, user);
			ctx.env.set(self.constants.ACTOR_KEY, modules.actor.create(user));
			return await next();
		}),
	};
});
