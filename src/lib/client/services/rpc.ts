import {createClient} from '@atom-forge/rpc';
import type {Api} from '$lib/server/api';
import type {ClientConfig} from '$lib/client/config';
import type {ClientServices} from '$lib/client/services';

export type RpcConfig = {
	rpc: {
		apiPrefix: string;
	};
};

export function createRpcService(config: ClientConfig, _services: ClientServices) {
	const [client] = createClient<Api>(config.rpc.apiPrefix);
	return client;
}
