import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from '../../../prisma/contract.d';
import contractJson from '../../../prisma/contract.json' with { type: 'json' };
import { defineService } from '../layers';

export type PrismaConfig = {
	database: {
		url: string;
	};
};

export const contract = contractFromJson<Contract>(contractJson);

function createDb(url: string) {
	return postgres({ contract, url });
}

export type Db = ReturnType<typeof createDb>;

const DB_KEY = Symbol.for('app.postgres.db');
const URL_KEY = Symbol.for('app.postgres.url');

type GlobalState = {
	[DB_KEY]?: Db;
	[URL_KEY]?: string;
};

const _global = globalThis as unknown as GlobalState;

/**
 * Holds the single Prisma 8 client. It is cached on globalThis so Vite HMR reloads do not open a new connection
 * pool on every edit.
 *
 * `db` is a getter function on purpose: laminar's PublicLayer maps object properties recursively, which erases the
 * generic method types of the Prisma 8 client. Function-typed members pass through unchanged.
 */
export const prismaService = defineService((config, _services) => {
	// Keyed by URL and contract hash: a re-emitted contract under `vite dev` gets a fresh client.
	const url = `${config.database.url}#${(contractJson as { storage?: { storageHash?: string } }).storage?.storageHash ?? ''}`;

	if (!_global[DB_KEY] || _global[URL_KEY] !== url) {
		if (_global[DB_KEY]) _global[DB_KEY].close().catch(console.error);
		_global[DB_KEY] = createDb(config.database.url);
		_global[URL_KEY] = url;
	}

	const db = _global[DB_KEY]!;
	return {
		db: (): Db => db
	};
});
