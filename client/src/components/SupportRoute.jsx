import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Ruta para administradores (rol 1) y soporte (rol 4)
 */
export default function SupportRoute({ children }) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />

  // Permitir acceso a admin (rol 1) y soporte (rol 4)
  const isSupport = user?.id_rol === 4 || user?.rol === 4
  if (!isAdmin && !isSupport) return <Navigate to="/" replace />

  return children
}