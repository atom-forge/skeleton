import { defineModule } from '#server/application/layers';
import type { ActorUser, IActor, RoleName } from './types';

class Actor implements IActor {
	constructor(
		readonly user: ActorUser | null,
		readonly _internal: boolean = false
	) {}

	is(userId: string): boolean {
		return this._internal || this.user?.id === userId;
	}

	isAuthenticated(): boolean {
		return this._internal || this.user !== null;
	}

	isAdmin(): boolean {
		return this._internal || (this.user?.roles.includes('admin') ?? false);
	}

	hasRole(role: RoleName): boolean {
		return this.isAdmin() || (this.user?.roles.includes(role) ?? false);
	}

	isInternal(): boolean {
		return this._internal;
	}
}

export const actorModule = defineModule((_config, _services, _modules) => {
	return {
		create(user: ActorUser | null): IActor {
			return new Actor(user);
		},
		internal(): IActor {
			return new Actor(null, true);
		}
	};
});
