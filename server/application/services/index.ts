import type { Unit } from '@atom-forge/laminar';
import { serviceCreatorFactory } from '../layers';
import { prismaService } from './prisma';
import { emailService } from './email';

export type Services = {
	prisma: Unit<typeof prismaService>;
	email: Unit<typeof emailService>;
};

export const createServices = serviceCreatorFactory({
	prisma: prismaService,
	email: emailService
});
