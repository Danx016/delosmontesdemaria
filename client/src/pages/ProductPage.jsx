import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { obtenerProducto, listarProductos, listarResenasProducto, crearResenaProducto } from '../api/productos.api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { getProductImageUrl, getProductImages, handleProductImageError } from '../utils/productImage'
import { getAvatarUrl, handleAvatarError } from '../utils/avatar'
import { trackProductView, trackAddToCart } from '../utils/analytics'
import ProductCard from '../components/ProductCard'

export default function ProductPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { addToast } = useToast()

  const [producto, setProducto] = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Reseñas y calificaciones
  const [resenas, setResenas] = useState([])
  const [promedioRating, setPromedioRating] = useState(0)
  const [totalResenas, setTotalResenas] = useState(0)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [fotoPreview, setFotoPreview] = useState('')

  // Formulario de nueva reseña
  const [formResena, setFormResena] = useState({
    nombre_usuario: user?.nombre || user?.username || '',
    ciudad: 'Montes de María',
    rating: 5,
    comentario: '',
    foto_url: '',
  })

  useEffect(() => {
    if (user?.nombre || user?.username) {
      setFormResena((prev) => ({
        ...prev,
        nombre_usuario: user.nombre || user.username || '',
      }))
    }
  }, [user])

  const cargarResenas = (prodId) => {
    listarResenasProducto(prodId)
      .then((res) => {
        setResenas(res.data?.resenas || [])
        setTotalResenas(res.data?.total || 0)
        setPromedioRating(res.data?.promedio ? Number(res.data.promedio) : 0)
      })
      .catch((err) => {
        console.error('Error al cargar reseñas:', err)
      })
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    setCantidad(1)
    setMostrarFormulario(false)
    setActiveImageIndex(0)

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

        // Cargar reseñas del producto
        cargarResenas(prodData.id_producto)

        // Cargar productos relacionados
        listarProductos()
          .then((allRes) => {
            const todos = allRes.data?.productos || allRes.data || []
            const filtrados = todos
              .filter(
                (p) =>
                  String(p.id_producto) !== String(prodData.id_producto) &&
                  p.categoria === prodData.categoria
              )
              .slice(0, 4)
            setRelacionados(filtrados)
          })
          .catch(() => {})
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

  const handleSubirFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result
      setFotoPreview(dataUrl)
      setFormResena((prev) => ({ ...prev, foto_url: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleEnviarResena = async (e) => {
    e.preventDefault()
    if (!formResena.nombre_usuario.trim() || !formResena.comentario.trim()) {
      addToast('Por favor ingresa tu nombre y tu comentario.', 'warning')
      return
    }

    try {
      setEnviandoResena(true)
      await crearResenaProducto(producto.id_producto, formResena)
      addToast('¡Gracias por tu reseña! Ayuda mucho a nuestros campesinos.', 'success')
      setMostrarFormulario(false)
      setFotoPreview('')
      setFormResena({
        nombre_usuario: user?.nombre || user?.username || '',
        ciudad: 'Montes de María',
        rating: 5,
        comentario: '',
        foto_url: '',
      })
      cargarResenas(producto.id_producto)
    } catch (err) {
      console.error('Error al enviar reseña:', err)
      addToast('No se pudo guardar la reseña. Inténtalo de nuevo.', 'error')
    } finally {
      setEnviandoResena(false)
    }
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

  const vendorGreeting = vendorName && vendorName !== 'Campesino de Montes de María' ? `Don/Doña ${vendorName}` : 'amigo campesino'
  const whatsappMessage = encodeURIComponent(
    `Hola ${vendorGreeting}, vi tu producto "${prodName}" (${formatCOP(producto.precio)}) en De los Montes de María y me interesa comprarlo. ¿Tienen disponibilidad para envío? Enlace: ${currentUrl}`
  )
  const vendorPhone = (producto.vendedor_telefono || producto.telefono || '').replace(/\D/g, '')
  const whatsappUrl = vendorPhone
    ? `https://wa.me/57${vendorPhone}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto', width: '100%' }}>
          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" style={{ marginBottom: '1.5rem' }}>
            <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#64748b', alignItems: 'center' }}>
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
              <li style={{ color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                {prodName}
              </li>
            </ol>
          </nav>

          {/* Tarjeta Principal del Producto - 2 Columnas Elegantes y Balanceadas */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              alignItems: 'stretch',
            }}
          >
            {/* Columna Izquierda: Galería de Fotos y Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRadius: '24px 0 0 24px', overflow: 'hidden' }}>
              <div
                style={{
                  background: '#f8fafc',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '380px',
                  maxHeight: '480px',
                  overflow: 'hidden',
                  flex: 1,
                }}
              >
                {(() => {
                  const productImages = getProductImages(producto)
                  const currentImg = productImages[activeImageIndex] || productImages[0] || imageUrl
                  return (
                    <>
                      <img
                        src={currentImg}
                        alt={`${prodName} - vista ${activeImageIndex + 1}`}
                        onError={(e) => handleProductImageError(e, prodName)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'all 0.25s ease',
                        }}
                      />

                      {/* Flechas si hay más de una foto */}
                      {productImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))}
                            aria-label="Foto anterior"
                            style={{
                              position: 'absolute',
                              left: '0.75rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              color: '#0f172a',
                              zIndex: 10,
                            }}
                          >
                            <i className="fa fa-chevron-left" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))}
                            aria-label="Siguiente foto"
                            style={{
                              position: 'absolute',
                              right: '0.75rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              color: '#0f172a',
                              zIndex: 10,
                            }}
                          >
                            <i className="fa fa-chevron-right" />
                          </button>

                          <span
                            style={{
                              position: 'absolute',
                              bottom: '0.75rem',
                              right: '0.75rem',
                              background: 'rgba(15, 23, 42, 0.75)',
                              color: '#ffffff',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              zIndex: 10,
                            }}
                          >
                            📷 {activeImageIndex + 1} / {productImages.length}
                          </span>
                        </>
                      )}
                    </>
                  )
                })()}

                {/* Badge Región */}
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    color: '#15803d',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    zIndex: 5,
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
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    zIndex: 5,
                  }}
                >
                  {isOutOfStock ? 'Agotado' : `${producto.stock} ${unidadText} disponibles`}
                </span>
              </div>

              {/* Tira de Miniaturas si hay múltiples fotos */}
              {(() => {
                const productImages = getProductImages(producto)
                if (productImages.length <= 1) return null
                return (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      padding: '0.65rem 1rem 0.85rem 1rem',
                      background: '#f1f5f9',
                      borderTop: '1px solid #e2e8f0',
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    {productImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        style={{
                          padding: 0,
                          border: idx === activeImageIndex ? '2px solid #16a34a' : '2px solid transparent',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          width: '56px',
                          height: '56px',
                          flexShrink: 0,
                          cursor: 'pointer',
                          background: '#ffffff',
                          boxShadow: idx === activeImageIndex ? '0 0 0 2px rgba(22, 163, 74, 0.3)' : 'none',
                          transform: idx === activeImageIndex ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Miniatura ${idx + 1}`}
                          onError={(e) => handleProductImageError(e, prodName)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Columna Derecha: Información y Acciones */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
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

                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', lineHeight: 1.25 }}>
                  {prodName}
                </h1>

                {/* Calificación y Categoría */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {totalResenas > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#eab308' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fa ${
                            star <= Math.floor(promedioRating)
                              ? 'fa-star'
                              : star - 0.5 <= promedioRating
                              ? 'fa-star-half-o'
                              : 'fa-star-o'
                          }`}
                        />
                      ))}
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', marginLeft: '0.2rem' }}>
                        {promedioRating.toFixed(1)}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        ({totalResenas} {totalResenas === 1 ? 'opinión verificada' : 'opiniones verificadas'})
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i key={star} className="fa fa-star-o" style={{ color: '#cbd5e1' }} />
                      ))}
                      <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                        Sin opiniones aún
                      </span>
                    </div>
                  )}

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
                    <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a' }}>
                      {formatCOP(producto.precio)}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>
                      / {unidadText}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
                    Origen y Frescura
                  </h6>
                  <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                    {producto.descripcion || 'Cosecha fresca 100% cultivada en las fértiles tierras de los Montes de María, recolectada directamente por familias campesinas.'}
                  </p>
                </div>
              </div>

              {/* Acciones de Compra y Botones */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Cantidad:</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '999px', padding: '0.25rem 0.75rem', background: '#ffffff' }}>
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                      disabled={cantidad <= 1 || isOutOfStock}
                      style={{ border: 'none', background: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.5rem', color: cantidad <= 1 ? '#cbd5e1' : '#0f172a' }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                      {cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.min(maxStock, c + 1))}
                      disabled={cantidad >= maxStock || isOutOfStock}
                      style={{ border: 'none', background: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.5rem', color: cantidad >= maxStock ? '#cbd5e1' : '#0f172a' }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Subtotal: <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>{formatCOP(Number(producto.precio || 0) * cantidad)}</strong>
                  </span>
                </div>

                {/* Botón Principal: Agregar al Carrito */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`btn ${added ? 'btn-success' : 'btn-primary'} w-100`}
                  style={{
                    padding: '0.95rem',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    marginBottom: '0.85rem',
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success"
                    style={{
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '0.7rem 0.5rem',
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
                      padding: '0.7rem 0.5rem',
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

          {/* SECCIÓN DE RESEÑAS Y CALIFICACIONES CON FOTOS REALES */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '2.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              marginBottom: '3rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  ⭐ Calificaciones y Opiniones Reales
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>
                  Opiniones verificadas de personas que han comprado cosechas de Montes de María
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="btn btn-outline-primary"
                style={{ borderRadius: '999px', fontWeight: 700, padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
              >
                <i className="fa fa-pen me-2" />
                {mostrarFormulario ? 'Cancelar Opinión' : 'Escribir una Reseña con Foto'}
              </button>
            </div>

            {/* FORMULARIO PARA AGREGAR RESEÑA CON FOTO */}
            {mostrarFormulario && (
              <form
                onSubmit={handleEnviarResena}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  marginBottom: '2rem',
                }}
              >
                <h5 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                  Cuéntanos tu experiencia con esta cosecha del campo
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                      Tu Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formResena.nombre_usuario}
                      onChange={(e) => setFormResena({ ...formResena, nombre_usuario: e.target.value })}
                      placeholder="Ej. Carmen Paternina"
                      required
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                      Ciudad / Municipio
                    </label>
                    <input
                      type="text"
                      value={formResena.ciudad}
                      onChange={(e) => setFormResena({ ...formResena, ciudad: e.target.value })}
                      placeholder="Ej. Cartagena, Sincelejo, etc."
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* Selector de Estrellas Interactivo */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                    Calificación (1 a 5 estrellas) *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        onClick={() => setFormResena({ ...formResena, rating: star })}
                        className={`fa fa-star fs-3 ${star <= formResena.rating ? 'text-warning' : 'text-secondary opacity-50'}`}
                        style={{ cursor: 'pointer', transition: 'transform 0.1s ease' }}
                        title={`${star} estrellas`}
                      />
                    ))}
                    <span style={{ fontWeight: 800, color: '#0f172a', marginLeft: '0.5rem' }}>
                      {formResena.rating} de 5 estrellas
                    </span>
                  </div>
                </div>

                {/* Comentario */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                    Comentario y detalles de cómo te llegó el producto *
                  </label>
                  <textarea
                    rows={3}
                    value={formResena.comentario}
                    onChange={(e) => setFormResena({ ...formResena, comentario: e.target.value })}
                    placeholder="¿Cómo estuvo la frescura, el empaque y el sabor? Cuéntanos..."
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Subida de Foto Real */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                    📷 Sube una foto real del producto recibido (Opcional pero muy valioso)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubirFoto}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', fontSize: '0.85rem' }}
                  />
                  {fotoPreview && (
                    <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                      <img
                        src={fotoPreview}
                        alt="Vista previa de reseña"
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '14px', border: '2px solid #22c55e' }}
                      />
                      <button
                        type="button"
                        onClick={() => { setFotoPreview(''); setFormResena({ ...formResena, foto_url: '' }) }}
                        className="btn btn-sm btn-danger"
                        style={{ position: 'absolute', top: '-8px', right: '-8px', borderRadius: '50%', width: '24px', height: '24px', padding: 0 }}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button
                    type="submit"
                    disabled={enviandoResena}
                    className="btn btn-success"
                    style={{ borderRadius: '999px', fontWeight: 800, padding: '0.65rem 1.75rem' }}
                  >
                    {enviandoResena ? 'Publicando...' : 'Publicar Reseña'}
                  </button>
                </div>
              </form>
            )}

            {/* LISTA DE RESEÑAS */}
            {resenas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                <i className="fa fa-comment-dots fs-1 text-muted mb-3" />
                <h5 style={{ fontWeight: 700, color: '#0f172a' }}>Aún no hay opiniones para esta cosecha</h5>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
                  Sé el primero en compartir qué tal te pareció este producto del campo.
                </p>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(true)}
                  className="btn btn-sm btn-primary"
                  style={{ borderRadius: '999px', fontWeight: 700, padding: '0.45rem 1.25rem' }}
                >
                  Dejar Primera Reseña
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {resenas.map((r) => (
                  <div
                    key={r.id_resena}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '18px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      {/* Cabecera de la reseña */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '0.95rem', display: 'block' }}>
                            {r.nombre_usuario}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {r.ciudad || 'Montes de María'} • {r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleDateString('es-CO') : 'Reciente'}
                          </span>
                        </div>

                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <i className="fa fa-circle-check" /> Compra Verificada
                        </span>
                      </div>

                      {/* Estrellas */}
                      <div style={{ color: '#eab308', fontSize: '0.85rem', marginBottom: '0.65rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`fa ${star <= r.rating ? 'fa-star' : 'fa-star-o'}`} />
                        ))}
                      </div>

                      {/* Texto del comentario */}
                      <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                        "{r.comentario}"
                      </p>
                    </div>

                    {/* Foto Real de la Reseña */}
                    {r.foto_url && (
                      <div style={{ marginTop: '0.85rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          Foto real del cliente:
                        </span>
                        <img
                          src={r.foto_url}
                          alt={`Foto reseña de ${r.nombre_usuario}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                          }}
                          onClick={() => window.open(r.foto_url, '_blank')}
                          title="Ver foto en tamaño completo"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {relacionados.map((rel) => (
                  <ProductCard key={rel.id_producto || rel.id} producto={rel} />
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
