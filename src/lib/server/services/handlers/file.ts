import {autoDriver, createFileServer} from '@atom-forge/attachment';
import type {Config} from '$lib/server/config';
import type {Services} from '$lib/server/services';

export function createFileHandler(config: Config, _services: Services) {
	return createFileServer({
		uploadDir: config.storage.uploadDir,
		servePrefix: config.storage.servePrefix,
		driver: autoDriver,
	});
}
