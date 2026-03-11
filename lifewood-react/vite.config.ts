/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    /* Chunk splitting for better caching & smaller initial bundle */
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['gsap', 'lenis', 'motion'],
          three: ['three', '@react-three/fiber', 'ogl'],
          maps: ['leaflet', 'react-leaflet'],
          monitoring: ['@sentry/react'],
          ui: ['react-hot-toast'],
        },
      },
    },
    sourcemap: true,
    target: 'es2022',
    /* Image assets: inline small files, hash larger ones for cache busting */
    assetsInlineLimit: 4096,  // inline assets smaller than 4kb
    cssCodeSplit: true,        // split CSS per chunk for faster initial load
    minify: 'esbuild',
    reportCompressedSize: false, // speeds up build
  },
  /* Asset handling for images */
  assetsInclude: ['**/*.webp', '**/*.avif', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
