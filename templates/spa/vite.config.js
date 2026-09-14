import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    watch: {
      usePolling: true
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        register: resolve(__dirname, 'register.html'),
        'admin-dashboard': resolve(__dirname, 'admin/dashboard.html'),
        'admin-calendar': resolve(__dirname, 'admin/calendar.html'),
        'admin-reservations': resolve(__dirname, 'admin/reservations.html'),
        'admin-staff': resolve(__dirname, 'admin/staff.html'),
        'admin-services': resolve(__dirname, 'admin/services.html'),
        'admin-customers': resolve(__dirname, 'admin/customers.html'),
        'admin-login': resolve(__dirname, 'admin/login.html'),
      }
    }
  }
})

