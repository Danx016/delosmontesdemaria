/**
 * Service Registry & Heartbeat Discovery con Redis
 * Permite el registro dinámico y descubrimiento de instancias de microservicios.
 */
const Redis = require('ioredis');
const os = require('os');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

class ServiceRegistry {
  constructor() {
    this.redis = null;
    this.heartbeatInterval = null;
    this.instanceId = `${os.hostname()}-${process.pid}-${Math.random().toString(36).slice(2, 7)}`;
  }

  getRedisClient() {
    if (!this.redis) {
      this.redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: false
      });
      this.redis.on('error', (err) => {
        console.warn('⚠️ [ServiceRegistry Redis Error]:', err.message);
      });
    }
    return this.redis;
  }

  /**
   * Inicia el latido periódico de una instancia de microservicio
   */
  startHeartbeat({ serviceName, port, host = '127.0.0.1', metadata = {} }) {
    const client = this.getRedisClient();
    const key = `registry:instance:${serviceName}:${this.instanceId}`;
    const url = `http://${host}:${port}`;

    const sendBeat = async () => {
      try {
        const payload = JSON.stringify({
          serviceName,
          instanceId: this.instanceId,
          host,
          port,
          url,
          status: 'UP',
          uptime: process.uptime(),
          memory: process.memoryUsage().rss,
          lastHeartbeat: new Date().toISOString(),
          metadata
        });

        // Registrar con TTL de 15 segundos
        await client.set(key, payload, 'EX', 15);
      } catch (err) {
        console.warn(`⚠️ [Heartbeat Error: ${serviceName}]:`, err.message);
      }
    };

    // Latido inicial inmediato
    sendBeat();
    // Latido cada 6 segundos
    this.heartbeatInterval = setInterval(sendBeat, 6000);

    // Limpieza automática al cerrar el proceso
    const cleanup = async () => {
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      try {
        await client.del(key);
      } catch (e) {}
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  }

  /**
   * Obtiene todas las instancias vivas registradas
   * @returns {Promise<Array>}
   */
  async getAllServices() {
    const client = this.getRedisClient();
    try {
      const keys = await client.keys('registry:instance:*');
      if (!keys.length) return [];

      const values = await client.mget(keys);
      return values.map(v => {
        try { return JSON.parse(v); } catch (e) { return null; }
      }).filter(Boolean);
    } catch (err) {
      console.error('❌ [ServiceRegistry getAllServices Error]:', err.message);
      return [];
    }
  }

  /**
   * Detiene el heartbeat
   */
  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}

const registry = new ServiceRegistry();

module.exports = {
  ServiceRegistry,
  registry
};
