import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@auth': path.resolve(__dirname, 'src/auth'),
      '@treasury': path.resolve(__dirname, 'src/treasury'),
      '@publicWorks': path.resolve(__dirname, 'src/publicWorks'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@mocks': path.resolve(__dirname, 'src/mocks')
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0')
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest.setup.ts'
  }
});
