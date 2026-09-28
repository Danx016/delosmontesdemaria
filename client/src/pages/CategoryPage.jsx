import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import MediaRenderer from '../components/MediaRenderer'
import CategoryMiniMap from '../components/CategoryMiniMap'
import { listarProductos, listarCategoriasPublicas } from '../api/productos.api'
import { matchProductCategory, findCategoryInfo, slugify } from '../utils/categoryMatcher'

export default function CategoryPage() {
  const { slug } = useParams()
  const [todosLosProductos, setTodosLosProductos] = useState([])
  const [categoriasLista, setCategoriasLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recientes') // 'recientes' | 'precio_asc' | 'precio_desc' | 'stock'
  const [onlyInStock, setOnlyInStock] = useState(false) // Filtro de disponibilidad

  useEffect(() => {
    setLoading(true)
    Promise.all([
      listarProductos().catch(() => ({ data: [] })),
      listarCategoriasPublicas().catch(() => ({ data: [] }))
    ])
      .then(([prodRes, catRes]) => {
        const todos = prodRes.data?.productos || prodRes.data || []
        setTodosLosProductos(Array.isArray(todos) ? todos : [])

        const rawCats = catRes.data || []
        setCategoriasLista(Array.isArray(rawCats) ? rawCats : [])
      })
      .catch((err) => console.error('Error al cargar categoría:', err))
      .finally(() => setLoading(false))
  }, [slug])

  // Información enriquecida de la categoría actual
  const catInfo = useMemo(() => {
    return findCategoryInfo(slug, categoriasLista)
  }, [slug, categoriasLista])

  // Productos de esta categoría con búsqueda y ordenamiento
  const productosFiltrados = useMemo(() => {
    return todosLosProductos
      .filter((p) => {
        const matchCat = matchProductCategory(p, slug, categoriasLista)
        const q = searchTerm.trim().toLowerCase()
        const matchSearch =
          !q ||
          (p.nombre || p.nombre_producto || '').toLowerCase().includes(q) ||
          (p.descripcion || '').toLowerCase().includes(q) ||
          (p.vendedor_nombre || '').toLowerCase().includes(q) ||
          (p.origen || '').toLowerCase().includes(q)

        const matchStock = !onlyInStock || (Number(p.stock) || 0) > 0

        return matchCat && matchSearch && matchStock
      })
      .sort((a, b) => {
        const precioA = Number(a.precio) || 0
        const precioB = Number(b.precio) || 0

        if (sortBy === 'precio_asc') return precioA - precioB
        if (sortBy === 'precio_desc') return precioB - precioA
        if (sortBy === 'stock') return (Number(b.stock) || 0) - (Number(a.stock) || 0)
        return (b.id_producto || 0) - (a.id_producto || 0)
      })
  }, [todosLosProductos, slug, categoriasLista, searchTerm, sortBy, onlyInStock])

  // Otras categorías para navegación rápida
  const otrasCategorias = useMemo(() => {
    return categoriasLista
      .filter((c) => {
        const cSlug = c.slug || slugify(c.nombre_categoria)
        return cSlug !== slug && normalizeSlug(cSlug) !== normalizeSlug(slug)
      })
      .slice(0, 6)
  }, [categoriasLista, slug])

  function normalizeSlug(s) {
    if (!s) return ''
    return String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  return (
    <>
      <Navbar />

      <main className="main-content-wrap">
        {/* Page Breadcrumb */}
        <div className="page-breadcrumb-bar">
          <div className="app-container">
            <nav className="page-breadcrumb">
              <Link to="/">Inicio</Link>
              <span className="breadcrumb-sep">/</span>
              <Link to="/categorias">Categorías</Link>
              <span className="breadcrumb-sep">/</span>
              <strong>{catInfo.label || catInfo.nombre_categoria}</strong>
            </nav>
          </div>
        </div>

        <div className="app-container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
          {/* Category Hero Banner Rediseñado & Elegante */}
          <div
            className="cat-hero-card fade-in"
            style={{
              '--hero-accent': catInfo.color || '#2e7d32',
              '--hero-accent-subtle': `${catInfo.color || '#2e7d32'}18`,
              '--hero-accent-border': `${catInfo.color || '#2e7d32'}35`,
            }}
          >
            <div className="cat-hero-glow" />

            <div className="cat-hero-content">
              <div className="cat-hero-tag-row">
                <span className="cat-hero-tag">
                  <i className="fa fa-leaf" /> Mercado Campesino • Montes de María
                </span>
                <span className="badge badge-outline" style={{ borderColor: `${catInfo.color || '#2e7d32'}40`, color: catInfo.color || '#2e7d32', fontSize: '0.78rem' }}>
                  Categoría Oficial
                </span>
              </div>

              <h1 className="cat-hero-title">{catInfo.label || catInfo.nombre_categoria}</h1>
              <p className="cat-hero-desc">
                {catInfo.descripcion || 'Explora los mejores productos locales directamente traídos desde el campo de los Montes de María.'}
              </p>

              <div className="cat-hero-badges-row">
                <div className="cat-hero-badge-pill">
                  <i className="fa fa-boxes-stacked" />
                  <span><strong>{productosFiltrados.length}</strong> {productosFiltrados.length === 1 ? 'Producto disponible' : 'Productos disponibles'}</span>
                </div>
                <div className="cat-hero-badge-pill">
                  <i className="fa fa-truck-fast" />
                  <span>Envíos directos sin intermediarios</span>
                </div>
                <div className="cat-hero-badge-pill">
                  <i className="fa fa-award" />
                  <span>Calidad 100% Garantizada</span>
                </div>
              </div>
            </div>

            <div className="cat-hero-showcase">
              <MediaRenderer
                src={catInfo.imagen}
                alt={catInfo.label || catInfo.nombre_categoria}
                icon={catInfo.icono || catInfo.icon || 'fa-box'}
                color={catInfo.color || '#2e7d32'}
                type="category"
              />
            </div>
          </div>

          {/* Mini Mapa de Origen de Cosechas y Productores */}
          <CategoryMiniMap
            productos={productosFiltrados}
            categoryName={catInfo.label || catInfo.nombre_categoria}
            categoryColor={catInfo.color || '#2e7d32'}
          />

          {/* Barra de Filtro y Orden en la Categoría */}
          <div className="catalog-toolbar" style={{ marginTop: '2rem', marginBottom: '1.5rem', background: 'var(--card-bg, #ffffff)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color, #e5e7eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
              <i className="fa fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={`Buscar en ${catInfo.label}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 2rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', fontSize: '0.9rem', outline: 'none' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                >
                  <i className="fa fa-times" />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="cat-sort" style={{ fontSize: '0.88rem', color: '#6b7280', fontWeight: '500' }}>Ordenar:</label>
              <select
                id="cat-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="catalog-sort-select"
                style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', fontSize: '0.88rem' }}
              >
                <option value="recientes">Más Recientes</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="stock">Mayor Inventario</option>
              </select>
            </div>
          </div>

          {/* Layout de dos columnas: Filtros a la izquierda, Productos a la derecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', marginTop: '1.5rem' }} className="category-layout-grid">
            {/* Panel lateral de filtros */}
            <div className="catalog-filters-sidebar" style={{ 
              background: 'var(--card-bg, #ffffff)', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid var(--border-color, #e5e7eb)', 
              height: 'fit-content',
              position: 'sticky',
              top: '1rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                <i className="fa fa-filter" style={{ marginRight: '0.5rem', color: catInfo.color || '#2e7d32' }} />
                FILTROS
              </h3>

              {/* Filtro de Disponibilidad */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-main, #1f2937)' }}>
                  DISPONIBILIDAD
                </h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted, #6b7280)' }}>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: catInfo.color || '#2e7d32' }}
                  />
                  Solo en inventario (&gt; 0)
                </label>
              </div>

              {/* Información de la categoría */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: `${catInfo.color || '#2e7d32'}08`, borderRadius: '8px', border: `1px solid ${catInfo.color || '#2e7d32'}20` }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: catInfo.color || '#2e7d32' }}>
                  <i className="fa fa-info-circle" /> {catInfo.label || catInfo.nombre_categoria}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6b7280)', lineHeight: '1.4', margin: 0 }}>
                  {catInfo.descripcion || 'Productos locales de calidad directamente del campo.'}
                </p>
              </div>

              {/* Otras categorías rápidas */}
              {otrasCategorias.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-main, #1f2937)' }}>
                    OTRAS CATEGORÍAS
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {otrasCategorias.slice(0, 4).map((c) => {
                      const otherSlug = c.slug || slugify(c.nombre_categoria)
                      return (
                        <Link
                          key={c.id_categoria || otherSlug}
                          to={`/categoria/${otherSlug}`}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            padding: '0.5rem', 
                            borderRadius: '6px', 
                            textDecoration: 'none', 
                            color: 'var(--text-muted, #6b7280)', 
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'var(--bg-color, #f9fafb)'
                            e.target.style.color = catInfo.color || '#2e7d32'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent'
                            e.target.style.color = 'var(--text-muted, #6b7280)'
                          }}
                        >
                          <MediaRenderer
                            src={c.imagen}
                            alt={c.nombre_categoria}
                            icon={c.icono || 'fa-box'}
                            color={c.color || '#2e7d32'}
                            type="category"
                            style={{ width: '24px', height: '24px' }}
                          />
                          {c.nombre_categoria}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Columna principal de productos */}
            <div style={{ minWidth: 0 }}>

            {/* Products Grid */}
            {loading ? (
              <div className="loading-state-box">
                <div className="spinner" />
                <p>Cargando productos de {catInfo.label}...</p>
              </div>
            ) : productosFiltrados.length > 0 ? (
              <>
                <div className="products-grid-container fade-in">
                  {productosFiltrados.map((prod) => (
                    <div key={prod.id_producto || prod.id} id={`prod-${prod.id_producto || prod.id}`} style={{ scrollMarginTop: '100px' }}>
                      <ProductCard producto={prod} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-catalog-card fade-in">
                <i className="fa fa-seedling empty-catalog-icon" />
                <h3>{searchTerm ? 'No se encontraron resultados' : `No hay productos registrados en ${catInfo.label}`}</h3>
                <p>{searchTerm ? `No hay productos que coincidan con "${searchTerm}" en esta sección.` : 'Nuestros agricultores están alistando la próxima cosecha.'}</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="btn btn-secondary">
                      <i className="fa fa-times" /> Limpiar Búsqueda
                    </button>
                  )}
                  <Link to="/categorias" className="btn btn-primary">
                    <i className="fa fa-boxes-stacked" /> Ver Todas las Categorías
                  </Link>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
