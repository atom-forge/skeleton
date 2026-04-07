import {createLocalProvider, type ImageVariantMap, type StorageProvider} from "@atom-forge/attachment";
import type {Config} from "$lib/app/config";
import type {Services} from "$lib/app/services";

export type StorageConfig = {
	storage: {
		uploadDir:    string;
		servePrefix?: string;
		thumbDir:     string;
		thumbPrefix?: string;   // default: '/img'
		focusSecret:  string;
		variants:     ImageVariantMap;
	}
};

export function createStorageService(config: Config, services: Services): StorageProvider {
	return createLocalProvider(config.storage.uploadDir);
}
