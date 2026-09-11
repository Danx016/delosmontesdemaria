/**
 * Adaptadores de Infraestructura (Hexagonal Architecture)
 * - driving: Adaptadores Primarios / Entrada (HTTP, WebSockets)
 * - driven: Adaptadores Secundarios / Salida (Persistencia, Servicios Externos)
 */
module.exports = {
  driving: {
    controllers: require('./driving/http/controllers'),
    routes: require('./driving/http/routes'),
    middleware: {
      auth: require('./driving/http/middleware/auth'),
      csrf: require('./driving/http/middleware/csrf'),
      logger: require('./driving/http/middleware/logger'),
      rateLimiter: require('./driving/http/middleware/rateLimiter'),
      upload: require('./driving/http/middleware/upload'),
      validate: require('./driving/http/middleware/validate')
    },
    websocket: {
      SocketHandler: require('./driving/websocket/SocketHandler')
    }
  },
  driven: {
    persistence: require('./driven/persistence'),
    external: require('./driven/external')
  }
};
