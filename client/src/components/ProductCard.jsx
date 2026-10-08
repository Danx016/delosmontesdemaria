import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ProductDetailModal from './ProductDetailModal'
import { getProductImageUrl, handleProductImageError } from '../utils/productImage'
import { getAvatarUrl, handleAvatarError } from '../utils/avatar'

export default function ProductCard({ producto }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleAdd = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    addItem(producto, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const formatCOP = (p) => {
    return Number(p || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    })
  }

  const imageUrl = getProductImageUrl(producto)

  const vendorId = producto.id_vendedor || producto.id_proveedor
  const vendorName = producto.vendedor_nombre || 'Productor Campesino'
  const vendorAvatar = getAvatarUrl(producto.vendedor_avatar || producto.vendedor_foto || producto.avatar, vendorName)
  const prodTitle = producto.nombre || producto.nombre_producto || 'Producto Campesino'
  const isOutOfStock = Number(producto.stock || 0) === 0

  const vendorGreeting = vendorName && vendorName !== 'Productor Campesino' ? `Don/Doña ${vendorName}` : 'amigo campesino'
  const whatsappMsg = encodeURIComponent(
    `Hola ${vendorGreeting}, vi tu producto "${prodTitle}" (${formatCOP(producto.precio)}) en De los Montes de María y me interesa comprarlo. ¿Tienen disponibilidad para envío?`
  )
  const vendorPhone = (producto.vendedor_telefono || producto.telefono || '').replace(/\D/g, '')
  const whatsappUrl = vendorPhone
    ? `https://wa.me/57${vendorPhone}?text=${whatsappMsg}`
    : `https://wa.me/?text=${whatsappMsg}`

  return (
    <>
      <div
        className="marketplace-product-card"
        onClick={() => setShowDetailModal(true)}
        style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      >
        {/* Product Image Container */}
        <div className="product-card-media">
          <img
            src={imageUrl}
            alt={prodTitle}
            className="product-card-img"
            onError={handleProductImageError}
            loading="lazy"
            decoding="async"
            width="300"
            height="200"
          />
          {producto.categoria && (
            <span className="product-card-category-badge">
              {(() => {
                const MAP = {
                  cosechas: 'Cosechas Frescas',
                  semillas: 'Semillas Certificadas',
                  lacteos: 'Lácteos de la Finca',
                  ferre: 'Herramientas',
                  abonos: 'Abonos y Fertilizantes',
                  agro: 'AgroEquipos'
                }
                const lower = (producto.categoria || '').toLowerCase()
                return MAP[lower] || producto.categoria
              })()}
            </span>
          )}
          {producto.stock <= 5 && producto.stock > 0 && (
            <span className="product-card-stock-badge warning">
              Últimas {producto.stock}
            </span>
          )}
          {isOutOfStock && (
            <span className="product-card-stock-badge danger">
              Agotado
            </span>
          )}
        </div>

        {/* Product Information Body */}
        <div className="product-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.35rem' }}>
            {vendorId && (
              <Link
                to={`/vendedor/${vendorId}`}
                onClick={(e) => e.stopPropagation()}
                className="product-card-vendor"
                title={`Ver perfil de ${vendorName}`}
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '0.45rem',
                  color: 'var(--primary-color, #2e7d32)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  lineHeight: 1.2,
                  width: 'fit-content',
                  maxWidth: '70%',
                }}
              >
                <img
                  src={vendorAvatar}
                  alt={vendorName}
                  onError={(e) => handleAvatarError(e, vendorName)}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '1.5px solid #22c55e',
                    display: 'inline-block',
                  }}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {vendorName}
                </span>
              </Link>
            )}

            {/* Rating Stars preview */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: '#eab308', fontWeight: 700 }}>
              <i className="fa fa-star" />
              <span style={{ color: '#475569' }}>5.0</span>
            </div>
          </div>

          <h3 className="product-card-name" title={prodTitle}>
            {prodTitle}
          </h3>

          {producto.descripcion && (
            <p className="product-card-summary">
              {producto.descripcion.length > 70
                ? `${producto.descripcion.substring(0, 70)}...`
                : producto.descripcion}
            </p>
          )}

          {/* Card Footer: Price & Add button & WhatsApp Direct */}
          <div className="product-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
            <div className="product-card-pricing">
              <span className="price-tag-label">Precio</span>
              <span className="price-tag-value">{formatCOP(producto.precio)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={`Preguntar por WhatsApp sobre ${prodTitle}`}
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)'
                }}
              >
                <i className="fab fa-whatsapp" />
              </a>

              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`btn-product-add ${added ? 'added' : ''}`}
                title="Agregar al carrito"
                aria-label={isOutOfStock ? 'Producto agotado' : added ? 'Producto agregado al carrito' : 'Agregar al carrito'}
                style={{ minHeight: 'var(--touch-target-min)' }}
              >
                {added ? (
                  <>
                    <i className="fa fa-check" />
                    <span>¡Listo!</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-shopping-cart" />
                    <span>Comprar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* In-depth Product Details Modal */}
      <ProductDetailModal
        producto={producto}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </>
  )
}
