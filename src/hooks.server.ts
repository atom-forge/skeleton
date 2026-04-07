import type {Handle} from '@sveltejs/kit';
import {createHandler} from '@atom-forge/rpc';
import {createApp} from '$lib/app';
import {config} from './config';
import {autoDriver, createFileServer, createImageServer} from "@atom-forge/attachment";

const app = createApp(config);

const rpcHandler = createHandler(app.api, app.config.app.apiPrefix);

const fileHandler = createFileServer({
	uploadDir:   app.config.storage.uploadDir,
	servePrefix: app.config.storage.servePrefix,
	driver:      autoDriver,
});

const imageHandler = createImageServer({
	variants:    app.config.storage.variants,
	uploadDir:   app.config.storage.uploadDir,
	thumbDir:    app.config.storage.thumbDir,
	thumbPrefix: app.config.storage.thumbPrefix,
	focusSecret: app.config.storage.focusSecret,
});

export const handle: Handle = async ({event, resolve}) => {
	event.locals.app = app;
	if (rpcHandler.match(event.request)) return rpcHandler.handle(event.request);
	if (fileHandler.match(event.request)) return fileHandler.handle(event.request);
	if (imageHandler.match(event.request)) return imageHandler.handle(event.request);
	return resolve(event);
};
