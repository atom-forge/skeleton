import {createPrismaService} from './prisma.ts';
import type {Config} from "$lib/app/config";

export type Services = {
	prisma: ReturnType<typeof createPrismaService>
};

export function createServices(config: Config): Services {
	let services = {} as Services;
	services.prisma = createPrismaService(config, services);
	return services;
}