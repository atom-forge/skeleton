import {createServices} from "./services";
import {createModules} from "./modules";
import {createApi} from "$lib/app/api";
import type {Config} from "$lib/app/config";
import type {DeepReadonly} from "@atom-forge/env-reader";

export type App = {
	config: DeepReadonly<Config>;
	services: ReturnType<typeof createServices>;
	modules: ReturnType<typeof createModules>;
	api: ReturnType<typeof createApi>;
};

export function createApp(config: Config): App {
	const services = createServices(config);
	const modules = createModules(config, services);
	const api = createApi(config, services, modules);
	return {config, services, modules, api};
}
