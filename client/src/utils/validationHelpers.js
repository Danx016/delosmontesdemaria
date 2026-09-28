/**
 * Utilidades de validación flexible - Ley de Postel
 * "Sé conservador en lo que envías, sé liberal en lo que aceptas"
 */

/**
 * Normaliza y valida números de teléfono colombianos
 * Acepta múltiples formatos: +57 300 123 4567, 3001234567, (300) 123-4567
 */
export const normalizePhone = (phone) => {
  if (!phone) return ''

  // Eliminar todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '')

  // Si empieza con 57 (código país), mantenerlo
  // Si no, agregar 57 automáticamente
  if (cleaned.length === 10 && !cleaned.startsWith('57')) {
    return `57${cleaned}`
  }

  // Si ya tiene 57 y 10 dígitos, devolver como está
  if (cleaned.length === 12 && cleaned.startsWith('57')) {
    return cleaned
  }

  return cleaned
}

/**
 * Valida si un número de teléfono colombiano es válido
 */
export const isValidPhone = (phone) => {
  const normalized = normalizePhone(phone)
  // Debe tener 12 dígitos (57 + 10 dígitos del número)
  return /^\d{12}$/.test(normalized)
}

/**
 * Normaliza correos electrónicos
 * Acepta mayúsculas/minúsculas, espacios extras
 */
export const normalizeEmail = (email) => {
  if (!email) return ''
  return email.trim().toLowerCase()
}

/**
 * Valida correos electrónicos de forma flexible
 */
export const isValidEmail = (email) => {
  const normalized = normalizeEmail(email)
  // Validación básica pero flexible
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(normalized)
}

/**
 * Normaliza nombres y apellidos
 * Elimina espacios extras, capitaliza apropiadamente
 */
export const normalizeName = (name) => {
  if (!name) return ''
  return name
    .trim()
    .replace(/\s+/g, ' ') // Eliminar espacios múltiples
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalizar primera letra
}

/**
 * Normaliza direcciones
 * Elimina espacios extras, normaliza formato
 */
export const normalizeAddress = (address) => {
  if (!address) return ''
  return address
    .trim()
    .replace(/\s+/g, ' ') // Eliminar espacios múltiples
    .replace(/,\s*/g, ', ') // Normalizar comas
}

/**
 * Valida contraseña de forma flexible
 * Mínimo 6 caracteres (flexible para usuarios no técnicos)
 */
export const isValidPassword = (password) => {
  if (!password) return false
  return password.length >= 6
}

/**
 * Genera mensaje de error constructivo para validación
 */
export const getValidationMessage = (field, value) => {
  const messages = {
    email: () => {
      if (!value) return 'Por favor ingresa tu correo electrónico'
      if (!isValidEmail(value)) return 'El formato del correo no es válido. Ejemplo: usuario@correo.com'
      return ''
    },
    phone: () => {
      if (!value) return 'Por favor ingresa tu número de teléfono'
      if (!isValidPhone(value)) return 'El número de teléfono debe tener 10 dígitos (ej: 300 123 4567)'
      return ''
    },
    password: () => {
      if (!value) return 'Por favor ingresa tu contraseña'
      if (!isValidPassword(value)) return 'La contraseña debe tener al menos 6 caracteres'
      return ''
    },
    name: () => {
      if (!value) return 'Por favor ingresa tu nombre completo'
      if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
      return ''
    },
    required: (fieldName) => {
      if (!value) return `Por favor completa el campo ${fieldName}`
      return ''
    }
  }

  const validator = messages[field]
  if (typeof validator === 'function') {
    return validator()
  }
  return ''
}

/**
 * Autocompletado inteligente para formularios
 */
export const getAutocompleteAttributes = (fieldType) => {
  const autocompleteMap = {
    email: 'email',
    password: 'current-password',
    newPassword: 'new-password',
    name: 'name',
    firstName: 'given-name',
    lastName: 'family-name',
    phone: 'tel',
    address: 'street-address',
    city: 'address-level2',
    state: 'address-level1',
    zip: 'postal-code',
    country: 'country-name'
  }

  return autocompleteMap[fieldType] || 'off'
}

/**
 * Formatea moneda colombiana de forma consistente
 */
export const formatCOP = (amount) => {
  return Number(amount || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  })
}

/**
 * Parsea entrada de moneda flexible
 * Acepta: $1.000, 1000, 1,000, 1.000
 */
export const parseCurrencyInput = (value) => {
  if (!value) return 0
  // Eliminar símbolos de moneda y puntos, reemplazar comas por puntos
  const cleaned = value.toString()
    .replace(/[$\s]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
  return parseFloat(cleaned) || 0
}
