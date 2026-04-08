import {createServices} from "./services";
import {createModules} from "./modules";
import {createApi} from "$lib/server/api";
import type {Config} from "$lib/server/config";
import type {DeepReadonly} from "@atom-forge/env-reader";

export type Server = {
	config: DeepReadonly<Config>;
	services: ReturnType<typeof createServices>;
	modules: ReturnType<typeof createModules>;
	api: ReturnType<typeof createApi>;
};

export function createServer(config: Config): Server {
	const services = createServices(config);
	const modules = createModules(config, services);
	const api = createApi(config, services, modules);
	services.handlers.api.wire(api);
	return {config, services, modules, api};
}
