import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 👇 ADD THIS ENTIRE 'server' SECTION
  server: {
    host: true, // This exposes the server to the network (0.0.0.0)
    port: 5174, // You can specify the port if you want, or leave it out
  },
});