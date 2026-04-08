import {createHandler} from '@atom-forge/rpc';
import type {Config} from '$lib/server/config';
import type {Services} from '$lib/server/services';
import type {Api} from '$lib/server/api';

export function createApiHandler(config: Config, _services: Services) {
	let handler: ReturnType<typeof createHandler> | null = null;

	return {
		wire(api: Api) {
			handler = createHandler(api, config.app.apiPrefix);
		},
		match(request: Request): boolean {
			return handler?.match(request) ?? false;
		},
		handle(request: Request): Promise<Response> {
			return handler!.handle(request);
		},
	};
}
