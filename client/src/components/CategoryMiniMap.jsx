import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'

// Generador de iconos Leaflet personalizados con color de categoría
const createProductMarkerIcon = (color = '#2e7d32', title = '') => {
  return L.divIcon({
    className: 'product-map-pin',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
        transition: transform 0.2s ease;
      ">
        <svg viewBox="0 0 384 512" width="34" height="44" fill="${color}">
          <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
        </svg>
        <div style="
          position: absolute;
          top: 8px;
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
        ">
          <span style="font-size: 10px;">🌾</span>
        </div>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40]
  })
}

export default function CategoryMiniMap({
  productos = [],
  categoryName = 'esta categoría',
  categoryColor = '#2e7d32'
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)

  const [isExpanded, setIsExpanded] = useState(true)

  // Filtrar productos con coordenadas válidas
  const productosConGeo = useMemo(() => {
    return productos.filter((p) => {
      const lat = parseFloat(p.latitud)
      const lng = parseFloat(p.longitud)
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })
  }, [productos])

  // Formato COP
  const formatCOP = (val) =>
    Number(val || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    })

  // Inicializar y actualizar mapa
  useEffect(() => {
    if (!isExpanded || !mapContainerRef.current) return

    // Limpiar instancia previa si existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Centro inicial: El Carmen de Bolívar
    const defaultCenter = [9.7174, -75.1213]
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 10,
      scrollWheelZoom: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>'
    }).addTo(map)

    const markersGroup = L.featureGroup().addTo(map)
    markersLayerRef.current = markersGroup

    if (productosConGeo.length > 0) {
      productosConGeo.forEach((prod) => {
        const lat = parseFloat(prod.latitud)
        const lng = parseFloat(prod.longitud)
        const nombre = prod.nombre || prod.nombre_producto || 'Producto Campesino'
        const precio = formatCOP(prod.precio)
        const origen = prod.ubicacion_nombre || prod.origen || 'Montes de María, Colombia'
        const vendedor = prod.vendedor_nombre || prod.vendedor_apodo || 'Productor Local'
        const imagenUrl = prod.imagen
          ? (prod.imagen.startsWith('http') || prod.imagen.startsWith('/') ? prod.imagen : `/uploads/products/${prod.imagen}`)
          : '/img/Logo.jpg'

        const marker = L.marker([lat, lng], {
          icon: createProductMarkerIcon(categoryColor, nombre)
        })

        // Pop-up con diseño premium
        const popupContent = `
          <div style="font-family: inherit; width: 220px; text-align: left; padding: 2px;">
            <div style="position: relative; width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #f3f4f6;">
              <img src="${imagenUrl}" alt="${nombre}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/img/Logo.jpg'" />
              <div style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.75); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                ${precio}
              </div>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #1f2937; line-height: 1.2;">
              ${nombre}
            </h4>
            <div style="font-size: 11px; color: #4b5563; margin-bottom: 2px;">
              👨‍🌾 <strong>Productor:</strong> ${vendedor}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px; display: flex; align-items: center; gap: 3px;">
              📍 <span>${origen}</span>
            </div>
            <a href="#prod-${prod.id_producto || prod.id}" 
               style="display: block; text-align: center; background: ${categoryColor}; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 600; padding: 5px 8px; border-radius: 6px;">
              Ver en Catálogo ↓
            </a>
          </div>
        `

        marker.bindPopup(popupContent, { maxWidth: 240 })
        markersGroup.addLayer(marker)
      })

      // Auto-ajustar mapa a los puntos
      try {
        const bounds = markersGroup.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
        }
      } catch (_) {}
    }

    mapInstanceRef.current = map

    // Fix tamaño de contenedor cuando React monta
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }, 200)

    return () => {
      clearTimeout(resizeTimer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [productosConGeo, isExpanded, categoryColor])

  const handleResetView = () => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      try {
        const bounds = markersLayerRef.current.getBounds()
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
        } else {
          mapInstanceRef.current.setView([9.7174, -75.1213], 10)
        }
      } catch (_) {
        mapInstanceRef.current.setView([9.7174, -75.1213], 10)
      }
    }
  }

  return (
    <div
      style={{
        marginTop: '1.75rem',
        marginBottom: '1.75rem',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-color, #e5e7eb)',
        background: 'var(--card-bg, #ffffff)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: isExpanded ? '1px solid var(--border-color, #e5e7eb)' : 'none',
          background: `linear-gradient(135deg, ${categoryColor}0d 0%, rgba(249,250,251,1) 100%)`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: `${categoryColor}18`,
              color: categoryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}
          >
            <i className="fa fa-map-location-dot"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main, #111827)' }}>
              Origen de Productos — {categoryName}
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)' }}>
              {productosConGeo.length > 0
                ? `📍 ${productosConGeo.length} punto(s) de cultivo o elaboración geolocalizados en los Montes de María`
                : 'Ubicaciones de origen de nuestros campesinos productores'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isExpanded && productosConGeo.length > 0 && (
            <button
              type="button"
              onClick={handleResetView}
              title="Centrar en todos los productos"
              style={{
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #d1d5db)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                color: 'var(--text-main, #374151)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: '500'
              }}
            >
              <i className="fa fa-expand"></i> Centrar
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: isExpanded ? 'var(--card-bg, #ffffff)' : categoryColor,
              color: isExpanded ? 'var(--text-main, #374151)' : '#ffffff',
              border: isExpanded ? '1px solid var(--border-color, #d1d5db)' : 'none',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: '600'
            }}
          >
            <i className={`fa ${isExpanded ? 'fa-eye-slash' : 'fa-map'}`}></i>
            {isExpanded ? 'Ocultar Mapa' : 'Ver Mapa'}
          </button>
        </div>
      </div>

      {/* Map Content */}
      {isExpanded && (
        <div style={{ position: 'relative', width: '100%', height: '320px', background: '#f3f4f6' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Floating badge for info */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(3px)',
              padding: '0.3rem 0.7rem',
              borderRadius: '20px',
              fontSize: '0.72rem',
              color: '#374151',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              zIndex: 1000,
              pointerEvents: 'none',
              fontWeight: '600'
            }}
          >
            🌾 Toca un punto para ver el producto y su productor
          </div>
        </div>
      )}
    </div>
  )
}
