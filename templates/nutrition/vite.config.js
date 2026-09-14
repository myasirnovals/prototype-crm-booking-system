import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        login: resolve(__dirname, 'login.html'),
        admin_login: resolve(__dirname, 'admin/login.html'),
        admin_dashboard: resolve(__dirname, 'admin/index.html'),
        telehealth: resolve(__dirname, 'telehealth.html'),
        control_center_login: resolve(__dirname, 'control-center/login.html'),
        control_center: resolve(__dirname, 'control-center/index.html')
      }
    }
  }
});
