import { rpc } from '@atom-forge/rpc';
import { defineApi } from '#server/application/layers';

export const systemApi = defineApi((_config, _modules, _apiSupport) => {
	return {
		/** Liveness check: answers without touching the database. */
		ping: rpc.query(async () => ({ time: new Date().toISOString() }))
	};
});
