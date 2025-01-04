// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		globals: true,
		environment: "jsdom",
		include: ['src/**/*.{test,spec}.{js,ts,svelte}'], // 测试文件匹配模式
		coverage: {
			provider: 'istanbul', // 或 'c8'
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/**/*.d.ts'],
		},
	},
});
