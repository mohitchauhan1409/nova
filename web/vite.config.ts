import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({ root: fileURLToPath(new URL('.', import.meta.url)), base: './', plugins: [react()], server: { port: 5173, strictPort: true, proxy: { '/downloads': 'http://127.0.0.1:8787', '/api': 'http://127.0.0.1:8787', '/socket': { target: 'ws://127.0.0.1:8787', ws: true }, '/demo': 'http://127.0.0.1:8787' } }, build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), panel: fileURLToPath(new URL('./panel.html', import.meta.url)) } } } });
