import {getContext, setContext} from 'svelte';
import type {ClientConfig} from '$lib/client/config';
import {createClientServices} from '$lib/client/services';
import {createClientModules} from '$lib/client/modules';
import type {DeepReadonly} from "@atom-forge/env-reader";

export type ClientApp = {
	config: DeepReadonly<ClientConfig>;
	services: ReturnType<typeof createClientServices>;
	modules: ReturnType<typeof createClientModules>;
};

const CLIENT_APP_KEY = Symbol('ClientApp');

export function setClientApp(config: ClientConfig): ClientApp {
	const services = createClientServices(config);
	const modules = createClientModules(config, services);
	return setContext(CLIENT_APP_KEY, {config, services, modules});
}

export function getClientApp(): ClientApp {
	return getContext<ClientApp>(CLIENT_APP_KEY);
}
