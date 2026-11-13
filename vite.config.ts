import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Node-szerver (Bun alatt fut); az oldalak kéréskor renderelődnek.
			adapter: adapter()
		})
	],
	ssr: {
		// Közvetlenül a node_modules-ból töltődnek: a Vite SSR előcsomagolása elrontja a Prisma 8 pg driverét és a natív modulokat.
		external: [
			'@prisma/orm-postgres',
			'@prisma/orm-target-postgres',
			'@prisma/orm-family-sql',
			'@prisma/orm-framework',
			'pg',
			'sharp',
			'nodemailer',
			'lru-cache'
		]
	}
});
