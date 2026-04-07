import {createClient} from '@atom-forge/rpc';
import type {Api} from '$lib/app/api';

export const [client] = createClient<Api>('/api');
