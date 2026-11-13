import {rpc} from '@atom-forge/rpc';
import {defineApiSupport} from '../layers';
import type {ActorUser, IActor as Actor} from '#server/application/modules/user/types';

type EnvCtx = {env: {get(key: symbol): unknown}};

export const guardsSupport = defineApiSupport((_config, _modules, self) => {
	return {
		getActor(ctx: EnvCtx): Actor {
			const actor = ctx.env.get(self.constants.ACTOR_KEY);
			if (!actor) throw new Error('Actor is not available. Did you forget sessionMiddleware?');
			return actor as Actor;
		},

		requireActor(ctx: EnvCtx) {
			const actor = ctx.env.get(self.constants.ACTOR_KEY) as Actor | undefined;
			const user = ctx.env.get(self.constants.USER_KEY) as ActorUser | undefined;
			if (!actor || !actor.isAuthenticated() || !user) {
				return {ok: false as const, error: rpc.error.permissionDenied({message: 'Bejelentkezés szükséges.'})};
			}
			return {ok: true as const, actor, user};
		},

		/** For handlers behind authRequiredMiddleware: the actor and user are guaranteed. */
		getRequiredActor(ctx: EnvCtx) {
			const actor = ctx.env.get(self.constants.ACTOR_KEY) as Actor | undefined;
			const user = ctx.env.get(self.constants.USER_KEY) as ActorUser | undefined;
			if (!actor || !user) throw new Error('User is not available. Did you forget authRequiredMiddleware?');
			return {actor, user};
		},
	};
});
