import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { listarAgentes, buscarTicket, enviarMensaje, cerrarTicket } from '../api/soporte.api'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'

const DEFAULT_QUICK_REPLIES = [
  {
    id: 'qr_saludo',
    shortcut: '/saludo',
    titulo: '👋 Saludo Inicial',
    categoria: 'Bienvenida',
    mensaje: '¡Hola {cliente}! 👋 Un gusto saludarte. Mi nombre es {asesor}, ¿en qué podemos colaborarte hoy con tu pedido o consulta?',
  },
  {
    id: 'qr_envio',
    shortcut: '/envio',
    titulo: '🚚 Estado de Envío',
    categoria: 'Logística',
    mensaje: 'Tus productos están siendo preparados directamente en fincas de los Montes de María. Los despachos toman entre 24 y 48 horas hábiles para llegar 100% frescos.',
  },
  {
    id: 'qr_pago',
    shortcut: '/pago',
    titulo: '💵 Pago Contra Entrega',
    categoria: 'Pagos',
    mensaje: 'Manejamos la modalidad de Pago Contra Entrega. Cancelas en efectivo únicamente cuando recibas tus productos en la puerta de tu domicilio.',
  },
  {
    id: 'qr_origen',
    shortcut: '/origen',
    titulo: '🌱 Origen Campesino',
    categoria: 'Cosechas',
    mensaje: 'Nuestras cosechas (ñame, yuca, plátano, aguacate y lácteos) provienen 100% de pequeños productores de El Carmen de Bolívar, San Jacinto, Ovejas y alrededores.',
  },
  {
    id: 'qr_whatsapp',
    shortcut: '/whatsapp',
    titulo: '📱 WhatsApp Directo',
    categoria: 'Contacto',
    mensaje: 'También puedes comunicarte con nuestra línea oficial de soporte y fotos en WhatsApp: +57 300 872 3989.',
  },
  {
    id: 'qr_factura',
    shortcut: '/factura',
    titulo: '🧾 Factura Electrónica',
    categoria: 'Facturación',
    mensaje: 'Tu factura electrónica con código QR y detalle de compra ha sido generada y enviada a tu correo registrado.',
  },
  {
    id: 'qr_cierre',
    shortcut: '/cierre',
    titulo: '✅ Cierre & Agradecimiento',
    categoria: 'Cierre',
    mensaje: '¡Muchas gracias por apoyar a las familias campesinas de los Montes de María! Si no tienes más inquietudes, procederé a cerrar el ticket. ¡Que tengas un excelente día! 🌾',
  },
]

export default function AdminSoportePage() {
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [replyText, setReplyText] = useState('')
  const [agentes, setAgentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [searchFilter, setSearchFilter] = useState('')

  // Sistema de Mensajes Rápidos
  const [quickReplies, setQuickReplies] = useState(() => {
    try {
      const stored = localStorage.getItem('montes_quick_replies')
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_QUICK_REPLIES
      }
    } catch (_) {}
    return DEFAULT_QUICK_REPLIES
  })

  const [showQuickModal, setShowQuickModal] = useState(false)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashFilter, setSlashFilter] = useState('')
  const [newQrTitle, setNewQrTitle] = useState('')
  const [newQrShortcut, setNewQrShortcut] = useState('')
  const [newQrCategory, setNewQrCategory] = useState('General')
  const [newQrMessage, setNewQrMessage] = useState('')

  const chatEndRef = useRef(null)
  const replyInputRef = useRef(null)

  // Guardar respuestas personalizadas en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('montes_quick_replies', JSON.stringify(quickReplies))
    } catch (_) {}
  }, [quickReplies])

  // Hook de socket en admin_room
  const { emitEscribiendo } = useSocket(
    selectedTicket?.session_id || 'admin_room',
    'admin',
    {
      onTicketCreado: (newTicket) => {
        setTickets((prev) => [newTicket, ...prev.filter((t) => t.id !== newTicket.id)])
      },
      onNuevoMensaje: (msg) => {
        if (msg.session_id === selectedTicket?.session_id) {
          setMessages((prev) => {
            if (msg.id && prev.some((m) => m.id === msg.id)) return prev

            // Reemplazar mensaje temporal optimista si existe
            const tempIdx = prev.findIndex(
              (m) =>
                (String(m.id).startsWith('temp_') || !m.id) &&
                (m.remitente === msg.remitente || m.rol === msg.rol || m.rol === msg.remitente || m.remitente === msg.rol) &&
                m.mensaje?.trim() === msg.mensaje?.trim()
            )
            if (tempIdx !== -1) {
              const next = [...prev]
              next[tempIdx] = msg
              return next
            }

            return [...prev, msg]
          })
        }
      },
      onTicketCerrado: (data) => {
        const closedId = typeof data === 'object' ? data.ticketId : data
        setTickets((prev) =>
          prev.map((t) => (t.id === closedId || t.session_id === data?.sessionId ? { ...t, estado: 'cerrado' } : t))
        )
        if (selectedTicket?.id === closedId || selectedTicket?.session_id === data?.sessionId) {
          setSelectedTicket((prev) => (prev ? { ...prev, estado: 'cerrado' } : null))
        }
      },
    }
  )

  const fetchTickets = async () => {
    try {
      const [tickRes, agRes] = await Promise.allSettled([
        buscarTicket({ q: '' }),
        listarAgentes(),
      ])

      if (tickRes.status === 'fulfilled') {
        const list = tickRes.value.data?.tickets || tickRes.value.data || []
        setTickets(list)
        if (list.length > 0 && !selectedTicket) {
          setSelectedTicket(list[0])
          setMessages(list[0].mensajes || [])
        } else if (selectedTicket) {
          const updated = list.find((t) => t.id === selectedTicket.id || t.session_id === selectedTicket.session_id)
          if (updated) {
            setSelectedTicket(updated)
            setMessages(updated.mensajes || [])
          }
        }
      }

      if (agRes.status === 'fulfilled') {
        setAgentes(agRes.value.data?.agentes || agRes.value.data || [])
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectTicket = (t) => {
    setSelectedTicket(t)
    setMessages(t.mensajes || [])
    setShowSlashMenu(false)
  }

  const formatTemplate = (templateStr) => {
    if (!templateStr) return ''
    const clienteName = selectedTicket?.nombre_cliente || 'Cliente'
    const agentName = user?.nombre || user?.username || 'Asesor'
    const code = selectedTicket?.ticket_code || ''
    return templateStr
      .replace(/\{cliente\}/gi, clienteName)
      .replace(/\{asesor\}/gi, agentName)
      .replace(/\{codigo\}/gi, code)
  }

  const handleInsertQuickReply = (qr, autoSend = false) => {
    const formatted = formatTemplate(qr.mensaje)
    setShowSlashMenu(false)

    if (autoSend && selectedTicket) {
      sendDirectMessage(formatted)
    } else {
      setReplyText(formatted)
      replyInputRef.current?.focus()
    }
  }

  const sendDirectMessage = async (textToSend) => {
    if (!textToSend.trim() || !selectedTicket) return

    const txt = textToSend.trim()
    setReplyText('')
    setShowSlashMenu(false)

    const agentName = user?.nombre || user?.username || 'Asesor de Soporte'
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const localMsg = {
      id: tempId,
      session_id: selectedTicket.session_id,
      ticket_id: selectedTicket.id,
      remitente: 'agente',
      rol: 'agente',
      nombre_remitente: agentName,
      mensaje: txt,
      fecha: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, localMsg])

    try {
      await enviarMensaje({
        session_id: selectedTicket.session_id,
        ticket_id: selectedTicket.id,
        mensaje: txt,
        remitente: 'agente',
        nombre_remitente: agentName,
      })
    } catch (err) {
      console.error('Error sending agent reply:', err)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error('No se pudo enviar el mensaje')
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedTicket) return
    sendDirectMessage(replyText)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setReplyText(val)
    emitEscribiendo()

    if (val.startsWith('/')) {
      setShowSlashMenu(true)
      setSlashFilter(val.toLowerCase())
    } else {
      setShowSlashMenu(false)
    }
  }

  const handleAddQuickReply = (e) => {
    e.preventDefault()
    if (!newQrTitle.trim() || !newQrMessage.trim()) {
      toast.error('Título y mensaje son requeridos')
      return
    }

    let shortcut = newQrShortcut.trim()
    if (shortcut && !shortcut.startsWith('/')) shortcut = '/' + shortcut

    const newReply = {
      id: `qr_custom_${Date.now()}`,
      titulo: newQrTitle.trim(),
      shortcut: shortcut || `/${newQrTitle.trim().toLowerCase().replace(/\s+/g, '')}`,
      categoria: newQrCategory.trim() || 'Personalizado',
      mensaje: newQrMessage.trim(),
    }

    setQuickReplies((prev) => [...prev, newReply])
    setNewQrTitle('')
    setNewQrShortcut('')
    setNewQrMessage('')
    toast.success('Mensaje rápido agregado con éxito')
  }

  const handleDeleteQuickReply = (id) => {
    setQuickReplies((prev) => prev.filter((qr) => qr.id !== id))
    toast.info('Mensaje rápido eliminado')
  }

  const handleResetQuickReplies = () => {
    setQuickReplies(DEFAULT_QUICK_REPLIES)
    toast.success('Respuestas rápidas restauradas por defecto')
  }

  const handleCloseTicket = async () => {
    if (!selectedTicket) return
    const ok = await confirm({
      title: '¿Cerrar ticket?',
      message: 'El ticket será marcado como Resuelto y Cerrado. Esta acción no se puede deshacer.',
      danger: false,
    })
    if (!ok) return

    setClosing(true)
    try {
      await cerrarTicket({
        ticket_id: selectedTicket.id,
        session_id: selectedTicket.session_id,
      })
      setSelectedTicket((prev) => (prev ? { ...prev, estado: 'cerrado' } : null))
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, estado: 'cerrado' } : t))
      )
      setMessages((prev) => [
        ...prev,
        {
          remitente: 'sistema',
          nombre_remitente: 'Sistema',
          mensaje: '✅ Ticket marcado como resuelto y cerrado por el agente.',
          fecha: new Date().toISOString(),
        },
      ])
    } catch (err) {
      toast.error('Error al cerrar el ticket.')
    } finally {
      setClosing(false)
    }
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus =
        filterStatus === 'todos' ||
        (filterStatus === 'agente' && t.estado === 'agente') ||
        (filterStatus === 'bot' && t.estado === 'bot') ||
        (filterStatus === 'cerrado' && t.estado === 'cerrado')

      const q = searchFilter.toLowerCase().trim()
      const matchSearch =
        q === '' ||
        (t.ticket_code && t.ticket_code.toLowerCase().includes(q)) ||
        (t.nombre_cliente && t.nombre_cliente.toLowerCase().includes(q)) ||
        (t.correo_cliente && t.correo_cliente.toLowerCase().includes(q)) ||
        (t.asunto && t.asunto.toLowerCase().includes(q))

      return matchStatus && matchSearch
    })
  }, [tickets, filterStatus, searchFilter])

  const matchingSlashReplies = useMemo(() => {
    if (!slashFilter || !slashFilter.startsWith('/')) return quickReplies
    const query = slashFilter.substring(1).trim()
    if (!query) return quickReplies
    return quickReplies.filter(
      (qr) =>
        qr.shortcut.toLowerCase().includes(query) ||
        qr.titulo.toLowerCase().includes(query) ||
        qr.categoria.toLowerCase().includes(query)
    )
  }, [quickReplies, slashFilter])

  const pendingHumanCount = tickets.filter((t) => t.estado === 'agente').length

  return (
    <div className="admin-support-fullscreen" style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', padding: '1.5rem 2rem' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: '#ffffff', padding: '1.25rem 1.75rem', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '1.4rem' }}>
            <i className="fa fa-headset" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#1b5e20', fontWeight: 800 }}>
                Mesa de Ayuda & Atención en Vivo
              </h1>
              {pendingHumanCount > 0 && (
                <span className="badge badge-danger" style={{ animation: 'pulse 2s infinite' }}>
                  {pendingHumanCount} Requiere Asesor Humano
                </span>
              )}
            </div>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Gestiona consultas de compradores y productores en tiempo real con respuestas rápidas integradas.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowQuickModal(true)}
            className="btn btn-outline-success"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <i className="fa fa-bolt text-warning" /> Mensajes Rápidos ({quickReplies.length})
          </button>
          <button onClick={fetchTickets} className="btn btn-outline-primary" title="Refrescar lista de tickets">
            <i className="fa fa-sync-alt" /> Actualizar
          </button>
          <Link to="/admin" className="btn btn-secondary">
            <i className="fa fa-arrow-left" /> Volver al Panel
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 2fr)', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>
        {/* Left Column: Tickets List with Filters */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: '14px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa fa-inbox text-primary" /> Tickets ({filteredTickets.length})
              </h3>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Total: {tickets.length}</span>
            </div>

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setFilterStatus('todos')}
                className={`btn btn-sm ${filterStatus === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('agente')}
                className={`btn btn-sm ${filterStatus === 'agente' ? 'btn-warning' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                ⚠️ Asesor ({tickets.filter((t) => t.estado === 'agente').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('bot')}
                className={`btn btn-sm ${filterStatus === 'bot' ? 'btn-success' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                🤖 Bot
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('cerrado')}
                className={`btn btn-sm ${filterStatus === 'cerrado' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                Resueltos
              </button>
            </div>

            {/* Search Filter Input */}
            <div style={{ marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Buscar por código, cliente o asunto..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Tickets List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <i className="fa fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                <p>Cargando tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <i className="fa fa-folder-open" style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                <p>No se encontraron tickets con este filtro.</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id
                const isNeedsAgent = t.estado === 'agente'
                const isClosed = t.estado === 'cerrado'

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(46, 125, 50, 0.08)' : '#ffffff',
                      border: isSelected
                        ? '2px solid var(--primary-color, #2e7d32)'
                        : isNeedsAgent
                        ? '1.5px solid #ffa000'
                        : '1px solid var(--border-color)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? '#1b5e20' : 'inherit' }}>
                        {t.ticket_code || `TK-${t.id}`}
                      </span>
                      <span
                        className={`badge ${
                          isClosed ? 'badge-secondary' : isNeedsAgent ? 'badge-warning' : 'badge-success'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {isClosed ? 'Resuelto' : isNeedsAgent ? '⚠️ Requiere Asesor' : '🤖 IA Bot'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.asunto || 'Consulta sin asunto'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      <span>👤 {t.nombre_cliente || 'Anónimo'}</span>
                      <span>{t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Ticket Chat & Details */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: '14px', position: 'relative' }}>
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem 1.5rem', background: '#f8f9fa', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#1b5e20', fontWeight: 800 }}>
                      [{selectedTicket.asunto || 'Consulta'}] {selectedTicket.ticket_code || `#${selectedTicket.id}`}
                    </h2>
                    <span className={`badge ${selectedTicket.estado === 'cerrado' ? 'badge-secondary' : selectedTicket.estado === 'agente' ? 'badge-warning' : 'badge-success'}`}>
                      {selectedTicket.estado === 'cerrado' ? 'Resuelto' : selectedTicket.estado === 'agente' ? 'En cola de Asesor' : 'Asistente IA'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span><strong>Cliente:</strong> {selectedTicket.nombre_cliente || 'Anónimo'}</span>
                    <span><strong>Correo:</strong> {selectedTicket.correo_cliente || 'N/A'}</span>
                    {selectedTicket.telefono_cliente && <span><strong>Tel:</strong> {selectedTicket.telefono_cliente}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedTicket.estado !== 'cerrado' && (
                    <button
                      type="button"
                      onClick={handleCloseTicket}
                      disabled={closing}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <i className={`fa ${closing ? 'fa-spinner fa-spin' : 'fa-check'}`} /> Marcar Resuelto
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#ffffff' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                    <i className="fa fa-comments" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No hay mensajes en esta conversación todavía.</p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isAgent = m.remitente === 'agente' || m.remitente === 'admin'
                    const isBot = m.remitente === 'bot'
                    const isSys = m.remitente === 'sistema'
                    const isClient = !isAgent && !isBot && !isSys

                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isAgent ? 'flex-end' : isSys ? 'center' : 'flex-start',
                          maxWidth: isSys ? '90%' : '75%',
                          backgroundColor: isAgent ? 'var(--primary-color, #2e7d32)' : isSys ? '#eceff1' : isBot ? '#f1f8e9' : '#f5f5f5',
                          color: isAgent ? '#ffffff' : '#202124',
                          padding: '0.75rem 1rem',
                          borderRadius: isAgent ? '16px 16px 4px 16px' : isSys ? '8px' : '16px 16px 16px 4px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                          fontSize: '0.92rem',
                          border: isBot ? '1px solid #c8e6c9' : isSys ? '1px dashed #b0bec5' : 'none',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', opacity: isAgent ? 0.9 : 0.75, color: isAgent ? '#ffffff' : isBot ? '#2e7d32' : isSys ? '#546e7a' : '#1565c0' }}>
                          {isAgent
                            ? `🛡️ ${m.nombre_remitente || user?.nombre || 'Asesor de Soporte'}`
                            : isBot
                            ? '🤖 Asistente Bot (IA)'
                            : isSys
                            ? '🔔 Sistema'
                            : `👤 ${m.nombre_remitente || selectedTicket.nombre_cliente || 'Cliente'}`}{' '}
                          • {m.fecha ? new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'}
                        </div>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.mensaje}</p>
                      </div>
                    )
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Slash Command Autocomplete Menu Floating Above Input */}
              {showSlashMenu && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '120px',
                    left: '1.5rem',
                    right: '1.5rem',
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                    border: '1.5px solid #c8e6c9',
                    zIndex: 100,
                    maxHeight: '220px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                  }}
                >
                  <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 800, color: '#2e7d32', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
                    <span>⚡ MENSAJES RÁPIDOS DISPONIBLES (Escribe para filtrar)</span>
                    <span>Clic para insertar</span>
                  </div>
                  {matchingSlashReplies.length === 0 ? (
                    <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No hay respuestas que coincidan con <code>{slashFilter}</code>
                    </div>
                  ) : (
                    matchingSlashReplies.map((qr) => (
                      <div
                        key={qr.id}
                        onClick={() => handleInsertQuickReply(qr)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f8e9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <strong style={{ color: '#1b5e20', fontSize: '0.88rem' }}>{qr.titulo}</strong>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {qr.shortcut}
                          </span>
                          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#555555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '500px' }}>
                            {formatTemplate(qr.mensaje)}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 700 }}>Insertar ↵</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Quick Reply Pills Horizontal Bar */}
              {selectedTicket.estado !== 'cerrado' && (
                <div style={{ padding: '0.5rem 1.5rem 0.2rem', background: '#f8f9fa', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2e7d32', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="fa fa-bolt text-warning" /> Rápidos:
                  </span>
                  {quickReplies.slice(0, 6).map((qr) => (
                    <button
                      key={qr.id}
                      type="button"
                      onClick={() => handleInsertQuickReply(qr)}
                      title={formatTemplate(qr.mensaje)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #c8e6c9',
                        borderRadius: '999px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#1b5e20',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2e7d32'
                        e.currentTarget.style.color = '#ffffff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff'
                        e.currentTarget.style.color = '#1b5e20'
                      }}
                    >
                      {qr.titulo}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowQuickModal(true)}
                    style={{
                      background: '#e8f5e9',
                      border: '1px dashed #81c784',
                      borderRadius: '999px',
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#2e7d32',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Ver todos ({quickReplies.length})
                  </button>
                </div>
              )}

              {/* Agent Reply Input Bar */}
              {selectedTicket.estado !== 'cerrado' ? (
                <form onSubmit={handleSendReply} style={{ padding: '0.75rem 1.5rem 1rem', background: '#f8f9fa', display: 'flex', gap: '0.75rem' }}>
                  <input
                    ref={replyInputRef}
                    type="text"
                    placeholder="Escribe una respuesta... (o usa / para mensajes rápidos)"
                    value={replyText}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={!replyText.trim()} style={{ padding: '0 1.5rem' }}>
                    <i className="fa fa-paper-plane" /> Responder
                  </button>
                </form>
              ) : (
                <div style={{ padding: '1rem', background: '#f8f9fa', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <i className="fa fa-check-circle text-success" /> Este ticket está marcado como resuelto.
                </div>
              )}
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <i className="fa fa-headset" style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }} />
              <h3>Selecciona un ticket de la lista para atender</h3>
              <p>Podrás chatear en vivo con el cliente y usar plantillas de respuestas automáticas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Panel de Administración de Mensajes Rápidos */}
      {showQuickModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowQuickModal(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              padding: '1.5rem',
              overflow: 'hidden',
              background: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32', fontSize: '1.2rem' }}>
                  <i className="fa fa-bolt" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1b5e20', fontWeight: 800 }}>
                    Gestor de Mensajes Rápidos
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Inserta variables dinámicas como <code>{'{cliente}'}</code>, <code>{'{asesor}'}</code> o <code>{'{codigo}'}</code>
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setShowQuickModal(false)} className="btn btn-sm btn-secondary" style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}>
                ✕
              </button>
            </div>

            {/* Modal Body with Two Tabs / Areas */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Form to Add New Quick Reply */}
              <form onSubmit={handleAddQuickReply} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.9rem', color: '#1b5e20', display: 'block', marginBottom: '0.6rem' }}>
                  ➕ Crear Nueva Respuesta Rápida
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Título (ej: Formas de Pago)"
                    value={newQrTitle}
                    onChange={(e) => setNewQrTitle(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Comando (/pago)"
                    value={newQrShortcut}
                    onChange={(e) => setNewQrShortcut(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Categoría"
                    value={newQrCategory}
                    onChange={(e) => setNewQrCategory(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
                <textarea
                  placeholder="Mensaje de respuesta para el cliente... Puedes usar {cliente} para el nombre."
                  value={newQrMessage}
                  onChange={(e) => setNewQrMessage(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', minHeight: '65px', fontSize: '0.85rem', marginBottom: '0.6rem' }}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-sm btn-primary">
                    <i className="fa fa-save" /> Guardar Mensaje
                  </button>
                </div>
              </form>

              {/* Existing Quick Replies List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#333333' }}>
                    📋 Plantillas Guardadas ({quickReplies.length})
                  </strong>
                  <button
                    type="button"
                    onClick={handleResetQuickReplies}
                    className="btn btn-sm btn-outline-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    Restaurar Predeterminados
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {quickReplies.map((qr) => (
                    <div
                      key={qr.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#1b5e20' }}>{qr.titulo}</strong>
                          <span style={{ fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {qr.shortcut}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            [{qr.categoria}]
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#444444', lineHeight: 1.45 }}>
                          {formatTemplate(qr.mensaje)}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                        {selectedTicket && selectedTicket.estado !== 'cerrado' && (
                          <button
                            type="button"
                            onClick={() => {
                              handleInsertQuickReply(qr)
                              setShowQuickModal(false)
                            }}
                            className="btn btn-sm btn-success"
                            style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                            title="Insertar en la caja de texto"
                          >
                            <i className="fa fa-pencil-alt" /> Usar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteQuickReply(qr.id)}
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
                          title="Eliminar este mensaje rápido"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowQuickModal(false)} className="btn btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
