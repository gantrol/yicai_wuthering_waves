一款小游戏，技术栈：

- Sveltekit
- Svelte 5
- shadcn-svelte
- vitest、Playwright

依赖

  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.9.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/svelte": "^5.2.6",
    "@testing-library/user-event": "^14.6.0",
    "@vitest/ui": "^2.1.8",
    "autoprefixer": "^10.4.20",
    "bits-ui": "^1.0.0-next.77",
    "clsx": "^2.1.1",
    "jsdom": "^25.0.1",
    "lucide-svelte": "^0.469.0",
    "svelte": "latest",
    "svelte-check": "^4.0.0",
    "tailwind-merge": "^2.6.0",
    "tailwind-variants": "^0.3.0",
    "tailwindcss": "^3.4.9",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "vitest": "^2.1.8"
  }


调用组件用$lib来调用，不要用相对路径