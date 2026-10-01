import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

function getCartStorageKey(user) {
  const userId = user?.id_usuario || user?.id
  return userId ? `cart_user_${userId}` : 'cart_guest'
}

function parseCartItems(raw) {
  try {
    if (!Array.isArray(raw)) return []
    return raw
      .filter((i) => i && (i.id_producto || i.id))
      .map((i) => {
        const prodId = Number(i.id_producto || i.id) || 1
        const precio = parseFloat(i.precio) || 0
        const cantidad = parseInt(i.cantidad, 10) > 0 ? parseInt(i.cantidad, 10) : 1
        return {
          ...i,
          id_producto: prodId,
          id: prodId,
          nombre: i.nombre || i.nombre_producto || 'Producto Campesino',
          nombre_producto: i.nombre || i.nombre_producto || 'Producto Campesino',
          precio,
          cantidad,
        }
      })
  } catch {
    return []
  }
}

function loadCart(storageKey) {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey))
    if (raw && Array.isArray(raw)) {
      return parseCartItems(raw)
    }
    // Si no hay bajo la clave de usuario pero hay legacy 'cart', migrarlo solo si es guest
    if (storageKey === 'cart_guest') {
      const legacyRaw = JSON.parse(localStorage.getItem('cart'))
      if (legacyRaw && Array.isArray(legacyRaw)) {
        return parseCartItems(legacyRaw)
      }
    }
    return []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const storageKey = getCartStorageKey(user)
  const isInitialMount = useRef(true)

  const [items, setItems] = useState(() => loadCart(storageKey))

  // Sincronizar y recargar el carrito cuando el usuario cambia (login, logout, cambio de cuenta)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const userCart = loadCart(storageKey)
    setItems(userCart)
  }, [storageKey])

  // Persistir en localStorage bajo la clave del usuario activo
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch (e) {
      console.warn('Error al guardar carrito en localStorage:', e)
    }
  }, [items, storageKey])

  const addItem = useCallback((producto, cantidad = 1) => {
    if (!producto) return
    const prodId = Number(producto.id_producto || producto.id)
    const cleanProd = {
      ...producto,
      id_producto: prodId,
      id: prodId,
      nombre: producto.nombre || producto.nombre_producto || 'Producto Campesino',
      nombre_producto: producto.nombre || producto.nombre_producto || 'Producto Campesino',
      precio: parseFloat(producto.precio) || 0,
      imagen: producto.imagen || '',
      categoria: producto.categoria || 'cosechas',
      stock: producto.stock !== undefined ? parseInt(producto.stock, 10) : 25,
    }

    setItems((prev) => {
      const existing = prev.find((i) => Number(i.id_producto || i.id) === prodId)
      if (existing) {
        return prev.map((i) =>
          Number(i.id_producto || i.id) === prodId
            ? { ...i, ...cleanProd, cantidad: (i.cantidad || 1) + cantidad }
            : i
        )
      }
      return [...prev, { ...cleanProd, cantidad }]
    })
  }, [])

  const removeItem = useCallback((id_producto) => {
    const targetId = Number(id_producto)
    setItems((prev) => prev.filter((i) => Number(i.id_producto || i.id) !== targetId))
  }, [])

  const updateQty = useCallback((id_producto, cantidad) => {
    const targetId = Number(id_producto)
    if (cantidad <= 0) return removeItem(targetId)
    setItems((prev) =>
      prev.map((i) =>
        Number(i.id_producto || i.id) === targetId ? { ...i, cantidad } : i
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const count = items.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, addToCart: addItem, removeItem, updateQty, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
