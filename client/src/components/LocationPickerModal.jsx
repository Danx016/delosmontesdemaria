import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'

// Marcador SVG personalizado para evitar problemas con assets estáticos en bundlers
const createPinIcon = (color = '#2e7d32') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        cursor: grab;
      ">
        <svg viewBox="0 0 384 512" width="36" height="46" fill="${color}">
          <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
        </svg>
        <div style="
          position: absolute;
          top: 10px;
          width: 14px;
          height: 14px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 6px; height: 6px; background: ${color}; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 46],
    popupAnchor: [0, -42]
  })
}

// Municipios emblemáticos de los Montes de María para selección rápida
const MONTES_MUNICIPIOS = [
  { name: 'El Carmen de Bolívar', lat: 9.7174, lng: -75.1213 },
  { name: 'San Jacinto', lat: 9.8294, lng: -75.1216 },
  { name: 'San Juan Nepomuceno', lat: 9.9511, lng: -75.0825 },
  { name: 'Ovejas', lat: 9.5333, lng: -75.2333 },
  { name: 'Colosó', lat: 9.4939, lng: -75.3536 },
  { name: 'Chalán', lat: 9.5539, lng: -75.3142 },
  { name: 'Los Palmitos', lat: 9.3811, lng: -75.2639 },
  { name: 'María La Baja', lat: 9.9825, lng: -75.3050 },
  { name: 'San Onofre', lat: 9.7369, lng: -75.5264 }
]

export default function LocationPickerModal({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialUbicacion,
  onConfirm
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const defaultLat = initialLat ? parseFloat(initialLat) : 9.7174
  const defaultLng = initialLng ? parseFloat(initialLng) : -75.1213

  const [lat, setLat] = useState(defaultLat)
  const [lng, setLng] = useState(defaultLng)
  const [ubicacionNombre, setUbicacionNombre] = useState(initialUbicacion || 'El Carmen de Bolívar, Montes de María')
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')

  useEffect(() => {
    if (isOpen) {
      const pLat = initialLat ? parseFloat(initialLat) : 9.7174
      const pLng = initialLng ? parseFloat(initialLng) : -75.1213
      setLat(pLat)
      setLng(pLng)
      setUbicacionNombre(initialUbicacion || 'El Carmen de Bolívar, Montes de María')
      setLocError('')
    }
  }, [isOpen, initialLat, initialLng, initialUbicacion])

  // Inicializar o centrar mapa cuando el modal se abre
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 12,
          scrollWheelZoom: true
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        const marker = L.marker([lat, lng], {
          icon: createPinIcon('#2e7d32'),
          draggable: true
        }).addTo(map)

        marker.on('dragend', async (e) => {
          const position = e.target.getLatLng()
          updatePosition(position.lat, position.lng, true)
        })

        map.on('click', (e) => {
          marker.setLatLng(e.latlng)
          updatePosition(e.latlng.lat, e.latlng.lng, true)
        })

        mapInstanceRef.current = map
        markerRef.current = marker
      } else {
        const map = mapInstanceRef.current
        map.invalidateSize()
        map.setView([lat, lng], 12)
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        }
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [isOpen])

  const updatePosition = async (newLat, newLng, doReverseGeo = false) => {
    const formattedLat = parseFloat(Number(newLat).toFixed(6))
    const formattedLng = parseFloat(Number(newLng).toFixed(6))
    setLat(formattedLat)
    setLng(formattedLng)

    if (markerRef.current) {
      markerRef.current.setLatLng([formattedLat, formattedLng])
    }

    if (doReverseGeo) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${formattedLat}&lon=${formattedLng}&zoom=14&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } }
        )
        if (res.ok) {
          const data = await res.json()
          if (data && data.address) {
            const addr = data.address
            const town = addr.village || addr.hamlet || addr.town || addr.municipality || addr.county || addr.city || ''
            const state = addr.state || 'Bolívar'
            if (town) {
              setUbicacionNombre(`${town}, ${state}, Montes de María`)
            }
          }
        }
      } catch (_) {
        // Fallback silencioso si Nominatim rate-limit
      }
    }
  }

  // Usar GPS del navegador
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setLocError('Tu navegador no soporta geolocalización.')
      return
    }

    setLocating(true)
    setLocError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        updatePosition(userLat, userLng, true)
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 15, { animate: true, duration: 1.5 })
        }
      },
      (err) => {
        setLocating(false)
        console.warn('Error GPS:', err)
        setLocError('No pudimos acceder a tu ubicación GPS. Por favor selecciona el punto en el mapa o elige tu municipio.')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  // Seleccionar preset de municipio
  const handleSelectPreset = (m) => {
    updatePosition(m.lat, m.lng, false)
    setUbicacionNombre(`${m.name}, Montes de María`)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([m.lat, m.lng], 13, { animate: true, duration: 1 })
    }
  }

  const handleSave = () => {
    onConfirm({
      latitud: lat,
      longitud: lng,
      ubicacion_nombre: ubicacionNombre.trim() || 'Montes de María, Colombia'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          color: 'var(--text-main, #242424)',
          width: '100%',
          maxWidth: '780px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxHeight: '90vh',
          animation: 'fadeInModal 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color, #e5e7eb)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(67, 142, 68, 0.08) 0%, rgba(226, 140, 43, 0.05) 100%)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-color, #2e7d32)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa fa-map-marked-alt"></i> Ubicación Real de la Cosecha / Finca
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #6b7280)' }}>
              Haz clic en el mapa o usa tu GPS para que los compradores vean de dónde viene este producto.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px'
            }}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Action Bar (GPS & Presets) */}
        <div style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-color, #f9fafb)', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={locating}
              className="btn btn-sm"
              style={{
                backgroundColor: 'var(--primary-color, #2e7d32)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                cursor: locating ? 'wait' : 'pointer',
                fontWeight: '600'
              }}
            >
              <i className={locating ? 'fa fa-spinner fa-spin' : 'fa fa-crosshairs'}></i>
              {locating ? 'Obteniendo GPS...' : 'Usar mi ubicación GPS actual'}
            </button>

            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              O elige municipio:
            </span>
          </div>

          {locError && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#dc2626' }}>
              <i className="fa fa-exclamation-circle"></i> {locError}
            </div>
          )}

          {/* Preset Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingTop: '0.5rem',
              paddingBottom: '0.25rem'
            }}
          >
            {MONTES_MUNICIPIOS.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => handleSelectPreset(m)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.78rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #d1d5db)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--text-main, #374151)',
                  cursor: 'pointer'
                }}
              >
                📍 {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div style={{ position: 'relative', height: '360px', width: '100%', background: '#e5e7eb' }}>
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

          {/* Floating Instructions Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(3px)',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              color: '#374151',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              zIndex: 1000,
              pointerEvents: 'none',
              fontWeight: '500'
            }}
          >
            💡 Arrastra el marcador o toca el mapa para fijar la finca
          </div>
        </div>

        {/* Coordinates and Location Name Form */}
        <div style={{ padding: '1rem 1.5rem', background: 'var(--card-bg, #ffffff)', borderTop: '1px solid var(--border-color, #e5e7eb)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted, #4b5563)', display: 'block', marginBottom: '0.25rem' }}>
                Referencia o Nombre de la Finca/Vereda
              </label>
              <input
                type="text"
                value={ubicacionNombre}
                onChange={(e) => setUbicacionNombre(e.target.value)}
                placeholder="Ej: Finca La Esperanza, Vereda Raicero"
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #d1d5db)',
                  background: 'var(--bg-color, #ffffff)',
                  color: 'var(--text-main, #111827)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted, #4b5563)', display: 'block', marginBottom: '0.25rem' }}>
                  Latitud
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={(e) => updatePosition(parseFloat(e.target.value) || 0, lng, false)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color, #d1d5db)',
                    background: 'var(--bg-color, #ffffff)',
                    color: 'var(--text-main, #111827)'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted, #4b5563)', display: 'block', marginBottom: '0.25rem' }}>
                  Longitud
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={(e) => updatePosition(lat, parseFloat(e.target.value) || 0, false)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color, #d1d5db)',
                    background: 'var(--bg-color, #ffffff)',
                    color: 'var(--text-main, #111827)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid var(--border-color, #e5e7eb)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            background: 'var(--bg-color, #f9fafb)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #d1d5db)',
              background: '#ffffff',
              color: '#374151',
              fontSize: '0.88rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary-color, #2e7d32)',
              color: '#ffffff',
              fontSize: '0.88rem',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <i className="fa fa-check"></i> Guardar Ubicación
          </button>
        </div>
      </div>
    </div>
  )
}
