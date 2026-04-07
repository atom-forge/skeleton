import type {ClientConfig} from '$lib/client/config';
import type {ClientServices} from '$lib/client/services';

export type I18nConfig = {
	i18n: {
		defaultLocale: string;
	};
};

export function createI18nService(config: ClientConfig, _services: ClientServices) {
	const dictionaries: Record<string, Record<string, string>> = {};
	let locale = $state(config.i18n.defaultLocale);

	return {
		get locale() { return locale; },
		load(l: string, dict: Record<string, string>) { dictionaries[l] = dict; },
		setLocale(l: string) { locale = l; },
		t(key: string, params?: Record<string, string>): string {
			let str = dictionaries[locale]?.[key] ?? key;
			if (params) str = str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
			return str;
		},
	};
}
