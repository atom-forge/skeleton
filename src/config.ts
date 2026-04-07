import {configDotenv} from "dotenv";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {EnvReader} from "@atom-forge/env-reader";
import type {Config} from "$lib/server/config";

configDotenv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = new EnvReader(path.resolve(__dirname, ".."));

export const config: Config = {
	app: {
		apiPrefix: env.string("API_PREFIX", "/api"),
	},
	database: {
		connectionString: env.string("DATABASE_URL"),
		max: env.int("DB_POOL_MAX", 20),
		min: env.int("DB_POOL_MIN", 2),
		idleTimeoutMillis: env.int("DB_POOL_IDLE_TIMEOUT", 30000),
		connectionTimeoutMillis: env.int("DB_POOL_CONN_TIMEOUT", 2000),
		maxLifetimeSeconds: env.int("DB_POOL_LIFETIME", 60 * 60),
	},
	storage: {
		uploadDir:   env.string("STORAGE_UPLOAD_DIR"),
		thumbDir:    env.string("STORAGE_THUMB_DIR"),
		focusSecret: env.string("STORAGE_FOCUS_SECRET"),
		variants:    {},
	},
} as const;
