/**
 * Adaptador de Persistencia: MySQLShipmentRepository
 * Implementa ShipmentRepositoryPort operando exclusivamente sobre `db_logistics`.
 */
const ShipmentRepositoryPort = require('../../domain/ports/outbound/repositories/ShipmentRepositoryPort');
const Shipment = require('../../domain/entities/Shipment');
const db = require('./Database');

class MySQLShipmentRepository extends ShipmentRepositoryPort {
  async createShipment(shipment) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO envios (
          tracking_number, order_id, customer_name, customer_phone,
          origin_region, destination_city, destination_address,
          shipping_cost, carrier_name, status, estimated_delivery, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        shipment.tracking_number,
        shipment.order_id,
        shipment.customer_name,
        shipment.customer_phone,
        shipment.origin_region,
        shipment.destination_city,
        shipment.destination_address,
        shipment.shipping_cost,
        shipment.carrier_name,
        shipment.status,
        shipment.estimated_delivery,
        shipment.notes
      ];

      db.query(sql, params, (err, res) => {
        if (err) return reject(err);

        const newId = res.insertId;

        // Registrar primer evento de trazabilidad
        const eventSql = `
          INSERT INTO envio_historial (shipment_id, status, location, description)
          VALUES (?, ?, ?, ?)
        `;
        db.query(
          eventSql,
          [newId, shipment.status, shipment.origin_region, 'Guía de recolección rural creada en el sistema.'],
          (evtErr) => {
            if (evtErr) console.warn('⚠️ [Logistics] Error guardando historial inicial:', evtErr.message);

            resolve(new Shipment({
              ...shipment,
              id: newId,
              history: [{
                status: shipment.status,
                location: shipment.origin_region,
                description: 'Guía de recolección rural creada en el sistema.',
                timestamp: new Date()
              }]
            }));
          }
        );
      });
    });
  }

  async findByTrackingNumber(trackingNumber) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM envios WHERE tracking_number = ? LIMIT 1`;
      db.query(sql, [trackingNumber], (err, rows) => {
        if (err) return reject(err);
        if (!rows || rows.length === 0) return resolve(null);

        const row = rows[0];

        // Obtener historial
        const histSql = `SELECT * FROM envio_historial WHERE shipment_id = ? ORDER BY timestamp DESC`;
        db.query(histSql, [row.id], (hErr, histRows) => {
          if (hErr) return reject(hErr);
          resolve(new Shipment({ ...row, history: histRows || [] }));
        });
      });
    });
  }

  async findByOrderId(orderId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM envios WHERE order_id = ? ORDER BY id DESC LIMIT 1`;
      db.query(sql, [orderId], (err, rows) => {
        if (err) return reject(err);
        if (!rows || rows.length === 0) return resolve(null);

        const row = rows[0];
        const histSql = `SELECT * FROM envio_historial WHERE shipment_id = ? ORDER BY timestamp DESC`;
        db.query(histSql, [row.id], (hErr, histRows) => {
          if (hErr) return reject(hErr);
          resolve(new Shipment({ ...row, history: histRows || [] }));
        });
      });
    });
  }

  async updateStatus(shipmentId, status, location, description) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE envios SET status = ?, updated_at = NOW() WHERE id = ?`;
      db.query(sql, [status, shipmentId], (err, res) => {
        if (err) return reject(err);
        if (res.affectedRows === 0) return reject(new Error('Guía de envío no encontrada'));

        // Agregar al historial
        const histSql = `
          INSERT INTO envio_historial (shipment_id, status, location, description)
          VALUES (?, ?, ?, ?)
        `;
        db.query(histSql, [shipmentId, status, location, description], (hErr) => {
          if (hErr) return reject(hErr);

          // Retornar entidad actualizada
          const fetchSql = `SELECT * FROM envios WHERE id = ?`;
          db.query(fetchSql, [shipmentId], (fErr, rows) => {
            if (fErr) return reject(fErr);
            const row = rows[0];

            db.query(`SELECT * FROM envio_historial WHERE shipment_id = ? ORDER BY timestamp DESC`, [shipmentId], (qhErr, hRows) => {
              if (qhErr) return reject(qhErr);
              resolve(new Shipment({ ...row, history: hRows || [] }));
            });
          });
        });
      });
    });
  }

  async listShipments({ limit = 50, offset = 0, status } = {}) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM envios`;
      const params = [];

      if (status) {
        sql += ` WHERE status = ?`;
        params.push(status);
      }

      sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      db.query(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(r => new Shipment(r)));
      });
    });
  }

  async getShippingRate(city) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tarifas_flete WHERE city LIKE ? AND active = 1 LIMIT 1`;
      db.query(sql, [`%${city}%`], (err, rows) => {
        if (err) return reject(err);
        resolve(rows && rows.length > 0 ? rows[0] : null);
      });
    });
  }

  async listAllRates() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tarifas_flete WHERE active = 1 ORDER BY zone ASC, city ASC`;
      db.query(sql, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
}

module.exports = MySQLShipmentRepository;
