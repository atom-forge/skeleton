import type {Config} from "$lib/app/config";
import type {Services} from "../services";
import {createUserApi} from "$lib/app/api/user";
import type {Modules} from "$lib/app/modules";

export type Api = {
	user: ReturnType<typeof createUserApi>;
};

export function createApi(config: Config, services: Services, modules: Modules): Api {
	const api = {} as Api;
	api.user = createUserApi(config, services, modules);
	return api;
}
