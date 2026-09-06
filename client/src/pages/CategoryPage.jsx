import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import MediaRenderer from '../components/MediaRenderer'
import { listarProductos, listarCategoriasPublicas } from '../api/productos.api'
import { matchProductCategory, findCategoryInfo, slugify } from '../utils/categoryMatcher'

export default function CategoryPage() {
  const { slug } = useParams()
  const [todosLosProductos, setTodosLosProductos] = useState([])
  const [categoriasLista, setCategoriasLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recientes') // 'recientes' | 'precio_asc' | 'precio_desc' | 'stock'

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

        return matchCat && matchSearch
      })
      .sort((a, b) => {
        const precioA = Number(a.precio) || 0
        const precioB = Number(b.precio) || 0

        if (sortBy === 'precio_asc') return precioA - precioB
        if (sortBy === 'precio_desc') return precioB - precioA
        if (sortBy === 'stock') return (Number(b.stock) || 0) - (Number(a.stock) || 0)
        return (b.id_producto || 0) - (a.id_producto || 0)
      })
  }, [todosLosProductos, slug, categoriasLista, searchTerm, sortBy])

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
                  <ProductCard key={prod.id_producto || prod.id} producto={prod} />
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

          {/* Explora otras categorías */}
          {otrasCategorias.length > 0 && (
            <div style={{ marginTop: '3.5rem' }}>
              <div className="block-header" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Explorar Otras Categorías</h3>
              </div>
              <div className="categories-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {otrasCategorias.map((c) => {
                  const otherSlug = c.slug || slugify(c.nombre_categoria)
                  return (
                    <Link
                      key={c.id_categoria || otherSlug}
                      to={`/categoria/${otherSlug}`}
                      className="category-item-card"
                      style={{ padding: '1rem' }}
                    >
                      <div
                        className="cat-icon-circle"
                        style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: `${c.color || '#2e7d32'}18`,
                          color: c.color || '#2e7d32',
                          margin: '0 auto 0.75rem auto'
                        }}
                      >
                        <MediaRenderer
                          src={c.imagen}
                          alt={c.nombre_categoria}
                          icon={c.icono || 'fa-box'}
                          color={c.color || '#2e7d32'}
                          type="category"
                        />
                      </div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '600', margin: '0 0 0.25rem 0', textAlign: 'center' }}>
                        {c.nombre_categoria}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#16a34a', display: 'block', textAlign: 'center' }}>
                        Ver productos <i className="fa fa-chevron-right" style={{ fontSize: '0.7rem' }} />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
