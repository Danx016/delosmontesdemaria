/**
 * Middleware y Utilidad de Trazabilidad Distribuida (Distributed Tracing)
 * Gestiona el X-Correlation-ID a lo largo del Gateway y los Microservicios.
 */
const crypto = require('crypto');

/**
 * Middleware para Express que asegura la presencia de un Correlation-ID único.
 */
function correlationMiddleware(serviceName = 'service') {
  return (req, res, next) => {
    // Extraer header entrante o generar un nuevo UUID v4
    const correlationId = req.headers['x-correlation-id'] || 
                          req.headers['x-request-id'] || 
                          `trace-${crypto.randomUUID().slice(0, 13)}`;

    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    // Logging contextualizado con el ID de correlación
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      // Solo loguear en consola peticiones relevantes (evitar inundar con healthchecks si están OK)
      if (req.path !== '/health' || statusCode >= 400) {
        console.log(`[${new Date().toISOString()}] [${serviceName}] [Trace: ${correlationId}] ${req.method} ${req.originalUrl || req.url} -> ${statusCode} (${duration}ms)`);
      }
    });

    next();
  };
}

module.exports = {
  correlationMiddleware
};
