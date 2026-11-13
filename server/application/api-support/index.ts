import type {Unit} from '@atom-forge/laminar';
import {apiSupportCreatorFactory} from '../layers';
import {constantsSupport} from './constants';
import {guardsSupport} from './guards';
import {middlewaresSupport} from './middlewares';
import {sessionSupport} from './session';

export type ApiSupport = {
	constants: Unit<typeof constantsSupport>;
	guards: Unit<typeof guardsSupport>;
	middlewares: Unit<typeof middlewaresSupport>;
	session: Unit<typeof sessionSupport>;
};

export const createApiSupport = apiSupportCreatorFactory({
	constants: constantsSupport,
	guards: guardsSupport,
	middlewares: middlewaresSupport,
	session: sessionSupport,
});
