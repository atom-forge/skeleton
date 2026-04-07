import type {ClientConfig} from '$lib/client/config';
import type {ClientServices} from '$lib/client/services';

export type ClientModules = Record<string, never>;

export function createClientModules(_config: ClientConfig, _services: ClientServices): ClientModules {
	return {};
}
