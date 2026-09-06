/**
 * Utilidades para normalización y coincidencia flexible de categorías
 * Resuelve discrepancias entre slugs, nombres completos y acentos en la base de datos y la interfaz.
 */

export function normalizeCategoryText(str) {
  if (!str) return ''
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos (á -> a, etc.)
    .replace(/[^a-z0-9]/g, '') // Solo caracteres alfanuméricos
}

/**
 * Normaliza un slug a formato URL estándar
 */
export function slugify(str) {
  if (!str) return ''
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Encuentra una categoría en la lista por slug, nombre o ID
 */
export function findCategoryInfo(targetSlugOrName, categories = []) {
  if (!targetSlugOrName || targetSlugOrName === 'all') {
    return {
      slug: 'all',
      label: 'Todas las Categorías',
      nombre_categoria: 'Todas las Categorías',
      icono: 'fa-layer-group',
      icon: 'fa-layer-group',
      color: '#2e7d32',
      descripcion: 'Explora todos los productos frescos y agrícolas de los Montes de María.'
    }
  }

  const normTarget = normalizeCategoryText(targetSlugOrName)

  // 1. Coincidencia exacta de slug o ID
  let found = categories.find((c) => {
    if (!c) return false
    if (String(c.id_categoria) === String(targetSlugOrName) || String(c.id) === String(targetSlugOrName)) return true
    if (c.slug && c.slug.toLowerCase() === targetSlugOrName.toLowerCase()) return true
    return false
  })

  // 2. Coincidencia normalizada
  if (!found) {
    found = categories.find((c) => {
      if (!c) return false
      const cNormSlug = normalizeCategoryText(c.slug)
      const cNormName = normalizeCategoryText(c.nombre_categoria || c.label)
      return cNormSlug === normTarget || cNormName === normTarget
    })
  }

  // 3. Coincidencia parcial (subcadena)
  if (!found && normTarget.length >= 3) {
    found = categories.find((c) => {
      if (!c) return false
      const cNormSlug = normalizeCategoryText(c.slug)
      const cNormName = normalizeCategoryText(c.nombre_categoria || c.label)
      return (
        (cNormSlug && (cNormSlug.includes(normTarget) || normTarget.includes(cNormSlug))) ||
        (cNormName && (cNormName.includes(normTarget) || normTarget.includes(cNormName)))
      )
    })
  }

  if (found) {
    const label = found.nombre_categoria || found.label || found.slug
    return {
      ...found,
      id: found.id_categoria || found.id,
      slug: found.slug || slugify(label),
      label,
      nombre_categoria: label,
      icono: found.icono || found.icon || 'fa-box',
      icon: found.icono || found.icon || 'fa-box',
      color: found.color || '#2e7d32',
      descripcion: found.descripcion || 'Explora los productos de esta categoría.'
    }
  }

  // Fallback con formato presentable si no existe en la lista
  const cleanTitle = String(targetSlugOrName)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

  return {
    slug: slugify(targetSlugOrName),
    label: cleanTitle,
    nombre_categoria: cleanTitle,
    icono: 'fa-box',
    icon: 'fa-box',
    color: '#2e7d32',
    descripcion: 'Explora los productos disponibles en esta sección.'
  }
}

/**
 * Verifica si un producto pertenece a una categoría dada
 */
export function matchProductCategory(product, targetCatSlugOrName, categories = []) {
  if (!targetCatSlugOrName || targetCatSlugOrName === 'all') return true
  if (!product) return false

  const normTarget = normalizeCategoryText(targetCatSlugOrName)
  const catObj = findCategoryInfo(targetCatSlugOrName, categories)

  const targets = new Set()
  targets.add(normTarget)
  if (catObj.slug) targets.add(normalizeCategoryText(catObj.slug))
  if (catObj.nombre_categoria) targets.add(normalizeCategoryText(catObj.nombre_categoria))
  if (catObj.label) targets.add(normalizeCategoryText(catObj.label))

  // Identificadores del producto
  const pIdCat = product.id_categoria ? String(product.id_categoria) : null
  if (pIdCat && (pIdCat === String(targetCatSlugOrName) || (catObj.id_categoria && pIdCat === String(catObj.id_categoria)))) {
    return true
  }

  const pValues = [
    product.categoria,
    product.nombre_categoria,
    product.categoria_nombre,
    product.categoria_slug
  ].filter(Boolean).map(normalizeCategoryText)

  // Comparación cruzada de coincidencias exactas o de subcadenas
  for (const pVal of pValues) {
    if (!pVal) continue
    for (const tVal of targets) {
      if (!tVal) continue
      if (pVal === tVal) return true
      if (pVal.length >= 3 && tVal.length >= 3) {
        if (pVal.includes(tVal) || tVal.includes(pVal)) return true
      }
    }
  }

  return false
}

/**
 * Cuenta productos por cada categoría de la lista de forma robusta
 */
export function countProductsByCategory(products = [], categories = []) {
  const counts = { all: products.length }

  for (const cat of categories) {
    const key = cat.slug || slugify(cat.nombre_categoria || cat.label)
    const matchedCount = products.filter((p) => matchProductCategory(p, key, categories)).length
    counts[key] = matchedCount
    if (cat.id_categoria) {
      counts[cat.id_categoria] = matchedCount
    }
  }

  return counts
}

/**
 * Formatea el nombre visual de la categoría a partir de un valor crudo
 */
export function getCategoryDisplayLabel(rawCat, categories = []) {
  if (!rawCat) return 'General'
  const info = findCategoryInfo(rawCat, categories)
  return info.label || rawCat
}
