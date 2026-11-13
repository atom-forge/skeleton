import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EnvReader } from '@atom-forge/env-reader';
import { type Config, createApp } from './application';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = new EnvReader(projectRoot);

const config: Config = {
	database: {
		url: env.string('DATABASE_URL')
	},
	email: {
		smtpUrl: env.string('SMTP_URL', ''),
		from: env.string('EMAIL_FROM', 'App <robot@example.com>')
	}
};

export const app = createApp(config);
