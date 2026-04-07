import {getContext, setContext} from 'svelte';
import type {ClientConfig} from '$lib/client/config';
import {createClientServices} from '$lib/client/services';
import {createClientModules} from '$lib/client/modules';

export type ClientApp = {
	config: ClientConfig;
	services: ReturnType<typeof createClientServices>;
	modules: ReturnType<typeof createClientModules>;
};

export function createClientApp(config: ClientConfig): ClientApp {
	const services = createClientServices(config);
	const modules = createClientModules(config, services);
	return {config, services, modules};
}

const CLIENT_APP_KEY = Symbol('ClientApp');

export function setClientApp(app: ClientApp): ClientApp {
	return setContext(CLIENT_APP_KEY, app);
}

export function getClientApp(): ClientApp {
	return getContext<ClientApp>(CLIENT_APP_KEY);
}
