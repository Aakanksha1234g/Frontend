import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr(), inspect()],
  define: {
    global: {},
    'process.env': {},
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/shared/hooks'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@validations': path.resolve(__dirname, 'src/validations'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@products': path.resolve(__dirname, 'src/products'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@global-pages': path.resolve(__dirname, 'src/global-pages'),
      '@ui': path.resolve(__dirname, "./src/ui"),
      buffer: 'buffer',
      process: 'process/browser',
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'], // Moved out of alias
  },
  server: {
    host: true, //  enables external access
    port: 5173, // optional
  },
  optimizeDeps: {
    include: ['buffer', 'process', "hero-ui"],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setupTests.js', // <-- remove leading slash
  },
});
