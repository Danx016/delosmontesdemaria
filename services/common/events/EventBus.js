/**
 * Bus de Eventos Asíncrono para Microservicios (Event-Driven Architecture)
 * Soporta:
 * 1. Redis Pub/Sub (Eventos volátiles en tiempo real)
 * 2. Redis Streams con Consumer Groups (Persistencia garantizada, At-least-once, XACK)
 * 3. Dead Letter Queue (DLQ) para reintentos y auditoría de eventos fallidos
 * 4. Propagación de X-Correlation-ID a través de eventos
 */
const crypto = require('crypto');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

class EventBus {
  constructor() {
    this.publisher = null;
    this.subscriber = null;
    this.streamClient = null;
    this.subscriptions = new Map();
    this.streamConsumers = [];
    this.isReady = false;
  }

  init() {
    if (this.publisher && this.subscriber && this.streamClient) return;

    const redisOptions = {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: false
    };

    if (!this.publisher) {
      this.publisher = new Redis(REDIS_URL, redisOptions);
      this.publisher.on('error', (err) => console.warn(`⚠️ [EventBus Publisher Error]: ${err.message}`));
    }

    if (!this.subscriber) {
      this.subscriber = new Redis(REDIS_URL, redisOptions);
      this.subscriber.on('error', (err) => console.warn(`⚠️ [EventBus Subscriber Error]: ${err.message}`));
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
    }

    if (!this.streamClient) {
      this.streamClient = new Redis(REDIS_URL, redisOptions);
      this.streamClient.on('error', (err) => console.warn(`⚠️ [EventBus Streams Error]: ${err.message}`));
    }

    this.isReady = true;
  }

  /**
   * Genera o preserva el Correlation-ID
   */
  _ensureCorrelation(eventData) {
    return {
      correlationId: eventData.correlationId || `trace-evt-${crypto.randomUUID().slice(0, 8)}`,
      _timestamp: new Date().toISOString(),
      ...eventData
    };
  }

  // ==========================================
  // MÉTODOS PUB/SUB (En tiempo real)
  // ==========================================

  async publish(channel, eventData) {
    this.init();
    const payload = JSON.stringify(this._ensureCorrelation(eventData));

    try {
      await this.publisher.publish(channel, payload);
    } catch (err) {
      console.error(`⚠️ Error al publicar evento en ${channel}:`, err.message);
    }
  }

  async subscribe(channel, handler) {
    this.init();
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
      await this.subscriber.subscribe(channel);
    }
    this.subscriptions.get(channel).push(handler);
  }

  // ==========================================
  // MÉTODOS REDIS STREAMS (Persistencia + DLQ)
  // ==========================================

  /**
   * Publica un evento persistente en un Redis Stream
   */
  async publishStream(streamKey, eventData) {
    this.init();
    const enriched = this._ensureCorrelation(eventData);
    const payload = JSON.stringify(enriched);

    try {
      // XADD streamKey MAXLEN ~ 5000 * data <payload>
      const messageId = await this.publisher.xadd(
        streamKey,
        'MAXLEN', '~', '5000',
        '*',
        'payload', payload,
        'type', enriched.type || 'UNKNOWN',
        'correlationId', enriched.correlationId
      );
      return messageId;
    } catch (err) {
      console.error(`❌ Error al publicar evento en stream ${streamKey}:`, err.message);
      throw err;
    }
  }

  /**
   * Registra un consumidor persistente en un Consumer Group con reintentos y DLQ
   */
  async consumeStream({ streamKey, groupName, consumerName, handler }) {
    this.init();

    // 1. Asegurar que el grupo de consumidores existe
    try {
      await this.streamClient.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
    } catch (err) {
      if (!err.message.includes('BUSYGROUP')) {
        console.warn(`⚠️ [EventBus xgroup error en ${streamKey}/${groupName}]:`, err.message);
      }
    }

    let isRunning = true;
    const retryTracker = new Map(); // id -> count

    const loop = async () => {
      while (isRunning) {
        try {
          // Leer nuevos mensajes dirigidos al grupo
          const response = await this.streamClient.xreadgroup(
            'GROUP', groupName, consumerName,
            'BLOCK', '2000',
            'COUNT', '5',
            'STREAMS', streamKey, '>'
          );

          if (response && response.length > 0) {
            const [stream, messages] = response[0];
            for (const [id, fields] of messages) {
              // Convertir array de campos en objeto
              const fieldObj = {};
              for (let i = 0; i < fields.length; i += 2) {
                fieldObj[fields[i]] = fields[i + 1];
              }

              let eventPayload = null;
              try {
                eventPayload = JSON.parse(fieldObj.payload);
              } catch (parseErr) {
                eventPayload = fieldObj;
              }

              // Ejecutar handler de procesamiento de la orden o catálogo
              try {
                await handler(eventPayload, id);
                // Confirmar procesamiento exitoso (ACK)
                await this.streamClient.xack(streamKey, groupName, id);
                retryTracker.delete(id);
              } catch (handlerErr) {
                console.error(`⚠️ [Stream Handler Error] (${streamKey}/${groupName}) id=${id}:`, handlerErr.message);
                const retries = (retryTracker.get(id) || 0) + 1;
                retryTracker.set(id, retries);

                if (retries >= 3) {
                  // Mover a Dead Letter Queue (DLQ) para auditoría
                  console.error(`🚨 [DLQ Alert] Evento ${id} excedió 3 reintentos. Moviendo a 'stream:dlq'...`);
                  await this.streamClient.xadd(
                    'stream:dlq',
                    '*',
                    'originalStream', streamKey,
                    'group', groupName,
                    'originalId', id,
                    'retries', retries.toString(),
                    'error', handlerErr.message,
                    'payload', JSON.stringify(eventPayload),
                    'failedAt', new Date().toISOString()
                  );
                  // Hacer ACK al mensaje original para no trabar el stream
                  await this.streamClient.xack(streamKey, groupName, id);
                  retryTracker.delete(id);
                }
              }
            }
          }
        } catch (readErr) {
          if (isRunning) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
    };

    loop();

    return () => {
      isRunning = false;
    };
  }

  /**
   * Lee los últimos mensajes de la Dead Letter Queue (DLQ)
   */
  async getDLQMessages(count = 10) {
    this.init();
    try {
      const messages = await this.streamClient.xrevrange('stream:dlq', '+', '-', 'COUNT', count);
      return messages.map(([id, fields]) => {
        const obj = { id };
        for (let i = 0; i < fields.length; i += 2) {
          obj[fields[i]] = fields[i + 1];
        }
        return obj;
      });
    } catch (e) {
      return [];
    }
  }
}

// Canales y nombres de eventos estándar
const CHANNELS = {
  ORDERS: 'agro.orders.events',
  AUTH: 'agro.auth.events',
  SUPPORT: 'agro.support.events',
  CATALOG: 'agro.catalog.events'
};

const STREAMS = {
  ORDERS: 'stream:orders',
  AUTH: 'stream:auth',
  CATALOG: 'stream:catalog',
  DLQ: 'stream:dlq'
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
  STREAMS,
  EVENTS
};
