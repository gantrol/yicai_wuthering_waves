// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		globals: true,
		environment: "jsdom",
		include: ['src/**/*.{test,spec}.{js,ts,svelte}'],
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/**/*.d.ts'],
		},
	},
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
