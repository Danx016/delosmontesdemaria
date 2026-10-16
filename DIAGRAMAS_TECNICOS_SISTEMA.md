# 🌾 Diagramas Técnicos del Sistema — De los Montes de María

Colección integral de diagramas arquitectónicos, flujos de secuencia, modelos de datos y procesos de la plataforma **De los Montes de María**. Todos los diagramas están especificados en formato nativo **Mermaid** para su renderizado directo en GitHub.

---

## 1. Alcance Funcional del Sistema

```mermaid
mindmap
  root((De los Montes de María))
    Tienda y Catalogo Frontend
      Catalogo React 18 SPA
      Filtros por Categoria y Municipio
      Perfiles Publicos de Campesinos
      Buscador Predictivo en Tiempo Real
      Carrito Reactivo con Cupones
    Ecosistema de Microservicios
      API Gateway Central :3000
      Auth & User Service :3001
      Catalog Service :3002
      Order & Payment Service :3003
      AI Support Service :3004
      Notification Service :3005
      Logistics Service :3006
    Checkout y Pasarelas
      Pago Contra Entrega COD
      Verificacion de Seguridad por OTP
      Facturacion Electronica PDF con QR
      Calculadora de Fletes Rurales
      Pasarela Wompi
    Soporte Multicanal e IA
      Chat WebSockets en Tiempo Real
      Groq Cloud LLM gpt-oss-120b
      OpenRouter IA Backup
      Bot Oficial Telegram @montesdemariabot
      WhatsApp Business Cloud API
    Infraestructura y DevOps
      Cluster PM2 Zero Downtime
      Nginx Reverse Proxy con SSL
      Redis Streams y PubSub
      MySQL 8.0 Cloud utf8mb4
      GitHub Actions CI CD Pipeline
```

---

## 2. Topología de Infraestructura y Microservicios

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

## 3. Arquitectura Hexagonal (Ports & Adapters / DDD)

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

## 4. Diagrama de Secuencia: Inversión de Control y Flujo Interno (DIP)

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

## 5. Diagrama de Secuencia: Checkout Asíncrono con Redis Streams y OTP

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 🛒 Comprador
    participant React as 🖥️ Frontend (React 18)
    participant Gateway as 🚪 API Gateway (:3000)
    participant OrderSvc as 💳 Order Service (:3003)
    participant EventBus as ⚡ Redis Streams (stream:orders)
    participant NotifSvc as 📢 Notification Service (:3005)
    participant CatalogSvc as 📦 Catalog Service (:3002)
    participant AuthSvc as 🔐 Auth Service (:3001)
    participant TG as 📱 Telegram Bot (@montesdemariabot)

    Cliente->>React: Completa datos y hace clic en "Confirmar Pedido"
    React->>Gateway: POST /api/compra/enviar-otp { email, total }
    Gateway->>OrderSvc: Enruta petición con X-Correlation-ID
    OrderSvc->>OrderSvc: Genera código OTP de 6 dígitos (10 min validez)
    OrderSvc->>NotifSvc: Solicita envío de código de seguridad
    NotifSvc-->>Cliente: Correo con plantilla HTML y código OTP
    OrderSvc-->>React: 200 OK (Código enviado)

    Cliente->>React: Ingresa código OTP de 6 dígitos
    React->>Gateway: POST /api/compra/confirmar { otp, items, direccion }
    Gateway->>OrderSvc: Valida OTP criptográfico y registra orden
    OrderSvc->>OrderSvc: Guarda orden en db_orders
    OrderSvc->>EventBus: XADD stream:orders (ORDER_CREATED, items, total)
    OrderSvc-->>React: 201 Created (Confirmación inmediata en 0.15s)
    React-->>Cliente: Pantalla de Éxito y Descarga de Factura PDF con QR

    par Procesamiento Asíncrono Desacoplado (Consumer Groups)
        EventBus->>CatalogSvc: cg:catalog lee ORDER_CREATED
        CatalogSvc->>CatalogSvc: Descuenta stock en db_catalog e invalida caché
        CatalogSvc->>EventBus: XACK stream:orders
    and Notificaciones Multicanal
        EventBus->>NotifSvc: cg:notifications lee ORDER_CREATED
        NotifSvc->>TG: Envía alerta a Administradores (Nueva Venta en COP)
        NotifSvc-->>Cliente: Despacha Factura Electrónica en PDF con QR
        NotifSvc->>EventBus: XACK stream:orders
    and Programa de Fidelización
        EventBus->>AuthSvc: cg:auth lee ORDER_CREATED
        AuthSvc->>AuthSvc: Acredita cashback / puntos al usuario
        AuthSvc->>EventBus: XACK stream:orders
    end
```

---

## 6. Diagrama de Secuencia: Soporte Multicanal en Tiempo Real (IA -> Humano -> Telegram)

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

## 7. Diagrama de Flujo: Tolerancia a Fallos y Dead Letter Queue (DLQ)

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

## 8. Diagrama de Estados: Ciclo de Vida de una Orden de Compra

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

## 9. Diagrama de Estados: Ciclo de Vida de un Ticket de Soporte

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

## 10. Diagrama de Clases: Modelo de Dominio y Roles del Sistema

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

## 11. Diagrama Entidad-Relación (ERD) Completo de Base de Datos MySQL

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

## 12. Diagrama de Flujo: Pipeline CI/CD y Despliegue Automatizado

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

## 13. Diagrama de Seguridad y Autenticación (JWT + Google OAuth 2.0)

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
