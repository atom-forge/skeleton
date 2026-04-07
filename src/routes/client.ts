import {createClient} from '@atom-forge/rpc';
import type {Api} from '$lib/server/api';

export const [client] = createClient<Api>('/api');
