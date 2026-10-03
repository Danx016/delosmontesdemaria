import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe } from '../api/usuario.api'
import { logout as logoutApi } from '../api/auth.api'

const AuthContext = createContext(null)

function normalizeUserData(raw) {
  if (!raw) return null
  const userId = raw.id || raw.id_usuario || raw.idUser
  const rolId = raw.id_rol ?? raw.rol ?? raw.rolUser ?? 3
  return {
    ...raw,
    id: userId,
    id_usuario: userId,
    idUser: userId,
    nombre: raw.nombre || raw.nombreUser || raw.name || '',
    nombreUser: raw.nombreUser || raw.nombre || raw.name || '',
    correo: raw.correo || raw.emailUser || raw.email || '',
    emailUser: raw.emailUser || raw.correo || raw.email || '',
    username: raw.username || raw.apodo || '',
    apodo: raw.apodo || raw.username || '',
    id_rol: Number(rolId),
    rol: Number(rolId),
    rolUser: Number(rolId)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? normalizeUserData(JSON.parse(saved)) : null
    } catch (_) {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Cargar y sincronizar usuario desde el token almacenado al iniciar la app
  useEffect(() => {
    const token = localStorage.getItem('jwt')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then((res) => {
        const userData = normalizeUserData(res.data?.usuario || res.data)
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      })
      .catch((err) => {
        // Solo desloguear si el servidor explícitamente respondió 401 No Autorizado o 403 Prohibido
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('jwt')
          localStorage.removeItem('user')
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((token, rawUserData) => {
    const userData = normalizeUserData(rawUserData)
    localStorage.setItem('jwt', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    // Actualizar perfil completo en segundo plano
    getMe()
      .then((res) => {
        const fullUser = normalizeUserData(res.data?.usuario || res.data)
        if (fullUser) {
          localStorage.setItem('user', JSON.stringify(fullUser))
          setUser(fullUser)
        }
      })
      .catch(() => {})
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi().catch(() => {})
    } catch (_) {}

    // Eliminar credenciales
    localStorage.removeItem('jwt')
    localStorage.removeItem('user')

    // Eliminar todo rastro de carritos, soporte o formularios de cualquier usuario
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (
        k.startsWith('cart_') ||
        k.startsWith('agro_active_ticket') ||
        k.startsWith('form_draft_') ||
        k.startsWith('checkout_')
      )) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
    localStorage.removeItem('cart')
    localStorage.removeItem('cart_guest')
    localStorage.removeItem('agro_active_ticket')
    localStorage.removeItem('agro_active_ticket_guest')

    setUser(null)
    // Redirección completa para reiniciar cualquier estado en memoria de React
    window.location.href = '/login'
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('jwt')
    if (!token) {
      setUser(null)
      return
    }
    try {
      const res = await getMe()
      const userData = res.data?.usuario || res.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('jwt')
        localStorage.removeItem('user')
        setUser(null)
      }
    }
  }, [])

  const isAdmin = user?.id_rol === 1 || user?.rol === 1
  const isVendedor = user?.id_rol === 2 || user?.rol === 2
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser, isAdmin, isVendedor, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
