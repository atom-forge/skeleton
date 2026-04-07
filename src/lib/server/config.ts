import type {PrismaConfig} from "$lib/server/services/prisma";
import type {StorageConfig} from "$lib/server/services/storage";

export type AppConfig = {
	app: {
		apiPrefix: string;
	}
};

export type Config =
	& AppConfig
	& PrismaConfig
	& StorageConfig;
