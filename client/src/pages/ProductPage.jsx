import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { obtenerProducto, listarProductos } from '../api/productos.api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getProductImageUrl, handleProductImageError } from '../utils/productImage'
import { getAvatarUrl, handleAvatarError } from '../utils/avatar'
import { trackProductView, trackAddToCart } from '../utils/analytics'
import ProductCard from '../components/ProductCard'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { addToast } = useToast()

  const [producto, setProducto] = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setCantidad(1)

    obtenerProducto(id)
      .then((res) => {
        const prodData = res.data?.producto || res.data
        if (!prodData || !prodData.id_producto) {
          setError('El producto no fue encontrado.')
          return
        }
        setProducto(prodData)

        // Actualizar título y SEO en cliente
        const titleName = prodData.nombre || prodData.nombre_producto || 'Producto del Campo'
        document.title = `${titleName} - De los Montes de María`

        // Tracking GA4
        trackProductView(prodData)

        // Cargar productos relacionados
        listarProductos().then((allRes) => {
          const todos = allRes.data?.productos || allRes.data || []
          const filtrados = todos
            .filter((p) => String(p.id_producto) !== String(prodData.id_producto) && p.categoria === prodData.categoria)
            .slice(0, 4)
          setRelacionados(filtrados)
        }).catch(() => {})
      })
      .catch((err) => {
        console.error('Error al cargar producto:', err)
        setError('No se pudo cargar la información de este producto.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const formatCOP = (p) => {
    return Number(p || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Cargando cosecha fresca...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <i className="fa fa-basket-shopping" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 800, color: '#0f172a' }}>Producto no disponible</h3>
            <p style={{ color: '#64748b' }}>{error || 'El producto no existe o fue retirado del catálogo.'}</p>
            <Link to="/categorias" className="btn btn-primary" style={{ borderRadius: '999px', padding: '0.6rem 1.5rem', fontWeight: 700 }}>
              <i className="fa fa-arrow-left me-2" /> Explorar Cosechas
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const prodName = producto.nombre || producto.nombre_producto || 'Cosecha Campesina'
  const imageUrl = getProductImageUrl(producto)
  const isOutOfStock = Number(producto.stock || 0) <= 0
  const maxStock = Number(producto.stock || 99)
  const vendorId = producto.id_vendedor || producto.id_proveedor
  const vendorName = producto.vendedor_nombre || 'Campesino de Montes de María'
  const unidadText = producto.unidad_medida || 'unidad'
  const currentUrl = window.location.href

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(producto, cantidad)
    trackAddToCart(producto, cantidad)
    setAdded(true)
    addToast(`¡${cantidad}x ${prodName} agregado al carrito!`, 'success')
    setTimeout(() => setAdded(false), 2200)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopiado(true)
    addToast('¡Enlace del producto copiado al portapapeles!', 'info')
    setTimeout(() => setCopiado(false), 2500)
  }

  // Enlace directo de WhatsApp con mensaje personalizado
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Estoy interesado en comprar "${prodName}" (${formatCOP(producto.precio)}) que vi en De los Montes de María: ${currentUrl}`
  )
  const vendorPhone = (producto.vendedor_telefono || producto.telefono || '').replace(/\D/g, '')
  const whatsappUrl = vendorPhone
    ? `https://wa.me/57${vendorPhone}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" style={{ marginBottom: '1.5rem' }}>
            <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              <li><Link to="/" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Inicio</Link></li>
              <li>/</li>
              <li><Link to="/categorias" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Categorías</Link></li>
              {producto.categoria && (
                <>
                  <li>/</li>
                  <li><Link to={`/categoria/${producto.categoria}`} style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>{producto.categoria}</Link></li>
                </>
              )}
              <li>/</li>
              <li style={{ color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                {prodName}
              </li>
            </ol>
          </nav>

          {/* Tarjeta Principal del Producto */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              marginBottom: '3rem',
            }}
          >
            <div className="row g-0">
              {/* Columna Izquierda: Imagen y Badges */}
              <div className="col-lg-6" style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px', position: 'relative' }}>
                <img
                  src={imageUrl}
                  alt={prodName}
                  onError={(e) => handleProductImageError(e, prodName)}
                  style={{ width: '100%', height: '100%', maxHeight: '480px', objectFit: 'cover' }}
                />

                {/* Badge Región */}
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    color: '#15803d',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <i className="fa fa-seedling text-success" /> Montes de María Oficial
                </span>

                {/* Stock Badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: isOutOfStock ? '#fee2e2' : '#dcfce7',
                    color: isOutOfStock ? '#991b1b' : '#166534',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  {isOutOfStock ? 'Agotado' : `${producto.stock} ${unidadText} disponibles`}
                </span>
              </div>

              {/* Columna Derecha: Información y Compra */}
              <div className="col-lg-6" style={{ padding: '2.5rem' }}>
                {/* Vendedor Info */}
                {vendorId && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={getAvatarUrl(producto.vendedor_avatar || producto.avatar, vendorName)}
                        alt={vendorName}
                        onError={(e) => handleAvatarError(e, vendorName)}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
                      />
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Productor Campesino</span>
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{vendorName}</strong>
                      </div>
                    </div>
                    <Link
                      to={`/vendedor/${vendorId}`}
                      className="btn btn-sm btn-outline-success"
                      style={{ borderRadius: '999px', fontWeight: 700, fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
                    >
                      Ver Finca
                    </Link>
                  </div>
                )}

                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.25 }}>
                  {prodName}
                </h1>

                {/* Categoría y Municipio */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {producto.categoria && (
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '8px' }}>
                      <i className="fa fa-tag me-1 text-primary" /> {producto.categoria}
                    </span>
                  )}
                  {producto.municipio && (
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '8px' }}>
                      <i className="fa fa-location-dot me-1 text-danger" /> {producto.municipio}
                    </span>
                  )}
                </div>

                {/* Precio */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#16a34a' }}>
                      {formatCOP(producto.precio)}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                      / {unidadText}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Origen y Detalles
                  </h6>
                  <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                    {producto.descripcion || 'Producto 100% cultivado en las fértiles tierras de los Montes de María, sin intermediarios.'}
                  </p>
                </div>

                {/* Cantidad y Acciones de Compra */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Cantidad:</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '999px', padding: '0.2rem 0.6rem' }}>
                      <button
                        type="button"
                        onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                        disabled={cantidad <= 1 || isOutOfStock}
                        style={{ border: 'none', background: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', padding: '0 0.5rem' }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                        {cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCantidad((c) => Math.min(maxStock, c + 1))}
                        disabled={cantidad >= maxStock || isOutOfStock}
                        style={{ border: 'none', background: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', padding: '0 0.5rem' }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Total: <strong style={{ color: '#0f172a' }}>{formatCOP(Number(producto.precio || 0) * cantidad)}</strong>
                    </span>
                  </div>

                  {/* Botón Principal: Agregar al Carrito */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`btn ${added ? 'btn-success' : 'btn-primary'} w-100`}
                    style={{
                      padding: '0.9rem',
                      borderRadius: '16px',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      marginBottom: '0.75rem',
                      boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {added ? (
                      <><i className="fa fa-check-circle me-2" /> ¡Agregado al Carrito ({cantidad})!</>
                    ) : isOutOfStock ? (
                      <><i className="fa fa-ban me-2" /> Producto Agotado</>
                    ) : (
                      <><i className="fa fa-cart-plus me-2" /> Agregar al Carrito</>
                    )}
                  </button>

                  {/* Botones Secundarios: WhatsApp Directo y Compartir */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success"
                      style={{
                        borderRadius: '14px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <i className="fab fa-whatsapp text-success fs-5" /> Preguntar al Campesino
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="btn btn-outline-secondary"
                      style={{
                        borderRadius: '14px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <i className={`fa ${copiado ? 'fa-check text-success' : 'fa-share-nodes'}`} />
                      {copiado ? '¡Copiado!' : 'Compartir Producto'}
                    </button>
                  </div>
                </div>

                {/* Garantías Agroecológicas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                    <i className="fa fa-truck-fast text-success fs-6" />
                    <span>Envíos a todo el Caribe y Colombia</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                    <i className="fa fa-hand-holding-heart text-danger fs-6" />
                    <span>Pago 100% seguro a familias rurales</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Cosechas Relacionadas */}
          {relacionados.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h4 style={{ fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Más productos de {producto.categoria || 'la región'}
                </h4>
                <Link to={`/categoria/${producto.categoria}`} style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                  Ver todos <i className="fa fa-arrow-right ms-1" />
                </Link>
              </div>

              <div className="row g-3">
                {relacionados.map((rel) => (
                  <div className="col-6 col-md-3" key={rel.id_producto || rel.id}>
                    <ProductCard producto={rel} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
