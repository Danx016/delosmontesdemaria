/**
 * Implementación concreta de CompraRepository usando MySQL
 */
const CompraRepository = require('../../domain/repositories/CompraRepository');
const Compra = require('../../domain/entities/Compra');
const ItemCompra = require('../../domain/entities/ItemCompra');
const db = require('./Database');

class MySQLCompraRepository extends CompraRepository {
  async crear(compraData) {
    return new Promise((resolve, reject) => {
      const { id_usuario, total, metodo_pago, direccion_envio, productos } = compraData;

      db.getConnection((connErr, conn) => {
        if (connErr) return reject(connErr);

        conn.beginTransaction((txErr) => {
          if (txErr) {
            conn.release();
            return reject(txErr);
          }

          const sqlHeader = 'INSERT INTO compras (id_usuario, total, metodo_pago, direccion_envio, estado) VALUES (?, ?, ?, ?, ?)';
          conn.query(sqlHeader, [id_usuario, total, metodo_pago || 'Tarjeta de Crédito', direccion_envio || 'No especificada', 'Pedido recibido'], (errHeader, resHeader) => {
            if (errHeader) {
              return conn.rollback(() => {
                conn.release();
                reject(errHeader);
              });
            }

            const idCompra = resHeader.insertId;
            const items = productos || [];

            if (items.length === 0) {
              return conn.commit((commitErr) => {
                if (commitErr) {
                  return conn.rollback(() => {
                    conn.release();
                    reject(commitErr);
                  });
                }
                conn.release();
                resolve({ id_compra: idCompra, ...compraData });
              });
            }

            const itemPromises = items.map(item => {
              return new Promise((resItem, rejItem) => {
                const idProd = item.idProducto || item.id_producto || item.id;
                const cantidad = item.cantidad || 1;
                const precio = item.precio || item.precio_unitario || 0;

                conn.query(
                  'INSERT INTO compra_detalles (id_compra, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                  [idCompra, idProd, cantidad, precio],
                  (errDetail) => {
                    if (errDetail) return rejItem(errDetail);

                    // Descontar stock de producto
                    conn.query(
                      'UPDATE productos SET stock = CASE WHEN stock - ? < 0 THEN 0 ELSE stock - ? END WHERE id_producto = ?',
                      [cantidad, cantidad, idProd],
                      (stockErr) => {
                        if (stockErr) console.error('Error descontando stock:', stockErr);
                        resItem();
                      }
                    );
                  }
                );
              });
            });

            Promise.all(itemPromises)
              .then(() => {
                conn.commit((commitErr) => {
                  if (commitErr) {
                    return conn.rollback(() => {
                      conn.release();
                      reject(commitErr);
                    });
                  }
                  conn.release();
                  resolve({ id_compra: idCompra, ...compraData });
                });
              })
              .catch(itemErr => {
                conn.rollback(() => {
                  conn.release();
                  reject(itemErr);
                });
              });
          });
        });
      });
    });
  }

  async buscarPorId(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM compras WHERE id_compra = ?', [id], (err, rows) => {
        if (err) return reject(err);
        if (!rows || rows.length === 0) return resolve(null);

        const compra = new Compra(rows[0]);
        this.obtenerDetalles(id)
          .then(detalles => {
            compra.detalles = detalles;
            resolve(compra);
          })
          .catch(reject);
      });
    });
  }

  async obtenerReciboCompleto(idCompra) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT c.id_compra, c.id_usuario, c.fecha, c.total, c.estado, c.metodo_pago, c.direccion_envio, c.reembolsado,
                          COALESCE(u.nombre, 'Cliente') AS nombre_cliente, u.correo AS correo_cliente
                   FROM compras c 
                   LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario 
                   WHERE c.id_compra = ?`;

      db.query(sql, [idCompra], (err, headerRows) => {
        if (err) return reject(err);
        if (!headerRows || headerRows.length === 0) return resolve(null);

        const recibo = headerRows[0];

        const detailSql = `SELECT cd.id_detalle, cd.id_compra, cd.id_producto, cd.cantidad, cd.precio_unitario,
                                  p.nombre_producto, p.presentacion
                           FROM compra_detalles cd 
                           JOIN productos p ON cd.id_producto = p.id_producto 
                           WHERE cd.id_compra = ?`;

        db.query(detailSql, [idCompra], (detailErr, detailRows) => {
          if (detailErr) return reject(detailErr);
          recibo.detalles = (detailRows || []).map(r => new ItemCompra(r));
          resolve(recibo);
        });
      });
    });
  }

  async actualizarEstado(idCompra, nuevoEstado) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE compras SET estado = ? WHERE id_compra = ?', [nuevoEstado, idCompra], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  async marcarReembolsado(idCompra) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE compras SET reembolsado = 1 WHERE id_compra = ?', [idCompra], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  async eliminar(idCompra) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM compra_detalles WHERE id_compra = ?', [idCompra], (errDetails) => {
        if (errDetails) return reject(errDetails);
        db.query('DELETE FROM compras WHERE id_compra = ?', [idCompra], (errHead) => {
          if (errHead) return reject(errHead);
          resolve(true);
        });
      });
    });
  }

  async listarPorUsuario(idUsuario) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM compras WHERE id_usuario = ? ORDER BY fecha DESC', [idUsuario], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(r => new Compra(r)));
      });
    });
  }

  async listarTodas(search = null) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT c.id_compra, c.id_usuario, c.fecha, c.total, c.estado, c.metodo_pago, c.direccion_envio, c.reembolsado,
                        u.nombre AS nombre_usuario, u.correo 
                 FROM compras c 
                 LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario`;
      const params = [];
      if (search) {
        sql += ' WHERE c.id_compra LIKE ? OR c.estado LIKE ? OR u.nombre LIKE ? OR u.correo LIKE ?';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }
      sql += ' ORDER BY c.fecha DESC';

      db.query(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async listarParaVendedores(sellerId = null) {
    return new Promise((resolve, reject) => {
      let sqlHeader = `SELECT DISTINCT c.id_compra, c.fecha, c.total, c.estado, c.direccion_envio, 
                                u.nombre AS nombre_cliente, u.correo AS correo_cliente,
                                u.nombre AS cliente_nombre, u.correo AS cliente_correo
                         FROM compras c 
                         JOIN usuarios u ON c.id_usuario = u.id_usuario `;
      const headerParams = [];

      if (sellerId) {
        sqlHeader += `JOIN compra_detalles cd ON cd.id_compra = c.id_compra
                      JOIN productos p ON cd.id_producto = p.id_producto
                      WHERE (p.id_vendedor = ? OR p.id_proveedor = ?) `;
        headerParams.push(sellerId, sellerId);
      }

      sqlHeader += `ORDER BY c.fecha DESC`;

      db.query(sqlHeader, headerParams, (err, compras) => {
        if (err) return reject(err);
        if (!compras || compras.length === 0) return resolve([]);

        let sqlDetails = `SELECT cd.id_compra, cd.cantidad, cd.precio_unitario, p.nombre_producto, p.id_vendedor, p.id_proveedor 
                            FROM compra_detalles cd 
                            JOIN productos p ON cd.id_producto = p.id_producto`;
        const detailsParams = [];

        if (sellerId) {
          sqlDetails += ` WHERE (p.id_vendedor = ? OR p.id_proveedor = ?)`;
          detailsParams.push(sellerId, sellerId);
        }

        db.query(sqlDetails, detailsParams, (errD, details) => {
          if (errD) return reject(errD);
          const map = compras.map(c => {
            const myDetails = (details || []).filter(d => d.id_compra === c.id_compra);
            c.detalles = myDetails;
            if (sellerId && myDetails.length > 0) {
              c.total = myDetails.reduce((sum, d) => sum + (Number(d.cantidad || 1) * Number(d.precio_unitario || 0)), 0);
            }
            return c;
          });
          resolve(map);
        });
      });
    });
  }

  async obtenerDetalles(idCompra) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM compra_detalles WHERE id_compra = ?', [idCompra], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async obtenerEstadisticasGlobales() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          (SELECT IFNULL(SUM(total), 0) FROM compras) as ingresos,
          (SELECT COUNT(*) FROM compras) as ventas,
          (SELECT COUNT(*) FROM usuarios) as usuarios,
          (SELECT COUNT(*) FROM productos) as productos
      `;
      db.query(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0] || { ingresos: 0, ventas: 0, usuarios: 0, productos: 0 });
      });
    });
  }

  async obtenerDesgloseEstadisticas() {
    return new Promise((resolve, reject) => {
      const queryPromise = (sql) => new Promise((res, rej) => db.query(sql, (e, r) => e ? rej(e) : res(r || [])));
      Promise.all([
        queryPromise("SELECT IFNULL(categoria, 'Sin Categoría') as categoria, COUNT(*) as cantidad FROM productos GROUP BY categoria"),
        queryPromise("SELECT id_rol, COUNT(*) as cantidad FROM usuarios GROUP BY id_rol"),
        queryPromise("SELECT IFNULL(estado, 'Completado') as estado, COUNT(*) as cantidad FROM compras GROUP BY estado")
      ]).then(([productosCat, usuariosRol, ventasEstado]) => {
        resolve({ productosCat, usuariosRol, ventasEstado });
      }).catch(reject);
    });
  }
}

module.exports = MySQLCompraRepository;