import type {Handle} from '@sveltejs/kit';
import {createHandler} from '@atom-forge/rpc';
import {createServer} from '$lib/server';
import {config} from './config';
import {autoDriver, createFileServer, createImageServer} from "@atom-forge/attachment";

const server = createServer(config);

const rpcHandler = createHandler(server.api, server.config.app.apiPrefix);

const fileHandler = createFileServer({
	uploadDir:   server.config.storage.uploadDir,
	servePrefix: server.config.storage.servePrefix,
	driver:      autoDriver,
});

const imageHandler = createImageServer({
	variants:    server.config.storage.variants,
	uploadDir:   server.config.storage.uploadDir,
	thumbDir:    server.config.storage.thumbDir,
	thumbPrefix: server.config.storage.thumbPrefix,
	focusSecret: server.config.storage.focusSecret,
});

export const handle: Handle = async ({event, resolve}) => {
	event.locals.config = server.config;
	event.locals.services = server.services;
	event.locals.modules = server.modules;
	if (rpcHandler.match(event.request)) return rpcHandler.handle(event.request);
	if (fileHandler.match(event.request)) return fileHandler.handle(event.request);
	if (imageHandler.match(event.request)) return imageHandler.handle(event.request);
	return resolve(event);
};
