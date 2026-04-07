import type {I18nConfig} from "$lib/client/services/i18n.svelte";
import type {RpcConfig} from "$lib/client/services/rpc";

export type ClientConfig =
	& RpcConfig
	& I18nConfig;
