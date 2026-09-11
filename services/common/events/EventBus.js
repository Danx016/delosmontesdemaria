/**
 * Bus de Eventos Asíncrono para Microservicios (Event-Driven Architecture)
 * Implementado con Redis Pub/Sub (ioredis)
 */
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

class EventBus {
  constructor() {
    this.publisher = null;
    this.subscriber = null;
    this.subscriptions = new Map();
    this.isReady = false;
  }

  init() {
    if (this.publisher && this.subscriber) return;

    this.publisher = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: false
    });

    this.subscriber = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: false
    });

    this.publisher.on('error', (err) => {
      console.warn(`⚠️ [EventBus Publisher Error]: ${err.message}`);
    });

    this.subscriber.on('error', (err) => {
      console.warn(`⚠️ [EventBus Subscriber Error]: ${err.message}`);
    });

    this.subscriber.on('message', (channel, message) => {
      try {
        const event = JSON.parse(message);
        const handlers = this.subscriptions.get(channel) || [];
        handlers.forEach(handler => {
          try {
            handler(event);
          } catch (handlerErr) {
            console.error(`❌ [EventBus Handler Error] en canal ${channel}:`, handlerErr.message);
          }
        });
      } catch (err) {
        console.error(`❌ [EventBus Parse Error] en canal ${channel}:`, err.message);
      }
    });

    this.isReady = true;
  }

  /**
   * Publica un evento en un canal de Redis
   * @param {string} channel
   * @param {Object} eventData
   */
  async publish(channel, eventData) {
    this.init();
    const payload = JSON.stringify({
      ...eventData,
      _timestamp: new Date().toISOString()
    });

    try {
      await this.publisher.publish(channel, payload);
    } catch (err) {
      console.error(`⚠️ Error al publicar evento en ${channel}:`, err.message);
    }
  }

  /**
   * Se suscribe a un canal y ejecuta el callback cuando llega un evento
   * @param {string} channel
   * @param {Function} handler
   */
  async subscribe(channel, handler) {
    this.init();
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
      await this.subscriber.subscribe(channel);
    }
    this.subscriptions.get(channel).push(handler);
  }
}

// Canales y nombres de eventos estándar
const CHANNELS = {
  ORDERS: 'agro.orders.events',
  AUTH: 'agro.auth.events',
  SUPPORT: 'agro.support.events',
  CATALOG: 'agro.catalog.events'
};

const EVENTS = {
  ORDER_CREATED: 'ORDER_CREATED',
  USER_REGISTERED: 'USER_REGISTERED',
  TICKET_CREATED: 'TICKET_CREATED',
  STOCK_UPDATED: 'STOCK_UPDATED'
};

const eventBusInstance = new EventBus();

module.exports = {
  eventBus: eventBusInstance,
  CHANNELS,
  EVENTS
};
