import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // The browser calls /api on :5173; Vite forwards it to the Express API.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
