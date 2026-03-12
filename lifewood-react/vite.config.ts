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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-hot-toast') || id.includes('react-helmet-async')) return 'vendor';
            if (id.includes('gsap') || id.includes('lenis') || id.includes('motion')) return 'animations';
            if (id.includes('three') || id.includes('@react-three') || id.includes('ogl')) return 'three';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps';
            if (id.includes('@sentry')) return 'monitoring';
          }
        },
      },
    },
    sourcemap: false,          // no sourcemaps in production
    target: 'es2022',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    minify: 'esbuild',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600, // warn on large chunks
    modulePreload: { polyfill: false }, // modern browsers support module preload natively
  },
  /* Optimise dependency pre-bundling */
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async', 'react-hot-toast'],
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
