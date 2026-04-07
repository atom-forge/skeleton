import {rpc} from '@atom-forge/rpc';
import {z} from 'zod';
import type {Config} from "$lib/app/config";
import type {Services} from "$lib/app/services";
import type {Modules} from "$lib/app/modules";


export function createUserApi(config: Config, services: Services, modules: Modules) {
	return {
		all: rpc
			.get(async (_args: void, _ctx) => {
				try {
					return modules.user.all();
				} catch (e) {
					return []
				}
			}),
		get: rpc
			.zod({id: z.string()})
			.get(async ({id}, ctx) => {
				await modules.user.get(id);
			}),
	}
}

