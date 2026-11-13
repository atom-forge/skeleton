import {defineApiSupport} from '../layers';

export const constantsSupport = defineApiSupport(() => {
	return {
		USER_KEY: Symbol('auth.user'),
		ACTOR_KEY: Symbol('auth.actor'),
	};
});
