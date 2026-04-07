import type {ClientConfig} from '$lib/client/config';
import {createRpcService} from './rpc';
import {createI18nService} from './i18n.svelte';

export type ClientServices = {
	rpc: ReturnType<typeof createRpcService>;
	i18n: ReturnType<typeof createI18nService>;
};

export function createClientServices(config: ClientConfig): ClientServices {
	const services = {} as ClientServices;
	services.rpc = createRpcService(config, services);
	services.i18n = createI18nService(config, services);
	return services;
}
