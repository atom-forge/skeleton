import type {PrismaConfig} from "$lib/app/services/prisma";
import type {StorageConfig} from "$lib/app/services/storage";

export type AppConfig = {
	app: {
		apiPrefix: string;
	}
};

export type Config =
	& AppConfig
	& PrismaConfig
	& StorageConfig;
