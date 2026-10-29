const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2200 1750" width="100%" height="100%">
  <defs>
    <style>
      * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      
      .font-mono {
        font-family: 'Consolas', 'Courier New', monospace;
      }

      /* Flechas gruesas estilo diagrama de arquitectura */
      .arrow-line {
        stroke: #0f172a;
        stroke-width: 4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Títulos de capas */
      .layer-title-outer {
        font-size: 34px;
        font-weight: 900;
        fill: #000000;
        letter-spacing: 0.5px;
      }

      .layer-title-mid {
        font-size: 30px;
        font-weight: 900;
        fill: #000000;
        letter-spacing: 0.5px;
      }

      .layer-title-core {
        font-size: 38px;
        font-weight: 900;
        fill: #000000;
        letter-spacing: 0.8px;
      }

      /* Títulos de sección en capas */
      .section-heading-lg {
        font-size: 22px;
        font-weight: 800;
        fill: #0f172a;
      }

      .section-heading-md {
        font-size: 18px;
        font-weight: 800;
        fill: #0f172a;
      }

      .section-heading-sm {
        font-size: 15px;
        font-weight: 800;
        fill: #1e293b;
      }

      /* Texto de elementos */
      .item-text {
        font-size: 12px;
        font-weight: 600;
        fill: #1e293b;
      }
      
      .item-subtext {
        font-size: 11px;
        font-weight: 500;
        fill: #475569;
      }

      /* Bloques externos */
      .ext-title {
        font-size: 26px;
        font-weight: 900;
        fill: #000000;
      }
      
      .ext-box-title {
        font-size: 15px;
        font-weight: 800;
        fill: #0f172a;
      }

      .ext-box-desc {
        font-size: 12px;
        font-weight: 500;
        fill: #334155;
      }
    </style>

    <!-- Marcadores de flechas idénticos al diagrama -->
    <marker id="arrow-head-end" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto">
      <path d="M 2 2 L 10 6 L 2 10 z" fill="#000000" />
    </marker>
    <marker id="arrow-head-start" viewBox="0 0 12 12" refX="2" refY="6" markerWidth="9" markerHeight="9" orient="auto">
      <path d="M 10 2 L 2 6 L 10 10 z" fill="#000000" />
    </marker>

    <!-- Degradado suave de fondo del canvas -->
    <linearGradient id="canvas-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>

    <!-- Colores oficiales del diagrama hexagonal -->
    <!-- 1. Capa Exterior: Azul Pastel (#BFE3F7 / #B8DCF5) -->
    <linearGradient id="outer-hex-color" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C6E5FB" />
      <stop offset="100%" stop-color="#B3DAF8" />
    </linearGradient>

    <!-- 2. Capa Media: Salmón / Coral Pastel (#FBC5B8 / #F8B3A2) -->
    <linearGradient id="mid-hex-color" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDC9BD" />
      <stop offset="100%" stop-color="#F8AEA0" />
    </linearGradient>

    <!-- 3. Núcleo: Amarillo Pastel (#FFF2B2 / #FEE685) -->
    <linearGradient id="core-hex-color" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3B8" />
      <stop offset="100%" stop-color="#FEEA94" />
    </linearGradient>
  </defs>

  <!-- Fondo General -->
  <rect width="2200" height="1750" fill="url(#canvas-bg)" />

  <!-- ENCABEZADO SUPERIOR DEL PROYECTO -->
  <g transform="translate(100, 35)">
    <rect x="0" y="0" width="2000" height="65" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
    <circle cx="36" cy="32" r="18" fill="#16a34a" />
    <text x="36" y="39" font-size="20" text-anchor="middle" fill="#ffffff">🌾</text>
    <text x="68" y="30" font-size="20" font-weight="900" fill="#0f172a">DE LOS MONTES DE MARÍA — ARQUITECTURA HEXAGONAL (PORTS &amp; ADAPTERS)</text>
    <text x="68" y="49" font-size="12.5" font-weight="600" fill="#64748b">Especificación Arquitectónica Oficial • Patrón Alistair Cockburn • DDD (Domain-Driven Design) • Clean Architecture</text>
    
    <rect x="1730" y="16" width="245" height="32" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1" />
    <text x="1852" y="37" font-size="11.5" font-weight="700" fill="#334155" text-anchor="middle">v2.0 • Sistema en Producción</text>
  </g>

  <!-- ============================================================== -->
  <!-- 1. HEXÁGONO EXTERIOR: INFRAESTRUCTURA (Azul Pastel)            -->
  <!-- ============================================================== -->
  <!-- Vértices Outer (R=640, cx=1100, cy=920):
       Top-Right: (1420, 365.7)
       Top-Left:  (780, 365.7)
       Left:      (460, 920)
       Bottom-L:  (780, 1474.3)
       Bottom-R:  (1420, 1474.3)
       Right:     (1740, 920)
  -->
  <g>
    <polygon points="1420,365.7 780,365.7 460,920 780,1474.3 1420,1474.3 1740,920"
             fill="url(#outer-hex-color)" stroke="#000000" stroke-width="3" stroke-linejoin="round" />
  </g>

  <!-- ============================================================== -->
  <!-- 2. HEXÁGONO MEDIO: APLICACIÓN (Salmón / Coral Pastel)           -->
  <!-- ============================================================== -->
  <!-- Vértices Mid (R=440, cx=1100, cy=920):
       Top-Right: (1320, 539)
       Top-Left:  (880, 539)
       Left:      (660, 920)
       Bottom-L:  (880, 1301)
       Bottom-R:  (1320, 1301)
       Right:     (1540, 920)
  -->
  <g>
    <polygon points="1320,539 880,539 660,920 880,1301 1320,1301 1540,920"
             fill="url(#mid-hex-color)" stroke="#000000" stroke-width="3" stroke-linejoin="round" />
  </g>

  <!-- ============================================================== -->
  <!-- 3. HEXÁGONO NÚCLEO: DOMINIO (Amarillo Pastel)                  -->
  <!-- ============================================================== -->
  <!-- Vértices Core (R=250, cx=1100, cy=920):
       Top-Right: (1225, 703.5)
       Top-Left:  (975, 703.5)
       Left:      (850, 920)
       Bottom-L:  (975, 1136.5)
       Bottom-R:  (1225, 1136.5)
       Right:     (1350, 920)
  -->
  <g>
    <polygon points="1225,703.5 975,703.5 850,920 975,1136.5 1225,1136.5 1350,920"
             fill="url(#core-hex-color)" stroke="#000000" stroke-width="3" stroke-linejoin="round" />
  </g>

  <!-- ============================================================== -->
  <!-- CONTENIDO: CAPA DE INFRAESTRUCTURA (Azul Pastel)              -->
  <!-- ============================================================== -->
  
  <!-- Título Oficial de la Capa (Abajo) -->
  <text x="1100" y="1415" class="layer-title-outer" text-anchor="middle">Infraestructura</text>
  <text x="1100" y="1438" font-size="13" font-weight="700" fill="#0369a1" text-anchor="middle">Capa de Adaptadores Técnicos Primarios (Driving) &amp; Secundarios (Driven)</text>

  <!-- SECTOR SUPERIOR: CONTROLADORES (Igual al diagrama de referencia) -->
  <g transform="translate(1100, 395)">
    <text x="0" y="0" class="section-heading-lg" text-anchor="middle">Controladores</text>
    <rect x="-350" y="10" width="700" height="98" rx="10" fill="#ffffff" fill-opacity="0.9" stroke="#0284c7" stroke-width="1.2" />
    
    <text x="0" y="32" font-size="12" font-weight="800" fill="#0369a1" text-anchor="middle">Controladores HTTP Express (Driving Adapters):</text>
    <text x="0" y="52" class="item-text" text-anchor="middle">AuthController • ProductoController • CompraController • LogisticsController</text>
    <text x="0" y="69" class="item-text" text-anchor="middle">SoporteController • AdminController • ChatController • BannerController • UsuarioController</text>
    <line x1="-330" y1="78" x2="330" y2="78" stroke="#cbd5e1" stroke-width="1" />
    <text x="0" y="94" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Middlewares: auth.js (JWT) • csrf.js • rateLimiter.js • validate.js • upload.js (Multer)</text>
  </g>

  <!-- SECTOR ARRIBA-DERECHA: ENTITYMANAGER / PERSISTENCIA (Igual al diagrama) -->
  <g transform="translate(1450, 570)">
    <text x="0" y="0" class="section-heading-md" text-anchor="start">EntityManager</text>
    <text x="0" y="18" font-size="11" font-weight="800" fill="#0369a1" text-anchor="start">(Persistencia MySQL 8.0)</text>
    
    <rect x="-5" y="26" width="215" height="152" rx="8" fill="#ffffff" fill-opacity="0.95" stroke="#0284c7" stroke-width="1.2" />
    <text x="10" y="46" font-size="11" font-weight="700" fill="#0f172a">Database.js (Pool SSL)</text>
    <line x1="10" y1="53" x2="200" y2="53" stroke="#e2e8f0" stroke-width="1" />
    <text x="10" y="68" class="item-text">• MySQLUsuarioRepository</text>
    <text x="10" y="83" class="item-text">• MySQLProductoRepository</text>
    <text x="10" y="98" class="item-text">• MySQLCompraRepository (ACID)</text>
    <text x="10" y="113" class="item-text">• MySQLShipmentRepository</text>
    <text x="10" y="128" class="item-text">• MySQLChatRepository</text>
    <text x="10" y="143" class="item-text">• MySQLSoporteRepository</text>
    <text x="10" y="158" class="item-text">• MySQLCoupon &amp; BannerRepo</text>
  </g>

  <!-- SECTOR ABAJO-DERECHA: MAILADAPTER (Igual al diagrama) -->
  <g transform="translate(1450, 1140)">
    <text x="0" y="0" class="section-heading-md" text-anchor="start">MailAdapter</text>
    <text x="0" y="18" font-size="11" font-weight="800" fill="#0369a1" text-anchor="start">(Notificaciones &amp; Mensajería)</text>
    
    <rect x="-5" y="26" width="215" height="120" rx="8" fill="#ffffff" fill-opacity="0.95" stroke="#0284c7" stroke-width="1.2" />
    <text x="10" y="46" font-size="11.5" font-weight="800" fill="#0f172a">📧 EmailService.js</text>
    <text x="10" y="61" font-size="10" font-weight="500" fill="#475569">Gmail SMTP &amp; Nodemailer (SSL)</text>
    <text x="10" y="74" font-size="9.5" font-weight="600" fill="#0284c7">Facturas PDF con QR &amp; OTP</text>
    <line x1="10" y1="82" x2="200" y2="82" stroke="#e2e8f0" stroke-width="1" />
    <text x="10" y="99" font-size="11" font-weight="700" fill="#0f172a">📱 TelegramService.js (@bot)</text>
    <text x="10" y="115" font-size="11" font-weight="700" fill="#0f172a">💬 WhatsAppService (Meta Cloud)</text>
  </g>

  <!-- SECTOR ABAJO-IZQUIERDA: RESTCLIENT (Igual al diagrama) -->
  <g transform="translate(750, 1140)">
    <text x="0" y="0" class="section-heading-md" text-anchor="end">RestClient</text>
    <text x="0" y="18" font-size="11" font-weight="800" fill="#0369a1" text-anchor="end">(Pasarelas &amp; APIs Externas)</text>
    
    <rect x="-210" y="26" width="210" height="120" rx="8" fill="#ffffff" fill-opacity="0.95" stroke="#0284c7" stroke-width="1.2" />
    <text x="-195" y="46" font-size="11.5" font-weight="800" fill="#0f172a">💵 PaymentService.js</text>
    <text x="-195" y="61" font-size="10" font-weight="500" fill="#475569">Pago Contra Entrega (Efectivo)</text>
    <line x1="-195" y1="69" x2="-10" y2="69" stroke="#e2e8f0" stroke-width="1" />
    <text x="-195" y="85" font-size="11.5" font-weight="800" fill="#0f172a">🧠 IAService.js</text>
    <text x="-195" y="100" font-size="10" font-weight="500" fill="#475569">Groq (LLaMA 3.3) &amp; OpenRouter</text>
    <line x1="-195" y1="108" x2="-10" y2="108" stroke="#e2e8f0" stroke-width="1" />
    <text x="-195" y="125" font-size="11" font-weight="700" fill="#0f172a">🔑 GoogleAuthService (OAuth 2.0)</text>
  </g>

  <!-- SECTOR ARRIBA-IZQUIERDA: RABBITMQADAPTER / BROKER (Igual al diagrama) -->
  <g transform="translate(750, 570)">
    <text x="0" y="0" class="section-heading-md" text-anchor="end">RabbitMQAdapter</text>
    <text x="0" y="18" font-size="11" font-weight="800" fill="#0369a1" text-anchor="end">(Broker Redis &amp; WebSockets)</text>
    
    <rect x="-210" y="26" width="210" height="142" rx="8" fill="#ffffff" fill-opacity="0.95" stroke="#0284c7" stroke-width="1.2" />
    <text x="-195" y="46" font-size="11.5" font-weight="800" fill="#0f172a">⚡ Redis Streams &amp; Pub/Sub</text>
    <text x="-195" y="61" font-size="9.5" font-weight="600" fill="#0284c7">ioredis Connection Manager</text>
    <line x1="-195" y1="69" x2="-10" y2="69" stroke="#e2e8f0" stroke-width="1" />
    <text x="-195" y="85" font-size="11.5" font-weight="800" fill="#0f172a">🔌 SocketHandler.js</text>
    <text x="-195" y="100" font-size="10" font-weight="500" fill="#475569">Socket.io (:3004) Tiempo Real</text>
    <line x1="-195" y1="108" x2="-10" y2="108" stroke="#e2e8f0" stroke-width="1" />
    <text x="-195" y="123" class="item-subtext">• Consumer Groups &amp; DLQ</text>
    <text x="-195" y="137" class="item-subtext">• Circuit Breakers &amp; Retry</text>
    <text x="-195" y="151" class="item-subtext">• Sincronización Web-Telegram</text>
  </g>


  <!-- ============================================================== -->
  <!-- CONTENIDO: CAPA DE APLICACIÓN (Salmón / Coral Pastel)          -->
  <!-- ============================================================== -->
  
  <!-- Título Oficial de la Capa (Abajo) -->
  <text x="1100" y="1255" class="layer-title-mid" text-anchor="middle">Aplicación</text>
  <text x="1100" y="1275" font-size="11.5" font-weight="700" fill="#9f1239" text-anchor="middle">Orquestación de Reglas de Negocio &amp; Casos de Uso del Sistema</text>

  <!-- Título de Casos de Uso (Arriba) -->
  <text x="1100" y="572" class="section-heading-lg" text-anchor="middle">Casos de uso</text>

  <!-- Módulos de Casos de Uso -->
  <g transform="translate(1100, 582)">
    <!-- Sub-bloque 1: Auth & Catálogo (Centro-Arriba) -->
    <rect x="-210" y="5" width="420" height="75" rx="8" fill="#ffffff" fill-opacity="0.9" stroke="#fda4af" stroke-width="1.2" />
    <text x="-195" y="24" font-size="11" font-weight="800" fill="#9f1239">🔐 Auth &amp; Cuentas:</text>
    <text x="-80" y="24" class="item-text">LoginUser • RegisterUser • GoogleAuthUser • ResetPassword</text>
    <text x="-195" y="42" font-size="11" font-weight="800" fill="#9f1239">🌾 Catálogo:</text>
    <text x="-120" y="42" class="item-text">CreateProduct • GetProducts • SearchProducts • UpdateProduct</text>
    <text x="-195" y="60" font-size="11" font-weight="800" fill="#9f1239">🛒 Compras:</text>
    <text x="-125" y="60" class="item-text">ProcessPurchase • VerifyOTP • Pago Contra Entrega • Cupones</text>
  </g>

  <!-- Sub-bloque Izquierda: Logística Rural & Usuarios -->
  <g transform="translate(775, 810)">
    <rect x="-85" y="0" width="150" height="135" rx="8" fill="#ffffff" fill-opacity="0.95" stroke="#fda4af" stroke-width="1.2" />
    <text x="-75" y="18" font-size="10.5" font-weight="800" fill="#9f1239">🚚 Logística Rural:</text>
    <text x="-75" y="34" font-size="10" font-weight="600" fill="#1e293b">• CalculateShipping</text>
    <text x="-75" y="49" font-size="10" font-weight="600" fill="#1e293b">• CreateShipment</text>
    <text x="-75" y="64" font-size="10" font-weight="600" fill="#1e293b">• TrackShipment</text>
    <text x="-75" y="79" font-size="10" font-weight="600" fill="#1e293b">• UpdateStatus</text>
    <line x1="-75" y1="87" x2="55" y2="87" stroke="#e2e8f0" stroke-width="1" />
    <text x="-75" y="103" font-size="10.5" font-weight="800" fill="#9f1239">👤 Usuarios:</text>
    <text x="-75" y="118" font-size="10" font-weight="600" fill="#1e293b">• GetUserProfile</text>
    <text x="-75" y="131" font-size="10" font-weight="600" fill="#1e293b">• ManageAddresses</text>
  </g>

  <!-- Sub-bloque Derecha: Soporte IA & Administración -->
  <g transform="translate(1425, 810)">
    <rect x="-65" y="0" width="150" height="135" rx="8" fill="#ffffff" fill-opacity="0.95" stroke="#fda4af" stroke-width="1.2" />
    <text x="-55" y="18" font-size="10.5" font-weight="800" fill="#9f1239">🤖 Soporte &amp; IA:</text>
    <text x="-55" y="34" font-size="10" font-weight="600" fill="#1e293b">• ProcessSupportAI</text>
    <text x="-55" y="49" font-size="10" font-weight="600" fill="#1e293b">• ProcessPublicAI</text>
    <text x="-55" y="64" font-size="10" font-weight="600" fill="#1e293b">• ProcessAdminAI</text>
    <text x="-55" y="79" font-size="10" font-weight="600" fill="#1e293b">• EscalateToAgent</text>
    <line x1="-55" y1="87" x2="75" y2="87" stroke="#e2e8f0" stroke-width="1" />
    <text x="-55" y="103" font-size="10.5" font-weight="800" fill="#9f1239">👑 Administración:</text>
    <text x="-55" y="118" font-size="10" font-weight="600" fill="#1e293b">• GetAdminStats</text>
    <text x="-55" y="131" font-size="10" font-weight="600" fill="#1e293b">• ManageUsersAdmin</text>
  </g>


  <!-- ============================================================== -->
  <!-- CONTENIDO: NÚCLEO DE DOMINIO (Amarillo Pastel)                -->
  <!-- ============================================================== -->
  
  <!-- 1. Entidades (Arriba en Dominio) -->
  <g transform="translate(1100, 742)">
    <text x="0" y="0" class="section-heading-md" text-anchor="middle">Entidades</text>
    <text x="0" y="18" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">Usuario • Producto • Compra • ItemCompra</text>
    <text x="0" y="33" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Cupon • Direccion • Shipment • SoporteTicket</text>
    <text x="0" y="48" font-size="10.5" font-weight="500" fill="#475569" text-anchor="middle">MensajeChat • Banner • Categoria • TokenRecuperacion</text>
  </g>

  <!-- 2. Eventos (Izquierda en Dominio) -->
  <g transform="translate(965, 855)">
    <text x="0" y="0" class="section-heading-sm" text-anchor="middle">Eventos</text>
    <text x="0" y="16" class="item-text" text-anchor="middle">OrderCreated</text>
    <text x="0" y="30" class="item-text" text-anchor="middle">StockLowAlert</text>
    <text x="0" y="44" class="item-text" text-anchor="middle">TicketEscalated</text>
    <text x="0" y="58" class="item-text" text-anchor="middle">PaymentVerified</text>
  </g>

  <!-- TÍTULO CENTRAL: DOMINIO -->
  <g transform="translate(1100, 915)">
    <text x="0" y="0" class="layer-title-core" text-anchor="middle">Dominio</text>
    <rect x="-80" y="8" width="160" height="18" rx="9" fill="#fef3c7" stroke="#d97706" stroke-width="1" />
    <text x="0" y="21" font-size="9.5" font-weight="800" fill="#b45309" text-anchor="middle">NÚCLEO PURO</text>
  </g>

  <!-- 3. Repositorios / Puertos (Abajo-Izquierda en Dominio) -->
  <g transform="translate(1005, 985)">
    <text x="0" y="0" class="section-heading-sm" text-anchor="middle">Repositorios</text>
    <text x="0" y="15" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">UsuarioRepository</text>
    <text x="0" y="27" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">ProductoRepository</text>
    <text x="0" y="39" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">CompraRepository</text>
    <text x="0" y="51" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">ShipmentRepository</text>
    <text x="0" y="63" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">SoporteRepository</text>
  </g>

  <!-- 4. Servicios / Puertos (Abajo-Derecha en Dominio) -->
  <g transform="translate(1195, 985)">
    <text x="0" y="0" class="section-heading-sm" text-anchor="middle">Servicios</text>
    <text x="0" y="15" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">AIServicePort</text>
    <text x="0" y="27" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">EmailServicePort</text>
    <text x="0" y="39" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">PaymentServicePort</text>
    <text x="0" y="51" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">TelegramServicePort</text>
    <text x="0" y="63" font-size="9.5" font-weight="600" fill="#334155" text-anchor="middle">WhatsAppServicePort</text>
  </g>


  <!-- ============================================================== -->
  <!-- 4. MUNDO EXTERIOR & FLECHAS (EXACTAMENTE IGUALES AL DIAGRAMA)  -->
  <!-- ============================================================== -->

  <!-- FLECHA 1: SUPERIOR -> HTTP -->
  <g id="ext-http">
    <line x1="1100" y1="365" x2="1100" y2="235" class="arrow-line" marker-end="url(#arrow-head-end)" />
    
    <g transform="translate(1100, 195)">
      <text x="0" y="0" class="ext-title" text-anchor="middle">HTTP</text>
      <rect x="-240" y="10" width="480" height="26" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2" />
      <text x="0" y="28" class="ext-box-desc" text-anchor="middle" font-weight="700">🌐 Frontend React 18 SPA (Vite + PWA) • Clientes Móviles • Panel Admin</text>
    </g>
  </g>

  <!-- FLECHA 2: ARRIBA-DERECHA -> SQL -->
  <g id="ext-sql">
    <!-- Flecha bidireccional igual a la de referencia -->
    <line x1="1420" y1="365" x2="1700" y2="210" class="arrow-line" marker-start="url(#arrow-head-start)" marker-end="url(#arrow-head-end)" />
    
    <g transform="translate(1720, 185)">
      <text x="0" y="0" class="ext-title" text-anchor="start">SQL</text>
      <rect x="-5" y="10" width="370" height="52" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2" />
      <text x="10" y="30" class="ext-box-title">🏊 MySQL 8.0 Enterprise Cluster</text>
      <text x="10" y="48" class="ext-box-desc">Transacciones ACID, Pool Conexiones SSL, utf8mb4_unicode_ci</text>
    </g>
  </g>

  <!-- FLECHA 3: ABAJO-DERECHA -> SMTP -->
  <g id="ext-smtp">
    <!-- Flecha hacia afuera -->
    <line x1="1420" y1="1474" x2="1700" y2="1620" class="arrow-line" marker-end="url(#arrow-head-end)" />
    
    <g transform="translate(1720, 1610)">
      <text x="0" y="0" class="ext-title" text-anchor="start">SMTP</text>
      <rect x="-5" y="10" width="370" height="52" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2" />
      <text x="10" y="30" class="ext-box-title">✉️ Gmail SMTP (Nodemailer) &amp; Telegram Bot API</text>
      <text x="10" y="48" class="ext-box-desc">Facturas PDF con QR, Códigos OTP, Alertas Admin &amp; WhatsApp</text>
    </g>
  </g>

  <!-- FLECHA 4: ABAJO-IZQUIERDA -> REST API -->
  <g id="ext-rest">
    <!-- Flecha bidireccional igual a la de referencia -->
    <line x1="780" y1="1474" x2="500" y2="1620" class="arrow-line" marker-start="url(#arrow-head-start)" marker-end="url(#arrow-head-end)" />
    
    <g transform="translate(480, 1610)">
      <text x="0" y="0" class="ext-title" text-anchor="end">Rest API</text>
      <rect x="-365" y="10" width="370" height="52" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2" />
      <text x="-15" y="30" class="ext-box-title" text-anchor="end">🧠 Groq Cloud IA • 🔑 Google Identity OAuth</text>
      <text x="-15" y="48" class="ext-box-desc" text-anchor="end">Inferencia LLaMA 3.3 70B, OpenRouter &amp; Google OAuth 2.0</text>
    </g>
  </g>

  <!-- FLECHA 5: ARRIBA-IZQUIERDA -> MESSAGE BROKER -->
  <g id="ext-broker">
    <!-- Flecha hacia afuera igual a la de referencia -->
    <line x1="780" y1="365" x2="500" y2="210" class="arrow-line" marker-end="url(#arrow-head-end)" />
    
    <g transform="translate(480, 185)">
      <text x="0" y="0" class="ext-title" text-anchor="end">Message broker</text>
      <rect x="-365" y="10" width="370" height="52" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2" />
      <text x="-15" y="30" class="ext-box-title" text-anchor="end">⚡ Redis Enterprise Bus &amp; Socket.io</text>
      <text x="-15" y="48" class="ext-box-desc" text-anchor="end">Pub/Sub, Redis Streams con Consumer Groups, DLQ y Sockets</text>
    </g>
  </g>

  <!-- PIE DE DIAGRAMA -->
  <g transform="translate(1100, 1720)">
    <text x="0" y="0" font-size="12.5" font-weight="600" fill="#64748b" text-anchor="middle">
      De los Montes de María © 2026 • Arquitectura Hexagonal Pura • Repositorio: https://github.com/Danx016/delosmontesdemaria
    </text>
  </g>
</svg>`;

async function run() {
  const outputPathDocsSvg = path.join(__dirname, '..', 'docs', 'arquitectura', 'arquitectura_hexagonal.svg');
  const outputPathPublicSvg = path.join(__dirname, '..', 'public', 'arquitectura_hexagonal.svg');
  const outputPathDocsPng = path.join(__dirname, '..', 'docs', 'arquitectura', 'arquitectura_hexagonal.png');
  const outputPathPublicPng = path.join(__dirname, '..', 'public', 'arquitectura_hexagonal.png');

  fs.writeFileSync(outputPathDocsSvg, svgContent, 'utf8');
  fs.writeFileSync(outputPathPublicSvg, svgContent, 'utf8');
  console.log('SVG generated at docs and public.');

  const svgBuffer = Buffer.from(svgContent, 'utf8');
  await sharp(svgBuffer)
    .png()
    .toFile(outputPathDocsPng);

  fs.copyFileSync(outputPathDocsPng, outputPathPublicPng);
  console.log('PNG generated at docs and public.');
}

run().catch(err => {
  console.error('Error generating diagrams:', err);
  process.exit(1);
});
