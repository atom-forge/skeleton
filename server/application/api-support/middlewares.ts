import { makeServerMiddleware, rpc } from '@atom-forge/rpc';
import { defineApiSupport } from '../layers';
import type { ActorUser, IActor as Actor } from '#server/application/modules/user/types';

export const middlewaresSupport = defineApiSupport((_config, _modules, self) => {
	return {
		authRequiredMiddleware: makeServerMiddleware(async (ctx, next) => {
			const actor = ctx.env.get(self.constants.ACTOR_KEY) as Actor | undefined;
			if (!actor || !actor.isAuthenticated() || !ctx.env.get(self.constants.USER_KEY)) {
				return rpc.error.permissionDenied({ message: 'Bejelentkezés szükséges.' });
			}
			return await next();
		}),

		requireAdminMiddleware: makeServerMiddleware(async (ctx, next) => {
			const actor = ctx.env.get(self.constants.ACTOR_KEY) as Actor | undefined;
			if (!actor || !actor.isAdmin()) {
				return rpc.error.permissionDenied({ message: 'Adminisztrátori jogosultság szükséges.' });
			}
			return await next();
		})
	};
});

export type { ActorUser };
