import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ManualUsuarioPage() {
  const [activeSection, setActiveSection] = useState('introduccion')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('todos') // 'todos', 'comprador', 'productor', 'soporte', 'admin'

  const scrollTo = (id) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -90
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content-wrap legal-page manual-page">
        {/* Header Hero */}
        <section className="legal-hero manual-hero">
          <div className="app-container legal-hero-inner">
            <div className="legal-badge">
              <i className="fa fa-book-open" /> Guía Oficial del Sistema v1.0
            </div>
            <h1>Manual de Usuario de la Aplicación</h1>
            <p className="legal-subtitle">
              <strong>De los Montes de María</strong> — Del campo a tu mesa: Plataforma de Comercio Agropecuario Colombiano
            </p>
            <div className="legal-meta">
              <span><i className="fa fa-check-circle" /> Versión Oficial 1.0</span>
              <span><i className="fa fa-laptop-code" /> Web SPA & Mobile</span>
              <span><i className="fa fa-globe" /> delosmontesdemaria.dev</span>
              <span><i className="fa fa-map-marker-alt" /> Montes de María, Colombia</span>
            </div>

            {/* Quick Role Switcher */}
            <div className="manual-role-tabs" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className={`btn btn-sm ${roleFilter === 'todos' ? 'btn-success' : 'btn-outline-light'}`}
                onClick={() => setRoleFilter('todos')}
                style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <i className="fa fa-list-ul" /> Todo el Manual
              </button>
              <button
                type="button"
                className={`btn btn-sm ${roleFilter === 'comprador' ? 'btn-success' : 'btn-outline-light'}`}
                onClick={() => { setRoleFilter('comprador'); scrollTo('comprador'); }}
                style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <i className="fa fa-shopping-basket" /> Guía del Comprador
              </button>
              <button
                type="button"
                className={`btn btn-sm ${roleFilter === 'productor' ? 'btn-success' : 'btn-outline-light'}`}
                onClick={() => { setRoleFilter('productor'); scrollTo('productor'); }}
                style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <i className="fa fa-tractor" /> Guía del Productor
              </button>
              <button
                type="button"
                className={`btn btn-sm ${roleFilter === 'soporte' ? 'btn-success' : 'btn-outline-light'}`}
                onClick={() => { setRoleFilter('soporte'); scrollTo('soporte'); }}
                style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <i className="fa fa-headset" /> Agente de Soporte
              </button>
              <button
                type="button"
                className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-success' : 'btn-outline-light'}`}
                onClick={() => { setRoleFilter('admin'); scrollTo('admin'); }}
                style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <i className="fa fa-shield-alt" /> Administrador
              </button>
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <div className="app-container legal-layout">
          {/* Sticky Sidebar Navigation */}
          <aside className="legal-sidebar">
            <div className="legal-nav-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <h3 style={{ margin: 0 }}>Índice del Manual</h3>
                <button
                  onClick={handlePrint}
                  className="btn btn-outline-secondary btn-sm"
                  title="Imprimir o Guardar como PDF"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px' }}
                >
                  <i className="fa fa-print" /> Imprimir
                </button>
              </div>

              {/* Search input in index */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Filtrar temas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem 0.45rem 1.8rem',
                      fontSize: '0.82rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-color)',
                      color: 'var(--text-main)'
                    }}
                  />
                  <i className="fa fa-search" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <nav className="legal-nav">
                <button
                  className={activeSection === 'introduccion' ? 'active' : ''}
                  onClick={() => scrollTo('introduccion')}
                >
                  1. Introducción & Alcance
                </button>
                <button
                  className={activeSection === 'requisitos' ? 'active' : ''}
                  onClick={() => scrollTo('requisitos')}
                >
                  2. Requisitos y Acceso
                </button>
                <button
                  className={activeSection === 'roles' ? 'active' : ''}
                  onClick={() => scrollTo('roles')}
                >
                  3. Roles y Permisos
                </button>
                <button
                  className={activeSection === 'comprador' ? 'active' : ''}
                  onClick={() => scrollTo('comprador')}
                >
                  4. Uso como Comprador
                </button>
                <button
                  className={activeSection === 'productor' ? 'active' : ''}
                  onClick={() => scrollTo('productor')}
                >
                  5. Uso como Productor
                </button>
                <button
                  className={activeSection === 'soporte' ? 'active' : ''}
                  onClick={() => scrollTo('soporte')}
                >
                  6. Atención & Soporte (Telegram)
                </button>
                <button
                  className={activeSection === 'admin' ? 'active' : ''}
                  onClick={() => scrollTo('admin')}
                >
                  7. Administración (/admin)
                </button>
                <button
                  className={activeSection === 'referencias' ? 'active' : ''}
                  onClick={() => scrollTo('referencias')}
                >
                  8. Referencias Documentales
                </button>
              </nav>

              <div className="legal-quick-actions" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  ¿Necesitas asistencia en vivo?
                </p>
                <Link to="/soporte" className="btn btn-outline-success btn-sm btn-block" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <i className="fa fa-headset" /> Ir al Chat de Soporte
                </Link>
                <a
                  href="https://t.me/montesdemariabot"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm btn-block"
                  style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderColor: '#229ED9', color: '#229ED9' }}
                >
                  <i className="fab fa-telegram" /> Bot @montesdemariabot
                </a>
              </div>
            </div>
          </aside>

          {/* Main Manual Content */}
          <div className="legal-content">
            {/* Banner de Bienvenida */}
            <div className="legal-notice-box" style={{ background: 'linear-gradient(135deg, rgba(67, 142, 68, 0.12) 0%, rgba(34, 158, 217, 0.08) 100%)', borderColor: '#438E44' }}>
              <i className="fa fa-seedling legal-notice-icon" />
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary-color, #438E44)' }}>
                  Bienvenido al Manual Oficial de la Plataforma
                </strong>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Este documento orienta a compradores, campesinos productores, agentes de soporte y administradores sobre el uso eficiente, seguro y completo de cada una de las herramientas del ecosistema agropecuario <strong>De los Montes de María</strong>.
                </p>
              </div>
            </div>

            {/* SECCIÓN 1 */}
            <section id="introduccion" className="legal-section">
              <h2>1. Introducción y Generalidades</h2>
              
              <div className="legal-highlight-card">
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--primary-color, #438E44)' }}>
                  1.1 Presentación del Sistema
                </h4>
                <p>
                  <strong>De los Montes de María</strong> es una plataforma web orientada al comercio agropecuario colombiano, concebida para facilitar la conexión directa entre los productores campesinos de la subregión (El Carmen de Bolívar, San Jacinto, Ovejas, San Juan Nepomuceno, etc.) y personas o negocios interesados en adquirir productos agrícolas frescos y de alta calidad.
                </p>
                <p>
                  Su objetivo es transformar digitalmente la comercialización del campo, eliminando intermediarios abusivos, transparentando los precios y brindando a los compradores una experiencia de compra segura, rápida y con apoyo de tecnología de vanguardia.
                </p>
              </div>

              <h3>1.2 Objetivo y Alcance</h3>
              <p>
                El objetivo principal es centralizar en un entorno digital la oferta agropecuaria de la región, facilitando el acceso a la información, la gestión de cosechas, pedidos, facturación y atención en tiempo real.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <strong><i className="fa fa-check text-success" /> Alcance Incluido:</strong>
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', fontSize: '0.88rem' }}>
                    <li>Catálogo dinámico con búsqueda y filtros multicriterio.</li>
                    <li>Carrito persistente con cálculo automático de fletes.</li>
                    <li>Checkout contra entrega con validación de identidad OTP.</li>
                    <li>Facturación electrónica en PDF con código QR legal.</li>
                    <li>Asistencia con Inteligencia Artificial (AgroAsistente).</li>
                    <li>Soporte omnicanal web y sincronizado con Telegram.</li>
                    <li>Panel administrativo integral de ventas, inventario y usuarios.</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <strong><i className="fa fa-info-circle text-primary" /> Consideraciones Operativas:</strong>
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', fontSize: '0.88rem' }}>
                    <li>La disponibilidad de productos depende de los ciclos de cosecha de cada campesino.</li>
                    <li>La cobertura de entrega abarca los municipios y veredas habilitados por transportadoras aliadas.</li>
                    <li>Los servicios de correo electrónico y Telegram están sujetos a la conectividad de los proveedores externos.</li>
                  </ul>
                </div>
              </div>

              <h3>1.3 Público Objetivo</h3>
              <ul>
                <li><strong>Clientes o Compradores:</strong> Familias, restaurantes y comercios que desean adquirir cosechas frescas con pago seguro en la puerta de su casa o negocio.</li>
                <li><strong>Productores Campesinos:</strong> Agricultores y artesanos locales que publican sus productos, administran sus precios y despachan pedidos desde su finca.</li>
                <li><strong>Agentes de Soporte:</strong> Equipo de atención responsable de guiar al usuario mediante el chat web y responder consultas directamente desde Telegram.</li>
                <li><strong>Administradores:</strong> Encargados de la gobernanza global, supervisión de inventario, aprobación de banners, cupones y auditoría del sistema.</li>
              </ul>

              <h3>1.4 Características Principales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', margin: '1rem 0' }}>
                <div style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                  <i className="fa fa-shopping-basket" style={{ fontSize: '1.5rem', color: '#438E44', marginBottom: '0.4rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Catálogo Vivo</div>
                  <small style={{ color: 'var(--text-muted)' }}>Cosechas, lácteos, semillas e insumos</small>
                </div>
                <div style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                  <i className="fa fa-truck" style={{ fontSize: '1.5rem', color: '#2563eb', marginBottom: '0.4rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pago Contra Entrega</div>
                  <small style={{ color: 'var(--text-muted)' }}>Efectivo al recibir con código OTP</small>
                </div>
                <div style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                  <i className="fa fa-robot" style={{ fontSize: '1.5rem', color: '#7c3aed', marginBottom: '0.4rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>AgroAsistente IA</div>
                  <small style={{ color: 'var(--text-muted)' }}>Asesoría en cosechas y compras 24/7</small>
                </div>
                <div style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                  <i className="fab fa-telegram" style={{ fontSize: '1.5rem', color: '#229ED9', marginBottom: '0.4rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Bot @montesdemariabot</div>
                  <small style={{ color: 'var(--text-muted)' }}>Gestión ágil en 1 clic para campesinos</small>
                </div>
              </div>
            </section>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

            {/* SECCIÓN 2 */}
            <section id="requisitos" className="legal-section">
              <h2>2. Requisitos y Acceso a la Plataforma</h2>
              <p>
                La plataforma fue desarrollada como una Aplicación Web Progresiva (SPA) accesible desde cualquier navegador moderno, eliminando la necesidad de descargas o instalaciones complejas.
              </p>

              <h3>2.1 Requisitos Técnicos y Conectividad</h3>
              <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Componente</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Requisito Recomendado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem 0.8rem' }}><strong>Dispositivo</strong></td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>Teléfono inteligente Android/iOS, tablet, computador portátil o de escritorio.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem 0.8rem' }}><strong>Navegadores</strong></td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>Google Chrome (v90+), Mozilla Firefox, Microsoft Edge, Safari o navegadores móviles estándar.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem 0.8rem' }}><strong>Conexión</strong></td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>Conexión a Internet 3G, 4G, 5G o Wi-Fi estable para sincronización de pedidos y chat en vivo.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.6rem 0.8rem' }}><strong>Correo Electrónico</strong></td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>Cuenta de correo activa y accesible para recibir códigos de seguridad OTP y facturas electrónicas.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>2.3 Procedimiento de Registro e Inicio de Sesión</h3>
              <div className="legal-highlight-card">
                <strong>Paso a paso para crear una cuenta:</strong>
                <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', fontSize: '0.92rem' }}>
                  <li>Haz clic en el botón <strong>"Iniciar Sesión"</strong> en la barra superior o ve a <Link to="/registro">/registro</Link>.</li>
                  <li>Diligencia tu nombre completo, nombre de usuario deseado, correo electrónico y número de teléfono/WhatsApp.</li>
                  <li>Crea una contraseña segura con al menos 6 caracteres y confírmala.</li>
                  <li>Acepta los Términos y Condiciones y la Política de Privacidad de la plataforma.</li>
                  <li>Haz clic en <strong>"Crear Mi Cuenta"</strong>. También puedes acceder rápidamente con tu cuenta de Google.</li>
                </ol>
              </div>

              <h3>2.4 Recuperación de Contraseña con Código OTP</h3>
              <p>
                Si olvidaste tu clave de acceso, el sistema dispone de un mecanismo de recuperación de alta seguridad basado en estándares NIST/OWASP:
              </p>
              <ul>
                <li>Ingresa a <Link to="/recuperar">/recuperar</Link> o selecciona <em>"¿Olvidaste tu contraseña?"</em> en el inicio de sesión.</li>
                <li>Escribe tu correo electrónico registrado y presiona <strong>"Enviar Código de Recuperación"</strong>.</li>
                <li>Revisa tu bandeja de entrada (o carpeta de Spam/Promociones) donde recibirás un código de seguridad de 6 dígitos numéricos.</li>
                <li>Ingresa el código en el formulario y define tu nueva contraseña. El sistema validará la coincidencia y actualizará tu acceso de forma inmediata.</li>
              </ul>
            </section>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

            {/* SECCIÓN 3 */}
            <section id="roles" className="legal-section">
              <h2>3. Roles y Permisos en la Plataforma</h2>
              <p>
                La plataforma cuenta con un sistema de control de acceso basado en roles (RBAC) para proteger la integridad de los datos y asegurar que cada participante disponga de las herramientas adecuadas a su labor:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', margin: '1.2rem 0' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>ROL 1</span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>🛒 Cliente / Comprador</h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Explora productos, agrega al carrito, aplica cupones, realiza pedidos con pago contra entrega y descarga facturas oficiales en PDF.
                  </p>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>ROL 2</span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>🌾 Productor Campesino</h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Accede al <em>Centro de Ventas Agropecuarias</em> (`/vendedor`), publica cosechas, modifica precios, gestiona stock y despacha pedidos asignados.
                  </p>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>ROL 4</span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>🎧 Agente de Soporte</h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Atiende tickets de soporte en tiempo real vía WebSockets, responde consultas desde Telegram y asiste a los usuarios en dudas del pedido.
                  </p>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#f3e8ff', color: '#9333ea', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>ROL 3</span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>🛡️ Administrador Global</h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Control total sobre el dashboard financiero, gestión de roles de usuarios, inventario general, banners y marquesinas de cupones.
                  </p>
                </div>
              </div>
            </section>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

            {/* SECCIÓN 4 */}
            <section id="comprador" className="legal-section">
              <h2>4. Uso de la Plataforma como Comprador</h2>

              <h3>4.1 Exploración del Catálogo & Filtros</h3>
              <p>
                El comprador puede explorar toda la oferta campesina ingresando al <Link to="/catalogo">Catálogo</Link> o utilizando la barra de categorías superior:
              </p>
              <ul>
                <li><strong>Cosechas Frescas:</strong> Ñame, yuca, plátano hartón, aguacate, mangos, verduras y hortalizas de temporada.</li>
                <li><strong>Lácteos Artesanales:</strong> Queso costeño fresco, suero campesino y cuajadas.</li>
                <li><strong>Semillas Nativas:</strong> Semillas seleccionadas y certificadas de maíz, frijol y hortalizas.</li>
                <li><strong>Abonos y Fertilizantes:</strong> Compost orgánico 100% natural, humus de lombriz y biofertilizantes.</li>
                <li><strong>Ferretería & Herramientas:</strong> Machetes, azadones, palas, mangueras y herramientas agrícolas de alta resistencia.</li>
              </ul>

              <h3>4.2 Ficha de Producto y Perfil del Productor</h3>
              <p>
                Al hacer clic en cualquier producto, el cliente puede consultar su descripción completa, unidad de empaque (Kilos, bultos, unidades), origen exacto en los Montes de María, fotos reales y el enlace a la finca del campesino que lo cosechó.
              </p>

              <h3>4.3 Carrito de Compras Persistente & Cupones de Descuento</h3>
              <div className="legal-highlight-card">
                <p>
                  <strong>Gestión del Carrito:</strong> Puedes ajustar cantidades en tiempo real con los botones (+) y (-) o eliminar productos. Tu carrito se guarda automáticamente en tu navegador para que no pierdas tu selección si cierras la pestaña.
                </p>
                <p>
                  <strong>¿Tienes un Cupón de Descuento?</strong> En la barra promocional superior o en el resumen del pedido puedes ingresar códigos promocionales (ej. <code>BIENVENIDO</code> o cupones de temporada) para aplicar descuentos porcentuales o montos fijos en tu compra.
                </p>
              </div>

              <h3>4.4 Checkout Seguro con Pago Contra Entrega</h3>
              <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8' }}>
                <li><strong>Paso 1 - Carrito:</strong> Revisa tus cosechas y presiona <em>"Proceder al Pago"</em>.</li>
                <li><strong>Paso 2 - Dirección de Entrega:</strong> Selecciona tu departamento, municipio, dirección exacta y datos de contacto. El sistema calculará el costo de envío correspondiente.</li>
                <li><strong>Paso 3 - Método de Pago:</strong> Selecciona <strong>Pago Contra Entrega (Efectivo)</strong>. Pagas con tranquilidad al recibir las cosechas en tu puerta o negocio.</li>
                <li><strong>Verificación OTP Requerida:</strong> Para evitar pedidos falsos y autorizar el despacho legal, la plataforma enviará un código de verificación de 6 dígitos a tu correo electrónico. Ingrésalo en la ventana emergente para finalizar.</li>
                <li><strong>Factura Electrónica Inmediata:</strong> Al confirmar, el sistema genera de forma instantánea tu comprobante oficial en PDF con código QR y desglose detallado de ítems y flete.</li>
              </ol>
            </section>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

            {/* SECCIÓN 5 */}
            <section id="productor" className="legal-section">
              <h2>5. Uso de la Plataforma como Productor Campesino</h2>

              <h3>5.1 Acceso al Centro de Ventas Agropecuarias</h3>
              <p>
                Los agricultores y emprendedores de los Montes de María cuentan con un espacio exclusivo accesible desde la barra superior en <Link to="/vendedor">Vender en la Plataforma</Link> o desde el menú de usuario.
              </p>

              <h3>5.2 Perfil de la Finca & Marca Personal</h3>
              <p>
                Cada productor dispone de una vitrina digital pública donde puede:
              </p>
              <ul>
                <li>Subir la foto de portada de su finca o parcela agrícola.</li>
                <li>Redactar su historia campesina, tradición de cultivo y años de experiencia.</li>
                <li>Indicar su vereda o municipio de procedencia (El Carmen de Bolívar, San Jacinto, San Juan Nepomuceno, etc.).</li>
                <li>Vincular su número de WhatsApp oficial para atender clientes de manera directa.</li>
              </ul>

              <h3>5.3 Publicación y Control de Inventario</h3>
              <div className="legal-highlight-card">
                <strong>¿Cómo registrar un nuevo producto?</strong>
                <ol style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', fontSize: '0.92rem' }}>
                  <li>Haz clic en el botón verde <strong>"+ Publicar Nuevo Producto"</strong> en tu panel de ventas.</li>
                  <li>Ingresa el nombre de la cosecha o insumo, selecciona la categoría correspondiente y asigna el precio en pesos colombianos (COP).</li>
                  <li>Establece el stock disponible en bodega o cosecha lista para recolección.</li>
                  <li>Selecciona la unidad de medida (Kilogramo, Libra, Bulto, Unidad) y describe las bondades y frescura del producto.</li>
                  <li>Sube fotos nítidas del producto y presiona <strong>"Publicar Producto"</strong>. El artículo aparecerá de inmediato en el catálogo público nacional.</li>
                </ol>
              </div>
            </section>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

            {/* SECCIÓN 6 */}
            <section id="soporte" className="legal-section">
              <h2>6. Atención al Cliente, Soporte & Bot de Telegram</h2>

              <h3>6.1 Centro de Ayuda Web en Tiempo Real</h3>
              <p>
                Al ingresar a <Link to="/soporte">/soporte</Link>, tanto clientes como productores pueden abrir solicitudes de atención (tickets) categorizados en: <em>Dudas sobre pedidos, Entregas, Pagos, Problemas técnicos o Consultas sobre cosechas</em>.
              </p>
              <p>
                El chat opera con tecnología <strong>WebSockets (Socket.io)</strong>, garantizando que los mensajes se entreguen de manera instantánea y sin recargar la página.
              </p>

              <h3>6.2 AgroAsistente Virtual con Inteligencia Artificial</h3>
              <p>
                Integrado en la esquina inferior de toda la plataforma, el <strong>AgroAsistente</strong> responde preguntas sobre:
              </p>
              <ul>
                <li>Variedades de tubérculos locales (ñame diamante, criollo, espino; yuca costeña; plátano hartón).</li>
                <li>Recomendaciones de siembra, cuidados y dosis de abonos orgánicos.</li>
                <li>Cálculo de cobertura de envíos y adición de productos al carrito con 1 solo clic.</li>
              </ul>

              <h3>6.3 Integración Oficial con Telegram (@montesdemariabot)</h3>
              <div className="legal-highlight-card" style={{ borderLeft: '4px solid #229ED9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <i className="fab fa-telegram" style={{ color: '#229ED9', fontSize: '1.4rem' }} />
                  <strong>Atención Móvil en 1 Clic para Administradores y Campesinos</strong>
                </div>
                <p>
                  Cuando un cliente envía un mensaje en el sitio web, el bot de Telegram <strong>@montesdemariabot</strong> notifica inmediatamente en los teléfonos del equipo de soporte.
                </p>
                <p style={{ margin: 0 }}>
                  Los agentes pueden responder directamente dentro de Telegram utilizando el formato <code>/responder [ID_TICKET] [Mensaje]</code> y el texto aparecerá al instante en la pantalla del cliente en la web.
                </p>
              </div>
            </section>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

            {/* SECCIÓN 7 */}
            <section id="admin" className="legal-section">
              <h2>7. Administración de la Plataforma (/admin)</h2>
              <p>
                El perfil de Administrador cuenta con un centro de control integral para supervisar la salud del ecosistema:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <strong><i className="fa fa-chart-line text-success" /> Dashboard & Estadísticas:</strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
                    Métricas de ingresos brutos en COP, total de pedidos despachados, usuarios registrados y gráficos mensuales de comportamiento comercial.
                  </p>
                </div>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <strong><i className="fa fa-users-cog text-primary" /> Gestión de Usuarios y Roles:</strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
                    Asignación y cambio de roles (Comprador, Vendedor Campesino, Soporte Técnico, Administrador) y auditoría de cuentas activas.
                  </p>
                </div>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <strong><i className="fa fa-images text-warning" /> Carrusel Hero & Banners:</strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
                    Editor visual en tiempo real de diapositivas de inicio: selección de fondos, desenfoque (blur), tinte de contraste, títulos y enlaces CTA.
                  </p>
                </div>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <strong><i className="fa fa-tags text-danger" /> Cupones & Promociones:</strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
                    Creación de códigos promocionales, límites de usos, fechas de vencimiento y activación dinámica en la marquesina superior de la tienda.
                  </p>
                </div>
              </div>
            </section>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

            {/* SECCIÓN 8 */}
            <section id="referencias" className="legal-section">
              <h2>8. Referencias Documentales & Seguridad Digital</h2>
              <div className="legal-highlight-card">
                <p>
                  <strong>Plataforma Oficial en Producción:</strong>{' '}
                  <a href="https://delosmontesdemaria.dev" target="_blank" rel="noreferrer">
                    https://delosmontesdemaria.dev
                  </a>
                </p>
                <p>
                  <strong>Repositorio Oficial del Código Fuente:</strong>{' '}
                  <a href="https://github.com/Danx016/delosmontesdemaria" target="_blank" rel="noreferrer">
                    https://github.com/Danx016/delosmontesdemaria
                  </a>
                </p>
                <p>
                  <strong>Estándares de Seguridad Digital Aplicados:</strong>
                </p>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', fontSize: '0.88rem' }}>
                  <li>
                    <strong>OWASP Foundation:</strong> <em>Multifactor Authentication (MFA) & One-Time Password (OTP) Cheat Sheet</em> para la protección de transacciones.
                  </li>
                  <li>
                    <strong>NIST SP 800-63B-4:</strong> <em>Digital Identity Guidelines: Authentication and Authenticator Management</em> para el almacenamiento seguro de credenciales con hashing bcrypt y control de sesiones.
                  </li>
                </ul>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
