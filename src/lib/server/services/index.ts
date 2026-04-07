import {createPrismaService} from './prisma.ts';
import {createStorageService} from './storage.ts';
import type {Config} from "$lib/server/config";

export type Services = {
	prisma:   ReturnType<typeof createPrismaService>;
	storage:  ReturnType<typeof createStorageService>;
};

export function createServices(config: Config): Services {
	let services = {} as Services;
	services.prisma   = createPrismaService(config, services);
	services.storage  = createStorageService(config, services);
	return services;
}
