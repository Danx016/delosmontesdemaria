# 🌾 Arquitectura Hexagonal — De los Montes de María

Este documento describe la arquitectura de software de la plataforma **De los Montes de María**, implementada bajo el patrón **Arquitectura Hexagonal (Ports & Adapters)** propuesto por *Alistair Cockburn* y guiada por los principios del **Diseño Guiado por el Dominio (DDD)** y **Clean Architecture**.

---

## 📐 Diagrama Arquitectónico Oficial

<p align="center">
  <img src="./arquitectura_hexagonal.png" alt="Arquitectura Hexagonal - De los Montes de María" width="100%" />
</p>

> 💡 **Formato vectorial disponible:** Puedes descargar o visualizar la versión SVG en alta fidelidad en [`arquitectura_hexagonal.svg`](./arquitectura_hexagonal.svg).

---

## 🎯 Capas Concéntricas del Hexágono

### 1. 🟡 Núcleo de Dominio (Domain Core) — Centro
El corazón del sistema. Es **100% agnóstico e independiente** de frameworks, bases de datos o librerías externas. Contiene únicamente las reglas de negocio puras.

- **Entidades de Negocio:**
  - `Usuario`: Gestión de perfiles campesinos, clientes y administradores.
  - `Producto`: Cosechas, precios, stock, unidad de medida y fincas de origen.
  - `Compra` & `ItemCompra`: Órdenes transaccionales, subtotales, método de pago y estados.
  - `Cupon`: Reglas de descuento (porcentaje o valor fijo), límites de uso y fechas.
  - `Direccion`: Cobertura geográfica y domicilios en Montes de María y Colombia.
  - `Shipment`: Envíos, guías de rastreo y estados logísticos de cosechas.
  - `SoporteTicket`: Tickets de atención multicanal y calificaciones.
  - `MensajeChat`: Mensajes en tiempo real sincronizados con WebSockets.
  - `Banner`: Banners promocionales dinámicos para el home.
  - `Categoria`: Clasificación de cosechas (Tubérculos, Lácteos, Semillas, etc.).
  - `TokenRecuperacion`: Tokens criptográficos de 6 dígitos para validación OTP.

- **Eventos de Dominio:**
  - `OrderCreated`: Disparado al confirmarse un nuevo pedido.
  - `StockLowAlert`: Notifica cuando el inventario de una cosecha baja de 5 unidades.
  - `TicketEscalated`: Escala un chat del bot de IA a un agente humano en Telegram.
  - `PaymentVerified`: Confirma el cobro y entrega satisfactoria en efectivo de la orden.

- **Puertos de Repositorios (Interfaces de Persistencia):**
  - `UsuarioRepositoryPort`, `ProductoRepositoryPort`, `CompraRepositoryPort`, `ShipmentRepositoryPort`, `SoporteRepositoryPort`, `CouponRepositoryPort`, `BannerRepositoryPort`, etc.

- **Puertos de Servicios Externos (Interfaces I/O):**
  - `AIServicePort`, `EmailServicePort`, `PaymentServicePort`, `TelegramServicePort`, `WhatsAppServicePort`, `GoogleAuthServicePort`.

---

### 2. 🔴 Capa de Aplicación (Application Layer) — Intermedia
Contiene los **Casos de Uso (Use Cases)**. Orquesta el flujo de datos entre las entidades de dominio y coordina las operaciones a través de los puertos.

- **Autenticación & Cuentas:**
  - `LoginUser`, `RegisterUser`, `GoogleAuthUser`, `ResetPassword`, `RequestPasswordReset`.
- **Usuarios & Perfiles:**
  - `GetUserProfile`, `UpdateProfile`, `ManageAddresses`, `DeleteAccount`.
- **Catálogo & Cosechas:**
  - `CreateProduct`, `GetProducts`, `GetProductById`, `SearchProducts`, `UpdateProduct`, `DeleteProduct`.
- **Compras & Checkout:**
  - `ProcessPurchase`, `ValidarCuponUseCase`, `UpdateOrderStatus`, `GetPurchases`, `ConfirmDeliveryPayment`.
- **Logística Rural & Envíos:**
  - `CalculateShippingRate`, `CreateShipment`, `TrackShipment`, `UpdateShipmentStatus`.
- **Soporte & Asistente IA:**
  - `ProcessSupportAIChat`, `ProcessPublicAIChat`, `ProcessAdminAIChat`, `EscalateToAgent`.
- **Administración:**
  - `GetAdminStats`, `ManageUsersAdmin`, `ObtenerBannersUseCase`.

---

### 3. 🔵 Capa de Infraestructura (Infrastructure Layer) — Exterior
Implementa todos los adaptadores técnicos y conectores que comunican la aplicación con el exterior:

#### 🎮 Adaptadores Primarios / Driving (Entrada)
- **Controladores HTTP Express:**
  `AuthController`, `ProductoController`, `CompraController`, `LogisticsController`, `SoporteController`, `AdminController`, `ChatController`, `BannerController`, `UsuarioController`.
- **Middlewares de Seguridad:**
  `auth.js` (validación JWT), `csrf.js`, `rateLimiter.js` (protección DDoS/fuerza bruta), `validate.js` (express-validator), `upload.js` (Multer con filtrado MIME).
- **WebSockets en Tiempo Real:**
  `SocketHandler.js` impulsado por Socket.io para soporte y sincronización instantánea.

#### 🔌 Adaptadores Secundarios / Driven (Salida)
- **Persistencia (EntityManager):**
  `Database.js` (Connection Pool SSL con `mysql2/promise`), `MySQLUsuarioRepository`, `MySQLProductoRepository`, `MySQLCompraRepository` (Transacciones ACID), `MySQLShipmentRepository`, `MySQLChatRepository`, `MySQLSoporteRepository`, etc.
- **Notificaciones & Mensajería (MailAdapter):**
  - `EmailService.js`: Integración con Gmail SMTP (Nodemailer 465 SSL) para envío de facturas PDF con código QR y validación OTP.
  - `TelegramService.js`: Bot oficial (`@montesdemariabot`) con notificaciones 1-click y atención al cliente.
  - `WhatsAppService.js`: Integración con Meta Cloud API.
- **Pasarelas & Servicios Externos (RestClient):**
  - `PaymentService.js`: Orquestación y registro de Pago Contra Entrega (Cash on Delivery - COD) en efectivo.
  - `IAService.js`: Modelos de Inteligencia Artificial (Groq LLaMA 3.3 70B & OpenRouter).
  - `GoogleAuthService.js`: Cliente OAuth 2.0 de Google.
- **Message Broker & Event Bus (RabbitMQAdapter):**
  - Redis Streams & Pub/Sub con grupos de consumidores, colas de mensajes fallidos (*Dead Letter Queue - DLQ*) y circuit breakers para máxima resiliencia.

---

## 🌐 Conexiones con el Mundo Exterior

1. **⬆️ HTTP / HTTPS:** Navegadores Web (React 18 SPA + Vite + PWA), Clientes Móviles y Panel Administrativo `/admin`.
2. **↗️ SQL:** Base de datos relacional MySQL 8.0 en clúster con transacciones seguras ACID y codificación `utf8mb4_unicode_ci`.
3. **↘️ SMTP & Notificaciones:** Servidores de correo Gmail SMTP (Nodemailer), Telegram Bot API y WhatsApp Business.
4. **↙️ Rest API:** Modelos de lenguaje en la nube (Groq Cloud LLaMA 3.3, OpenRouter) y Google Identity OAuth 2.0.
5. **↖️ Message Broker:** Redis Enterprise Bus para eventos asíncronos en segundo plano y Socket.io para salas de comunicación bidireccional.
