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
                {registryData?.length || 0} / 5 Servicios
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

          {/* Grid de Microservicios y Circuit Breakers */}
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '15px' }}>
            Microservicios y Estado de Circuit Breakers
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '30px' }}>
            {circuitData && Object.entries(circuitData).map(([key, c]) => {
              const meta = {
                auth: { name: 'Auth & User Service', port: 3001, db: 'db_auth', icon: 'fa-lock', desc: 'Login, JWT, OAuth, Usuarios y Vendedores' },
                catalog: { name: 'Catalog & Product Service', port: 3002, db: 'db_catalog', icon: 'fa-box-open', desc: 'Productos, Banners, Categorías y Caché Redis' },
                order: { name: 'Order & Purchase Service', port: 3003, db: 'db_orders', icon: 'fa-shopping-cart', desc: 'Compras, Pagos Wompi, Cupones y Eventos' },
                support: { name: 'AI & Support Service', port: 3004, db: 'db_support', icon: 'fa-robot', desc: 'Tickets, Socket.IO y Asistente IA OpenRouter' },
                notification: { name: 'Notification Service', port: 3005, db: 'N/A', icon: 'fa-paper-plane', desc: 'Worker Telegram Bot y Correos Transaccionales' }
              }[key] || { name: key, port: 'N/A', db: 'N/A', icon: 'fa-server', desc: '' }

              return (
                <div key={key} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: '18px' }}>
                        <i className={`fa ${meta.icon}`} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{meta.name}</h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Puerto: {meta.port} • BD: <code style={{ background: '#f1f5f9', padding: '2px 5px', borderRadius: '4px' }}>{meta.db}</code></span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 15px 0' }}>{meta.desc}</p>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Estado Disyuntor:</span>
                      {getCircuitBadge(c.state)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Llamadas Totales:</span>
                      <strong style={{ color: '#0f172a' }}>{c.totalCalls || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Fallos Consecutivos:</span>
                      <strong style={{ color: (c.failureCount || 0) > 0 ? '#dc2626' : '#16a34a' }}>{c.failureCount || 0} / 5</strong>
                    </div>
                  </div>

                  {(c.failureCount > 0 || c.state !== 'CLOSED') && (
                    <button
                      onClick={() => handleResetCircuit(key)}
                      disabled={actionLoading === `circuit-${key}`}
                      style={{ width: '100%', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <i className="fa fa-undo" /> Restablecer Circuito a CLOSED
                    </button>
                  )}
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
