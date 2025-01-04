// vite.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte()],
	test: {
		globals: true, // 启用全局变量
		include: ['src/**/*.{test,spec}.{js,ts,svelte}'], // 测试文件匹配模式
		coverage: {
			provider: 'istanbul', // 或 'c8'
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/**/*.d.ts'],
		},
	},
});
