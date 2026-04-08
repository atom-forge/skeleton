import {createPrismaService} from './prisma.ts';
import {createStorageService} from './storage.ts';
import {createHandlersService} from './handlers/index.ts';
import type {Config} from "$lib/server/config";

export type Services = {
	prisma:    ReturnType<typeof createPrismaService>;
	storage:   ReturnType<typeof createStorageService>;
	handlers:  ReturnType<typeof createHandlersService>;
};

export function createServices(config: Config): Services {
	let services = {} as Services;
	services.prisma    = createPrismaService(config, services);
	services.storage   = createStorageService(config, services);
	services.handlers  = createHandlersService(config, services);
	return services;
}
