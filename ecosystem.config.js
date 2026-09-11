/**
 * Configuración de PM2 para Ecosistema de Microservicios
 * De los Montes de María en Servidor Propio (Ubuntu)
 */
module.exports = {
  apps: [
    {
      name: 'gateway',
      script: 'services/gateway/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'auth-service',
      script: 'services/auth-service/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
        AUTH_SERVICE_PORT: 3001
      }
    },
    {
      name: 'catalog-service',
      script: 'services/catalog-service/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
        CATALOG_SERVICE_PORT: 3002
      }
    },
    {
      name: 'order-service',
      script: 'services/order-service/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
        ORDER_SERVICE_PORT: 3003
      }
    },
    {
      name: 'ai-support-service',
      script: 'services/ai-support-service/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        AI_SUPPORT_SERVICE_PORT: 3004
      }
    },
    {
      name: 'notification-service',
      script: 'services/notification-service/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
        NOTIFICATION_SERVICE_PORT: 3005
      }
    }
  ]
};
