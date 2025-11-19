import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';  // ✅ импортируем плагин

export default defineConfig({
  plugins: [react()],          // ✅ используем его здесь
});
