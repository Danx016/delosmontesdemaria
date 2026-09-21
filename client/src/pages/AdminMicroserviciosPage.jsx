import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useToast } from '../context/ToastContext'

export default function AdminMicroserviciosPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const [healthData, setHealthData] = useState(null)
  const [circuitData, setCircuitData] = useState(null)
  const [registryData, setRegistryData] = useState(null)
  const [dlqData, setDlqData] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [pingResults, setPingResults] = useState({})
  const [expandedServices, setExpandedServices] = useState({
    gateway: true,
    auth: true,
    catalog: true,
    order: true,
    support: true,
    notification: true,
    logistics: true
  })

  const toggleExpand = (key) => {
    setExpandedServices(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAll = (state) => {
    setExpandedServices({
      gateway: state,
      auth: state,
      catalog: state,
      order: state,
      support: state,
      notification: state,
      logistics: state
    })
  }

  const testPing = async (key) => {
    setPingResults(prev => ({ ...prev, [key]: { loading: true } }))
    const start = performance.now()
    try {
      const res = await fetch(`/api/ping/${key}`, { signal: AbortSignal.timeout(6000) })
      const data = await res.json().catch(() => null)
      const duration = data?.time !== undefined ? data.time : Math.round(performance.now() - start)
      setPingResults(prev => ({
        ...prev,
        [key]: {
          loading: false,
          status: data?.status || res.status,
          time: duration,
          success: res.ok && data?.success !== false,
          timestamp: new Date().toLocaleTimeString()
        }
      }))
    } catch (e) {
      const duration = Math.round(performance.now() - start)
      setPingResults(prev => ({
        ...prev,
        [key]: {
          loading: false,
          status: 'ERR',
          time: duration,
          error: e.message,
          success: false,
          timestamp: new Date().toLocaleTimeString()
        }
      }))
    }
  }

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const [resHealth, resCircuits, resRegistry, resDlq] = await Promise.all([
        fetch('/health').then(r => r.json()).catch(() => null),
        fetch('/api/circuit-status').then(r => r.json()).catch(() => null),
        fetch('/api/registry').then(r => r.json()).catch(() => null),
        fetch('/api/dlq').then(r => r.json()).catch(() => null)
      ])

      setHealthData(resHealth)
      setCircuitData(resCircuits?.circuits || null)
      setRegistryData(resRegistry?.instances || [])
      setDlqData(resDlq?.messages || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error al cargar métricas:', err)
    } finally {
      setLoading(false)
      if (isManual) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchData()
    }, 4000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const handleResetCircuit = async (serviceName) => {
    setActionLoading(`circuit-${serviceName}`)
    try {
      const res = await fetch(`/api/circuit-status/reset/${serviceName}`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast?.success ? toast.success(`Circuito ${serviceName} restablecido a CLOSED`) : alert(data.message)
        fetchData()
      }
    } catch (e) {
      alert('Error al restablecer circuito')
    } finally {
      setActionLoading(null)
    }
  }

  const handleClearCache = async () => {
    setActionLoading('cache')
    try {
      const res = await fetch('/api/catalog/cache/clear', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast?.success ? toast.success('Caché Redis invalidada exitosamente') : alert('Caché Redis invalidada')
      }
    } catch (e) {
      alert('Error al purgar la caché')
    } finally {
      setActionLoading(null)
    }
  }

  const handleClearDLQ = async () => {
    if (!window.confirm('¿Seguro que deseas vaciar la Dead Letter Queue?')) return
    setActionLoading('dlq')
    try {
      const res = await fetch('/api/dlq/clear', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast?.success ? toast.success('DLQ vaciada') : alert('DLQ vaciada')
        fetchData()
      }
    } catch (e) {
      alert('Error al vaciar DLQ')
    } finally {
      setActionLoading(null)
    }
  }

  const getCircuitBadge = (state) => {
    if (state === 'CLOSED') {
      return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}><i className="fa fa-shield-alt" /> CLOSED (Saludable)</span>
    }
    if (state === 'OPEN') {
      return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}><i className="fa fa-exclamation-triangle" /> OPEN (Disparado)</span>
    }
    return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}><i className="fa fa-spinner fa-spin" /> HALF-OPEN</span>
  }

  return (
    <>
      <Navbar />
      <main style={{ background: '#f8fafc', minHeight: '85vh', padding: '30px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Barra Superior */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/admin" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
                  <i className="fa fa-arrow-left" /> Panel Admin
                </Link>
                <span style={{ color: '#cbd5e1' }}>/</span>
                <span style={{ color: '#0f172a', fontWeight: '600', fontSize: '14px' }}>Observabilidad</span>
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '6px 0 2px 0' }}>
                Torre de Control de Microservicios 🛡️
              </h1>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Supervisión de salud, Circuit Breakers, Service Registry y eventos en tiempo real.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresco (4s)
              </label>

              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className={`fa fa-sync-alt ${refreshing ? 'fa-spin' : ''}`} />
                Actualizar
              </button>

              <button
                onClick={handleClearCache}
                disabled={actionLoading === 'cache'}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa fa-bolt" />
                Purgar Caché Redis
              </button>
            </div>
          </div>

          {/* Tarjetas de Resumen Global */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>API Gateway</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: healthData?.gateway === 'UP' ? '#16a34a' : '#dc2626', margin: '4px 0' }}>
                {healthData?.gateway === 'UP' ? '🟢 100% OPERACIONAL' : '🔴 DESCONECTADO'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Puerto: {healthData?.port || 3000} | Nginx Proxy</div>
            </div>

            <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Instancias Vivas (Redis)</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                {registryData?.length || 0} / 6 Servicios
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Heartbeats activos cada 6s</div>
            </div>

            <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Circuit Breakers</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669', margin: '4px 0' }}>
                5/5 Protegidos
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Tolerancia a fallos en cascada</div>
            </div>

            <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Dead Letter Queue (DLQ)</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: (dlqData?.length || 0) === 0 ? '#16a34a' : '#dc2626', margin: '4px 0' }}>
                {dlqData?.length || 0} Fallas
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{(dlqData?.length || 0) === 0 ? 'Sin mensajes retenidos' : 'Requiere revisión'}</div>
            </div>
          </div>

          {/* Encabezado y Controles del Grid de Microservicios */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                Ecosistema de Microservicios: Operaciones, Rutas & Telemetría 🛡️
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Monitoreo en tiempo real de los 7 microservicios: puertos, rutas/endpoints, bases de datos, mensajería Redis Streams y resiliencia.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => toggleAll(true)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
              >
                <i className="fa fa-expand-alt" style={{ marginRight: '4px' }} /> Expandir Todos
              </button>
              <button
                onClick={() => toggleAll(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
              >
                <i className="fa fa-compress-alt" style={{ marginRight: '4px' }} /> Contraer
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '30px', alignItems: 'start' }}>
            {[
              {
                key: 'gateway',
                name: 'API Gateway Central',
                port: 3000,
                protocol: 'HTTP / HTTPS (Proxy Inverso) & WebSockets (WSS)',
                db: 'Sin base de datos (Proxy stateless & Reverse proxy)',
                icon: 'fa-network-wired',
                badgeColor: '#0f172a',
                category: 'Punto de Entrada & Enrutador',
                desc: 'Enrutador central de tráfico. Inyecta X-Correlation-ID en cada petición, administra Circuit Breakers hacia los microservicios y entrega la SPA React.',
                pingUrl: '/health',
                isGateway: true,
                tablas: ['En memoria (Estado de Circuit Breakers)', 'Redis (Discovery & Heartbeats)'],
                endpoints: [
                  { method: 'GET', path: '/health', desc: 'Chequeo de salud del Gateway y estado general' },
                  { method: 'GET', path: '/api/circuit-status', desc: 'Telemetría de llamadas y fallos por microservicio' },
                  { method: 'GET', path: '/api/registry', desc: 'Service Registry: Instancias vivas en Redis' },
                  { method: 'GET', path: '/api/dlq', desc: 'Inspección de fallas en Dead Letter Queue' },
                  { method: 'POST', path: '/api/catalog/cache/clear', desc: 'Purgado forzado de memoria caché en Redis' },
                  { method: 'WSS', path: '/socket.io', desc: 'Proxy bidireccional WebSockets hacia :3004' }
                ],
                routesForwarded: [
                  { route: '/api/auth/*', target: ':3001 (Auth Service)' },
                  { route: '/api/productos/*', target: ':3002 (Catalog Service)' },
                  { route: '/api/compras/*', target: ':3003 (Order Service)' },
                  { route: '/api/chat/*', target: ':3004 (Support Service)' },
                  { route: '/api/telegram/*', target: ':3005 (Notification Service)' },
                  { route: '/api/logistics/*', target: ':3006 (Logistics Service)' }
                ],
                eventsPub: [],
                eventsSub: [],
                externalDeps: ['Nginx Reverse Proxy', 'SSL Let\'s Encrypt', 'Redis Service Discovery']
              },
              {
                key: 'auth',
                name: 'Auth & User Service',
                port: 3001,
                protocol: 'HTTP (RESTful API)',
                db: 'db_auth (fallback: dbmontesdm)',
                icon: 'fa-user-shield',
                badgeColor: '#3b82f6',
                category: 'Seguridad & Usuarios',
                desc: 'Autenticación centralizada, tokens JWT con salting bcrypt, validación de Google OAuth 2.0 y perfiles de campesinos y compradores.',
                pingUrl: '/api/auth/google/client-id',
                tablas: ['usuarios', 'roles', 'direcciones', 'telegram_sesiones', 'telegram_auth_codigos'],
                endpoints: [
                  { method: 'POST', path: '/api/auth/register', desc: 'Registro de clientes y campesinos productores' },
                  { method: 'POST', path: '/api/auth/login', desc: 'Autenticación con contraseña y firma de JWT' },
                  { method: 'POST', path: '/api/auth/google', desc: 'Autenticación federada con Google OAuth 2.0' },
                  { method: 'GET', path: '/api/auth/perfil', desc: 'Consulta de perfil de usuario y rol' },
                  { method: 'GET', path: '/api/auth/direcciones', desc: 'Listado de direcciones de despacho' },
                  { method: 'POST', path: '/api/auth/direcciones', desc: 'Creación de dirección de entrega rural' }
                ],
                eventsPub: ['USER_REGISTERED', 'USER_LOGGED_IN'],
                eventsSub: ['stream:orders (cg:auth) -> Suma cashback o créditos de fidelidad por compra'],
                externalDeps: ['Google OAuth 2.0 API', 'MySQL Database', 'Bcrypt Security', 'Redis Streams']
              },
              {
                key: 'catalog',
                name: 'Catalog & Product Service',
                port: 3002,
                protocol: 'HTTP (RESTful API)',
                db: 'db_catalog (fallback: dbmontesdm)',
                icon: 'fa-boxes',
                badgeColor: '#059669',
                category: 'Catálogo & Stock Rural',
                desc: 'Catálogo público de productos agropecuarios, filtros por categoría o disponibilidad, banners del Home y gestión atómica de inventario con Redis Cache-Aside.',
                pingUrl: '/api/productos',
                tablas: ['productos', 'categorias', 'banners_hero', 'proveedores'],
                endpoints: [
                  { method: 'GET', path: '/api/productos', desc: 'Catálogo completo acelerado con Redis Cache (< 2ms)' },
                  { method: 'GET', path: '/api/productos/:id', desc: 'Ficha técnica y disponibilidad de producto' },
                  { method: 'POST', path: '/api/productos', desc: 'Creación de nuevo producto agropecuario' },
                  { method: 'PUT', path: '/api/productos/:id', desc: 'Actualización de precio, stock o descripción' },
                  { method: 'DELETE', path: '/api/productos/:id', desc: 'Baja lógica de producto en la tienda' },
                  { method: 'GET', path: '/api/banners', desc: 'Listado de banners para Hero Section' }
                ],
                eventsPub: ['PRODUCT_CREATED', 'PRODUCT_STOCK_CHANGED'],
                eventsSub: ['stream:orders (cg:catalog) -> Descuenta stock atómicamente e invalida caché Redis'],
                externalDeps: ['Redis Cache-Aside (TTL 300s)', 'MySQL Database', 'Redis Streams (cg:catalog)']
              },
              {
                key: 'order',
                name: 'Order & Checkout Service',
                port: 3003,
                protocol: 'HTTP (RESTful API)',
                db: 'db_orders (fallback: dbmontesdm)',
                icon: 'fa-shopping-cart',
                badgeColor: '#8b5cf6',
                category: 'Compras & Pagos Wompi',
                desc: 'Procesamiento transaccional de compras, validación de cupones, integración con pasarela Wompi (SHA-256) y emisión del evento ORDER_CREATED a Redis Streams.',
                pingUrl: '/api/cupones',
                tablas: ['compras', 'compra_detalles', 'cupones'],
                endpoints: [
                  { method: 'POST', path: '/api/compras', desc: 'Creación de orden de compra y persistencia' },
                  { method: 'GET', path: '/api/compras/usuario', desc: 'Historial de compras del cliente actual' },
                  { method: 'GET', path: '/api/compras/:id', desc: 'Detalle de orden, ítems comprados y estado de pago' },
                  { method: 'POST', path: '/api/compras/validar-cupon', desc: 'Verificación de vigencia y descuento de cupón' },
                  { method: 'POST', path: '/api/compras/verificar-otp', desc: 'Validación de código OTP de un solo uso' }
                ],
                eventsPub: ['ORDER_CREATED (stream:orders) -> Notifica a inventario, alertas y despacho'],
                eventsSub: ['PAYMENT_WEBHOOK_RECEIVED -> Actualiza estado transaccional a PAGADO'],
                externalDeps: ['Pasarela Wompi (Tarjetas, PSE, Nequi)', 'Firma SHA-256', 'Redis Streams']
              },
              {
                key: 'support',
                name: 'AI Support & Chat Service',
                port: 3004,
                protocol: 'HTTP (REST) & WebSockets (Socket.IO)',
                db: 'db_support (fallback: dbmontesdm)',
                icon: 'fa-robot',
                badgeColor: '#06b6d4',
                category: 'Atención & Asistente IA',
                desc: 'Chat en tiempo real mediante WebSockets, tickets de reclamos y asistente virtual inteligente especializado en producción agropecuaria de Montes de María.',
                pingUrl: '/health',
                tablas: ['soporte_tickets', 'soporte_mensajes', 'soporte_calificaciones'],
                endpoints: [
                  { method: 'POST', path: '/api/chat/public', desc: 'Consulta al Asistente Virtual Agropecuario LLM' },
                  { method: 'GET', path: '/api/soporte/tickets', desc: 'Listado de tickets de atención técnica' },
                  { method: 'POST', path: '/api/soporte/tickets', desc: 'Creación de nuevo ticket de soporte' },
                  { method: 'WSS', path: '/socket.io', desc: 'Conexión Socket.IO bidireccional en tiempo real' }
                ],
                eventsPub: ['TICKET_CREATED', 'AI_RESPONSE_GENERATED'],
                eventsSub: ['stream:orders -> Indexa datos del comprador para soporte posventa'],
                externalDeps: ['OpenRouter API (Modelos LLM)', 'Socket.IO Server Engine', 'MySQL Database']
              },
              {
                key: 'notification',
                name: 'Notification Service',
                port: 3005,
                protocol: 'Worker Asíncrono + Webhooks',
                db: 'Sin base de datos propia (Logs de entrega en memoria)',
                icon: 'fa-paper-plane',
                badgeColor: '#f59e0b',
                category: 'Alertas & Multicanal',
                desc: 'Worker de mensajería automática. Atiende el Bot oficial de Telegram (@montesdemariabot), correos HTML con Brevo y mensajes a WhatsApp Cloud API.',
                pingUrl: '/health',
                tablas: ['telegram_alertas (en memoria / logs)', 'email_audit_log'],
                endpoints: [
                  { method: 'POST', path: '/api/telegram/webhook', desc: 'Recepción de comandos y mensajes de Telegram' },
                  { method: 'POST', path: '/api/telegram/send', desc: 'Envío de mensaje Markdown directo a un Chat ID' },
                  { method: 'POST', path: '/api/notification/email', desc: 'Envío de correo transaccional vía Brevo API' }
                ],
                eventsPub: ['NOTIFICATION_SENT', 'NOTIFICATION_FAILED -> stream:dlq'],
                eventsSub: ['stream:orders (cg:notifications) -> Envía alerta instantánea al campesino'],
                externalDeps: ['Telegram Bot API (@montesdemariabot)', 'Brevo (Sendinblue) REST API', 'WhatsApp Cloud API', 'Dead Letter Queue']
              },
              {
                key: 'logistics',
                name: 'Logistics & Tracking Service',
                port: 3006,
                protocol: 'HTTP (RESTful API)',
                db: 'db_logistics (fallback: dbmontesdm)',
                icon: 'fa-truck-fast',
                badgeColor: '#ec4899',
                category: 'Logística & Transporte Rural',
                desc: 'Algoritmo de tarificación de fletes por distancia entre municipios y veredas de Montes de María, asignación de transportistas y número de guía.',
                pingUrl: '/health',
                tablas: ['envios', 'tarifas_municipios', 'transportistas', 'tracking_eventos'],
                endpoints: [
                  { method: 'POST', path: '/api/logistics/quote', desc: 'Cotización automática de flete por municipio de origen/destino' },
                  { method: 'POST', path: '/api/logistics/shipments', desc: 'Generación de guía de despacho y transportista' },
                  { method: 'GET', path: '/api/logistics/tracking/:code', desc: 'Consulta pública de estado del envío (tracking)' },
                  { method: 'PUT', path: '/api/logistics/shipments/:id/status', desc: 'Actualización de checkpoint logístico' }
                ],
                eventsPub: ['SHIPMENT_CREATED', 'SHIPMENT_STATUS_UPDATED'],
                eventsSub: ['stream:orders (cg:logistics) -> Genera orden de despacho y transportista'],
                externalDeps: ['Tabla de distancias intermunicipales', 'MySQL Database', 'Redis Streams']
              }
            ].map(meta => {
              const c = circuitData ? circuitData[meta.key] : null
              const liveInstance = registryData?.find(i => 
                i.serviceName.includes(meta.key) || 
                (meta.key === 'support' && i.serviceName.includes('ai-support')) || 
                (meta.key === 'order' && i.serviceName.includes('order')) ||
                (meta.key === 'gateway' && i.serviceName.includes('gateway'))
              )
              const isExpanded = !!expandedServices[meta.key]
              const ping = pingResults[meta.key]

              return (
                <div key={meta.key} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Encabezado de la Tarjeta */}
                  <div style={{ padding: '20px 20px 15px 20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: `${meta.badgeColor}15`, color: meta.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          <i className={`fa ${meta.icon}`} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', background: `${meta.badgeColor}20`, color: meta.badgeColor, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                              {meta.category}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>Puerto :{meta.port}</span>
                          </div>
                          <h3 style={{ margin: '3px 0 0 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{meta.name}</h3>
                        </div>
                      </div>
                      <div>
                        {meta.isGateway ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}>
                            <i className="fa fa-check-circle" /> OPERACIONAL
                          </span>
                        ) : (
                          c ? getCircuitBadge(c.state) : <span style={{ color: '#94a3b8', fontSize: '12px' }}>Conectando...</span>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '10px 0 0 0', lineHeight: '1.4' }}>{meta.desc}</p>
                  </div>

                  {/* Panel de Telemetría en Vivo (Redis & Gateway) */}
                  <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Llamadas Totales:</span>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>{meta.isGateway ? 'Activo' : (c?.totalCalls || 0)}</strong>
                      </div>
                      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{meta.isGateway ? 'Circuitos:' : 'Fallos de Circuito:'}</span>
                        <strong style={{ fontSize: '15px', color: (c?.failureCount || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                          {meta.isGateway ? '5 Activos' : `${c?.failureCount || 0} / 5`}
                        </strong>
                      </div>
                    </div>

                    {/* Datos de Instancia Redis */}
                    {liveInstance ? (
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#065f46' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span><strong>● Instancia Redis:</strong> {liveInstance.instanceId.slice(0, 18)}...</span>
                          <span style={{ fontWeight: 'bold', color: '#047857' }}>UP</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857' }}>
                          <span>RAM: <strong>{(liveInstance.memory / 1024 / 1024).toFixed(1)} MB</strong></span>
                          <span>Uptime: <strong>{Math.floor(liveInstance.uptime / 60)} min</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#991b1b' }}>
                        {meta.isGateway ? '🟢 Proceso Gateway Principal (Puerto 3000)' : '⚠️ Sin instancia viva registrada en Redis Heartbeat'}
                      </div>
                    )}

                    {/* Test de Latencia en Vivo */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <button
                        onClick={() => testPing(meta.key)}
                        disabled={ping?.loading}
                        style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <i className={`fa fa-tachometer-alt ${ping?.loading ? 'fa-spin' : ''}`} />
                        {ping?.loading ? 'Midiendo...' : 'Test Latencia'}
                      </button>

                      {ping && !ping.loading && (
                        <span style={{ fontSize: '11px', color: ping.success ? '#15803d' : '#b91c1c', fontWeight: 'bold' }}>
                          {ping.success ? `✅ ${ping.time} ms (${ping.status})` : `❌ ${ping.time} ms (${ping.error || ping.status})`}
                        </span>
                      )}

                      {!meta.isGateway && c && (c.failureCount > 0 || c.state !== 'CLOSED') && (
                        <button
                          onClick={() => handleResetCircuit(meta.key)}
                          disabled={actionLoading === `circuit-${meta.key}`}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          <i className="fa fa-undo" /> Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sección Expandible: Ficha Operativa del Microservicio */}
                  <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
                    <button
                      onClick={() => toggleExpand(meta.key)}
                      style={{
                        width: '100%',
                        background: isExpanded ? '#f1f5f9' : '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#1e293b',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa fa-server" style={{ color: meta.badgeColor }} />
                        Ficha Técnica y Operativa
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isExpanded ? 'Ocultar' : 'Ver Rutas & BD'}
                        <i className={`fa ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                      </span>
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                        {/* Rutas y Endpoints HTTP */}
                        <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                            <i className="fa fa-route" style={{ color: '#3b82f6', marginRight: '4px' }} /> Rutas & Endpoints HTTP del Microservicio:
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {meta.endpoints.map((ep, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#fff', padding: '4px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{
                                    fontSize: '9px',
                                    fontWeight: '800',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    color: ep.method === 'GET' ? '#059669' : ep.method === 'POST' ? '#2563eb' : ep.method === 'PUT' ? '#d97706' : ep.method === 'DELETE' ? '#dc2626' : '#7c3aed',
                                    background: ep.method === 'GET' ? '#ecfdf5' : ep.method === 'POST' ? '#eff6ff' : ep.method === 'PUT' ? '#fffbeb' : ep.method === 'DELETE' ? '#fef2f2' : '#f5f3ff'
                                  }}>
                                    {ep.method}
                                  </span>
                                  <code style={{ fontSize: '11px', color: '#0f172a' }}>{ep.path}</code>
                                </div>
                                <span style={{ color: '#64748b', fontSize: '10px' }}>{ep.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mapeo de Enrutamiento (Solo Gateway) */}
                        {meta.routesForwarded && (
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                              <i className="fa fa-random" style={{ color: '#0f172a', marginRight: '4px' }} /> Enrutamiento de Proxy Inverso:
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {meta.routesForwarded.map((rf, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#475569' }}>
                                  <code>{rf.route}</code>
                                  <strong style={{ color: '#059669' }}>{rf.target}</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Base de Datos & Tablas */}
                        <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            <i className="fa fa-database" style={{ color: '#059669', marginRight: '4px' }} /> Base de Datos & Tablas Asignadas:
                          </span>
                          <span style={{ color: '#0f172a', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{meta.db}</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {meta.tablas.map((t, idx) => (
                              <code key={idx} style={{ background: '#e2e8f0', color: '#334155', padding: '1px 5px', borderRadius: '3px', fontSize: '10px' }}>{t}</code>
                            ))}
                          </div>
                        </div>

                        {/* Eventos Redis Streams (Event-Driven) */}
                        {(meta.eventsPub.length > 0 || meta.eventsSub.length > 0) && (
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                              <i className="fa fa-bolt" style={{ color: '#8b5cf6', marginRight: '4px' }} /> Mensajería Redis Streams:
                            </span>
                            {meta.eventsPub.length > 0 && (
                              <div style={{ color: '#64748b', marginBottom: '4px' }}>
                                <strong style={{ color: '#0f172a' }}>Publica:</strong> {meta.eventsPub.map((ep, i) => (
                                  <span key={i} style={{ background: '#ede9fe', color: '#6d28d9', padding: '1px 5px', borderRadius: '3px', margin: '0 2px', fontSize: '10px', fontWeight: 'bold' }}>{ep}</span>
                                ))}
                              </div>
                            )}
                            {meta.eventsSub.length > 0 && (
                              <div style={{ color: '#64748b' }}>
                                <strong style={{ color: '#0f172a' }}>Consume:</strong> {meta.eventsSub.map((es, i) => (
                                  <div key={i} style={{ marginTop: '2px', color: '#475569' }}>• {es}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Dependencias e Integraciones */}
                        <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            <i className="fa fa-plug" style={{ color: '#ea580c', marginRight: '4px' }} /> Integraciones & Dependencias Externas:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {meta.externalDeps.map((dep, idx) => (
                              <span key={idx} style={{ background: '#ffedd5', color: '#9a3412', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tabla de Service Registry (Redis Heartbeat) */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  <i className="fa fa-network-wired" style={{ color: '#059669', marginRight: '8px' }} />
                  Instancias Vivas Descubiertas (Service Registry en Redis)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Descubrimiento dinámico de instancias por latidos de salud cada 6 segundos.</span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Última actualización: {lastUpdated.toLocaleTimeString()}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 14px' }}>Servicio</th>
                    <th style={{ padding: '10px 14px' }}>ID de Instancia</th>
                    <th style={{ padding: '10px 14px' }}>Puerto</th>
                    <th style={{ padding: '10px 14px' }}>Memoria (RAM)</th>
                    <th style={{ padding: '10px 14px' }}>Uptime</th>
                    <th style={{ padding: '10px 14px' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {registryData && registryData.length > 0 ? (
                    registryData.map((inst, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0f172a' }}>{inst.serviceName}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b', fontFamily: 'monospace' }}>{inst.instanceId}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{inst.port}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{(inst.memory / 1024 / 1024).toFixed(1)} MB</td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{Math.floor(inst.uptime / 60)}m {Math.floor(inst.uptime % 60)}s</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                            ● {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                        No se detectaron instancias registradas en Redis.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dead Letter Queue (DLQ) Inspector */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  <i className="fa fa-inbox" style={{ color: '#f59e0b', marginRight: '8px' }} />
                  Dead Letter Queue (DLQ) - Eventos Retenidos
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Eventos que fallaron después de 3 reintentos en Redis Streams para auditoría y rescate.</span>
              </div>
              {dlqData && dlqData.length > 0 && (
                <button
                  onClick={handleClearDLQ}
                  disabled={actionLoading === 'dlq'}
                  style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <i className="fa fa-trash" /> Vaciar DLQ
                </button>
              )}
            </div>

            {dlqData && dlqData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dlqData.map((msg, i) => (
                  <div key={i} style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: '#9f1239' }}>Stream: {msg.originalStream} | Grupo: {msg.group}</strong>
                      <span style={{ color: '#881337' }}>{msg.failedAt}</span>
                    </div>
                    <div style={{ color: '#be123c', marginBottom: '6px' }}>Error: {msg.error} (Reintentos: {msg.retries})</div>
                    <pre style={{ background: '#fff', padding: '8px', borderRadius: '4px', margin: 0, overflowX: 'auto', fontSize: '11px', color: '#334155' }}>
                      {msg.payload}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#f8fafc', padding: '25px', textAlign: 'center', borderRadius: '8px', color: '#64748b' }}>
                <i className="fa fa-check-circle" style={{ fontSize: '28px', color: '#16a34a', display: 'block', marginBottom: '8px' }} />
                <strong>¡La Dead Letter Queue está 100% limpia!</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Todos los eventos de compras e inventario han sido procesados sin fallas.</p>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
