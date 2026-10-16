import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl, handleAvatarError } from '../utils/avatar'

// Pre-carga inmediata de páginas clave para navegación móvil instantánea sin congelamiento
const preloadCatalogo = () => import('../pages/CategoriasPage')
const preloadCarrito = () => import('../pages/CartPage')
const preloadSoporte = () => import('../pages/SoportePage')
const preloadPerfil = () => {
  import('../pages/ProfilePage')
  import('../pages/LoginPage')
}

export default function BottomMobileNav() {
  const location = useLocation()
  const { count } = useCart()
  const { isAuthenticated, user } = useAuth()

  // Pre-cargar en segundo plano cuando el navegador móvil esté libre (idle)
  useEffect(() => {
    const idlePreload = () => {
      preloadCatalogo()
      preloadCarrito()
      preloadSoporte()
      preloadPerfil()
    }

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(idlePreload, { timeout: 1500 })
        return () => window.cancelIdleCallback && window.cancelIdleCallback(id)
      } else {
        const timer = setTimeout(idlePreload, 800)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  // Ocultar en el panel admin y soporte de agentes
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bottom-mobile-nav" aria-label="Navegación Móvil Inferior" role="navigation">
      <div className="bottom-mobile-nav-inner">
        {/* 1. Inicio */}
        <Link
          to="/"
          className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
          aria-label="Ir al Inicio"
        >
          <div className="bottom-nav-icon-wrap">
            <i className="fa fa-home" />
          </div>
          <span className="bottom-nav-label">Inicio</span>
        </Link>

        {/* 2. Catálogo / Categorías */}
        <Link
          to="/catalogo"
          className={`bottom-nav-item ${isActive('/catalogo') || isActive('/categorias') || isActive('/categoria') ? 'active' : ''}`}
          aria-label="Explorar Catálogo"
          onMouseEnter={preloadCatalogo}
          onTouchStart={preloadCatalogo}
          onPointerDown={preloadCatalogo}
        >
          <div className="bottom-nav-icon-wrap">
            <i className="fa fa-th-large" />
          </div>
          <span className="bottom-nav-label">Catálogo</span>
        </Link>

        {/* 3. Carrito con Badge */}
        <Link
          to="/carrito"
          className={`bottom-nav-item ${isActive('/carrito') ? 'active' : ''}`}
          aria-label="Ver Carrito de Compras"
          onMouseEnter={preloadCarrito}
          onTouchStart={preloadCarrito}
          onPointerDown={preloadCarrito}
        >
          <div className="bottom-nav-icon-wrap">
            <i className="fa fa-shopping-cart" />
            {count > 0 && (
              <span className="bottom-nav-badge">{count > 99 ? '99+' : count}</span>
            )}
          </div>
          <span className="bottom-nav-label">Carrito</span>
        </Link>

        {/* 4. Soporte en Vivo */}
        <Link
          to="/soporte"
          className={`bottom-nav-item ${isActive('/soporte') ? 'active' : ''}`}
          aria-label="Centro de Soporte"
          onMouseEnter={preloadSoporte}
          onTouchStart={preloadSoporte}
          onPointerDown={preloadSoporte}
        >
          <div className="bottom-nav-icon-wrap">
            <i className="fa fa-headset" />
          </div>
          <span className="bottom-nav-label">Soporte</span>
        </Link>

        {/* 5. Perfil / Login */}
        <Link
          to={isAuthenticated ? '/perfil' : '/login'}
          className={`bottom-nav-item ${isActive('/perfil') || isActive('/login') || isActive('/registro') ? 'active' : ''}`}
          aria-label={isAuthenticated ? 'Mi Cuenta' : 'Iniciar Sesión'}
          onMouseEnter={preloadPerfil}
          onTouchStart={preloadPerfil}
          onPointerDown={preloadPerfil}
        >
          <div className="bottom-nav-icon-wrap">
            {isAuthenticated ? (
              <img
                src={getAvatarUrl(user)}
                alt={user?.nombre || 'Usuario'}
                className="bottom-nav-avatar"
                onError={(e) => handleAvatarError(e, user?.nombre || user?.username)}
              />
            ) : (
              <i className="fa fa-user-circle" />
            )}
          </div>
          <span className="bottom-nav-label">
            {isAuthenticated ? (user?.nombre?.split(' ')[0] || 'Perfil') : 'Ingresar'}
          </span>
        </Link>
      </div>
    </nav>
  )
}
