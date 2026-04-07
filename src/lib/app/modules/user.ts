import type {Config} from "$lib/app/config";
import type {Services} from "$lib/app/services";
import type {Modules} from "$lib/app/modules";

export function createUserModule(config: Config, services: Services, modules: Modules) {
	const {prisma} = services;

	return {
		async all() {
			return prisma.user.findMany();
		},
		async get(id: string) {
			return prisma.user.findUnique({where: {id}});
		},
		async count() {
			return prisma.user.count();
		},
	};
}

