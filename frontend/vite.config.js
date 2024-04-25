import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // eslint()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.js', './vitest.setup.mjs'],
    coverage: {
      exclude: [ 'src/data/*', 'src/__tests__/*', 'src/main.jsx', '.eslintrc.cjs', 'postcss.config.cjs' ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
});
