/**
 * Utilidad de Google Analytics 4 (GA4) para Comercio Electrónico
 * De los Montes de María
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-Y9MYJHPF9X'

let isInitialized = false

/**
 * Inicializa Google Analytics inyectando gtag.js dinámicamente
 */
export function initGA() {
  if (typeof window === 'undefined') return
  if (isInitialized) return
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    // Si no está configurado un ID real, modo silencioso sin errores
    return
  }

  // Prevenir duplicados
  if (document.getElementById('google-analytics-script')) return

  const script = document.createElement('script')
  script.id = 'google-analytics-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // Manejado manualmente por React Router
    cookie_flags: 'SameSite=None;Secure',
  })

  isInitialized = true
}

/**
 * Registra una vista de página en GA4
 */
export function trackPageView(path, title) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path || window.location.pathname,
    page_title: title || document.title,
    page_location: window.location.href,
  })
}

/**
 * Evento personalizado genérico
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', eventName, params)
}

/**
 * Evento E-Commerce: Ver detalle de producto
 */
export function trackProductView(producto) {
  if (!producto || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'view_item', {
    currency: 'COP',
    value: Number(producto.precio || 0),
    items: [
      {
        item_id: String(producto.id_producto || producto.id),
        item_name: producto.nombre || producto.nombre_producto,
        item_category: producto.categoria || 'Agropecuario',
        price: Number(producto.precio || 0),
        item_brand: producto.vendedor_nombre || 'Montes de María',
      },
    ],
  })
}

/**
 * Evento E-Commerce: Agregar al carrito
 */
export function trackAddToCart(producto, cantidad = 1) {
  if (!producto || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'add_to_cart', {
    currency: 'COP',
    value: Number(producto.precio || 0) * cantidad,
    items: [
      {
        item_id: String(producto.id_producto || producto.id),
        item_name: producto.nombre || producto.nombre_producto,
        item_category: producto.categoria || 'Agropecuario',
        price: Number(producto.precio || 0),
        quantity: cantidad,
        item_brand: producto.vendedor_nombre || 'Montes de María',
      },
    ],
  })
}
