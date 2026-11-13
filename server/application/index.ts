import type { DeepReadonly } from '@atom-forge/env-reader';
import { createServices, type Services } from './services';
import { createModules, type Modules } from './modules';
import { type Api, createApi } from './api';
import { type ApiSupport, createApiSupport } from './api-support';
import type { PrismaConfig } from './services/prisma';
import type { EmailConfig } from './services/email';

/** The runtime configuration the server application is built from (see server/app.ts). */
export type Config = PrismaConfig & EmailConfig;

/** The assembled server application: config, services, modules and the RPC API. */
export type Server = {
	config: DeepReadonly<Config>;
	services: Services;
	modules: Modules;
	apiSupport: ApiSupport;
	api: Api;
};

/** Wires services, modules and the RPC API in dependency order. */
export function createApp(config: Config): Server {
	const services = createServices(config);
	const modules = createModules(config, services);
	const apiSupport = createApiSupport(config, modules);
	const api = createApi(config, modules, apiSupport);
	return { config, services, modules, apiSupport, api };
}
