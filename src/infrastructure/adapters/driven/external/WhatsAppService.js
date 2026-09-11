/**
 * Adaptador de Infraestructura: WhatsAppService (Meta Cloud API)
 * Implementa WhatsAppServicePort llamando a la Graph API oficial de Meta.
 */
const https = require('https');
const WhatsAppServicePort = require('../../../../domain/ports/outbound/services/WhatsAppServicePort');

class WhatsAppService extends WhatsAppServicePort {
  constructor({ token, phoneNumberId } = {}) {
    super();
    this.token = token || process.env.WHATSAPP_TOKEN;
    this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '1380646575122625';
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
  }

  isConfigured() {
    return Boolean(this.token && this.phoneNumberId);
  }

  /**
   * Limpia y normaliza el número al formato internacional E.164 sin '+'
   * Ej: +57 300 123 4567 -> 573001234567
   */
  formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = String(phone).replace(/\D/g, '');
    // Si empieza por 3 (número móvil en Colombia de 10 dígitos), anteponer 57
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
      cleaned = `57${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Envía una petición HTTP POST a la Meta WhatsApp Cloud API
   */
  async _postToMeta(payload) {
    if (!this.isConfigured()) {
      console.warn('⚠️ [WhatsApp] Servicio no configurado. Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID en .env');
      return { skipped: true, reason: 'NOT_CONFIGURED' };
    }

    return new Promise((resolve, reject) => {
      const dataString = JSON.stringify(payload);
      const options = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: `/${this.apiVersion}/${this.phoneNumberId}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              console.error(`❌ [WhatsApp Meta API Error ${res.statusCode}]:`, parsed);
              reject(new Error(parsed.error?.message || `Error HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(new Error(`Respuesta inválida de Meta: ${responseData}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(dataString);
      req.end();
    });
  }

  /**
   * Envía un mensaje de texto plano enriquecido
   */
  async sendMessage(to, text) {
    const cleanTo = this.formatPhoneNumber(to);
    if (!cleanTo) throw new Error('Número de teléfono inválido');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: {
        preview_url: true,
        body: text
      }
    };

    return this._postToMeta(payload);
  }

  /**
   * Envía alerta de venta al campesino / productor
   */
  async sendOrderAlertToFarmer(to, orderData) {
    const { orderId, total, items, shippingAddress } = orderData;
    const itemsText = Array.isArray(items)
      ? items.map(i => `• ${i.cantidad || i.quantity || 1}x ${i.nombre || i.nombre_producto || 'Producto'}`).join('\n')
      : '• Productos agrícolas';

    const message = `🌾 *¡NUEVA VENTA EN DE LOS MONTES DE MARÍA!*\n\n` +
                    `📦 *Orden:* #${orderId}\n` +
                    `💰 *Total:* $${Number(total || 0).toLocaleString('es-CO')} COP\n` +
                    `📍 *Entrega:* ${shippingAddress || 'Dirección registrada'}\n\n` +
                    `🛒 *Cosechas solicitadas:*\n${itemsText}\n\n` +
                    `🚜 Por favor ten listo el pedido para la recolección del transporte rural.`;

    return this.sendMessage(to, message);
  }

  /**
   * Envía confirmación de compra al cliente
   */
  async sendOrderConfirmationToBuyer(to, orderData) {
    const { orderId, total } = orderData;
    const message = `✅ *¡Hola! Tu compra en De los Montes de María fue confirmada.*\n\n` +
                    `📦 *Orden:* #${orderId}\n` +
                    `💰 *Total Pagado:* $${Number(total || 0).toLocaleString('es-CO')} COP\n\n` +
                    `Nuestros campesinos ya están alistando tus cosechas frescas del campo. Puedes ver tu factura y estado aquí:\n` +
                    `👉 https://delosmontesdemaria.duckdns.org/perfil`;

    return this.sendMessage(to, message);
  }
}

module.exports = WhatsAppService;
