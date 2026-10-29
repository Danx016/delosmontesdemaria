# 🌾 Diagramas Técnicos del Sistema — De los Montes de María

Colección oficial de especificaciones arquitectónicas, modelos de interacción, topología de componentes y flujos de secuencia transaccionales de la plataforma **De los Montes de María**. Todos los diagramas han sido elaborados en formato nativo **Mermaid** y validados contra la implementación real del código fuente del backend y frontend.

---

## 📑 Índice de Diagramas
1. [Diagrama de Casos de Uso del Sistema](#1-diagrama-de-casos-de-uso-del-sistema)
2. [Diagrama de Componentes e Integraciones](#2-diagrama-de-componentes-e-integraciones)
3. [Diagrama de Secuencia del Proceso de Compra con Validación OTP](#3-diagrama-de-secuencia-del-proceso-de-compra-con-validación-otp)
4. [Topología de Infraestructura y Microservicios](#4-topología-de-infraestructura-y-microservicios)
5. [Arquitectura Hexagonal (Ports & Adapters)](#5-arquitectura-hexagonal-ports--adapters)
6. [Diagrama de Secuencia: Inversión de Control (DIP)](#6-diagrama-de-secuencia-inversión-de-control-dip)
7. [Diagrama de Secuencia: Soporte Multicanal en Tiempo Real](#7-diagrama-de-secuencia-soporte-multicanal-en-tiempo-real)
8. [Diagrama de Flujo: Tolerancia a Fallos y Dead Letter Queue (DLQ)](#8-diagrama-de-flujo-tolerancia-a-fallos-y-dead-letter-queue-dlq)
9. [Diagrama de Estados: Ciclo de Vida de una Orden](#9-diagrama-de-estados-ciclo-de-vida-de-una-orden)
10. [Diagrama de Estados: Ciclo de Vida de un Ticket de Soporte](#10-diagrama-de-estados-ciclo-de-vida-de-un-ticket-de-soporte)
11. [Diagrama de Clases y Roles del Sistema](#11-diagrama-de-clases-y-roles-del-sistema)
12. [Diagrama Entidad-Relación (ERD) Completo de Base de Datos MySQL](#12-diagrama-entidad-relación-erd-completo-de-base-de-datos-mysql)
13. [Diagrama de Flujo: Pipeline CI/CD y Despliegue](#13-diagrama-de-flujo-pipeline-cicd-y-despliegue)
14. [Diagrama de Seguridad y Autenticación (JWT + Google OAuth 2.0)](#14-diagrama-de-seguridad-y-autenticación-jwt--google-oauth-20)

---

## 1. Diagrama de Casos de Uso del Sistema

Este diagrama formaliza las interacciones principales entre los actores del ecosistema (**Cliente/Comprador**, **Productor Campesino/Vendedor**, **Asesor de Soporte**, **Administrador** y los **Sistemas Externos**) y los diferentes subsistemas de la plataforma.

```mermaid
flowchart LR
    %% Actores
    Cliente["👤 Cliente / Comprador"]
    Productor["🌾 Productor Campesino"]
    Admin["👑 Administrador"]
    Asesor["🎧 Asesor de Soporte"]
    
    subgraph Subsistema_Auth ["Seguridad & Cuentas"]
        UC_Reg(["Registrar cuenta"])
        UC_Login(["Iniciar sesión (JWT / Google)"])
        UC_OTP_Recup(["Recuperar contraseña vía OTP"])
    end

    subgraph Subsistema_Catalogo ["Catálogo & Comercio Campesino"]
        UC_Explorar(["Explorar catálogo y filtros"])
        UC_Buscar(["Búsqueda predictiva"])
        UC_PerfilCamp(["Ver perfil de campesino/finca"])
        UC_Publicar(["Publicar / editar cosecha"])
        UC_Stock(["Controlar inventario y stock"])
    end

    subgraph Subsistema_Compras ["Compras, Checkout & Facturación"]
        UC_Carrito(["Gestionar carrito persistente"])
        UC_Cupon(["Aplicar cupón promocional"])
        UC_SolOTP(["Solicitar código OTP de seguridad"])
        UC_VerifOTP(["Verificar código OTP (6 dígitos)"])
        UC_Confirmar(["Confirmar pedido (Pago Contra Entrega / Wompi)"])
        UC_Factura(["Descargar factura legal PDF con QR"])
    end

    subgraph Subsistema_Soporte ["Atención & AgroAsistente IA"]
        UC_ChatIA(["Consultar AgroAsistente IA (Groq LLM)"])
        UC_Escalar(["Solicitar transferencia a asesor humano"])
        UC_AtenderTG(["Atender ticket (Web / Telegram Bot)"])
        UC_Calificar(["Calificar atención recibida (1-5 estrellas)"])
    end

    subgraph Subsistema_Admin ["Administración & Auditoría"]
        UC_Metricas(["Visualizar métricas GMV e inventario"])
        UC_Banners(["Personalizar carrusel hero y banners"])
        UC_CuponesAdmin(["Crear y limitar cupones de descuento"])
        UC_Roles(["Asignar roles y permisos de acceso"])
        UC_Auditoria(["Auditar eventos y microservicios"])
    end

    %% Relaciones de Cliente
    Cliente --> UC_Reg
    Cliente --> UC_Login
    Cliente --> UC_OTP_Recup
    Cliente --> UC_Explorar
    Cliente --> UC_Buscar
    Cliente --> UC_PerfilCamp
    Cliente --> UC_Carrito
    Cliente --> UC_Cupon
    Cliente --> UC_SolOTP
    Cliente --> UC_VerifOTP
    Cliente --> UC_Confirmar
    Cliente --> UC_Factura
    Cliente --> UC_ChatIA
    Cliente --> UC_Escalar
    Cliente --> UC_Calificar

    %% Relaciones de Productor Campesino
    Productor --> UC_Login
    Productor --> UC_Publicar
    Productor --> UC_Stock
    Productor --> UC_Factura
    Productor --> UC_PerfilCamp

    %% Relaciones de Asesor de Soporte
    Asesor --> UC_Login
    Asesor --> UC_AtenderTG

    %% Relaciones de Administrador
    Admin --> UC_Login
    Admin --> UC_Metricas
    Admin --> UC_Banners
    Admin --> UC_CuponesAdmin
    Admin --> UC_Roles
    Admin --> UC_Auditoria
    Admin --> UC_AtenderTG

    %% Relaciones de Inclusión y Extensión
    UC_Confirmar -.->|<<include>>| UC_VerifOTP
    UC_VerifOTP -.->|<<include>>| UC_SolOTP
    UC_Confirmar -.->|<<include>>| UC_Factura
    UC_Escalar -.->|<<extend>>| UC_ChatIA
```

---

## 2. Diagrama de Componentes e Integraciones

Representa la estructura modular física y lógica del software ajustada estrictamente a los mecanismos reales de integración presentes en el código (Axios REST, Context Providers, Express Routers, Controllers, Use Cases, Repositories, MySQL Pool, Redis Streams y servicios externos).

```mermaid
flowchart TB
    subgraph FRONTEND ["Capa de Presentación (Frontend React 18 SPA)"]
        direction TB
        UI_VIEWS["🖼️ Vistas UI (Pages: Home, Catalogo, Checkout, Admin, Soporte)"]
        CONTEXTS["🔄 React Contexts (AuthContext, CartContext, ToastContext)"]
        API_LAYER["🔌 Clientes API Axios (auth.api, compras.api, banners.api)"]
        WS_CLIENT["⚡ WebSocket Client (Socket.io-client / useSocket)"]
        UI_VIEWS --> CONTEXTS
        CONTEXTS --> API_LAYER
        UI_VIEWS --> WS_CLIENT
    end

    subgraph GATEWAY ["Capa de Entrada & API Gateway (:3000)"]
        NGINX["🛡️ Nginx Reverse Proxy (SSL / HTTPS :443)"]
        EXPRESS_GW["🌐 Express Server & Routing"]
        MIDDLEWARES["🛡️ Middlewares (verifyToken, express-validator, rateLimiter)"]
        NGINX --> EXPRESS_GW
        EXPRESS_GW --> MIDDLEWARES
    end

    subgraph DRIVING ["Adaptadores de Entrada (Driving Adapters)"]
        CTRL_COMPRA["🎮 CompraController.js"]
        CTRL_AUTH["🎮 AuthController.js"]
        CTRL_PROD["🎮 ProductoController.js"]
        CTRL_LOGIS["🎮 LogisticsController.js"]
        SOCK_HANDLER["⚡ SocketHandler.js (WebSockets)"]
    end

    subgraph APPLICATION ["Capa de Aplicación (Casos de Uso)"]
        UC_PROC_PURCHASE["📋 ProcessPurchase.js"]
        UC_LOGIN["📋 LoginUser.js"]
        UC_UPDATE_ORDER["📋 UpdateOrderStatus.js"]
        UC_SUPPORT["📋 SupportService.js"]
        UC_SHIPMENT["📋 CalculateShippingRate.js"]
    end

    subgraph DOMAIN ["Capa de Dominio (Domain Core)"]
        subgraph ENTIDADES ["Entidades Puras"]
            E_COMPRA["🛒 Compra"]
            E_ITEM["📦 ItemCompra"]
            E_PROD["🌾 Producto"]
            E_USER["👤 Usuario"]
            E_CUPON["🏷️ Cupon"]
        end
        subgraph PUERTOS ["Puertos de Salida (Outbound Ports)"]
            P_COMPRA["🔌 CompraRepositoryPort"]
            P_PROD["🔌 ProductoRepositoryPort"]
            P_TOKEN["🔌 TokenRepositoryPort"]
            P_EMAIL["🔌 EmailServicePort"]
            P_TG["🔌 TelegramServicePort"]
            P_AI["🔌 AIServicePort"]
        end
    end

    subgraph DRIVEN ["Adaptadores de Salida (Driven Adapters)"]
        REPO_COMPRA["🗄️ MySQLCompraRepository.js"]
        REPO_PROD["🗄️ MySQLProductoRepository.js"]
        REPO_TOKEN["🗄️ MySQLTokenRepository.js (In-Memory Map + DB)"]
        SVC_EMAIL["📧 EmailService.js (Brevo API v3 / SMTP)"]
        SVC_TG["📱 TelegramService.js (Telegram Bot API)"]
        SVC_AI["🧠 IAService.js (Groq Cloud LLM / OpenRouter)"]
        DB_POOL["🏊 Database.js (MySQL Pool SSL utf8mb4)"]
    end

    subgraph EXTERNAL ["Infraestructura Externa & Cloud"]
        MYSQL_CLOUD[("🗄️ MySQL 8.0 Cloud Server")]
        REDIS_BUS[("⚡ Redis Streams & EventBus")]
        BREVO_API["✉️ Brevo Mail API HTTPS"]
        TG_API["🤖 Telegram Server API"]
        GROQ_API["⚡ Groq Cloud API (gpt-oss-120b)"]
        WOMPI_API["💳 Pasarela de Pago Wompi"]
    end

    %% Conexiones Frontend a Gateway
    API_LAYER -->|HTTPS / REST| NGINX
    WS_CLIENT -->|WSS / Socket.IO| NGINX

    %% Conexiones Gateway a Controllers
    MIDDLEWARES --> CTRL_COMPRA
    MIDDLEWARES --> CTRL_AUTH
    MIDDLEWARES --> CTRL_PROD
    MIDDLEWARES --> CTRL_LOGIS
    EXPRESS_GW --> SOCK_HANDLER

    %% Conexiones Controllers a Casos de Uso
    CTRL_COMPRA --> UC_PROC_PURCHASE
    CTRL_AUTH --> UC_LOGIN
    CTRL_COMPRA --> UC_UPDATE_ORDER
    SOCK_HANDLER --> UC_SUPPORT
    CTRL_LOGIS --> UC_SHIPMENT

    %% Casos de Uso a Dominio
    UC_PROC_PURCHASE --> E_COMPRA
    UC_PROC_PURCHASE --> E_ITEM
    UC_PROC_PURCHASE --> P_COMPRA
    UC_PROC_PURCHASE --> P_PROD
    CTRL_COMPRA --> P_TOKEN
    CTRL_COMPRA --> P_EMAIL
    CTRL_COMPRA --> P_TG

    %% Puertos a Adaptadores Driven
    P_COMPRA -.->|implementa| REPO_COMPRA
    P_PROD -.->|implementa| REPO_PROD
    P_TOKEN -.->|implementa| REPO_TOKEN
    P_EMAIL -.->|implementa| SVC_EMAIL
    P_TG -.->|implementa| SVC_TG
    P_AI -.->|implementa| SVC_AI

    %% Adaptadores Driven a Bases de Datos / APIs
    REPO_COMPRA --> DB_POOL
    REPO_PROD --> DB_POOL
    DB_POOL --> MYSQL_CLOUD
    SVC_EMAIL --> BREVO_API
    SVC_TG --> TG_API
    SVC_AI --> GROQ_API
    UC_PROC_PURCHASE -.->|Firma de Transacciones| WOMPI_API
    CTRL_COMPRA -.->|Publica eventos asíncronos| REDIS_BUS
```

---

## 3. Diagrama de Secuencia del Proceso de Compra con Validación OTP

Detalla el flujo lógico del proceso de compra implementado en [`CompraController.js`](file:///c:/Users/danil/Downloads/De%20los%20montesdemaria/src/infrastructure/adapters/driving/http/controllers/CompraController.js), [`ProcessPurchase.js`](file:///c:/Users/danil/Downloads/De%20los%20montesdemaria/src/application/use-cases/purchase/ProcessPurchase.js), [`MySQLCompraRepository.js`](file:///c:/Users/danil/Downloads/De%20los%20montesdemaria/src/infrastructure/adapters/driven/persistence/MySQLCompraRepository.js) y [`EmailService.js`](file:///c:/Users/danil/Downloads/De%20los%20montesdemaria/src/infrastructure/external-services/EmailService.js).

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 🛒 Comprador (Checkout Modal)
    participant React as 🖥️ Frontend (React 18 SPA)
    participant Ctrl as 🎮 CompraController.js
    participant TokenRepo as 🗄️ MySQLTokenRepository.js
    participant EmailSvc as 📧 EmailService.js
    participant Brevo as ✉️ Brevo API / SMTP
    participant UC as 📋 ProcessPurchase.js
    participant ProdRepo as 🗄️ MySQLProductoRepository.js
    participant CupRepo as 🗄️ CouponRepository.js
    participant CompraRepo as 🗄️ MySQLCompraRepository.js
    participant DB as 🏊 MySQL Database (Pool)
    participant TG as 📱 TelegramService.js (@montesdemariabot)

    %% ── FASE 1: SOLICITUD DE OTP ──
    Note over Cliente,Brevo: FASE 1: Solicitud y Emisión del Código OTP
    Cliente->>React: Hace clic en "Enviar Código de Confirmación"
    React->>Ctrl: POST /api/compra/enviar-otp { email, nombre, total }
    Ctrl->>Ctrl: Genera código criptográfico de 6 dígitos: Math.floor(100000 + Math.random()*900000)
    Ctrl->>TokenRepo: guardarOtp(targetEmail, code, 10 min)
    TokenRepo->>TokenRepo: Registra en memoria/BD con fecha de expiración (+10 minutos)
    Ctrl->>EmailSvc: sendPurchaseOtpEmail(targetEmail, nombre, code, total)
    EmailSvc->>Brevo: Despacha correo transaccional HTML con plantilla OTP
    Brevo-->>Cliente: Entrega código de 6 dígitos en bandeja de entrada
    Ctrl-->>React: HTTP 200 { success: true, message: "Código enviado a..." }
    React-->>Cliente: Habilita campo para ingresar código OTP

    %% ── FASE 2: VERIFICACIÓN DE OTP ──
    Note over Cliente,TokenRepo: FASE 2: Verificación del Código OTP
    Cliente->>React: Ingresa código OTP de 6 dígitos
    React->>Ctrl: POST /api/compra/verificar-otp { email, code }
    Ctrl->>TokenRepo: verificarOtp(targetEmail, code)
    alt Código inválido o expirado
        TokenRepo-->>Ctrl: { valid: false, message: "Código OTP inválido o expirado" }
        Ctrl-->>React: HTTP 400 { error: "Código OTP inválido o expirado" }
        React-->>Cliente: Muestra alerta de error en rojo
    else Código correcto y vigente
        TokenRepo->>TokenRepo: Consume el código (invalidation inmediata para un solo uso)
        TokenRepo-->>Ctrl: { valid: true }
        Ctrl-->>React: HTTP 200 { success: true, message: "Código verificado con éxito" }
        React-->>Cliente: Desbloquea botón "Finalizar Compra"
    end

    %% ── FASE 3: PERSISTENCIA TRANSACCIONAL ──
    Note over Cliente,DB: FASE 3: Persistencia Transaccional (ACID)
    Cliente->>React: Hace clic en "Confirmar y Pagar"
    React->>Ctrl: POST /api/compra { productos, total, metodoPago, direccion, cupon }
    Ctrl->>UC: execute({ userId, productos, metodoPago, direccion, cuponCodigo, shippingCost })
    
    loop Para cada producto en carrito
        UC->>ProdRepo: buscarPorId(idProducto)
        ProdRepo-->>UC: Retorna precio real y stock actual en catálogo
        UC->>UC: Valida integridad de precios y calcula subtotal oficial
    end

    opt Si incluye cupón promocional
        UC->>CupRepo: buscarPorCodigo(cuponCodigo)
        CupRepo-->>UC: Valida vigencia y calcula descuento (porcentaje o fijo)
        UC->>CupRepo: incrementarUso(cuponCodigo)
    end

    UC->>CompraRepo: crear({ id_usuario, total, metodo_pago, direccion_envio, productos })
    CompraRepo->>DB: conn.beginTransaction()
    CompraRepo->>DB: INSERT INTO compras (id_usuario, total, metodo_pago, direccion_envio, estado)
    DB-->>CompraRepo: Retorna insertId (id_compra generado: #1085)
    
    loop Para cada producto comprado
        CompraRepo->>DB: INSERT INTO compra_detalles (id_compra, id_producto, cantidad, precio_unitario)
        CompraRepo->>DB: UPDATE productos SET stock = CASE WHEN stock - ? < 0 THEN 0 ELSE stock - ? END
    end

    CompraRepo->>DB: conn.commit()
    CompraRepo-->>UC: Retorna objeto Compra persistido con ID
    UC-->>Ctrl: Retorna DTO { compraCreada, finalTotal, shippingAddress }
    Ctrl-->>React: HTTP 201 Created { id_compra: 1085, total: 95000, mensaje: "Compra registrada con éxito" }
    React-->>Cliente: Muestra modal de compra exitosa y botón de descarga de recibo

    %% ── FASE 4: ACCIONES ASÍNCRONAS POST-COMPRA ──
    Note over Ctrl,TG: FASE 4: Tareas Asíncronas en Segundo Plano (setImmediate)
    par Despacho de Factura Electrónica
        Ctrl->>CompraRepo: obtenerReciboCompleto(id_compra)
        CompraRepo-->>Ctrl: Retorna orden con datos de ítems, cliente y campesinos
        Ctrl->>EmailSvc: sendInvoiceEmail(recibo, buyerEmail)
        EmailSvc->>Brevo: Envía factura legal en PDF con código QR y desglose
        Brevo-->>Cliente: Recibe factura electrónica oficial
    and Alerta a Administradores en Telegram
        Ctrl->>TG: notificarNuevaCompra({ compra, usuario, productos, total, metodoPago })
        TG-->>TG: Publica mensaje detallado con botones en canal de administración
    and Control de Stock Crítico
        opt Si stock_restante <= 5 unidades
            Ctrl->>TG: notificarStockBajo({ producto, stockRestante })
            TG-->>TG: Alerta de reabastecimiento urgente
        end
    end
```

---

## 4. Topología de Infraestructura y Microservicios

```mermaid
flowchart TB
    Client["💻 Clientes Web & Móvil (React 18 SPA)"]
    Nginx["🔒 Nginx Reverse Proxy (SSL / HTTPS :443)"]
    Gateway["🌐 API Gateway Central Enterprise (:3000)\n• Inyección X-Correlation-ID\n• Circuit Breakers Activos\n• Proxy Inverso Resiliente\n• Servido de SPA"]

    subgraph Microservicios ["Ecosistema de Microservicios Autónomos (PM2 Cluster)"]
        Auth["🔐 Auth Service (:3001)\nBD: db_auth\n• JWT • OAuth 2.0 • Roles"]
        Catalog["📦 Catalog Service (:3002)\nBD: db_catalog\n• Caché Redis • Inventario"]
        Order["💳 Order Service (:3003)\nBD: db_orders\n• Checkout COD • Wompi • OTP"]
        Support["🤖 AI Support Service (:3004)\nBD: db_support\n• WebSockets • LLM Groq / OpenRouter"]
        Notif["📢 Notification Service (:3005)\nWorker Asíncrono\n• Telegram Bot • WhatsApp • Brevo"]
        Logistics["🚚 Logistics Service (:3006)\nBD: db_logistics\n• Fletes Rurales • Tracking"]
    end

    RedisBus[("⚡ Bus de Eventos & Caché (Redis Enterprise)\n• Pub/Sub en Tiempo Real\n• Redis Streams con Consumer Groups\n• Dead Letter Queue (DLQ)\n• Service Discovery & Heartbeats")]

    subgraph DBCluster ["Bases de Datos MySQL 8.0 (utf8mb4_unicode_ci)"]
        DB_AUTH[("db_auth")]
        DB_CAT[("db_catalog")]
        DB_ORD[("db_orders")]
        DB_SUP[("db_support")]
        DB_LOG[("db_logistics")]
    end

    Client -->|HTTPS / WSS| Nginx
    Nginx -->|Proxy :3000| Gateway

    Gateway -->|Proxy /api/auth| Auth
    Gateway -->|Proxy /api/productos| Catalog
    Gateway -->|Proxy /api/compras| Order
    Gateway -->|Proxy /api/chat & /socket.io| Support
    Gateway -->|Proxy /api/telegram| Notif
    Gateway -->|Proxy /api/logistics| Logistics

    Auth --> DB_AUTH
    Catalog --> DB_CAT
    Order --> DB_ORD
    Support --> DB_SUP
    Logistics --> DB_LOG

    Order -.->|Publica: ORDER_CREATED| RedisBus
    RedisBus -.->|cg:catalog -> Actualiza Stock| Catalog
    RedisBus -.->|cg:auth -> Cashback Puntos| Auth
    RedisBus -.->|cg:notifications -> Telegram / Email| Notif
    RedisBus -.->|cg:logistics -> Genera Guía| Logistics
```

---

## 5. Arquitectura Hexagonal (Ports & Adapters)
 
<p align="center">
  <img src="docs/arquitectura/arquitectura_hexagonal.png" alt="Arquitectura Hexagonal (Ports &amp; Adapters) - De los Montes de María" width="100%" />
</p>
<p align="center"><em>Topología hexagonal concéntrica: Núcleo de Dominio (Amarillo), Capa de Aplicación / Casos de Uso (Salmón), e Infraestructura de Adaptadores (Azul) con protocolos externos (HTTP, SQL, SMTP, Rest API, Message Broker).</em></p>

```mermaid
flowchart TD
    subgraph EXTERIOR ["Mundo Exterior (Actores & Clientes)"]
        CLIENT_WEB["🌐 Navegador Web / PWA (React 18)"]
        TG_USER["🤖 Bot Telegram (@montesdemariabot)"]
        ADMIN_CLI["👨‍💼 Panel de Control Administrativo (/admin)"]
    end

    subgraph DRIVING_ADAPTERS ["1. ADAPTADORES PRIMARIOS / DRIVING (Inbound)"]
        direction TB
        CTRL_AUTH["🎮 AuthController.js"]
        CTRL_PROD["🎮 ProductoController.js"]
        CTRL_COMP["🎮 CompraController.js"]
        CTRL_LOGI["🎮 LogisticsController.js"]
        WS_SOCK["⚡ SocketHandler.js (WebSockets)"]
        MID_AUTH["🛡️ Middlewares (auth.js, validate.js, rateLimiter.js)"]
    end

    subgraph APPLICATION_LAYER ["2. CAPA DE APLICACIÓN (Casos de Uso)"]
        direction TB
        UC_AUTH["📋 Casos de Uso: LoginUser, RegisterUser, GoogleAuthUser, ResetPassword"]
        UC_PROD["📋 Casos de Uso: CreateProduct, GetProducts, UpdateProduct, SearchProducts"]
        UC_COMP["📋 Casos de Uso: ProcessPurchase, VerifyOTP, ApplyCoupon, GenerateInvoice"]
        UC_LOGI["📋 Casos de Uso: CalculateShippingRate, CreateShipment, TrackShipment"]
        UC_SOPO["📋 Casos de Uso: ProcessSupportAIChat, EscalateToHumanAgent"]
    end

    subgraph DOMAIN_CORE ["3. NÚCLEO DE DOMINIO (Domain Core)"]
        direction TB
        subgraph ENTITIES ["Entidades Puras de Negocio"]
            E_USER["👤 Usuario"]
            E_PROD["🌾 Producto"]
            E_COMP["🛒 Compra"]
            E_ITEM["📦 ItemCompra"]
            E_CUPON["🏷️ Cupon"]
            E_DIR["📍 Direccion"]
            E_SHIP["🚚 Shipment"]
            E_TICK["🎫 SoporteTicket"]
        end
        subgraph PORTS_OUT ["Puertos de Salida (Contratos / Interfaces)"]
            P_REPO_U["🔌 UsuarioRepositoryPort"]
            P_REPO_P["🔌 ProductoRepositoryPort"]
            P_REPO_C["🔌 CompraRepositoryPort"]
            P_REPO_S["🔌 ShipmentRepositoryPort"]
            P_SVC_AI["🔌 AIServicePort"]
            P_SVC_EM["🔌 EmailServicePort"]
            P_SVC_WA["🔌 WhatsAppServicePort"]
            P_SVC_TG["🔌 TelegramServicePort"]
            P_SVC_PAY["🔌 PaymentServicePort"]
        end
    end

    subgraph DRIVEN_ADAPTERS ["4. ADAPTADORES SECUNDARIOS / DRIVEN (Outbound)"]
        direction TB
        subgraph PERSISTENCIA ["Persistencia MySQL"]
            M_REPO_U["🗄️ MySQLUsuarioRepository.js"]
            M_REPO_P["🗄️ MySQLProductoRepository.js"]
            M_REPO_C["🗄️ MySQLCompraRepository.js"]
            M_REPO_S["🗄️ MySQLShipmentRepository.js"]
            DB_POOL["🏊 Database.js (Connection Pool SSL)"]
        end
        subgraph SERVICIOS_EXTERNOS ["Servicios Externos & APIs"]
            EXT_AI["🧠 IAService.js (Groq / OpenRouter)"]
            EXT_EM["📧 EmailService.js (Brevo API / Nodemailer)"]
            EXT_WA["💬 WhatsAppService.js (Meta Cloud API)"]
            EXT_TG["📱 TelegramService.js (Bot API)"]
            EXT_PAY["💳 PaymentService.js (Wompi)"]
        end
    end

    EXTERIOR --> DRIVING_ADAPTERS
    DRIVING_ADAPTERS --> APPLICATION_LAYER
    APPLICATION_LAYER --> ENTITIES
    APPLICATION_LAYER --> PORTS_OUT
    PORTS_OUT -.->|Implementa| PERSISTENCIA
    PORTS_OUT -.->|Implementa| SERVICIOS_EXTERNOS
```

---

## 6. Diagrama de Secuencia: Inversión de Control (DIP)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 🛒 Comprador (Frontend React)
    participant Ctrl as 🎮 CompraController (Driving Adapter)
    participant UC as 📋 ProcessPurchase (Use Case)
    participant Entity as 🛒 Compra & ItemCompra (Domain Entity)
    participant Port as 🔌 CompraRepositoryPort (Outbound Port)
    participant Repo as 🗄️ MySQLCompraRepository (Driven Adapter)
    participant DB as 🏊 Database Pool (MySQL)
    participant NotifPort as 🔌 EmailServicePort (Outbound Port)
    participant EmailAdp as 📧 EmailService (Driven Adapter)

    Note over Ctrl,DB: 1. ENTRADA HTTP
    Cliente->>Ctrl: POST /api/compra (Body: items, direccion, cupon)
    Ctrl->>Ctrl: Extrae token JWT, valida schema con validate.js
    
    Note over Ctrl,UC: 2. CAPA DE APLICACIÓN
    Ctrl->>UC: execute({ idUsuario, items, direccion, cupon })
    
    Note over UC,Entity: 3. LÓGICA DE NEGOCIO PURA
    UC->>Entity: new Compra({ idUsuario, items, direccion })
    Entity->>Entity: calcularTotales(), validarStockMinimo()
    
    Note over UC,Port: 4. INVERSIÓN DE DEPENDENCIAS (DIP)
    UC->>Port: save(compra)
    Port->>Repo: save(compra)
    Repo->>DB: Iniciar Transacción SQL (INSERT compras, INSERT compra_detalles)
    DB-->>Repo: Commit Transacción (id_compra generado: #1085)
    Repo-->>UC: Retorna objeto Compra persistido
    
    Note over UC,NotifPort: 5. NOTIFICACIÓN DESACOPLADA
    UC->>NotifPort: sendPurchaseConfirmation(compra, pdfBuffer)
    NotifPort->>EmailAdp: sendMail({ to: cliente.correo, subject: "Factura" })
    EmailAdp-->>UC: Confirmación de despacho (messageId)
    
    Note over UC,Cliente: 6. RESPUESTA AL CLIENTE
    UC-->>Ctrl: Retorna DTO con id_compra, total y factura_url
    Ctrl-->>Cliente: 201 Created { success: true, id_compra: 1085, factura_url: "..." }
```

---

## 7. Diagrama de Secuencia: Soporte Multicanal en Tiempo Real

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 👤 Cliente en Tienda
    participant Widget as 💬 Widget Chat Web
    participant Socket as 🔌 AI Support Service (:3004)
    participant IA as ⚡ Groq Cloud LLM (gpt-oss-120b)
    actor Asesor as 👨‍💼 Asesor / Admin
    participant TG as 📱 Bot Telegram (@montesdemariabot)

    Cliente->>Widget: Escribe: "¿Qué variedad de ñame tienen y a cómo el kilo?"
    Widget->>Socket: Socket.emit('chat_message') { ticket_id, mensaje }
    Socket->>IA: Procesa consulta con catálogo agrícola actualizado
    IA-->>Socket: "Tenemos Ñame Espino a $3.500/kg cosechado en San Jacinto..."
    Socket-->>Widget: Muestra respuesta instantánea de la IA (< 500 ms)

    Cliente->>Widget: Escribe: "Quiero hablar con un asesor humano por favor"
    Widget->>Socket: Socket.emit('request_human_agent')
    Socket->>Socket: Actualiza estado del ticket a 'agente'
    Socket->>TG: Webhook HTTPS: Alerta con botón interactivo [💬 Responder]
    TG-->>Asesor: Notificación push en Telegram

    Asesor->>TG: Pulsa [💬 Responder] o responde por Swipe
    TG->>Socket: Webhook POST /api/telegram/webhook con el mensaje
    Socket->>Widget: Socket.emit('agent_message')
    Widget-->>Cliente: Visualiza la respuesta del asesor en tiempo real

    Asesor->>TG: Pulsa [🔒 Cerrar Ticket]
    TG->>Socket: Webhook POST: Cierre de ticket
    Socket-->>Widget: Socket.emit('ticket_closed') con formulario de calificación (1-5 estrellas)
```

---

## 8. Diagrama de Flujo: Tolerancia a Fallos y Dead Letter Queue (DLQ)

```mermaid
flowchart TD
    Start([⚡ Evento Publicado en Redis Stream]) --> Consumer[Worker Consumer Group lee evento]
    Consumer --> Process{¿Procesamiento exitoso?}
    Process -- Sí --> ACK[XACK al Stream: Evento Confirmado] --> EndSuccess([✅ Fin del Proceso])
    Process -- No --> ErrorCheck{¿Intentos < 3?}
    ErrorCheck -- Sí --> Backoff[Exponential Backoff: Reintentar tras 2s, 4s, 8s] --> Consumer
    ErrorCheck -- No --> DLQ[XADD stream:dlq\n• Payload original\n• Traza del error\n• Timestamp y Reintentos]
    DLQ --> AlertTG[Alerta a Telegram de Administradores: Error Crítico]
    AlertTG --> AdminPanel[Panel /admin/microservicios: Permite Reintento Manual o Auditoría]
    AdminPanel --> EndDLQ([⚠️ Evento Aislado en DLQ])
```

---

## 9. Diagrama de Estados: Ciclo de Vida de una Orden

```mermaid
stateDiagram-v2
    [*] --> CarritoActivo : Agrega productos
    CarritoActivo --> EsperandoOTP : Hace clic en Checkout
    EsperandoOTP --> OTPVerificado : Ingresa código válido
    EsperandoOTP --> CarritoActivo : Cancela o OTP expira
    OTPVerificado --> Creada : Orden registrada (Pago Contra Entrega / Wompi)
    Creada --> EnPreparacion : Campesino / Administrador confirma disponibilidad
    EnPreparacion --> EnCamino : Logistics Service genera guía de despacho
    EnCamino --> Entregada : Cliente recibe pedido y paga en efectivo (COD)
    EnCamino --> Devolucion : Dirección no encontrada o rechazo
    Creada --> Cancelada : Solicitud del usuario o falta de stock
    Devolucion --> Cancelada
    Entregada --> [*]
    Cancelada --> [*]
```

---

## 10. Diagrama de Estados: Ciclo de Vida de un Ticket de Soporte

```mermaid
stateDiagram-v2
    [*] --> BotIA : Cliente inicia chat en el widget
    BotIA --> BotIA : IA responde inquietudes de cosechas y catálogo
    BotIA --> EsperandoAgente : Cliente solicita asesor humano
    EsperandoAgente --> AtendidoPorAgente : Asesor toma el ticket desde Web o Telegram
    AtendidoPorAgente --> AtendidoPorAgente : Mensajes bidireccionales en tiempo real
    AtendidoPorAgente --> Resuelto : Asesor marca como solucionado
    Resuelto --> Calificado : Cliente califica atención (1-5 estrellas)
    Calificado --> Cerrado : Ticket archivado
    Resuelto --> Cerrado : Cierre automático por inactividad
    Cerrado --> [*]
```

---

## 11. Diagrama de Clases y Roles del Sistema

```mermaid
classDiagram
    class Usuario {
        +int id_usuario
        +string nombre
        +string correo
        +string telefono
        +int id_rol
        +decimal creditos
        +verCatalogo()
        +filtrarCosechas()
        +verProductores()
    }

    class Cliente {
        +string direccion
        +string ciudad
        +agregarAlCarrito()
        +aplicarCupon()
        +verificarOTP()
        +descargarFacturaPDF()
        +chatearConIAYSoporte()
    }

    class ProductorCampesino {
        +string foto_finca
        +string biografia
        +publicarCosecha()
        +actualizarStock()
        +verPerfilFinca()
        +consultarVentasEnTelegram()
    }

    class Administrador {
        +accederPanelAdmin()
        +gestionarBannersHero()
        +crearCupones()
        +cambiarRoles()
        +cerrarTicketsSoporte()
        +auditarMicroservicios()
    }

    class Producto {
        +int id_producto
        +string nombre
        +decimal precio
        +int stock
        +string categoria
        +string origen
        +validarStock(cantidad)
        +descontarStock(cantidad)
    }

    class Compra {
        +int id_compra
        +decimal total
        +string metodo_pago
        +string estado
        +calcularSubtotal()
        +aplicarDescuento(cupon)
    }

    class Cupon {
        +string codigo
        +string tipo_descuento
        +decimal valor_descuento
        +validarVigencia()
    }

    Usuario <|-- Cliente
    Usuario <|-- ProductorCampesino
    Usuario <|-- Administrador
    Cliente "1" --> "*" Compra : realiza
    Compra "1" --> "*" Producto : incluye
    Compra "*" --> "0..1" Cupon : aplica
    ProductorCampesino "1" --> "*" Producto : cultiva
```

---

## 12. Diagrama Entidad-Relación (ERD) Completo de Base de Datos MySQL

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : "asigna perfil"
    USUARIOS ||--o{ PRODUCTOS : "publica como vendedor"
    USUARIOS ||--o{ COMPRAS : "realiza pedidos"
    USUARIOS ||--o{ DIRECCIONES : "registra ubicaciones"
    USUARIOS ||--o{ PRODUCTO_RESENAS : "escribe resenas"
    USUARIOS ||--o{ SOPORTE_TICKETS : "crea tickets"
    USUARIOS ||--o| TELEGRAM_SESIONES : "vincula chat_id"
    CATEGORIAS ||--o{ PRODUCTOS : "clasifica productos"
    PROVEEDORES ||--o{ PRODUCTOS : "suministra productos"
    COMPRAS ||--|{ DETALLE_COMPRAS : "contiene items"
    PRODUCTOS ||--o{ DETALLE_COMPRAS : "referencia en items"
    PRODUCTOS ||--o{ PRODUCTO_RESENAS : "recibe calificaciones"
    CUPONES ||--o{ COMPRAS : "aplica descuento"
    SOPORTE_TICKETS ||--|{ MENSAJES_SOPORTE : "contiene mensajes"
    SOPORTE_TICKETS ||--o| SOPORTE_CALIFICACIONES : "recibe calificacion"

    ROLES {
        int id_rol PK
        string nombre_rol
        string descripcion
    }

    USUARIOS {
        int id_usuario PK
        string nombre
        string apodo
        string correo
        string telefono
        string direccion
        string contrasena
        int id_rol FK
        string avatar
        string foto_portada
        decimal creditos
        string google_id
        string estado
    }

    CATEGORIAS {
        int id_categoria PK
        string nombre
        string slug
        string icono
    }

    PRODUCTOS {
        int id_producto PK
        string nombre
        text descripcion
        decimal precio
        int stock
        string categoria
        int id_categoria FK
        string imagen
        int id_vendedor FK
        string origen
        string presentacion
        boolean destacado
        string estado
    }

    COMPRAS {
        int id_compra PK
        int id_usuario FK
        decimal total
        string metodo_pago
        string estado
        string direccion_envio
        string ciudad
        string departamento
        string telefono_contacto
        string codigo_cupon
        decimal descuento_aplicado
        datetime fecha
    }

    DETALLE_COMPRAS {
        int id_detalle PK
        int id_compra FK
        int id_producto FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
    }

    CUPONES {
        int id_cupon PK
        string codigo
        string tipo_descuento
        decimal valor_descuento
        decimal monto_minimo
        int limite_usos
        int usos_actuales
        datetime fecha_expiracion
        boolean activo
    }

    SOPORTE_TICKETS {
        int id PK
        string ticket_code
        string session_id
        int id_usuario FK
        string nombre_cliente
        string correo_cliente
        string telefono_cliente
        string asunto
        string estado
        int id_agente
        string nombre_agente
    }

    MENSAJES_SOPORTE {
        int id PK
        int ticket_id FK
        string session_id
        int id_usuario FK
        string nombre_remitente
        string rol
        text mensaje
        datetime created_at
    }

    SOPORTE_CALIFICACIONES {
        int id PK
        int ticket_id FK
        int calificacion
        text comentario
        datetime created_at
    }

    TELEGRAM_SESIONES {
        int id PK
        int id_usuario FK
        string telegram_chat_id
        string estado
        datetime fecha_vinculacion
    }

    DIRECCIONES {
        int id_direccion PK
        int id_usuario FK
        string direccion
        string ciudad
        string departamento
        string barrio
        string notas
    }
```

---

## 13. Diagrama de Flujo: Pipeline CI/CD y Despliegue

```mermaid
flowchart LR
    Dev([👨‍💻 Desarrollador]) -->|git push origin main| GH[🐙 Repositorio GitHub]

    subgraph GHA ["GitHub Actions Pipeline (.github/workflows/deploy.yml)"]
        direction TB
        LintTest["🧪 Tests & Linters\n• npm audit\n• Node.js 18.x Tests"]
        BuildFrontend["📦 Build Frontend SPA\n• Vite 5 Build\n• Asset Optimization"]
        DeployTrigger["🚀 SSH Deploy Script\n• Conexión segura SSH con claves"]
        LintTest --> BuildFrontend --> DeployTrigger
    end

    GH --> GHA

    subgraph Server ["Servidor de Producción (Oracle Cloud Ubuntu)"]
        direction TB
        GitPull["📥 git pull origin main"]
        BuildClient["🔨 npm run build (client)"]
        ReloadPM2["🔄 pm2 reload all --update-env\n• Zero-Downtime Reload"]
        NginxReload["🛡️ Nginx Reverse Proxy\n• SSL Let's Encrypt\n• Servido de Assets"]
        GitPull --> BuildClient --> ReloadPM2 --> NginxReload
    end

    DeployTrigger -->|SSH Command| Server
    NginxReload --> ProdWeb([🌐 delosmontesdemaria.dev Online])
```

---

## 14. Diagrama de Seguridad y Autenticación (JWT + Google OAuth 2.0)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 👤 Usuario
    participant React as 🖥️ Frontend (React 18)
    participant Gateway as 🚪 API Gateway (:3000)
    participant AuthSvc as 🔐 Auth Service (:3001)
    participant Google as 🌐 Google OAuth 2.0
    participant DB as 🗄️ MySQL (db_auth)

    alt Autenticación Tradicional (Correo y Contraseña)
        Cliente->>React: Ingresa credenciales
        React->>Gateway: POST /api/auth/login { correo, contrasena }
        Gateway->>AuthSvc: Proxy a Auth Service
        AuthSvc->>DB: Consulta usuario por correo
        DB-->>AuthSvc: Retorna hash bcrypt
        AuthSvc->>AuthSvc: Valida bcrypt.compare(contrasena, hash)
        AuthSvc->>AuthSvc: Genera JWT (HMAC-SHA256, exp: 24h)
        AuthSvc-->>React: Set-Cookie HttpOnly + JSON { user, token }
        React-->>Cliente: Redirecciona al Dashboard / Home
    else Autenticación Federada con Google OAuth 2.0
        Cliente->>React: Clic en "Continuar con Google"
        React->>Google: Abre popup / flujo Google Identity
        Google-->>React: Retorna Google ID Token (Credential)
        React->>Gateway: POST /api/auth/google { credential }
        Gateway->>AuthSvc: Proxy a Auth Service
        AuthSvc->>Google: Verifica firma criptográfica del ID Token
        Google-->>AuthSvc: Token verificado { email, name, sub }
        AuthSvc->>DB: Busca o crea usuario por google_id / correo
        AuthSvc->>AuthSvc: Emite JWT de sesión
        AuthSvc-->>React: Cookie HttpOnly + JSON { user, token }
        React-->>Cliente: Sesión iniciada automáticamente
    end
```
