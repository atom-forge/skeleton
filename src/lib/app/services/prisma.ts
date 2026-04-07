import {PrismaClient} from "../../../../prisma/client/client.ts";
import type {PoolConfig} from "pg";
import {createPrisma} from "$lib/shared/create-prisma";
import type {Config} from "$lib/app/config";
import type {Services} from "../services";

export type PrismaConfig = { database: PoolConfig };

export function createPrismaService(config: Config, services: Services) {
	return createPrisma(config.database, PrismaClient);
}
