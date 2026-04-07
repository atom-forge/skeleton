import {PUBLIC_API_PREFIX, PUBLIC_DEFAULT_LOCALE} from '$env/static/public';
import type {I18nConfig} from "$lib/client/services/i18n.svelte";
import type {RpcConfig} from "$lib/client/services/rpc";

export type ClientConfig =
	& RpcConfig
	& I18nConfig;

export function createClientConfig(): ClientConfig {
	return {
		rpc: {apiPrefix: PUBLIC_API_PREFIX},
		i18n: {defaultLocale: PUBLIC_DEFAULT_LOCALE},
	};
}
