import type {Services} from "../services";
import type {Config} from "$lib/server/config";
import {createUserModule} from "./user";

export type Modules = {
	user: ReturnType<typeof createUserModule>;
};

export function createModules(config: Config, services: Services): Modules {
	const modules = {} as Modules;
	modules.user = createUserModule(config, services, modules);
	return modules;
}
