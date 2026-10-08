/**
 * Controlador: ProductoController
 * Maneja operaciones del catálogo de productos mediante casos de uso y repositorios inyectados
 */
const CreateProduct = require('../../domain/use-cases/CreateProduct');
const UpdateProduct = require('../../domain/use-cases/product/UpdateProduct');
const DeleteProduct = require('../../domain/use-cases/product/DeleteProduct');
const SearchProducts = require('../../domain/use-cases/product/SearchProducts');

class ProductoController {
  constructor({ productoRepository, categoriaRepository }) {
    this.productoRepository = productoRepository;
    this.categoriaRepository = categoriaRepository;
    this.createProduct = new CreateProduct(productoRepository);
    this.updateProduct = new UpdateProduct(productoRepository);
    this.deleteProduct = new DeleteProduct(productoRepository);
    this.searchProducts = new SearchProducts(productoRepository);
  }

  async listar(req, res) {
    try {
      const productos = await this.productoRepository.listarTodos();
      res.json(productos.map(p => p.toJSON()));
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const producto = await this.productoRepository.buscarPorId(req.params.id_producto);
      if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(producto.toJSON());
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  }

  async crear(req, res) {
    try {
      const { nombre, precio, imagen, imagenes_existentes, imagenes, descripcion, categoria, origen, presentacion, cuidado, disponibilidad, id_vendedor, stock, unidad_medida } = req.body;

      let uploadedUrls = [];
      if (req.files) {
        const filesList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        uploadedUrls = filesList.map(f => `/uploads/products/${f.filename}`);
      } else if (req.file) {
        uploadedUrls = [`/uploads/products/${req.file.filename}`];
      }

      let existingUrls = [];
      const rawExistentes = imagenes_existentes || imagenes;
      if (rawExistentes) {
        try {
          const parsed = typeof rawExistentes === 'string' ? JSON.parse(rawExistentes) : rawExistentes;
          if (Array.isArray(parsed)) existingUrls = parsed;
          else if (typeof parsed === 'string') existingUrls = [parsed];
        } catch (e) {
          if (typeof rawExistentes === 'string') {
            existingUrls = rawExistentes.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
      }

      const allUrls = [...existingUrls, ...uploadedUrls];
      let finalImagen = '/img/Logo.jpg';
      if (allUrls.length > 1) {
        finalImagen = JSON.stringify(allUrls);
      } else if (allUrls.length === 1) {
        finalImagen = allUrls[0];
      } else if (imagen) {
        finalImagen = imagen;
      }

      const vendorId = req.user?.id || req.user?.id_usuario || id_vendedor || null;

      const nuevo = await this.createProduct.execute({
        id_vendedor: vendorId,
        id_proveedor: vendorId,
        nombre_producto: nombre,
        precio: parseFloat(precio),
        stock: stock !== undefined && stock !== '' ? parseInt(stock, 10) : 0,
        unidad_medida: unidad_medida || 'Kg',
        imagen: finalImagen,
        descripcion: descripcion || '',
        categoria: categoria || 'cosechas',
        origen: origen || 'Montes de María',
        presentacion: presentacion || '',
        cuidado: cuidado || '',
        disponibilidad: disponibilidad || 'disponible'
      });

      res.status(201).json(nuevo.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const productId = req.params.id_producto;
      const { nombre, precio, imagen, imagenes_existentes, imagenes, descripcion, categoria, origen, presentacion, cuidado, disponibilidad, stock, unidad_medida } = req.body;

      const current = await this.productoRepository.buscarPorId(productId);
      if (!current) return res.status(404).json({ error: 'Producto no encontrado' });

      // Verificación de pertenencia si no es administrador
      const userRole = Number(req.user?.role || req.user?.id_rol);
      const userId = Number(req.user?.id || req.user?.id_usuario);
      if (userRole !== 1 && req.user?.username !== 'admin') {
        const prodVendorId = Number(current.id_vendedor || current.id_proveedor);
        if (prodVendorId !== userId) {
          return res.status(403).json({ error: 'No tienes permisos para modificar este producto de otro vendedor.' });
        }
      }

      let uploadedUrls = [];
      if (req.files) {
        const filesList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        uploadedUrls = filesList.map(f => `/uploads/products/${f.filename}`);
      } else if (req.file) {
        uploadedUrls = [`/uploads/products/${req.file.filename}`];
      }

      const rawExistentes = imagenes_existentes !== undefined ? imagenes_existentes : imagenes;
      let finalImagen;
      if (uploadedUrls.length > 0 || rawExistentes !== undefined) {
        let existingUrls = [];
        if (rawExistentes) {
          try {
            const parsed = typeof rawExistentes === 'string' ? JSON.parse(rawExistentes) : rawExistentes;
            if (Array.isArray(parsed)) existingUrls = parsed;
            else if (typeof parsed === 'string') existingUrls = [parsed];
          } catch (e) {
            if (typeof rawExistentes === 'string') {
              existingUrls = rawExistentes.split(',').map(s => s.trim()).filter(Boolean);
            }
          }
        }
        const allUrls = [...existingUrls, ...uploadedUrls];
        if (allUrls.length > 1) {
          finalImagen = JSON.stringify(allUrls);
        } else if (allUrls.length === 1) {
          finalImagen = allUrls[0];
        } else {
          finalImagen = imagen || current.imagen || '/img/Logo.jpg';
        }
      } else {
        finalImagen = imagen || current.imagen;
      }

      const updated = await this.updateProduct.execute(productId, {
        nombre_producto: nombre !== undefined ? nombre : current.nombre_producto,
        precio: precio !== undefined ? parseFloat(precio) : current.precio,
        stock: stock !== undefined && stock !== '' ? parseInt(stock, 10) : current.stock,
        unidad_medida: unidad_medida !== undefined ? unidad_medida : current.unidad_medida,
        imagen: finalImagen,
        descripcion: descripcion !== undefined ? descripcion : current.descripcion,
        categoria: categoria !== undefined ? categoria : current.categoria,
        origen: origen !== undefined ? origen : current.origen,
        presentacion: presentacion !== undefined ? presentacion : current.presentacion,
        cuidado: cuidado !== undefined ? cuidado : current.cuidado,
        disponibilidad: disponibilidad !== undefined ? disponibilidad : current.disponibilidad
      });

      res.json(updated.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const productId = req.params.id_producto;
      const current = await this.productoRepository.buscarPorId(productId);
      if (!current) return res.status(404).json({ error: 'Producto no encontrado' });

      // Verificación de pertenencia si no es administrador
      const userRole = Number(req.user?.role || req.user?.id_rol);
      const userId = Number(req.user?.id || req.user?.id_usuario);
      if (userRole !== 1 && req.user?.username !== 'admin') {
        const prodVendorId = Number(current.id_vendedor || current.id_proveedor);
        if (prodVendorId !== userId) {
          return res.status(403).json({ error: 'No tienes permisos para eliminar este producto de otro vendedor.' });
        }
      }

      await this.deleteProduct.execute(productId);
      res.json({ success: true, message: '¡Producto eliminado con éxito!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async listarCategorias(req, res) {
    try {
      if (!this.categoriaRepository) {
        return res.json([]);
      }
      const categorias = await this.categoriaRepository.obtenerTodas();
      res.json(categorias || []);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  }

  async buscar(req, res) {
    try {
      const q = (req.query.q || '').trim();
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
      const resultados = await this.searchProducts.execute(q, limit);
      res.json(resultados.map(p => p.toJSON()));
    } catch (error) {
      res.status(500).json({ error: 'Error al buscar productos' });
    }
  }
}

module.exports = ProductoController;