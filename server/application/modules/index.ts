import type { Unit } from '@atom-forge/laminar';
import { moduleCreatorFactory } from '../layers';
import { actorModule } from './user/actor';

export type Modules = {
	actor: Unit<typeof actorModule>;
};

export const createModules = moduleCreatorFactory({
	actor: actorModule
});
