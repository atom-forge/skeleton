import {createImageServer} from '@atom-forge/attachment';
import type {Config} from '$lib/server/config';
import type {Services} from '$lib/server/services';

export function createImageHandler(config: Config, _services: Services) {
	return createImageServer({
		variants: config.storage.variants,
		uploadDir: config.storage.uploadDir,
		thumbDir: config.storage.thumbDir,
		thumbPrefix: config.storage.thumbPrefix,
		focusSecret: config.storage.focusSecret,
	});
}
