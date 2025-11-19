import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno (como API_KEY)
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Esto permite que process.env.API_KEY funcione en el código del cliente
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});