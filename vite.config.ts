import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    envPrefix: ['VITE_', 'SUPABASE_'],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    build: {
      // Transpile for older Chrome 80+, Android WebView 80+, Safari 14+, and ES2015 baseline
      target: ['chrome80', 'edge80', 'firefox78', 'safari14', 'es2015'],
      cssTarget: 'chrome80',
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Isolate GSAP into separate vendor chunk so it never blocks main thread on mobile
            if (id.includes('node_modules/gsap')) {
              return 'gsap-vendor';
            }
            // Isolate Supabase client
            if (id.includes('node_modules/@supabase')) {
              return 'supabase-vendor';
            }
            // Isolate icons
            if (id.includes('node_modules/lucide-react')) {
              return 'icons-vendor';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
