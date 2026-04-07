import type {Config} from "$lib/server/config";
import type {Services} from "../services";
import {createUserApi} from "$lib/server/api/user";
import type {Modules} from "$lib/server/modules";

export type Api = {
	user: ReturnType<typeof createUserApi>;
};

export function createApi(config: Config, services: Services, modules: Modules): Api {
	const api = {} as Api;
	api.user = createUserApi(config, services, modules);
	return api;
}
