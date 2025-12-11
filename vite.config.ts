/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3001,
      host: '0.0.0.0',
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      watch: {
        ignored: ['**/pocketbase/**', '**/pb_data/**', '**/*.db', '**/*.db-journal', '**/test_output.txt', '**/ai_service/**', '**/chroma_db/**'],
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['@remotion/renderer', '@remotion/bundler']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'clsx', 'tailwind-merge', '@blueprintjs/core'],
          pocketbase: ['pocketbase'],
          remotion: ['remotion', '@remotion/player'],
          markdown: ['react-markdown', 'rehype-highlight', 'remark-gfm', 'highlight.js'],
          aws: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
          polotno: ['polotno'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  };
});
