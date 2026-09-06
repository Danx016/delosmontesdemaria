import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import MediaRenderer from '../components/MediaRenderer'
import { listarProductos, listarCategoriasPublicas } from '../api/productos.api'
import {
  matchProductCategory,
  countProductsByCategory,
  findCategoryInfo,
  slugify
} from '../utils/categoryMatcher'

const DEFAULT_CATEGORIAS = [
  { slug: 'all', label: 'Todas las Categorías', icon: 'fa-layer-group', color: '#2e7d32' },
  { slug: 'cosechas', label: 'Cosechas Frescas', icon: 'fa-wheat-awn', color: '#16a34a' },
  { slug: 'semillas', label: 'Semillas Certificadas', icon: 'fa-seedling', color: '#15803d' },
  { slug: 'lacteos', label: 'Lácteos de la Finca', icon: 'fa-cow', color: '#ca8a04' },
  { slug: 'ferre', label: 'Herramientas de Campo', icon: 'fa-hammer', color: '#475569' },
  { slug: 'abonos', label: 'Abonos y Fertilizantes', icon: 'fa-leaf', color: '#059669' },
  { slug: 'agro', label: 'Maquinaria AgroEquipos', icon: 'fa-tractor', color: '#0284c7' },
]

const RANGOS_PRECIO = [
  { id: 'all', label: 'Cualquier precio', min: 0, max: Infinity },
  { id: 'bajo', label: 'Menos de $20.000', min: 0, max: 20000 },
  { id: 'medio', label: '$20.000 a $50.000', min: 20000, max: 50000 },
  { id: 'alto', label: '$50.000 a $150.000', min: 50000, max: 150000 },
  { id: 'premium', label: 'Más de $150.000', min: 150000, max: Infinity },
]

export default function CategoriasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('cat') || 'all'

  const [categoriasLista, setCategoriasLista] = useState(DEFAULT_CATEGORIAS)
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState(initialCat)
  const [selectedRango, setSelectedRango] = useState('all')
  const [customMin, setCustomMin] = useState('')
  const [customMax, setCustomMax] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sortBy, setSortBy] = useState('recientes') // 'recientes' | 'precio_asc' | 'precio_desc' | 'stock' | 'nombre'

  // Sincronizar selectedCat si cambia el URL searchParam
  useEffect(() => {
    const catFromUrl = searchParams.get('cat') || 'all'
    if (catFromUrl !== selectedCat) {
      setSelectedCat(catFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      listarProductos().catch(() => ({ data: [] })),
      listarCategoriasPublicas().catch(() => ({ data: [] }))
    ])
      .then(([prodRes, catRes]) => {
        const prodData = prodRes.data?.productos || prodRes.data || []
        setProductos(Array.isArray(prodData) ? prodData : [])

        const rawCats = catRes.data || []
        if (Array.isArray(rawCats) && rawCats.length > 0) {
          const mapped = [
            { slug: 'all', label: 'Todas las Categorías', nombre_categoria: 'Todas las Categorías', icon: 'fa-layer-group', icono: 'fa-layer-group', color: '#2e7d32' },
            ...rawCats.map((c) => ({
              id: c.id_categoria,
              id_categoria: c.id_categoria,
              slug: c.slug || slugify(c.nombre_categoria),
              label: c.nombre_categoria,
              nombre_categoria: c.nombre_categoria,
              descripcion: c.descripcion,
              icon: c.icono || 'fa-box',
              icono: c.icono || 'fa-box',
              color: c.color || '#2e7d32',
              imagen: c.imagen || null
            }))
          ]
          setCategoriasLista(mapped)
        }
      })
      .catch((err) => console.error('Error al cargar datos de categorías:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectCat = (slug) => {
    setSelectedCat(slug)
    const newParams = new URLSearchParams(searchParams)
    if (slug === 'all') {
      newParams.delete('cat')
    } else {
      newParams.set('cat', slug)
    }
    setSearchParams(newParams)
  }

  // Conteo reactivo y robusto de productos por categoría
  const countByCat = useMemo(() => {
    return countProductsByCategory(productos, categoriasLista)
  }, [productos, categoriasLista])

  // Filtrado y Ordenamiento reactivo
  const filteredProducts = useMemo(() => {
    return productos
      .filter((p) => {
        // Categoría usando normalizador y coincidencias cruzadas
        const matchCat = matchProductCategory(p, selectedCat, categoriasLista)

        // Búsqueda en nombre, descripción, vendedor, origen
        const query = searchTerm.trim().toLowerCase()
        const matchSearch =
          !query ||
          (p.nombre || p.nombre_producto || '').toLowerCase().includes(query) ||
          (p.descripcion || '').toLowerCase().includes(query) ||
          (p.categoria || '').toLowerCase().includes(query) ||
          (p.vendedor_nombre || '').toLowerCase().includes(query) ||
          (p.origen || '').toLowerCase().includes(query)

        // Precio
        const precio = Number(p.precio) || 0
        let matchPrecio = true

        if (customMin !== '' && !isNaN(customMin)) {
          matchPrecio = matchPrecio && precio >= Number(customMin)
        }
        if (customMax !== '' && !isNaN(customMax)) {
          matchPrecio = matchPrecio && precio <= Number(customMax)
        }

        if (selectedRango !== 'all' && customMin === '' && customMax === '') {
          const rango = RANGOS_PRECIO.find((r) => r.id === selectedRango)
          if (rango) {
            matchPrecio = precio >= rango.min && precio <= rango.max
          }
        }

        // Stock
        const matchStock = !onlyInStock || Number(p.stock) > 0

        return matchCat && matchSearch && matchPrecio && matchStock
      })
      .sort((a, b) => {
        const precioA = Number(a.precio) || 0
        const precioB = Number(b.precio) || 0

        if (sortBy === 'precio_asc') return precioA - precioB
        if (sortBy === 'precio_desc') return precioB - precioA
        if (sortBy === 'stock') return (Number(b.stock) || 0) - (Number(a.stock) || 0)
        if (sortBy === 'nombre') return (a.nombre || a.nombre_producto || '').localeCompare(b.nombre || b.nombre_producto || '')
        return (b.id_producto || 0) - (a.id_producto || 0)
      })
  }, [productos, selectedCat, categoriasLista, searchTerm, selectedRango, customMin, customMax, onlyInStock, sortBy])

  const handleResetFilters = () => {
    setSelectedCat('all')
    setSelectedRango('all')
    setCustomMin('')
    setCustomMax('')
    setSearchTerm('')
    setOnlyInStock(false)
    setSortBy('recientes')
    setSearchParams({})
  }

  const activeCategory = useMemo(() => {
    return findCategoryInfo(selectedCat, categoriasLista)
  }, [selectedCat, categoriasLista])

  const hasActiveFilters =
    selectedCat !== 'all' ||
    selectedRango !== 'all' ||
    customMin !== '' ||
    customMax !== '' ||
    searchTerm !== '' ||
    onlyInStock

  return (
    <>
      <Navbar />

      <main className="main-content">
        <div className="app-container">
          {/* Breadcrumb Navigation */}
          <nav className="catalog-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Inicio</Link>
            <span className="catalog-breadcrumb-sep">/</span>
            <Link to="/categorias" onClick={() => handleSelectCat('all')}>Catálogo & Categorías</Link>
            {selectedCat !== 'all' && (
              <>
                <span className="catalog-breadcrumb-sep">/</span>
                <strong>{activeCategory.label || activeCategory.nombre_categoria}</strong>
              </>
            )}
          </nav>

          {/* Header Bar */}
          <div className="catalog-header-bar">
            <div>
              <span className="badge badge-success">
                <i className="fa fa-leaf" /> Mercado Directo del Campo
              </span>
              <h1 className="catalog-title">
                {selectedCat === 'all' ? 'Catálogo & Categorías' : (activeCategory.label || activeCategory.nombre_categoria)}
              </h1>
              <p className="catalog-subtitle">
                {selectedCat === 'all'
                  ? 'Explora productos frescos y agrícolas con precios justos de los Montes de María.'
                  : (activeCategory.descripcion || 'Explora todos los productos disponibles en esta categoría.')}
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="catalog-search-wrap">
              <i className="fa fa-search" />
              <input
                type="text"
                placeholder="Buscar por nombre, producto, finca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="catalog-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="catalog-search-clear"
                  title="Limpiar"
                >
                  <i className="fa fa-times" />
                </button>
              )}
            </div>
          </div>

          {/* Layout Principal: 2 Columnas Limpias */}
          <div className="catalog-main-layout">
            {/* Columna Izquierda: Filtros */}
            <aside className="catalog-sidebar">
              <div className="catalog-sidebar-card">
                <div className="catalog-filter-head">
                  <h3><i className="fa fa-sliders-h" /> Filtros</h3>
                  {hasActiveFilters && (
                    <button onClick={handleResetFilters} className="catalog-clear-btn">
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Filtro por Categorías */}
                <div className="catalog-filter-group">
                  <h4 className="catalog-filter-title">Categorías</h4>
                  <div className="catalog-cat-list">
                    {categoriasLista.map((cat) => {
                      const count = countByCat[cat.slug] !== undefined ? countByCat[cat.slug] : (countByCat[cat.id_categoria] || 0)
                      const isSelected = selectedCat === cat.slug || (selectedCat !== 'all' && activeCategory.slug === cat.slug)

                      return (
                        <button
                          key={cat.slug || cat.id_categoria}
                          type="button"
                          onClick={() => handleSelectCat(cat.slug)}
                          className={`catalog-cat-item ${isSelected ? 'active' : ''}`}
                        >
                          <div style={{ width: '22px', height: '22px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MediaRenderer
                              src={cat.imagen}
                              alt={cat.label}
                              icon={cat.icon || cat.icono || 'fa-box'}
                              color={cat.color || '#2e7d32'}
                              type="category"
                            />
                          </div>
                          <span className="catalog-cat-name">{cat.label || cat.nombre_categoria}</span>
                          <span className="catalog-cat-pill">{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Filtro por Rango de Precios */}
                <div className="catalog-filter-group">
                  <h4 className="catalog-filter-title">Precio ($COP)</h4>
                  <div className="catalog-price-options">
                    {RANGOS_PRECIO.map((rango) => (
                      <label
                        key={rango.id}
                        className={`catalog-price-option ${selectedRango === rango.id && customMin === '' && customMax === '' ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="precio_rango"
                          checked={selectedRango === rango.id && customMin === '' && customMax === ''}
                          onChange={() => {
                            setSelectedRango(rango.id)
                            setCustomMin('')
                            setCustomMax('')
                          }}
                        />
                        <span>{rango.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Rango Manual */}
                  <div className="catalog-price-manual">
                    <span className="catalog-price-manual-lbl">Rango personalizado:</span>
                    <div className="catalog-price-inputs">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={customMin}
                        onChange={(e) => setCustomMin(e.target.value)}
                        className="catalog-price-field"
                      />
                      <span className="catalog-price-sep">-</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={customMax}
                        onChange={(e) => setCustomMax(e.target.value)}
                        className="catalog-price-field"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtro de Disponibilidad */}
                <div className="catalog-filter-group">
                  <h4 className="catalog-filter-title">Disponibilidad</h4>
                  <label className="catalog-checkbox-label">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                    />
                    <span>Solo en inventario ({'>'} 0)</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Columna Derecha: Catálogo & Grid */}
            <section className="catalog-content-area">
              {/* Barra de Control de Resultados y Orden */}
              <div className="catalog-toolbar">
                <div className="catalog-results-meta">
                  <span className="catalog-results-text">
                    <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'producto' : 'productos'} en {activeCategory.label || activeCategory.nombre_categoria}
                  </span>
                </div>

                <div className="catalog-sort-group">
                  <label htmlFor="catalog-sort">Ordenar por:</label>
                  <select
                    id="catalog-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="catalog-sort-select"
                  >
                    <option value="recientes">Novedades / Recientes</option>
                    <option value="precio_asc">Precio: Menor a Mayor</option>
                    <option value="precio_desc">Precio: Mayor a Menor</option>
                    <option value="stock">Mayor Stock Disponible</option>
                    <option value="nombre">Nombre (A - Z)</option>
                  </select>
                </div>
              </div>

              {/* Píldoras de Filtros Activos */}
              {hasActiveFilters && (
                <div className="catalog-active-filters fade-in">
                  <span className="catalog-active-filters-title">Filtros:</span>

                  {selectedCat !== 'all' && (
                    <span className="catalog-active-pill">
                      {activeCategory.label || activeCategory.nombre_categoria}
                      <button onClick={() => handleSelectCat('all')} title="Quitar">
                        <i className="fa fa-times" />
                      </button>
                    </span>
                  )}

                  {searchTerm && (
                    <span className="catalog-active-pill">
                      "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} title="Quitar">
                        <i className="fa fa-times" />
                      </button>
                    </span>
                  )}

                  {(customMin !== '' || customMax !== '') ? (
                    <span className="catalog-active-pill">
                      ${Number(customMin || 0).toLocaleString('es-CO')} - ${Number(customMax || Infinity).toLocaleString('es-CO')}
                      <button onClick={() => { setCustomMin(''); setCustomMax(''); }} title="Quitar">
                        <i className="fa fa-times" />
                      </button>
                    </span>
                  ) : selectedRango !== 'all' ? (
                    <span className="catalog-active-pill">
                      {RANGOS_PRECIO.find((r) => r.id === selectedRango)?.label}
                      <button onClick={() => setSelectedRango('all')} title="Quitar">
                        <i className="fa fa-times" />
                      </button>
                    </span>
                  ) : null}

                  {onlyInStock && (
                    <span className="catalog-active-pill">
                      Solo en stock
                      <button onClick={() => setOnlyInStock(false)} title="Quitar">
                        <i className="fa fa-times" />
                      </button>
                    </span>
                  )}

                  <button onClick={handleResetFilters} className="catalog-reset-link">
                    Limpiar todo
                  </button>
                </div>
              )}

              {/* Grid de Productos */}
              {loading ? (
                <div className="loading-state-box">
                  <div className="spinner" />
                  <p>Cargando productos de los Montes de María...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="products-grid-container fade-in">
                  {filteredProducts.map((prod) => (
                    <ProductCard key={prod.id_producto || prod.id} producto={prod} />
                  ))}
                </div>
              ) : (
                <div className="catalog-empty-box fade-in">
                  <div className="catalog-empty-icon">
                    <i className="fa fa-search" />
                  </div>
                  <h3>No hay productos que coincidan</h3>
                  <p>Intenta cambiar de categoría, ajustar el rango de precios o limpiar la búsqueda.</p>
                  <button onClick={handleResetFilters} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    <i className="fa fa-redo" /> Restablecer Filtros
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
