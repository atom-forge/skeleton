import { createHandler, type RpcHandler } from '@atom-forge/rpc';
import { app } from './app';

export const rpcHandler: RpcHandler = createHandler(app.api, '/rpc');
