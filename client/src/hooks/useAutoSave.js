import { useEffect, useRef } from 'react'

/**
 * Hook para autoguardado de formularios - Prevención de pérdida de datos
 * Guarda automáticamente el estado del formulario en localStorage
 */
export const useAutoSave = (key, data, debounceMs = 1000) => {
  const saveTimeoutRef = useRef(null)

  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Programar nuevo guardado con debounce
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch (error) {
        console.warn('Error al guardar en localStorage:', error)
      }
    }, debounceMs)

    // Limpiar timeout al desmontar
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [key, data, debounceMs])
}

/**
 * Hook para recuperar datos guardados de localStorage
 */
export const useLoadSavedData = (key) => {
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Error al cargar de localStorage:', error)
    }
    return null
  }, [key])
}

/**
 * Función para limpiar datos guardados
 */
export const clearSavedData = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Error al limpiar localStorage:', error)
  }
}
