import type {Config} from "$lib/server/config";
import type {Services} from "$lib/server/services";
import type {Modules} from "$lib/server/modules";

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
