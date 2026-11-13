import { rpc } from '@atom-forge/rpc';
import type { Unit } from '@atom-forge/laminar';
import { apiCreatorFactory } from '#server/application/layers';
import { systemApi } from './system';

export type Api = {
	system: Unit<typeof systemApi>;
};

export const createApi = apiCreatorFactory(
	{
		system: systemApi
	},
	{
		assemble: (api, _config, _modules, apiSupport) => {
			rpc.middleware(apiSupport.session.sessionMiddleware).on(api);
		}
	}
);
