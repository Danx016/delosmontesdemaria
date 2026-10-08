import { useState, useMemo, useRef } from 'react'
import HeroSlideRenderer from './HeroSlideRenderer'

// Catálogo de plantillas y diseños inspirados en Montes de María
export const PRESET_HERO_DESIGNS = [
  {
    id: 'queso_costeno',
    nombre: '🧀 Queso Costeño y Lácteos',
    subtitulo_desc: 'Idéntico a la tienda: con cita artesanal, productor y tarjeta de queso',
    estilo_plantilla: 'clasico',
    color_acento: '#0284c7',
    imagen_fondo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    filtro_blur: 0,
    categoria_nombre: 'LÁCTEOS ARTESANALES',
    categoria_slug: 'lacteos',
    titulo: 'Queso Costeño y Lácteos Campesinos',
    subtitulo: 'Queso costeño fresco, cuajada y suero tradicional elaborado artesanalmente con leche 100% pura en San Jacinto.',
    cita: 'Queso costeño fresco, cuajada y suero tradicional elaborado artesanalmente con leche 100% pura en San Jacinto.',
    mostrar_cita: true,
    mostrar_productor: true,
    mostrar_badge: true,
    mostrar_tarjeta: true,
    features: [
      'Queso Costeño Fresco',
      'Suero Tradicional Costeño',
      'Leche Pura de Ordeño'
    ],
    botones: [
      { id: 'b1', texto: 'Comprar Cosecha', link: '/categoria/lacteos', icono: 'fa-shopping-basket', estilo: 'primary' },
      { id: 'b2', texto: 'Conocer Productor', link: '/vendedor', icono: 'fa-store', estilo: 'secondary' }
    ],
    tarjeta_titulo: 'Queso Costeño',
    tarjeta_precio: '$25.000 COP / Venta por kg',
    tarjeta_imagen: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80',
    tarjeta_badge_top: '🧀 100% Artesanal',
    tarjeta_vendedor_nombre: 'Montes de María • Productor Local',
    tarjeta_vendedor_rating: '🚚 Envío Inmediato'
  },
  {
    id: 'aguacate_lorena',
    nombre: '🥑 Aguacate Lorena Criollo',
    subtitulo_desc: 'Estilo inmersivo moderno con tipografía gigante y verde esmeralda',
    estilo_plantilla: 'inmersivo',
    color_acento: '#15803d',
    imagen_fondo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=80',
    filtro_blur: 1,
    categoria_nombre: 'COSECHAS FRESCAS',
    categoria_slug: 'cosechas',
    titulo: 'El Mejor Aguacate de los Montes de María',
    subtitulo: 'Cosechado en las laderas fértiles de El Carmen de Bolívar. Mantecoso, fresco y sin químicos.',
    cita: '',
    mostrar_cita: false,
    mostrar_productor: true,
    mostrar_badge: true,
    mostrar_tarjeta: true,
    features: [
      '100% Agroecológico',
      'Cosechado al Día',
      'Directo del Campesino'
    ],
    botones: [
      { id: 'b1', texto: 'Comprar Aguacates', link: '/categoria/cosechas', icono: 'fa-basket-shopping', estilo: 'primary' },
      { id: 'b2', texto: 'Pedir por WhatsApp', link: 'https://wa.me/573000000000', icono: 'fa-whatsapp', estilo: 'whatsapp' }
    ],
    tarjeta_titulo: 'Aguacate Lorena Extra',
    tarjeta_precio: '$4.500 COP / Unidad',
    tarjeta_imagen: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
    tarjeta_badge_top: '🥑 Cosecha Premium',
    tarjeta_vendedor_nombre: 'Don Pedro Gómez • El Carmen',
    tarjeta_vendedor_rating: '⭐ 5.0 Calidad'
  },
  {
    id: 'name_espino',
    nombre: '🌱 Ñame Diamante & Espino',
    subtitulo_desc: 'Estilo clásico con tarjeta flotante de raíz montemariana',
    estilo_plantilla: 'clasico',
    color_acento: '#16a34a',
    imagen_fondo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    filtro_blur: 0,
    categoria_nombre: 'TUBÉRCULOS & RAÍCES',
    categoria_slug: 'cosechas',
    titulo: 'Ñame Diamante y Espino Tradicional',
    subtitulo: 'El auténtico sabor y resistencia de la tierra de San Juan Nepomuceno y San Jacinto.',
    cita: 'La raíz que alimenta la tradición y la fuerza de nuestras familias campesinas.',
    mostrar_cita: true,
    mostrar_productor: true,
    mostrar_badge: true,
    mostrar_tarjeta: true,
    features: [
      'Sin Fumigación Química',
      'Rendimiento en Cocina',
      'Empaque Artesanal'
    ],
    botones: [
      { id: 'b1', texto: 'Ver Catálogo de Ñame', link: '/categoria/cosechas', icono: 'fa-boxes', estilo: 'primary' },
      { id: 'b2', texto: 'Comprar al Por Mayor', link: '/catalogo', icono: 'fa-truck-fast', estilo: 'secondary' }
    ],
    tarjeta_titulo: 'Ñame Espino Seleccionado',
    tarjeta_precio: '$6.000 COP / kg',
    tarjeta_imagen: '/img/Ñame.avif',
    tarjeta_badge_top: '🌱 Cosecha Tradicional',
    tarjeta_vendedor_nombre: 'Asociación Campesina San Juan',
    tarjeta_vendedor_rating: '⭐ 4.9/5'
  },
  {
    id: 'cafe_altura',
    nombre: '☕ Café Especial de Montaña',
    subtitulo_desc: 'Estilo historia campesina enfocado en el origen y notas de cata',
    estilo_plantilla: 'historia_campesina',
    color_acento: '#d97706',
    imagen_fondo: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80',
    filtro_blur: 0,
    categoria_nombre: 'CAFÉ DE ESPECIALIDAD',
    categoria_slug: 'cafe',
    titulo: 'Café Cultivado Bajo Sombra en la Serranía',
    subtitulo: 'Granos arábigos seleccionados a mano por caficultores de San Jacinto y Chalán.',
    cita: 'Cada taza encierra el aroma de la niebla matutina de la serranía y el esfuerzo de manos campesinas.',
    mostrar_cita: true,
    mostrar_productor: true,
    mostrar_badge: true,
    mostrar_tarjeta: true,
    features: [
      'Notas a Chocolate y Miel',
      'Tueste Medio Artesanal',
      'Comercio Directo y Justo'
    ],
    botones: [
      { id: 'b1', texto: 'Comprar Café de Finca', link: '/categoria/cafe', icono: 'fa-coffee', estilo: 'amber' },
      { id: 'b2', texto: 'Conocer Caficultores', link: '/vendedores', icono: 'fa-users', estilo: 'secondary' }
    ],
    tarjeta_titulo: 'Café Tostado en Grano 500g',
    tarjeta_precio: '$18.000 COP',
    tarjeta_imagen: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    tarjeta_badge_top: '☕ Micro-lote 1800m',
    tarjeta_vendedor_nombre: 'Finca La Serranía • San Jacinto',
    tarjeta_vendedor_rating: '⭐ 5.0'
  },
  {
    id: 'oferta_flash_campo',
    nombre: '⚡ Gran Cosecha Montemariana',
    subtitulo_desc: 'Estilo promocional con caja de cupón copiable y descuento',
    estilo_plantilla: 'oferta_flash',
    color_acento: '#ea580c',
    imagen_fondo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    filtro_blur: 0,
    categoria_nombre: 'OFERTA DE LA SEMANA',
    categoria_slug: 'ofertas',
    titulo: 'Semana de la Cosecha Campesina con 20% OFF',
    subtitulo: 'Usa el cupón oficial para apoyar la economía local con precios de plaza de mercado.',
    cita: '',
    mostrar_cita: false,
    mostrar_productor: false,
    mostrar_badge: true,
    mostrar_tarjeta: true,
    cupon_codigo: 'CAMPO20',
    cupon_texto: '⚡ 20% de descuento directo en tu primera canasta campesina',
    features: [
      'Descuento Inmediato',
      'Envíos a Toda la Región',
      'Productos del Día'
    ],
    botones: [
      { id: 'b1', texto: 'Aprovechar Descuento', link: '/catalogo', icono: 'fa-bolt', estilo: 'amber' },
      { id: 'b2', texto: 'Ver Todas las Ofertas', link: '/ofertas', icono: 'fa-tags', estilo: 'secondary' }
    ],
    tarjeta_titulo: 'Canasta Familiar Campesina',
    tarjeta_precio: '$65.000 COP',
    tarjeta_imagen: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    tarjeta_badge_top: '🔥 -20% CON CUPÓN',
    tarjeta_vendedor_nombre: 'Red de Productores Montemarianos',
    tarjeta_vendedor_rating: '⚡ Envío Hoy'
  },
  {
    id: 'miel_pura',
    nombre: '🐝 Miel 100% Pura de Abejas',
    subtitulo_desc: 'Estilo mosaico con 3 pilares de pureza natural y floración silvestre',
    estilo_plantilla: 'mosaico',
    color_acento: '#eab308',
    imagen_fondo: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1600&q=80',
    filtro_blur: 0,
    categoria_nombre: 'PRODUCTOS NATURALES',
    categoria_slug: 'miel',
    titulo: 'Miel Pura de Bosque Seco Tropical',
    subtitulo: 'Cosechada de colmenas libres de pesticidas en María la Baja y San Onofre.',
    cita: '',
    mostrar_cita: false,
    mostrar_productor: false,
    mostrar_badge: true,
    mostrar_tarjeta: true,
    features: [
      '100% Cruda y Sin Azúcar Añadida',
      'Floración de Campanilla y Guácimo',
      'Extracción en Frío Artesanal'
    ],
    botones: [
      { id: 'b1', texto: 'Comprar Miel Pura', link: '/categoria/miel', icono: 'fa-jar', estilo: 'amber' },
      { id: 'b2', texto: 'Conocer Apicultores', link: '/vendedores', icono: 'fa-users', estilo: 'secondary' }
    ],
    tarjeta_titulo: 'Miel de Abejas Botella 750ml',
    tarjeta_precio: '$22.000 COP',
    tarjeta_imagen: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    tarjeta_badge_top: '🐝 Cosecha 2026',
    tarjeta_vendedor_nombre: 'Apicultores de María la Baja',
    tarjeta_vendedor_rating: '⭐ 5.0 Certificado'
  }
]

export const BLANK_BANNER = {
  estilo_plantilla: 'clasico',
  color_acento: '#22c55e',
  imagen_fondo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
  filtro_blur: 0,
  categoria_nombre: '',
  categoria_slug: '',
  categoria_thumb: '',
  titulo: '',
  subtitulo: '',
  cita: '',
  mostrar_cita: false,
  mostrar_productor: false,
  mostrar_badge: true,
  mostrar_tarjeta: true,
  features: [],
  botones: [
    { id: 'b1', texto: 'Ver Catálogo', link: '/catalogo', icono: 'fa-shopping-basket', estilo: 'primary' }
  ],
  tarjeta_titulo: '',
  tarjeta_precio: '',
  tarjeta_imagen: '',
  tarjeta_badge_top: '',
  tarjeta_vendedor_nombre: '',
  tarjeta_vendedor_rating: '',
  cupon_codigo: '',
  cupon_texto: '',
  activo: 1,
  orden: 0
}

const PALETA_COLORES = [
  { hex: '#22c55e', nombre: 'Verde Campo' },
  { hex: '#15803d', nombre: 'Verde Selva' },
  { hex: '#ea580c', nombre: 'Naranja Cosecha' },
  { hex: '#d97706', nombre: 'Ámbar Tierra' },
  { hex: '#eab308', nombre: 'Dorado Maíz' },
  { hex: '#0284c7', nombre: 'Azul Caribe' },
  { hex: '#059669', nombre: 'Esmeralda' },
  { hex: '#dc2626', nombre: 'Rojo Fuego' }
]

const FONDOS_PRESET = [
  { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80', label: '🌾 Trigal & Colinas' },
  { url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=80', label: '🥑 Campo Frutal' },
  { url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80', label: '☕ Café de Montaña' },
  { url: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1600&q=80', label: '🐝 Flores Silvestres' },
  { url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1600&q=80', label: '🌱 Tierra Campesina' }
]

const ICONOS_BOTON = [
  { val: 'fa-shopping-basket', label: 'Canasta' },
  { val: 'fa-whatsapp', label: 'WhatsApp' },
  { val: 'fa-store', label: 'Tienda' },
  { val: 'fa-seedling', label: 'Semilla' },
  { val: 'fa-bolt', label: 'Rayo' },
  { val: 'fa-arrow-right', label: 'Flecha' },
  { val: 'fa-tag', label: 'Oferta' },
  { val: 'fa-phone', label: 'Teléfono' },
  { val: 'fa-truck-fast', label: 'Envío' },
  { val: 'fa-boxes', label: 'Cajas' },
  { val: 'fa-heart', label: 'Apoyo' }
]

export default function BannerVisualEditorModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isEditing = false,
  existingBanners = []
}) {
  // Inicializar estado interno de manera aislada (0ms de retraso al escribir)
  const [data, setData] = useState(() => {
    if (!initialData) return { ...BLANK_BANNER }
    const clone = { ...initialData }
    if (!Array.isArray(clone.features)) {
      clone.features = typeof clone.features === 'string'
        ? clone.features.split(',').map((f) => f.trim()).filter(Boolean)
        : []
    }
    if (!Array.isArray(clone.botones) || clone.botones.length === 0) {
      clone.botones = []
      if (clone.boton_principal_texto) {
        clone.botones.push({
          id: 'b1',
          texto: clone.boton_principal_texto,
          link: clone.boton_principal_link || '/catalogo',
          icono: 'fa-shopping-basket',
          estilo: 'primary'
        })
      }
      if (clone.boton_secundario_texto) {
        clone.botones.push({
          id: 'b2',
          texto: clone.boton_secundario_texto,
          link: clone.boton_secundario_link || '/vendedor',
          icono: 'fa-store',
          estilo: 'secondary'
        })
      }
    }
    if (clone.mostrar_tarjeta === undefined) clone.mostrar_tarjeta = true
    if (clone.mostrar_cita === undefined) clone.mostrar_cita = Boolean(clone.cita)
    if (clone.mostrar_productor === undefined) clone.mostrar_productor = Boolean(clone.tarjeta_vendedor_nombre)
    if (clone.mostrar_badge === undefined) clone.mostrar_badge = true
    return clone
  })

  // Vista dispositivo: 'desktop' o 'mobile'
  const [viewDevice, setViewDevice] = useState('desktop')

  // Pestaña o sección activa de edición en la barra lateral
  const [activeSection, setActiveSection] = useState('diseno') // 'diseno', 'textos', 'botones', 'tarjeta', 'fondo'

  // Modal selector de plantillas previas
  const [showPresetsModal, setShowPresetsModal] = useState(false)

  // Archivos seleccionados para subida
  const [files, setFiles] = useState({
    imagen_fondo: null,
    tarjeta_imagen: null,
    categoria_thumb: null
  })

  // Previsualizaciones locales de archivos
  const [filePreviews, setFilePreviews] = useState({
    imagen_fondo: null,
    tarjeta_imagen: null,
    categoria_thumb: null
  })

  // Estado de guardado
  const [saving, setSaving] = useState(false)

  // Input temporal de nueva feature
  const [newFeatureText, setNewFeatureText] = useState('')

  if (!isOpen) return null

  // Actualizar campo específico
  const updateField = (field, val) => {
    setData((prev) => ({ ...prev, [field]: val }))
  }

  // Manejo de subida de archivos
  const handleFileChange = (field, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFiles((prev) => ({ ...prev, [field]: file }))
    const previewUrl = URL.createObjectURL(file)
    setFilePreviews((prev) => ({ ...prev, [field]: previewUrl }))
    updateField(field, previewUrl)
  }

  // Cargar una plantilla con 1 clic
  const handleApplyPreset = (preset) => {
    setData({
      ...preset,
      activo: data.activo !== undefined ? data.activo : 1,
      orden: data.orden || 0
    })
    setShowPresetsModal(false)
  }

  // Limpiar lienzo totalmente a cero
  const handleResetToBlank = () => {
    setData({ ...BLANK_BANNER })
    setFilePreviews({ imagen_fondo: null, tarjeta_imagen: null, categoria_thumb: null })
    setFiles({ imagen_fondo: null, tarjeta_imagen: null, categoria_thumb: null })
  }

  // Manejador de Botones Dinámicos
  const handleAddButton = () => {
    const newBtn = {
      id: `btn_${Date.now()}`,
      texto: 'Nuevo Botón',
      link: '/catalogo',
      icono: 'fa-arrow-right',
      estilo: data.botones.length === 0 ? 'primary' : 'secondary'
    }
    setData((prev) => ({ ...prev, botones: [...prev.botones, newBtn] }))
  }

  const handleUpdateButton = (index, key, val) => {
    setData((prev) => {
      const next = [...prev.botones]
      next[index] = { ...next[index], [key]: val }
      return { ...prev, botones: next }
    })
  }

  const handleRemoveButton = (index) => {
    setData((prev) => ({
      ...prev,
      botones: prev.botones.filter((_, i) => i !== index)
    }))
  }

  const handleMoveButton = (index, dir) => {
    setData((prev) => {
      const target = index + dir
      if (target < 0 || target >= prev.botones.length) return prev
      const next = [...prev.botones]
      const temp = next[index]
      next[index] = next[target]
      next[target] = temp
      return { ...prev, botones: next }
    })
  }

  // Manejador de Características / Chips
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return
    setData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()]
    }))
    setNewFeatureText('')
  }

  const handleRemoveFeature = (index) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // Compilar y guardar
  const handleSubmitSave = async (e) => {
    if (e) e.preventDefault()
    if (!data.titulo || !data.titulo.trim()) {
      alert('Por favor escribe un título para el banner.')
      setActiveSection('textos')
      return
    }

    setSaving(true)
    try {
      // Estructura completa enriquecida
      const payload = {
        ...data,
        titulo: data.titulo.trim(),
        // Para compatibilidad hacia atrás con campos directos de la BD
        boton_principal_texto: data.botones[0]?.texto || 'Ver Catálogo',
        boton_principal_link: data.botones[0]?.link || '/catalogo',
        boton_secundario_texto: data.botones[1]?.texto || '',
        boton_secundario_link: data.botones[1]?.link || '',
        // El campo features almacena el objeto enriquecido
        features: {
          items: data.features,
          botones: data.botones,
          cita: data.cita || '',
          mostrar_cita: Boolean(data.mostrar_cita),
          mostrar_productor: Boolean(data.mostrar_productor),
          mostrar_badge: Boolean(data.mostrar_badge),
          mostrar_tarjeta: Boolean(data.mostrar_tarjeta)
        }
      }

      await onSave(payload, files)
      onClose()
    } catch (err) {
      console.error('Error al guardar banner:', err)
      alert('Hubo un error al guardar el banner. Revisa la consola.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 15, 10, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* 1. BARRA SUPERIOR DE HERRAMIENTAS (Studio Toolbar) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          gap: '1rem',
          flexWrap: 'wrap',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 800
            }}
          >
            🎨
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              {isEditing ? 'Editar Banner Visualmente' : 'Estudio de Diseño de Banners'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
              Crea desde cero o edita cada botón, texto y elemento en tiempo real con 0 lag.
            </p>
          </div>
        </div>

        {/* Acciones de Flujo de Trabajo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Selector de Diseños Previos */}
          <button
            type="button"
            onClick={() => setShowPresetsModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <i className="fa fa-th-large" /> ✨ Diseños Previos
          </button>

          {/* Empezar Desde Cero */}
          <button
            type="button"
            onClick={handleResetToBlank}
            title="Limpia todos los campos para diseñar desde una hoja completamente blanca"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#1e293b',
              color: '#facc15',
              border: '1px solid #334155',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <i className="fa fa-file" /> 📄 Empezar de Cero
          </button>

          {/* Switch de Dispositivo */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#020617',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid #1e293b'
            }}
          >
            <button
              type="button"
              onClick={() => setViewDevice('desktop')}
              style={{
                backgroundColor: viewDevice === 'desktop' ? '#334155' : 'transparent',
                color: viewDevice === 'desktop' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🖥️ Escritorio
            </button>
            <button
              type="button"
              onClick={() => setViewDevice('mobile')}
              style={{
                backgroundColor: viewDevice === 'mobile' ? '#334155' : 'transparent',
                color: viewDevice === 'mobile' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📱 Móvil
            </button>
          </div>

          {/* Guardar Banner */}
          <button
            type="button"
            onClick={handleSubmitSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: saving ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
            }}
          >
            {saving ? (
              <>
                <i className="fa fa-spinner fa-spin" /> Guardando...
              </>
            ) : (
              <>
                <i className="fa fa-check" /> 💾 Guardar Banner
              </>
            )}
          </button>

          {/* Cerrar */}
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: 'none',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cerrar sin guardar"
          >
            ✕
          </button>
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL: DIVISIÓN 2 COLUMNAS (Inspector a la Izquierda, Canvas a la Derecha) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* ==============================================================
            PANEL IZQUIERDO: CAJA DE HERRAMIENTAS Y BLOQUES DINÁMICOS
           ============================================================== */}
        <aside
          style={{
            width: '420px',
            maxWidth: '100%',
            backgroundColor: '#0b1329',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          {/* Navegación rápida por categorías de bloques */}
          <nav
            style={{
              display: 'flex',
              overflowX: 'auto',
              borderBottom: '1px solid #1e293b',
              backgroundColor: '#090d1a',
              padding: '0.35rem 0.5rem',
              gap: '0.3rem'
            }}
          >
            {[
              { id: 'diseno', label: '🎨 Estilo' },
              { id: 'textos', label: '🔤 Textos' },
              { id: 'botones', label: `🔘 Botones (${data.botones.length})` },
              { id: 'tarjeta', label: '🧀 Producto' },
              { id: 'fondo', label: '🖼️ Fondo' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                style={{
                  backgroundColor: activeSection === tab.id ? '#1e293b' : 'transparent',
                  color: activeSection === tab.id ? '#38bdf8' : '#94a3b8',
                  border: 'none',
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Contenido del Inspector con scroll suave e inputs ultra veloces */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* -------------------------------------------------------------
                SECCIÓN: ESTILO & PLANTILLA BASE
               ------------------------------------------------------------- */}
            {activeSection === 'diseno' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Plantilla Visual del Banner
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'clasico', name: 'Clásico Agro', desc: 'Hero con Tarjeta Flotante' },
                      { id: 'inmersivo', name: 'Inmersivo', desc: 'Texto gigante centrado' },
                      { id: 'oferta_flash', name: 'Oferta Flash', desc: 'Con Cupón y Descuento' },
                      { id: 'mosaico', name: 'Mosaico', desc: '3 Pilares Campesinos' },
                      { id: 'historia_campesina', name: 'Historia', desc: 'Origen Campesino & Cita' }
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => updateField('estilo_plantilla', tpl.id)}
                        style={{
                          backgroundColor: data.estilo_plantilla === tpl.id ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                          border: data.estilo_plantilla === tpl.id ? '2px solid #38bdf8' : '1px solid #1e293b',
                          borderRadius: '8px',
                          padding: '0.65rem 0.6rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: '#f8fafc'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: data.estilo_plantilla === tpl.id ? '#38bdf8' : '#ffffff' }}>
                          {tpl.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          {tpl.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color de acento de la marca */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Color de Acento de la Marca
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
                    {PALETA_COLORES.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateField('color_acento', c.hex)}
                        title={c.nombre}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: c.hex,
                          border: data.color_acento === c.hex ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          boxShadow: data.color_acento === c.hex ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={data.color_acento || '#22c55e'}
                      onChange={(e) => updateField('color_acento', e.target.value)}
                      style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Toggles de elementos visibles */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Elementos Visibles en Pantalla
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[
                      { key: 'mostrar_badge', label: '🏷️ Píldora / Insignia Superior' },
                      { key: 'mostrar_cita', label: '💬 Cita / Testimonio de Campesino' },
                      { key: 'mostrar_productor', label: '👤 Sello de Productor Verificado' },
                      { key: 'mostrar_tarjeta', label: '🧀 Tarjeta Flotante de Producto' }
                    ].map((t) => (
                      <label
                        key={t.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#0f172a',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #1e293b',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        <span>{t.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(data[t.key])}
                          onChange={(e) => updateField(t.key, e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#16a34a', cursor: 'pointer' }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SECCIÓN: TEXTOS, CITA Y BENEFICIOS
               ------------------------------------------------------------- */}
            {activeSection === 'textos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Insignia Superior */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Insignia / Categoría Superior
                  </label>
                  <input
                    type="text"
                    value={data.categoria_nombre || ''}
                    onChange={(e) => updateField('categoria_nombre', e.target.value)}
                    placeholder="Ej: 🌾 LÁCTEOS ARTESANALES / 🥑 COSECHA FRESCA"
                    style={{
                      width: '100%',
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Título Principal */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Título Principal <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={data.titulo || ''}
                    onChange={(e) => updateField('titulo', e.target.value)}
                    placeholder="Ej: Queso Costeño y Lácteos Campesinos"
                    style={{
                      width: '100%',
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Cita Campesina */}
                {data.mostrar_cita && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Cita Campesina / Testimonio
                    </label>
                    <textarea
                      rows={2}
                      value={data.cita || ''}
                      onChange={(e) => updateField('cita', e.target.value)}
                      placeholder='Ej: "Queso costeño fresco elaborado artesanalmente con leche 100% pura..."'
                      style={{
                        width: '100%',
                        backgroundColor: '#0f172a',
                        border: '1px solid #d97706',
                        borderRadius: '8px',
                        padding: '0.55rem 0.75rem',
                        color: '#fef08a',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

                {/* Subtítulo / Descripción */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Subtítulo o Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={data.subtitulo || ''}
                    onChange={(e) => updateField('subtitulo', e.target.value)}
                    placeholder="Ej: Directamente desde los Montes de María a tu hogar."
                    style={{
                      width: '100%',
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Productor Verificado */}
                {data.mostrar_productor && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Nombre del Productor / Campesino
                    </label>
                    <input
                      type="text"
                      value={data.tarjeta_vendedor_nombre || ''}
                      onChange={(e) => updateField('tarjeta_vendedor_nombre', e.target.value)}
                      placeholder="Ej: Montes de María • Productor Local"
                      style={{
                        width: '100%',
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                        padding: '0.55rem 0.75rem',
                        color: '#f8fafc',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

                {/* Características / Píldoras de Ventajas */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Ventajas y Características (Chips con Check)
                  </label>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature() } }}
                      placeholder="Ej: Queso Costeño Fresco"
                      style={{
                        flex: 1,
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        padding: '0.45rem 0.65rem',
                        color: '#f8fafc',
                        fontSize: '0.82rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      + Agregar
                    </button>
                  </div>

                  {/* Lista de chips existentes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {data.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#0f172a',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #1e293b',
                          fontSize: '0.78rem'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="fa fa-check-circle" style={{ color: '#4ade80' }} />
                          {feat}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(fIdx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SECCIÓN: BOTONES DE ACCIÓN (100% DINÁMICOS)
               ------------------------------------------------------------- */}
            {activeSection === 'botones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Botones de Acción ({data.botones.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddButton}
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <i className="fa fa-plus" /> Agregar Botón
                  </button>
                </div>

                {data.botones.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '8px', color: '#94a3b8', fontSize: '0.82rem' }}>
                    No hay botones creados. Haz clic en <strong>Agregar Botón</strong> para crear uno.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {data.botones.map((btn, bIdx) => (
                      <div
                        key={btn.id || bIdx}
                        style={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem'
                        }}
                      >
                        {/* Cabecera del Botón */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#38bdf8' }}>
                            Botón #{bIdx + 1}
                          </span>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveButton(bIdx, -1)}
                              disabled={bIdx === 0}
                              style={{ background: '#1e293b', color: '#ffffff', border: 'none', borderRadius: '4px', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveButton(bIdx, 1)}
                              disabled={bIdx === data.botones.length - 1}
                              style={{ background: '#1e293b', color: '#ffffff', border: 'none', borderRadius: '4px', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveButton(bIdx)}
                              style={{ background: '#451a1a', color: '#f87171', border: 'none', borderRadius: '4px', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Texto del Botón */}
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Texto visible</label>
                          <input
                            type="text"
                            value={btn.texto || ''}
                            onChange={(e) => handleUpdateButton(bIdx, 'texto', e.target.value)}
                            placeholder="Ej: Comprar Cosecha"
                            style={{
                              width: '100%',
                              backgroundColor: '#020617',
                              border: '1px solid #1e293b',
                              borderRadius: '6px',
                              padding: '0.45rem 0.6rem',
                              color: '#ffffff',
                              fontSize: '0.8rem',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        {/* Enlace / Link */}
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Enlace / Destino</label>
                          <input
                            type="text"
                            value={btn.link || ''}
                            onChange={(e) => handleUpdateButton(bIdx, 'link', e.target.value)}
                            placeholder="Ej: /catalogo o https://wa.me/57..."
                            style={{
                              width: '100%',
                              backgroundColor: '#020617',
                              border: '1px solid #1e293b',
                              borderRadius: '6px',
                              padding: '0.45rem 0.6rem',
                              color: '#ffffff',
                              fontSize: '0.8rem',
                              boxSizing: 'border-box'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '4px' }}>
                            {['/catalogo', '/vendedor', 'https://wa.me/573000000000'].map((sug) => (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => handleUpdateButton(bIdx, 'link', sug)}
                                style={{
                                  backgroundColor: '#1e293b',
                                  color: '#cbd5e1',
                                  border: 'none',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.65rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {sug.startsWith('https://wa') ? '💬 WhatsApp' : sug}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Estilo y Icono */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Estilo Visual</label>
                            <select
                              value={btn.estilo || 'primary'}
                              onChange={(e) => handleUpdateButton(bIdx, 'estilo', e.target.value)}
                              style={{
                                width: '100%',
                                backgroundColor: '#020617',
                                border: '1px solid #1e293b',
                                borderRadius: '6px',
                                padding: '0.45rem',
                                color: '#ffffff',
                                fontSize: '0.78rem'
                              }}
                            >
                              <option value="primary">🟢 Relleno Principal</option>
                              <option value="secondary">🥛 Cristal Translúcido</option>
                              <option value="whatsapp">💚 WhatsApp Oficial</option>
                              <option value="amber">🟧 Naranja Cosecha</option>
                              <option value="outline">🔲 Contorno Outline</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Icono</label>
                            <select
                              value={btn.icono || 'fa-arrow-right'}
                              onChange={(e) => handleUpdateButton(bIdx, 'icono', e.target.value)}
                              style={{
                                width: '100%',
                                backgroundColor: '#020617',
                                border: '1px solid #1e293b',
                                borderRadius: '6px',
                                padding: '0.45rem',
                                color: '#ffffff',
                                fontSize: '0.78rem'
                              }}
                            >
                              {ICONOS_BOTON.map((ico) => (
                                <option key={ico.val} value={ico.val}>
                                  {ico.label} ({ico.val.replace('fa-', '')})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                SECCIÓN: TARJETA DE PRODUCTO FLOTANTE & CUPÓN
               ------------------------------------------------------------- */}
            {activeSection === 'tarjeta' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Tarjeta de Producto Flotante
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <span>Activa</span>
                    <input
                      type="checkbox"
                      checked={Boolean(data.mostrar_tarjeta)}
                      onChange={(e) => updateField('mostrar_tarjeta', e.target.checked)}
                      style={{ accentColor: '#16a34a' }}
                    />
                  </label>
                </div>

                {data.mostrar_tarjeta && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>Nombre del Producto</label>
                      <input
                        type="text"
                        value={data.tarjeta_titulo || ''}
                        onChange={(e) => updateField('tarjeta_titulo', e.target.value)}
                        placeholder="Ej: Queso Costeño"
                        style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>Precio y Unidad</label>
                        <input
                          type="text"
                          value={data.tarjeta_precio || ''}
                          onChange={(e) => updateField('tarjeta_precio', e.target.value)}
                          placeholder="Ej: $25.000 COP / kg"
                          style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.5rem', color: '#facc15', fontWeight: 700, fontSize: '0.82rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>Sello Superior</label>
                        <input
                          type="text"
                          value={data.tarjeta_badge_top || ''}
                          onChange={(e) => updateField('tarjeta_badge_top', e.target.value)}
                          placeholder="Ej: 🧀 100% Artesanal"
                          style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    {/* Imagen de Producto */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>Imagen del Producto</label>
                      <input
                        type="text"
                        value={data.tarjeta_imagen || ''}
                        onChange={(e) => updateField('tarjeta_imagen', e.target.value)}
                        placeholder="URL de imagen o sube un archivo abajo"
                        style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: '4px' }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('tarjeta_imagen', e)}
                        style={{ fontSize: '0.75rem', color: '#94a3b8' }}
                      />
                    </div>
                  </div>
                )}

                {/* Cupón Promocional Opcional */}
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid #1e293b', paddingTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    🎟️ Cupón de Descuento (Opcional)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Código</label>
                      <input
                        type="text"
                        value={data.cupon_codigo || ''}
                        onChange={(e) => updateField('cupon_codigo', e.target.value.toUpperCase())}
                        placeholder="Ej: QUESO15"
                        style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.45rem', color: '#facc15', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Texto Promocional</label>
                      <input
                        type="text"
                        value={data.cupon_texto || ''}
                        onChange={(e) => updateField('cupon_texto', e.target.value)}
                        placeholder="Ej: 15% de descuento"
                        style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SECCIÓN: FONDO, IMAGEN Y EFECTOS
               ------------------------------------------------------------- */}
            {activeSection === 'fondo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Imagen de Fondo del Banner
                  </label>
                  <input
                    type="text"
                    value={data.imagen_fondo || ''}
                    onChange={(e) => updateField('imagen_fondo', e.target.value)}
                    placeholder="URL de imagen de fondo"
                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: '6px' }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('imagen_fondo', e)}
                    style={{ fontSize: '0.75rem', color: '#94a3b8' }}
                  />
                </div>

                {/* Galería rápida de fondos campestres */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Fondos Campestres Recomendados</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                    {FONDOS_PRESET.map((f, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateField('imagen_fondo', f.url)}
                        style={{
                          backgroundColor: data.imagen_fondo === f.url ? '#16a34a' : '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: '6px',
                          padding: '0.35rem 0.5rem',
                          color: '#ffffff',
                          fontSize: '0.72rem',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desenfoque (Blur) en tiempo real */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Desenfoque de Fondo (Blur)
                    </label>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                      {data.filtro_blur || 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={data.filtro_blur || 0}
                    onChange={(e) => updateField('filtro_blur', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                </div>

                {/* Orden de diapositiva y activo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #1e293b' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Orden en Carrusel</label>
                    <input
                      type="number"
                      value={data.orden || 0}
                      onChange={(e) => updateField('orden', Number(e.target.value))}
                      style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Estado</label>
                    <select
                      value={data.activo !== undefined ? data.activo : 1}
                      onChange={(e) => updateField('activo', Number(e.target.value))}
                      style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem' }}
                    >
                      <option value={1}>Activo (Visible)</option>
                      <option value={0}>Inactivo (Borrador)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* ==============================================================
            PANEL DERECHO: CANVAS INTERACTIVO EN VIVO (Live Visual Stage)
           ============================================================== */}
        <main
          style={{
            flex: 1,
            backgroundColor: '#020617',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '1.5rem',
            position: 'relative'
          }}
        >
          {/* Marco del Canvas (Desktop o Móvil) */}
          <div
            style={{
              width: '100%',
              maxWidth: viewDevice === 'mobile' ? '410px' : '1080px',
              transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
              backgroundColor: '#07160c'
            }}
          >
            {/* Barra simulada del navegador */}
            <div
              style={{
                backgroundColor: '#0f172a',
                padding: '0.45rem 0.85rem',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#94a3b8'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span style={{ marginLeft: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                  delosmontesdemaria.dev {viewDevice === 'mobile' ? '(Vista Móvil)' : '(Vista Escritorio)'}
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 700 }}>
                ⚡ Vista Previa Interactiva en Vivo
              </div>
            </div>

            {/* Renderizador Oficial del Hero Slide */}
            <HeroSlideRenderer
              slide={{
                ...data,
                // Mapear compatibilidad de variables
                accentColor: data.color_acento,
                backgroundImage: data.imagen_fondo,
                categoryName: data.categoria_nombre,
                showcaseTitle: data.tarjeta_titulo,
                showcasePrice: data.tarjeta_precio,
                showcaseImage: data.tarjeta_imagen,
                floatPillTop: data.tarjeta_badge_top,
                farmerName: data.tarjeta_vendedor_nombre,
                floatPillBottom: data.tarjeta_vendedor_rating
              }}
              isPreview={true}
            />
          </div>

          <p style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            Los botones, desenfoques y textos se actualizan instantáneamente sin recargar la página.
          </p>
        </main>
      </div>

      {/* ==============================================================
          MODAL FLOTANTE DE DISEÑOS PREVIOS / PLANTILLAS
         ============================================================== */}
      {showPresetsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #1e293b'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  ✨ Galería de Diseños Previos & Plantillas
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                  Elige cualquiera como punto de partida. Luego podrás editar o borrar cualquier botón o texto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetsModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {PRESET_HERO_DESIGNS.map((p) => (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  <div style={{ height: '90px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={p.imagen_fondo}
                      alt={p.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to top, #1e293b 0%, rgba(30, 41, 59, 0.4) 100%)`
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: p.color_acento,
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {p.estilo_plantilla.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                        {p.nombre}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.35 }}>
                        {p.subtitulo_desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      style={{
                        marginTop: '0.85rem',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Cargar Este Diseño
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
