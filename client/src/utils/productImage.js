/**
 * Utilidad para resolver y normalizar URLs de imágenes de productos
 * Soporta imágenes individuales o múltiples imágenes (JSON array, lista separada por comas)
 * Previene duplicación de rutas y proporciona fallbacks consistentes.
 */

function normalizeSingleUrl(raw, fallback = '/img/Logo.jpg') {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  // Si ya es una URL externa (http/https), data URI, o blob URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Si ya empieza con /uploads/ o /img/
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/img/')) {
    return trimmed;
  }

  // Si empieza con uploads/ o img/ sin slash inicial
  if (trimmed.startsWith('uploads/') || trimmed.startsWith('img/')) {
    return `/${trimmed}`;
  }

  // Si empieza con products/ o categories/ o profiles/
  if (
    trimmed.startsWith('products/') ||
    trimmed.startsWith('categories/') ||
    trimmed.startsWith('profiles/') ||
    trimmed.startsWith('banners/')
  ) {
    return `/uploads/${trimmed}`;
  }

  // Si empieza con / pero no con /uploads
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Si es solo un nombre de archivo (ej. 1740089123-yuca.jpg o name.png)
  return `/uploads/products/${trimmed}`;
}

/**
 * Retorna un array con todas las imágenes disponibles para el producto
 */
export function getProductImages(imgOrProduct, fallback = '/img/Logo.jpg') {
  if (!imgOrProduct) return [fallback];

  const raw =
    typeof imgOrProduct === 'object'
      ? (imgOrProduct.imagen ||
         imgOrProduct.imagen_producto ||
         imgOrProduct.foto ||
         imgOrProduct.image ||
         imgOrProduct.tarjeta_imagen)
      : imgOrProduct;

  if (!raw) return [fallback];

  let list = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [fallback];

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        } else {
          list = [trimmed];
        }
      } catch (e) {
        list = [trimmed];
      }
    } else if (trimmed.includes(',')) {
      list = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      list = [trimmed];
    }
  } else {
    return [fallback];
  }

  const normalized = list
    .map((item) => normalizeSingleUrl(item, fallback))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : [fallback];
}

/**
 * Retorna la URL de la imagen principal (primera foto del producto)
 */
export function getProductImageUrl(imgOrProduct, fallback = '/img/Logo.jpg') {
  const images = getProductImages(imgOrProduct, fallback);
  return images[0] || fallback;
}

export function handleProductImageError(e, fallback = '/img/Logo.jpg') {
  if (e?.target && e.target.src !== fallback && !e.target.src.endsWith(fallback)) {
    e.target.src = fallback;
  }
}
