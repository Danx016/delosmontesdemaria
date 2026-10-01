import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { buscarProductos, listarCategoriasPublicas } from '../api/productos.api'
import MediaRenderer from './MediaRenderer'
import PromoCouponBanner from './PromoCouponBanner'
import { getAvatarUrl, handleAvatarError } from '../utils/avatar'
import { getProductImageUrl, handleProductImageError } from '../utils/productImage'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isVendedor, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  // Verificar si es soporte (rol 4)
  const isSupport = user?.id_rol === 4 || user?.rol === 4

  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [categoriasNav, setCategoriasNav] = useState([])

  // Cargar categorías reales de la base de datos
  useEffect(() => {
    listarCategoriasPublicas()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategoriasNav(res.data)
        }
      })
      .catch((err) => console.error('Error al cargar categorías en Navbar:', err))
  }, [])

  // Dark/Light theme toggle
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Live search debounced
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await buscarProductos(query.trim())
        setSearchResults(res.data?.productos || res.data || [])
        setShowDropdown(true)
      } catch (err) {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setShowDropdown(false)
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const isActive = (path) => location.pathname === path

  const handleScrollRibbon = (offset) => {
    const el = document.getElementById('navbar-categories-ribbon')
    if (el) {
      el.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <header className="main-site-header">
      {/* Barra / Carrusel Promocional de Cupones */}
      <PromoCouponBanner />

      {/* Top Main Navigation Bar */}
      <div className="header-container app-container">
        {/* Brand Logo */}
        <div className="header-brand-wrap">
          <Link to="/" className="header-brand-link">
            <img
              src="/img/Logo.jpg"
              alt="Logo De los Montes de María"
              className="header-brand-img"
              onError={(e) => { e.target.src = '/img/Logo.jpg' }}
            />
            <div className="header-brand-text">
              <span className="brand-name">De los Montes de María</span>
              <span className="brand-tagline">Mercado Campesino Directo</span>
            </div>
          </Link>
        </div>

        {/* Center Search Bar */}
        <div className="header-search-wrapper">
          <form onSubmit={handleSearchSubmit} className="header-search-form">
            <input
              type="text"
              placeholder="Buscar productos, frutas, insumos del campo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              className="header-search-input"
            />
            {query && (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => { setQuery(''); setShowDropdown(false); }}
                title="Limpiar búsqueda"
              >
                <i className="fa fa-times" />
              </button>
            )}
            <button type="submit" className="header-search-submit" title="Buscar">
              <i className="fa fa-search" />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="header-search-dropdown fade-in">
              {isSearching ? (
                <div className="search-dropdown-loading">
                  <i className="fa fa-spinner fa-spin" /> Buscando productos...
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="search-dropdown-list">
                  {searchResults.slice(0, 5).map((prod) => (
                    <li key={prod.id_producto}>
                      <Link
                        to={`/producto/${prod.id_producto || prod.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="search-dropdown-item"
                      >
                        <img
                          src={getProductImageUrl(prod)}
                          alt={prod.nombre}
                          className="search-dropdown-thumb"
                          onError={handleProductImageError}
                        />
                        <div className="search-dropdown-meta">
                          <span className="search-dropdown-title">{prod.nombre}</span>
                          <span className="search-dropdown-price">${Number(prod.precio || 0).toLocaleString('es-CO')}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li className="search-dropdown-footer">
                    <Link
                      to={`/buscar?q=${encodeURIComponent(query)}`}
                      onClick={() => setShowDropdown(false)}
                    >
                      Ver todos los resultados <i className="fa fa-arrow-right" />
                    </Link>
                  </li>
                </ul>
              ) : (
                <div className="search-dropdown-empty">
                  No se encontraron productos para "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <nav className={`header-nav-menu ${mobileMenuOpen ? 'mobile-active' : ''}`} id="header-nav-menu" aria-label="Navegación principal">
          <ul className="header-nav-list" role="menubar">
            <li role="none">
              <Link to="/" className={`nav-link-item ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} role="menuitem" tabIndex="0">
                <i className="fa fa-home" /> <span>Inicio</span>
              </Link>
            </li>

            <li role="none">
              <Link to="/categorias" className={`nav-link-item ${isActive('/categorias') || isActive('/catalogo') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} role="menuitem" tabIndex="0">
                <i className="fa fa-layer-group" /> <span>Categorías</span>
              </Link>
            </li>

            <li role="none">
              <Link to="/vendedores" className={`nav-link-item ${isActive('/vendedores') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} role="menuitem" tabIndex="0">
                <i className="fa fa-users" /> <span>Vendedores</span>
              </Link>
            </li>

            <li role="none">
              <Link to="/carrito" className={`nav-link-item nav-cart-item ${isActive('/carrito') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} role="menuitem" tabIndex="0" aria-label={`Carrito de compras${count > 0 ? ` con ${count} productos` : ''}`}>
                <i className="fa fa-shopping-cart" />
                <span>Carrito</span>
                {count > 0 && <span className="nav-cart-badge" aria-label={`${count} productos en el carrito`}>{count}</span>}
              </Link>
            </li>

            <li role="none">
              <Link to="/soporte" className={`nav-link-item ${isActive('/soporte') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} role="menuitem" tabIndex="0">
                <i className="fa fa-life-ring" /> <span>Ayuda</span>
              </Link>
            </li>

            {/* User Account / Profile */}
            {isAuthenticated ? (
              <li className="user-dropdown-container">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="user-dropdown-trigger"
                  aria-expanded={userDropdown}
                  aria-haspopup="true"
                >
                  <img
                    src={getAvatarUrl(user)}
                    alt="Perfil"
                    className="user-dropdown-avatar"
                    onError={(e) => handleAvatarError(e, user?.nombre || user?.username)}
                  />
                  <span className="user-dropdown-name">{user?.nombre?.split(' ')[0] || user?.username || 'Cuenta'}</span>
                  <i className="fa fa-caret-down" />
                </button>

                {userDropdown && (
                  <div className="user-popup-menu fade-in" onMouseLeave={() => setUserDropdown(false)} role="menu">
                    <div className="user-popup-header">
                      <strong>{user?.nombre || user?.username}</strong>
                      <span className="user-popup-role">
                        {isAdmin ? '🛡️ Administrador' : isSupport ? '🎧 Soporte Técnico' : isVendedor ? '🌾 Vendedor Campesino' : '🛒 Comprador'}
                      </span>
                    </div>
                    <hr className="user-popup-divider" />
                    <Link to="/perfil" onClick={() => { setUserDropdown(false); setMobileMenuOpen(false); }} role="menuitem">
                      <i className="fa fa-user" /> Mi Perfil y Pedidos
                    </Link>
                    <Link to="/rastreo" onClick={() => { setUserDropdown(false); setMobileMenuOpen(false); }} role="menuitem">
                      <i className="fa fa-truck-fast" /> Rastrear Cosecha
                    </Link>
                    <Link to="/vendedor" onClick={() => { setUserDropdown(false); setMobileMenuOpen(false); }} role="menuitem">
                      <i className="fa fa-store" /> Centro de Ventas (Vender)
                    </Link>
                    <Link to="/soporte" onClick={() => { setUserDropdown(false); setMobileMenuOpen(false); }} role="menuitem">
                      <i className="fa fa-life-ring" /> Centro de Ayuda
                    </Link>
                    {(isAdmin || isSupport) && (
                      <>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => { setUserDropdown(false); setMobileMenuOpen(false); }} role="menuitem">
                            <i className="fa fa-cogs" /> Panel Administrador
                          </Link>
                        )}
                        <Link to="/admin/soporte" onClick={() => { setUserDropdown(false); setMobileMenuOpen(false); }} role="menuitem">
                          <i className="fa fa-ticket-alt" /> Panel de Soporte
                        </Link>
                      </>
                    )}
                    <hr className="user-popup-divider" />
                    <button onClick={() => { logout(); setUserDropdown(false); navigate('/login'); }} className="user-popup-logout" role="menuitem">
                      <i className="fa fa-sign-out-alt" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li className="auth-nav-buttons">
                <Link to="/login" className="btn-nav-login" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa fa-user" /> Iniciar Sesión
                </Link>
              </li>
            )}

            {/* Dark Mode Toggle */}
            <li>
              <button onClick={toggleTheme} className="theme-toggle-btn" title="Cambiar tema">
                <i className={`fa ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          aria-controls="header-nav-menu"
        >
          <i className={`fa ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
        </button>
      </div>

      {/* Categories Subnav Ribbon (Desplazamiento suave y dinámico) */}
      <nav className="categories-ribbon" aria-label="Categorías principales">
        <div className="app-container ribbon-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleScrollRibbon(-260)}
            className="ribbon-arrow-btn left"
            title="Ver anteriores"
            aria-label="Categorías anteriores"
          >
            <i className="fa fa-chevron-left" />
          </button>

          <div id="navbar-categories-ribbon" className="ribbon-inner">
            {categoriasNav.length > 0 ? (
              categoriasNav.map((cat) => {
                const slug = cat.slug || cat.nombre_categoria?.toLowerCase().replace(/\s+/g, '-')
                const isActiveCat = location.pathname === `/categoria/${slug}`
                const color = cat.color || '#2e7d32'
                const icon = cat.icono || 'fa-box'
                const imgUrl = cat.imagen
                  ? (cat.imagen.startsWith('http') || cat.imagen.startsWith('/') ? cat.imagen : `/uploads/categories/${cat.imagen}`)
                  : null

                return (
                  <Link
                    key={cat.id_categoria || slug}
                    to={`/categoria/${slug}`}
                    className={`ribbon-cat-chip ${isActiveCat ? 'active' : ''}`}
                    style={{ '--chip-color': color }}
                  >
                    <span className="ribbon-cat-icon-bubble">
                      <MediaRenderer
                        src={cat.imagen}
                        alt={cat.nombre_categoria}
                        icon={icon}
                        color={color}
                        type="category"
                      />
                    </span>
                    <span className="ribbon-cat-text">{cat.nombre_categoria}</span>
                  </Link>
                )
              })
            ) : (
              <>
                <Link to="/categoria/cosechas" className="ribbon-cat-chip">
                  <span className="ribbon-cat-icon-bubble"><i className="fa fa-wheat-awn" /></span>
                  <span className="ribbon-cat-text">Cosechas Frescas</span>
                </Link>
                <Link to="/categoria/semillas" className="ribbon-cat-chip">
                  <span className="ribbon-cat-icon-bubble"><i className="fa fa-seedling" /></span>
                  <span className="ribbon-cat-text">Semillas Nativas</span>
                </Link>
                <Link to="/categoria/lacteos" className="ribbon-cat-chip">
                  <span className="ribbon-cat-icon-bubble"><i className="fa fa-cheese" /></span>
                  <span className="ribbon-cat-text">Lácteos Campesinos</span>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleScrollRibbon(260)}
            className="ribbon-arrow-btn right"
            title="Ver siguientes"
            aria-label="Siguientes categorías"
          >
            <i className="fa fa-chevron-right" />
          </button>
        </div>
      </nav>
    </header>
  )
}
