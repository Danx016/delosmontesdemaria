import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Ruta solo para administradores (rol 1)
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}
