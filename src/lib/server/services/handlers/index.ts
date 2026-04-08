import {createApiHandler} from './api.ts';
import {createFileHandler} from './file.ts';
import {createImageHandler} from './image.ts';
import type {Config} from '$lib/server/config';
import type {Services} from '$lib/server/services';
import {handle} from "../../../../hooks.server.ts";

export type Handlers = {
	api: ReturnType<typeof createApiHandler>;
	file: ReturnType<typeof createFileHandler>;
	image: ReturnType<typeof createImageHandler>;
	handle: {
		(request: Request): Promise<Response | null>;
		(request: Request, fallback: () => Promise<Response>|Response): Promise<Response>;	}
};

export function createHandlersService(config: Config, services: Services): Handlers {
	const api = createApiHandler(config, services);
	const file = createFileHandler(config, services);
	const image = createImageHandler(config, services);

	return {
		api, file, image,
		handle: (async (request: Request, fallback?: () => Promise<Response>|Response) => {
			if (api.match(request)) return api.handle(request);
			if (file.match(request)) return file.handle(request);
			if (image.match(request)) return image.handle(request);
			if (fallback) return fallback();
			return null;
		}) as Handlers["handle"],
	};
}
