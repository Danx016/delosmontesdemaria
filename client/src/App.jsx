import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { ConfirmProvider } from './context/ConfirmContext'
import ToastPortal from './components/ToastPortal'
import GlobalSupportNotifier from './components/GlobalSupportNotifier'
import AIAssistantWidget from './components/AIAssistantWidget'
import ScrollToTop from './components/ScrollToTop'
import BottomMobileNav from './components/BottomMobileNav'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import SupportRoute from './components/SupportRoute'
import { initGA, trackPageView } from './utils/analytics'

// Lazy Loading para Code-Splitting ultrarrápido
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const RecoverPage = lazy(() => import('./pages/RecoverPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const CategoriasPage = lazy(() => import('./pages/CategoriasPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const VendedorPage = lazy(() => import('./pages/VendedorPage'))
const VendedorPerfilPage = lazy(() => import('./pages/VendedorPerfilPage'))
const VendedoresPage = lazy(() => import('./pages/VendedoresPage'))
const SoportePage = lazy(() => import('./pages/SoportePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AdminSoportePage = lazy(() => import('./pages/AdminSoportePage'))
const AdminMicroserviciosPage = lazy(() => import('./pages/AdminMicroserviciosPage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const TerminosPage = lazy(() => import('./pages/TerminosPage'))
const PrivacidadPage = lazy(() => import('./pages/PrivacidadPage'))
const TrackingPage = lazy(() => import('./pages/TrackingPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '95151482078-k07kflr5nbjnjs89ntoff2dgikgsor1u.apps.googleusercontent.com'

/**
 * Rastrear cambios de ruta automáticamente en Google Analytics 4
 */
function RouteAnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])

  return null
}

/**
 * Loader elegante para transiciones entre páginas
 */
function PageFallbackLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div
        className="spinner-border text-success"
        role="status"
        style={{ width: '2.5rem', height: '2.5rem' }}
      >
        <span className="visually-hidden">Cargando...</span>
      </div>
      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.3px' }}>
        Cargando Montes de María...
      </span>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    // Inicializar Google Analytics al cargar la app
    initGA()
  }, [])

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <RouteAnalyticsTracker />
                <ScrollToTop />
                <GlobalSupportNotifier />
                <AIAssistantWidget />
                <Suspense fallback={<PageFallbackLoader />}>
                  <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/categorias" element={<CategoriasPage />} />
                    <Route path="/catalogo" element={<CategoriasPage />} />
                    <Route path="/explorar" element={<CategoriasPage />} />
                    <Route path="/producto/:id" element={<ProductPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegisterPage />} />
                    <Route path="/recuperar" element={<RecoverPage />} />
                    <Route path="/buscar" element={<SearchPage />} />
                    <Route path="/categoria/:slug" element={<CategoryPage />} />
                    <Route path="/vendedores" element={<VendedoresPage />} />
                    <Route path="/vendedor/:id" element={<VendedorPerfilPage />} />
                    <Route path="/rastreo" element={<TrackingPage />} />
                    <Route path="/rastreo/:trackingNumber" element={<TrackingPage />} />
                    <Route path="/soporte" element={<SoportePage />} />
                    <Route path="/terminos" element={<TerminosPage />} />
                    <Route path="/terminos-condiciones" element={<TerminosPage />} />
                    <Route path="/privacidad" element={<PrivacidadPage />} />
                    <Route path="/politica-privacidad" element={<PrivacidadPage />} />
                    <Route path="/admin-login" element={<AdminLoginPage />} />

                    {/* Rutas protegidas (usuario autenticado) */}
                    <Route
                      path="/perfil"
                      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                    />
                    <Route
                      path="/carrito"
                      element={<ProtectedRoute><CartPage /></ProtectedRoute>}
                    />
                    <Route
                      path="/checkout"
                      element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
                    />
                    <Route
                      path="/pago"
                      element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}
                    />
                    <Route
                      path="/vendedor"
                      element={<ProtectedRoute><VendedorPage /></ProtectedRoute>}
                    />

                    {/* Rutas solo Admin */}
                    <Route
                      path="/admin"
                      element={<AdminRoute><AdminPage /></AdminRoute>}
                    />
                    <Route
                      path="/admin/microservicios"
                      element={<AdminMicroserviciosPage />}
                    />

                    {/* Rutas para Admin y Soporte */}
                    <Route
                      path="/admin/soporte"
                      element={<SupportRoute><AdminSoportePage /></SupportRoute>}
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
                <BottomMobileNav />
              </BrowserRouter>
              <ToastPortal />
            </CartProvider>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  )
}
