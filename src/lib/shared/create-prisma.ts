import {PrismaPg} from "@prisma/adapter-pg";
import {Pool, type PoolConfig} from "pg";

const POOL_KEY = Symbol.for('atom-forge.postgres.pool');
const URL_KEY = Symbol.for('atom-forge.postgres.url');

type GlobalState = {
	[POOL_KEY]?: Pool;
	[URL_KEY]?: string;
};

const global = globalThis as unknown as GlobalState;

type PrismaConstructor = new (options: { adapter: any }) => any;

export function createPrisma<CLIENT extends PrismaConstructor>(config: PoolConfig, client: CLIENT): InstanceType<CLIENT> {

	const connectionString = config.connectionString;

	if (!global[POOL_KEY] || global[URL_KEY] !== connectionString) {
		if (global[POOL_KEY]) global[POOL_KEY].end().catch(console.error);
		global[POOL_KEY] = new Pool(config);
		global[URL_KEY] = connectionString;
	}

	const adapter = new PrismaPg(global[POOL_KEY]);
	return new client({adapter})
}

