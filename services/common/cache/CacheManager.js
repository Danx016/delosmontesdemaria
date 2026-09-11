/**
 * Gestor de Caché Distribuida con Redis (Patrón Cache-Aside)
 * Acelera consultas recurrentes (catálogos, banners, categorías) a < 2ms.
 */
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

class CacheManager {
  constructor(prefix = 'cache:') {
    this.prefix = prefix;
    this.redis = null;
  }

  getClient() {
    if (!this.redis) {
      this.redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 2,
        lazyConnect: false
      });
      this.redis.on('error', (err) => {
        console.warn(`⚠️ [CacheManager Redis Error]:`, err.message);
      });
    }
    return this.redis;
  }

  formatKey(key) {
    return `${this.prefix}${key}`;
  }

  async get(key) {
    try {
      const client = this.getClient();
      const data = await client.get(this.formatKey(key));
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    try {
      const client = this.getClient();
      const serialized = JSON.stringify(value);
      await client.set(this.formatKey(key), serialized, 'EX', ttlSeconds);
    } catch (e) {
      console.warn(`⚠️ [CacheManager Set Error]:`, e.message);
    }
  }

  async del(key) {
    try {
      const client = this.getClient();
      await client.del(this.formatKey(key));
    } catch (e) {}
  }

  async delPattern(pattern) {
    try {
      const client = this.getClient();
      const keys = await client.keys(`${this.prefix}${pattern}`);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (e) {}
  }

  /**
   * Middleware Express para cachear respuestas GET automáticamente
   */
  middleware(keyGenerator, ttlSeconds = 300) {
    return async (req, res, next) => {
      if (req.method !== 'GET') return next();

      const cacheKey = typeof keyGenerator === 'function' ? keyGenerator(req) : `${req.baseUrl}${req.path}`;
      
      try {
        const cached = await this.get(cacheKey);
        if (cached) {
          res.setHeader('X-Cache', 'HIT');
          return res.json(cached);
        }
      } catch (err) {
        // Fallback transparente a base de datos si falla Redis
      }

      res.setHeader('X-Cache', 'MISS');

      // Interceptar res.json para guardar en caché
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && body) {
          this.set(cacheKey, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    };
  }
}

module.exports = {
  CacheManager
};
