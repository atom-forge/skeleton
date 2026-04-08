import type {Handle} from '@sveltejs/kit';
import {createServer} from '$lib/server';
import {config} from './config';

const server = createServer(config);

export const handle: Handle = async ({event, resolve}) => {
	event.locals.config = server.config;
	event.locals.services = server.services;
	event.locals.modules = server.modules;
	return await server.services.handlers.handle(event.request, ()=>resolve(event));
};
