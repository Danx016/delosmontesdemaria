/**
 * Patrón Circuit Breaker (Disyuntor de Fallas)
 * Protege al API Gateway y previene fallos en cascada entre microservicios.
 * Estados: CLOSED (Operativo) -> OPEN (Aislado por fallas) -> HALF_OPEN (Prueba de recuperación)
 */

const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

class CircuitBreaker {
  /**
   * @param {string} serviceName - Nombre del servicio protegido
   * @param {Object} options - Configuración del disyuntor
   */
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.failureThreshold = options.failureThreshold || 5; // Número de fallas consecutivas para abrir
    this.recoveryTimeout = options.recoveryTimeout || 10000; // Tiempo en ms en estado OPEN antes de probar HALF_OPEN (10s)
    
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.totalCalls = 0;
    this.totalFailures = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttempt = Date.now();
  }

  /**
   * Verifica si el circuito permite que pase una petición
   * @returns {boolean}
   */
  canPass() {
    const now = Date.now();

    if (this.state === STATES.OPEN) {
      if (now >= this.nextAttempt) {
        this.state = STATES.HALF_OPEN;
        console.log(`🟡 [Circuit Breaker: ${this.serviceName}] Pasando a HALF_OPEN para probar recuperación`);
        return true;
      }
      return false; // Circuito aún abierto: rechazar inmediatamente
    }

    return true; // CLOSED o HALF_OPEN
  }

  /**
   * Registra una petición exitosa (cierra el circuito si estaba en HALF_OPEN)
   */
  recordSuccess() {
    this.totalCalls++;
    this.lastSuccessTime = new Date().toISOString();

    if (this.state === STATES.HALF_OPEN) {
      this.state = STATES.CLOSED;
      this.failureCount = 0;
      console.log(`🟢 [Circuit Breaker: ${this.serviceName}] Recuperado exitosamente. Estado: CLOSED`);
    } else if (this.state === STATES.CLOSED) {
      this.failureCount = 0;
    }
  }

  /**
   * Registra una falla en el microservicio (timeout o error 5xx)
   * @param {Error|string} error
   */
  recordFailure(error) {
    this.totalCalls++;
    this.totalFailures++;
    this.failureCount++;
    this.lastFailureTime = new Date().toISOString();

    console.warn(`⚠️ [Circuit Breaker: ${this.serviceName}] Falla detectada (#${this.failureCount}/${this.failureThreshold}):`, error?.message || error);

    if (this.state === STATES.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
      this.nextAttempt = Date.now() + this.recoveryTimeout;
      console.error(`🔴 [Circuit Breaker: ${this.serviceName}] ¡CIRCUITO ABIERTO! Tráfico bloqueado temporalmente por ${this.recoveryTimeout / 1000}s`);
    }
  }

  /**
   * Obtiene estadísticas del disyuntor
   */
  getStatus() {
    return {
      service: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime
    };
  }

  /**
   * Middleware Express para anteponer al proxy
   */
  middleware(fallbackResponse = null) {
    return (req, res, next) => {
      if (!this.canPass()) {
        const correlationId = req.correlationId || req.headers['x-correlation-id'] || 'N/A';
        return res.status(503).json(fallbackResponse || {
          success: false,
          error: `El servicio [${this.serviceName}] no está disponible temporalmente.`,
          circuitBreaker: {
            state: this.state,
            service: this.serviceName,
            recoveryInSeconds: Math.max(0, Math.ceil((this.nextAttempt - Date.now()) / 1000))
          },
          correlationId,
          timestamp: new Date().toISOString()
        });
      }
      next();
    };
  }
}

module.exports = {
  CircuitBreaker,
  STATES
};
