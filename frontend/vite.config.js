import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    // These are optional peer deps — only needed if VITE_AUTH_PROVIDER=supabase/firebase
    // Don't fail the build if they are absent
    exclude: ['@supabase/supabase-js', 'firebase', 'firebase/app', 'firebase/auth'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // Mark optional peer deps as external so Rollup never tries to bundle them.
      // They are loaded at runtime only when VITE_AUTH_PROVIDER=supabase|firebase.
      external: (id) => {
        return id.startsWith('@supabase/') || id.startsWith('firebase');
      },
    },
  },
});
