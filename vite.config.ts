import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Different CSP for development and production
  const csp = mode === 'development'
    ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.openai.com ws://localhost:* wss://localhost:*;"
    : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.openai.com;";
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true
        }
      },
      strictPort: true,
      headers: {
        'Content-Security-Policy': csp
      }
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      modulePreload: {
        polyfill: true
      },
      rollupOptions: {
        output: {
          format: 'es',
          manualChunks: {
            vendor: ['react', 'react-dom'],
            'openai-vendor': ['openai']
          },
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (name.endsWith('.js')) {
              return 'assets/[name]-[hash].js';
            }
            if (name.endsWith('.css')) {
              return 'assets/[name]-[hash].css';
            }
            return 'assets/[name]-[hash][extname]';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    esbuild: {
      target: 'esnext',
      supported: {
        'top-level-await': true
      }
    },
    define: {
      'process.env': {
        ...env,
        NODE_ENV: mode,
        VITE_APP_ENV: mode
      }
    }
  };
}); 