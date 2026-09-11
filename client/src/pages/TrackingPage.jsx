import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const STATUS_STEPS = [
  { key: 'PENDIENTE_RECOLECCION', label: 'Programado en Finca', icon: 'fa-seedling', desc: 'El campesino prepara la cosecha para recolección.' },
  { key: 'RECOLECTADO_EN_FINCA', label: 'Recolectado por Transporte', icon: 'fa-tractor', desc: 'Vehículo rural recogió los productos en la vereda.' },
  { key: 'EN_CENTRO_ACOPIO', label: 'Centro de Acopio Regional', icon: 'fa-warehouse', desc: 'Clasificado y embalado en El Carmen de Bolívar.' },
  { key: 'EN_RUTA', label: 'En Camino a tu Ciudad', icon: 'fa-truck-fast', desc: 'Transporte intermunicipal en ruta hacia tu dirección.' },
  { key: 'ENTREGADO', label: 'Cosecha Entregada', icon: 'fa-circle-check', desc: 'Entregado fresco en la puerta de tu hogar.' }
]

function getStepIndex(status) {
  switch (status) {
    case 'PENDIENTE_RECOLECCION': return 0
    case 'RECOLECTADO_EN_FINCA': return 1
    case 'EN_CENTRO_ACOPIO': return 2
    case 'EN_RUTA': return 3
    case 'ENTREGADO': return 4
    default: return 0
  }
}

export default function TrackingPage() {
  const { trackingNumber: paramTracking } = useParams()
  const [searchParams] = useSearchParams()
  const orderIdQuery = searchParams.get('orden')

  const [query, setQuery] = useState(paramTracking || orderIdQuery || '')
  const [loading, setLoading] = useState(false)
  const [shipment, setShipment] = useState(null)
  const [error, setError] = useState(null)

  // Cotizador rápido de fletes
  const [rates, setRates] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [rateEstimate, setRateEstimate] = useState(null)

  useEffect(() => {
    // Cargar tarifas de flete disponibles
    axios.get('/api/logistics/rates')
      .then(res => {
        if (res.data.success && res.data.rates) {
          setRates(res.data.rates)
        }
      })
      .catch(() => {})

    // Si viene por URL, buscar de inmediato
    if (paramTracking) {
      buscarGuia(paramTracking)
    } else if (orderIdQuery) {
      buscarPorOrden(orderIdQuery)
    }
  }, [paramTracking, orderIdQuery])

  const buscarGuia = async (codigo) => {
    const code = (codigo || query).trim()
    if (!code) return

    setLoading(true)
    setError(null)
    setShipment(null)

    try {
      // Intentar buscar por tracking o por ID de orden
      const isOrderNumber = /^\d+$/.test(code)
      const url = isOrderNumber ? `/api/logistics/order/${code}` : `/api/logistics/track/${encodeURIComponent(code)}`
      const res = await axios.get(url)

      if (res.data.success && res.data.shipment) {
        setShipment(res.data.shipment)
      } else {
        setError(`No encontramos despachos para "${code}". Verifica el número de guía o pedido.`)
      }
    } catch (err) {
      setError(err.response?.data?.error || `No se encontró la guía de despacho "${code}".`)
    } finally {
      setLoading(false)
    }
  }

  const buscarPorOrden = (ordId) => {
    setQuery(ordId)
    buscarGuia(ordId)
  }

  const calcularFlete = (e) => {
    e.preventDefault()
    if (!selectedCity) return
    axios.get(`/api/logistics/calculate?city=${encodeURIComponent(selectedCity)}`)
      .then(res => {
        if (res.data.success) {
          setRateEstimate(res.data.estimate)
        }
      })
      .catch(err => console.error(err))
  }

  const activeStepIdx = shipment ? getStepIndex(shipment.status) : 0

  return (
    <div className="tracking-page-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem', minHeight: '80vh' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)',
        color: '#fff',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        marginBottom: '2.5rem',
        boxShadow: '0 10px 25px rgba(22, 101, 52, 0.2)'
      }}>
        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🚚 Red de Logística Rural
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', margin: '0.75rem 0 0.5rem 0' }}>
          Rastreo de Cosechas en Tiempo Real
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto', opacity: 0.9 }}>
          Sigue el camino de tus productos desde la finca de los campesinos en los Montes de María hasta la puerta de tu hogar.
        </p>

        {/* Buscador de Guía */}
        <div style={{ maxWidth: '600px', margin: '1.8rem auto 0 auto', display: 'flex', gap: '0.5rem', background: '#fff', padding: '6px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarGuia()}
            placeholder="Ingresa tu No. de Guía (ej: MDM-TRK-...) o No. de Orden"
            style={{
              flex: 1,
              border: 'none',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              color: '#1f2937',
              outline: 'none',
              borderRadius: '8px'
            }}
          />
          <button
            onClick={() => buscarGuia()}
            disabled={loading}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s'
            }}
          >
            {loading ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-search" />}
            <span>Rastrear</span>
          </button>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '1.25rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <i className="fa fa-circle-exclamation" style={{ fontSize: '1.5rem' }} />
          <div>
            <strong>No se encontró la guía:</strong> {error}
            <div style={{ fontSize: '0.9rem', marginTop: '4px', opacity: 0.85 }}>
              Si acabas de realizar tu compra, la orden se está sincronizando en la red de despacho.
            </div>
          </div>
        </div>
      )}

      {/* Detalle del Envío y Timeline */}
      {shipment && (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          marginBottom: '3rem'
        }}>
          {/* Cabecera de la Guía */}
          <div style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e5e7eb',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>GUÍA DE DESPACHO RURAL</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>
                {shipment.tracking_number}
              </h2>
              <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                Asociado a Orden <strong>#{shipment.order_id}</strong> • Destinatario: <strong>{shipment.customer_name}</strong>
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: shipment.status === 'ENTREGADO' ? '#dcfce7' : '#dbeafe',
                color: shipment.status === 'ENTREGADO' ? '#166534' : '#1e40af',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <i className={shipment.status === 'ENTREGADO' ? 'fa fa-check-circle' : 'fa fa-clock'} />
                {shipment.status.replace(/_/g, ' ')}
              </span>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
                Transporte: <strong>{shipment.carrier_name}</strong>
              </div>
            </div>
          </div>

          {/* Stepper Gráfico / Línea de Tiempo */}
          <div style={{ padding: '2.5rem 2rem', background: '#fff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '2rem' }}>
              Progreso de la Cosecha
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              position: 'relative'
            }}>
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= activeStepIdx
                const isCurrent = idx === activeStepIdx

                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: isCompleted ? '#16a34a' : '#f1f5f9',
                      color: isCompleted ? '#fff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      marginBottom: '0.75rem',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.25)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className={`fa ${step.icon}`} />
                    </div>

                    <strong style={{
                      fontSize: '0.95rem',
                      color: isCompleted ? '#0f172a' : '#94a3b8',
                      marginBottom: '0.25rem'
                    }}>
                      {step.label}
                    </strong>

                    <span style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.3' }}>
                      {step.desc}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resumen de Ubicación y Trazabilidad */}
          <div style={{
            background: '#f8fafc',
            borderTop: '1px solid #e5e7eb',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {/* Tarjeta de Destino */}
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa fa-map-location-dot" style={{ color: '#16a34a' }} /> Datos del Despacho
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: '#334155' }}>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Origen:</strong> {shipment.origin_region}
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Destino:</strong> {shipment.destination_city}
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Dirección:</strong> {shipment.destination_address}
                </li>
                <li style={{ marginBottom: '0.6rem' }}>
                  <strong>Valor Flete:</strong> ${Number(shipment.shipping_cost).toLocaleString('es-CO')} COP
                </li>
                {shipment.estimated_delivery && (
                  <li>
                    <strong>Entrega estimada:</strong> {new Date(shipment.estimated_delivery).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </li>
                )}
              </ul>
            </div>

            {/* Historial Cronológico de Estados */}
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa fa-clock-rotate-left" style={{ color: '#0284c7' }} /> Historial de Trazabilidad
              </h4>

              {shipment.history && shipment.history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {shipment.history.map((h, i) => (
                    <div key={i} style={{ borderLeft: '3px solid #16a34a', paddingLeft: '0.75rem', position: 'relative' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>
                        {h.location} — <span style={{ color: '#16a34a' }}>{h.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>{h.description}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {new Date(h.timestamp).toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No hay eventos registrados en este momento.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cotizador de Tarifas de Flete */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <i className="fa fa-calculator" style={{ fontSize: '1.5rem', color: '#16a34a' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: '800' }}>
              Cotizador de Fletes Regionales
            </h3>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Tarifas solidarias para transporte campesino desde los Montes de María hacia la Costa Caribe y Colombia.
            </span>
          </div>
        </div>

        <form onSubmit={calcularFlete} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          >
            <option value="">-- Selecciona tu Municipio o Ciudad --</option>
            {rates.map(r => (
              <option key={r.id} value={r.city}>
                {r.city} ({r.department}) — Zona {r.zone.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={{
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Calcular Tarifa
          </button>
        </form>

        {rateEstimate && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <strong style={{ fontSize: '1.1rem', color: '#166534' }}>
                Flete a {rateEstimate.city} ({rateEstimate.department})
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '0.2rem' }}>
                Tiempo estimado de viaje: <strong>{rateEstimate.estimatedHours} horas</strong> ({rateEstimate.estimatedDays} día(s))
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#166534' }}>
              ${rateEstimate.baseFee.toLocaleString('es-CO')} COP
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
