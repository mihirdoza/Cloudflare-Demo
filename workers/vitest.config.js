import { defineConfig } from 'vite';
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineConfig({
  build: {
    target: 'esnext', // Cloudflare Workers use modern JS
    outDir: './dist', // Output directory
    rollupOptions: {
      input: './src/index.js', // Adjust to your entry file
    },
  },
  ...defineWorkersConfig({
    test: {
      poolOptions: {
        workers: {
          wrangler: { configPath: './wrangler.toml' },
        },
      },
    },
  }),
});
