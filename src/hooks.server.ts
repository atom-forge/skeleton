import type {Handle} from '@sveltejs/kit';
import {createHandler} from '@atom-forge/rpc';
import {createApp} from '$lib/app';
import {config} from './config';

const app = createApp(config);
const rpcHandler = createHandler(app.api, '/api');

export const handle: Handle = async ({event, resolve}) => {
	event.locals.app = app;
	if (rpcHandler.match(event.request)) return rpcHandler.handle(event.request);
	return resolve(event);
};
