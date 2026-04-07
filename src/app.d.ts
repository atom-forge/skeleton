// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			config: import('$lib/server').Server['config'];
			services: import('$lib/server').Server['services'];
			modules: import('$lib/server').Server['modules'];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
