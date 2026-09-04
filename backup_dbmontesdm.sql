-- ========================================================
-- MIGRACIÓN BASE DE DATOS: DE LOS MONTES DE MARÍA
-- Origen: Oracle Cloud (149.130.189.158)
-- Destino: Servidor Propio (Localhost / Ubuntu Server)
-- Fecha de volcado: 2026-09-04T21:51:19.585Z
-- ========================================================

CREATE DATABASE IF NOT EXISTS `dbmontesdm` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dbmontesdm`;

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Estructura de tabla: `banners_hero`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `banners_hero`;
CREATE TABLE `banners_hero` (
  `id_banner` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitulo` text COLLATE utf8mb4_unicode_ci,
  `categoria_nombre` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_thumb` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen_fondo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_acento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '#22c55e',
  `features` text COLLATE utf8mb4_unicode_ci,
  `boton_principal_texto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Ver Productos',
  `boton_principal_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '/catalogo',
  `boton_secundario_texto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Vender mis Productos',
  `boton_secundario_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '/vendedor',
  `tarjeta_badge_top` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 0xF09F8CBF20313030252043616D706F,
  `tarjeta_imagen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tarjeta_titulo` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tarjeta_precio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tarjeta_vendedor_nombre` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tarjeta_vendedor_rating` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tarjeta_vendedor_id` int DEFAULT '47',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cupon_codigo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cupon_texto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filtro_blur` int DEFAULT '0',
  `estilo_plantilla` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'clasico',
  PRIMARY KEY (`id_banner`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `banners_hero`
INSERT INTO `banners_hero` (`id_banner`, `titulo`, `subtitulo`, `categoria_nombre`, `categoria_slug`, `categoria_thumb`, `imagen_fondo`, `color_acento`, `features`, `boton_principal_texto`, `boton_principal_link`, `boton_secundario_texto`, `boton_secundario_link`, `tarjeta_badge_top`, `tarjeta_imagen`, `tarjeta_titulo`, `tarjeta_precio`, `tarjeta_vendedor_nombre`, `tarjeta_vendedor_rating`, `tarjeta_vendedor_id`, `orden`, `activo`, `created_at`, `cupon_codigo`, `cupon_texto`, `filtro_blur`, `estilo_plantilla`) VALUES
(1, 'Producto De Compost Altamente Organico', 'El mejor compost hecho 100% natural y en el campo Montemariano', 'Cosechas Frescas', 'cosechas', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80', '#16a34a', '[]', 'Ver productos  ferre', '/categoria/cosechas', 'Vender mis Productos', '/vendedor', '🌿 100% Campo', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa2vmsEVsiLa2pHh1oSxnaz2eFskuQVc-tAw&s', 'Compost Orgánico', '$25.000 COP / Bolsa x 20kg', 'Danilo Rodelo', 'El Carmen de Bolívar • Productor Verificado', 2, 1, 1, '2026-08-18 14:40:56', NULL, NULL, 30, 'historia_campesina'),
(2, 'Semillas Seleccionadas de Alto Rendimiento', 'Semillas de maíz amarillo, fríjol rojo, hortalizas y granos con alto porcentaje de germinación para agricultores.', 'Semillas Nativas', 'semillas', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', '#f59e0b', '["Maíz Amarillo Seleccionado","Fríjol Rojo Criollo","Alta Germinación"]', 'Ver Semillas', '/categoria/semillas', 'Registrarme Gratis', '/registro', '🌱 Alta Germinación', 'https://calyxplantas.com/cdn/shop/products/10SEMILLATOMATECHONTOCALYXPLANTASBOGOTA-824068.jpg?v=1773264607&width=1445', 'Semilla de Tomate Chonto', '$9.500 COP / Sobre x 100 semillas', 'Antioquia • Productor Local', '⭐ 4.9/5 Calidad', 47, 2, 1, '2026-08-18 14:40:56', NULL, NULL, 28, 'historia_campesina'),
(3, 'Queso Costeño y Lácteos Campesinos', 'Queso costeño fresco, cuajada y suero tradicional elaborado artesanalmente con leche 100% pura en San Jacinto.', 'Lácteos Artesanales', 'lacteos', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80', '#0369a1', '["Queso Costeño Fresco","Suero Tradicional Costeño","Leche Pura de Ordeño"]', 'Ver Lácteos', '/categoria/lacteos', 'Conoce los Productores', '/vendedores', '🧀 100% Artesanal', 'https://es.edairynews.com/wp-content/uploads/2024/09/A-como-esta-el-kilo-de-queso-en-Colombia.png', 'Queso Costeño', '$25.000 COP / Venta por kg', 'Montes de María • Productor Local', '🚚 Envío Inmediato', 47, 3, 1, '2026-08-18 14:40:56', NULL, NULL, 0, 'historia_campesina'),
(4, 'Herramientas de Campo y Maquinaria Agrícola', 'Fumigadoras, motobombas, machetes, palas y sistemas de riego para el trabajo diario en la finca.', 'Herramientas & AgroEquipos', 'agro', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', '#0284c7', '["Fumigadoras y Bombas de Agua","Herramientas Manuales","Garantía Directa"]', 'Ver Herramientas', '/categoria/agro', 'Explorar Catálogo', '/catalogo', '🚜 Trabajo Pesado', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80', 'Fumigadora Manual RoyalCondor', '$250.000 COP', 'Roberto Carlos Salcedo', '🛡️ Garantía de Campo', 47, 4, 1, '2026-08-18 14:40:56', NULL, NULL, 0, 'mosaico');

-- --------------------------------------------------------
-- Estructura de tabla: `categorias`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `imagen` mediumtext COLLATE utf8mb4_unicode_ci,
  `icono` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'fa-box',
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#2e7d32',
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `categorias`
INSERT INTO `categorias` (`id_categoria`, `nombre_categoria`, `slug`, `descripcion`, `imagen`, `icono`, `color`) VALUES
(1, 'Cosechas Frescas', 'cosechas', 'Frutas, verduras, hortalizas y tubérculos recién cosechados.', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', 'fa-carrot', '#16a34a'),
(2, 'Lácteos Artesanales', 'lacteos', 'Quesos, suero, mantequilla y leche pura de vaca.', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80', 'fa-cheese', '#f59e0b'),
(3, 'Semillas Nativas', 'semillas', 'Semillas seleccionadas y certificadas de alta pureza y rendimiento.', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80', 'fa-seedling', '#059669'),
(4, 'Abonos y Fertilizantes', 'abonos', 'Compost orgánico, humus de lombriz y biofertilizantes.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80', 'fa-leaf', '#10b981'),
(5, 'Ferretería & Herramientas', 'ferre', 'Machetes, palas, mangueras y herramientas agrícolas.', 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80', 'fa-tools', '#64748b');

-- --------------------------------------------------------
-- Estructura de tabla: `compra_detalles`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `compra_detalles`;
CREATE TABLE `compra_detalles` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_compra` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `compra_detalles_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compras` (`id_compra`) ON DELETE CASCADE,
  CONSTRAINT `compra_detalles_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `compra_detalles`
INSERT INTO `compra_detalles` (`id_detalle`, `id_compra`, `id_producto`, `cantidad`, `precio_unitario`) VALUES
(11, 4, 49, 1, '35000.00'),
(12, 5, 56, 1, '28000.00'),
(13, 5, 66, 2, '4000.00'),
(14, 5, 49, 1, '35000.00'),
(15, 6, 49, 1, '35000.00'),
(16, 7, 66, 1, '4000.00');

-- --------------------------------------------------------
-- Estructura de tabla: `compras`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `compras`;
CREATE TABLE `compras` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pedido recibido',
  `metodo_pago` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Contra Entrega (Efectivo)',
  `reembolsado` tinyint(1) DEFAULT '0',
  `direccion_envio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `codigo_cupon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id_compra`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `compras`
INSERT INTO `compras` (`id_compra`, `id_usuario`, `fecha`, `total`, `estado`, `metodo_pago`, `reembolsado`, `direccion_envio`, `codigo_cupon`, `descuento`) VALUES
(4, 2, '2026-08-19 12:10:40', '50000.00', 'empaquetado', 'Contra Entrega (Efectivo)', 0, '[object Object],  - ', NULL, '0.00'),
(5, 50, '2026-08-19 13:37:15', '86000.00', 'empaquetado', 'Contra Entrega (Efectivo)', 0, '[object Object],  - ', NULL, '0.00'),
(6, 2, '2026-08-20 08:07:13', '50000.00', 'Pedido recibido', 'Contra Entrega (Efectivo)', 0, '[object Object],  - ', NULL, '0.00'),
(7, 49, '2026-08-21 00:40:41', '19000.00', 'Pedido recibido', 'Contra Entrega (Efectivo)', 0, '[object Object],  - ', NULL, '0.00');

-- --------------------------------------------------------
-- Estructura de tabla: `cupones`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cupones`;
CREATE TABLE `cupones` (
  `id_cupon` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descuento_porcentaje` decimal(5,2) DEFAULT '0.00',
  `descuento_fijo` decimal(10,2) DEFAULT '0.00',
  `monto_minimo` decimal(10,2) DEFAULT '0.00',
  `uso_limite` int DEFAULT NULL,
  `uso_actual` int DEFAULT '0',
  `fecha_expiracion` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `promocionar_en_barra` tinyint(1) DEFAULT '0',
  `mensaje_promocional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `color_tema` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#059669',
  PRIMARY KEY (`id_cupon`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `cupones`
INSERT INTO `cupones` (`id_cupon`, `codigo`, `descripcion`, `descuento_porcentaje`, `descuento_fijo`, `monto_minimo`, `uso_limite`, `uso_actual`, `fecha_expiracion`, `activo`, `promocionar_en_barra`, `mensaje_promocional`, `created_at`, `color_tema`) VALUES
(1, 'AGRO10', '10% de descuento en toda la tienda del campo', '10.00', '0.00', '0.00', 1000, 0, NULL, 0, 0, '¡Usa el cupón AGRO10 para 10% OFF en toda tu compra!', '2026-08-18 14:11:19', '#059669'),
(2, 'BIENVENIDO', '15% de descuento especial de bienvenida', '15.00', '0.00', '0.00', 500, 0, NULL, 1, 1, '¡Bienvenido! Usa BIENVENIDO para 15% OFF en tu primer pedido.', '2026-08-18 14:11:19', '#059669'),
(3, 'FINCA9-3667', '$20.000 COP de descuento directo', '9.00', '0.00', '50000.00', 200, 0, NULL, 1, 1, '$20.000 OFF en compras mayores a $50.000 COP', '2026-08-18 14:11:19', '#059669'),
(110, 'AGRO20K-PFDJ', 'Cupón de descuento especial', '0.00', '20000.00', '0.00', 100, 0, NULL, 1, 1, NULL, '2026-08-19 13:35:44', '#ea580c'),
(130, 'FINCA2K-5TVL', 'Cupón de descuento especial', '0.00', '2000.00', '0.00', 100, 0, NULL, 1, 1, '🔥 ¡Temporada de Cosecha! Usa este cupón y obtén un descuento especial', '2026-08-21 00:42:58', '#db2777'),
(171, 'MONTES25-BF9T', 'Cupón de descuento especial', '25.00', '0.00', '0.00', 100, 0, NULL, 1, 1, '🔥 ¡Temporada de Cosecha! Usa este cupón y obtén un descuento especial', '2026-09-03 05:26:52', '#0f172a');

-- --------------------------------------------------------
-- Estructura de tabla: `direcciones`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `direcciones`;
CREATE TABLE `direcciones` (
  `id_direccion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `titulo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Principal',
  `direccion_principal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `departamento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_postal` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_direccion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `direcciones`
INSERT INTO `direcciones` (`id_direccion`, `id_usuario`, `titulo`, `direccion_principal`, `departamento`, `ciudad`, `telefono`, `codigo_postal`, `notas`) VALUES
(1, 2, 'Dirección de Entrega', '24', 'Bolívar', 'El Carmen de Bolívar', '3008723989', '', 'Venta'),
(2, 50, 'Dirección de Entrega', 'PUERTO JORDAN', 'Arauca', 'Arauca', '', '', 'EN LA CASA GRANDE DE COLOR VERDE'),
(3, 49, 'Dirección de Entrega', 'Carrera 45 #29-14', 'Bolívar', 'El Carmen de Bolívar', '', '', 'Diagonal tienda el paisa '),
(4, 52, 'Dirección de Entrega', 'dfdhfh', 'Casanare', 'Yopal', '', '', 'Barrio: fgffh');

-- --------------------------------------------------------
-- Estructura de tabla: `productos`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_vendedor` int DEFAULT '47',
  `nombre_producto` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `precio` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `unidad_medida` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen` mediumtext COLLATE utf8mb4_unicode_ci,
  `fecha_ingreso` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_categoria` int DEFAULT NULL,
  `id_proveedor` int DEFAULT NULL,
  `categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `origen` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuidado` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disponibilidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_vendedor` (`id_vendedor`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_vendedor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `productos`
INSERT INTO `productos` (`id_producto`, `id_vendedor`, `nombre_producto`, `descripcion`, `precio`, `stock`, `unidad_medida`, `imagen`, `fecha_ingreso`, `id_categoria`, `id_proveedor`, `categoria`, `origen`, `presentacion`, `cuidado`, `disponibilidad`) VALUES
(28, NULL, 'Semilla de Ají Dulce', 'Ideal para huertas caseras y producción comercial.', '10000.00', 54, NULL, 'https://www.tierragro.com/cdn/shop/files/02210011.jpg?v=1730314267', '2026-08-18 14:11:19', NULL, NULL, 'semillas', 'Montes de María', 'Bolsa x 200 semillas', 'Evitar humedad excesiva', '54'),
(30, NULL, 'Semilla de Sandía', 'Produce frutos grandes y dulces de excelente calidad.', '23000.00', 32, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC3FERpvsAfvsHTJacUko1KVuk7IE1y0KtvA&s', '2026-08-18 14:11:19', NULL, NULL, 'semillas', 'Montes de María', 'Sobre x 120 semillas', 'Mantener en lugar fresco y seco', '32'),
(31, NULL, 'Semilla de Maíz Híbrido', 'Semillas certificadas de maíz híbrido de alta productividad y resistencia.', '18000.00', 45, NULL, 'https://http2.mlstatic.com/D_NQ_NP_942124-MCO95273155376_102025-O.webp', '2026-08-18 14:11:19', NULL, NULL, 'semillas', 'Valle del Cauca', 'Bolsa x 1kg', 'Mantener en lugar fresco y seco', '45'),
(32, NULL, 'Semilla de Tomate Chonto', 'Semillas seleccionadas para cultivos de tomate de excelente calidad.', '9500.00', 44, NULL, 'https://calyxplantas.com/cdn/shop/products/10SEMILLATOMATECHONTOCALYXPLANTASBOGOTA-824068.jpg?v=1773264607&width=1445', '2026-08-18 14:11:19', NULL, NULL, 'semillas', 'Antioquia', 'Sobre x 100 semillas', 'Evitar humedad excesiva', '44'),
(36, NULL, 'Queso Costeño', 'Queso artesanal fresco elaborado con leche pura de vaca.', '25000.00', 104, NULL, 'https://es.edairynews.com/wp-content/uploads/2024/09/A-como-esta-el-kilo-de-queso-en-Colombia.png', '2026-08-18 14:11:19', NULL, NULL, 'lacteos', 'Montes de María', 'Venta por kg', 'Mantener refrigerado', '104'),
(37, NULL, 'Suero Costeño', 'Suero tradicional costeño con sabor auténtico.', '6000.00', 498, NULL, 'https://larazon.co/wp-content/uploads/2024/06/suero-costeno.jpg', '2026-08-18 14:11:19', NULL, NULL, 'lacteos', 'Montes de María', 'Bolsa x 1kg', 'Mantener refrigerado', '498'),
(38, NULL, 'Yogurt Natural', 'Yogurt artesanal elaborado con leche fresca.', '12000.00', 77, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2qdsEyGZL-4m_3U1OnDfjdoRlmYuC4V3QIg&s', '2026-08-18 14:11:19', NULL, NULL, 'lacteos', 'Montes de María', 'Botella x 1 litro', 'Mantener refrigerado', '77'),
(39, NULL, 'Kumis Casero', 'Bebida láctea tradicional con sabor suave.', '10000.00', 186, NULL, 'https://www.utadeo.edu.co/sites/tadeo/files/node/news/field_images/kumis_casero.png', '2026-08-18 14:11:19', NULL, NULL, 'lacteos', 'Montes de María', 'Botella x 1lt', 'Mantener refrigerado', '186'),
(40, NULL, 'Cuajada Fresca', 'Producto lácteo artesanal de textura suave.', '18000.00', 55, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR_E21jSwSmhARPogv0m8gYqA2NR31eITTCQ&s', '2026-08-18 14:11:19', NULL, NULL, 'lacteos', 'Montes de María', 'Venta por kg', 'Mantener refrigerado', '55'),
(41, NULL, 'Mantequilla Artesanal', 'Mantequilla natural elaborada con crema de leche pura.', '14000.00', 76, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH8v0mepmQ-XmJECmD4UQOmQXQlK6KbGOdbQ&s', '2026-08-18 14:11:19', NULL, NULL, 'lacteos', 'Montes de María', 'Venta por 500g', 'Mantener refrigerado', '76'),
(48, NULL, 'Compost Orgánico', 'Abono natural elaborado con residuos vegetales compostados.', '25000.00', 500, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa2vmsEVsiLa2pHh1oSxnaz2eFskuQVc-tAw&s', '2026-08-18 14:11:19', NULL, NULL, 'abonos', 'Montes de María', 'Bolsa x 20kg', 'Natural', '500'),
(49, NULL, 'Humus de Lombriz', 'Fertilizante orgánico rico en nutrientes para cultivos.', '35000.00', 597, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYC7Iy6Y1RduY7Ch6xG6e_Bv1hyGy73imBvA&s', '2026-08-18 14:11:19', NULL, NULL, 'abonos', 'Montes de María', 'Bolsa x 25kg', 'Mantener en lugar seco', '600'),
(56, NULL, 'Machete Profesional', 'Herramienta resistente para labores agrícolas y limpieza.', '28000.00', 99, NULL, 'https://http2.mlstatic.com/D_NQ_NP_693816-MLA92561820026_092025-O.webp', '2026-08-18 14:11:19', NULL, NULL, 'ferre', 'Montes de María', 'Unidad', '100% Acero Inoxidable', '100'),
(58, 50, 'Azadón Reforzado', 'Herramienta resistente para preparación de suelos.', '38000.00', 45, 'Unidad', 'https://www.ferragro.com/cdn/shop/files/1005615_700x700.jpg?v=1723696992', '2026-08-18 14:11:19', NULL, 50, 'ferre', 'Montes de María', 'Unidad', 'Hierro forjado', '45'),
(64, NULL, 'Yuca Fresca del Campo', 'Yuca fresca y harinosa cosechada el mismo día.', '3000.00', 595, NULL, 'https://blog.mentta.com/wp-content/uploads/2024/06/pexels-daniel-dan-47825192-7543155-scaled.jpg', '2026-08-18 14:11:19', NULL, NULL, 'cosechas', 'Montes de María', 'Venta por kg', 'Natural', '595'),
(65, NULL, 'Plátano Hartón', 'Plátano verde fresco cultivado sin químicos.', '2500.00', 1000, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFTz1G95TxFK5DhidiWztSVhFZglvbvhXEcA&s', '2026-08-18 14:11:19', NULL, NULL, 'cosechas', 'Montes de María', 'Unidad', 'Natural', '1000'),
(66, 2, 'Mango de Azúcar / Tommy', 'Mango dulce y jugoso de excelente calidad.', '4000.00', 697, 'Unidad', 'https://upload.wikimedia.org/wikipedia/commons/a/af/Mango_TommyAtkins04_Asit.jpg', '2026-08-18 14:11:19', NULL, 2, 'cosechas', 'Montes de María', 'Venta por kg', 'Natural', '700'),
(67, 49, 'Pepino Fresco', 'Hortaliza fresca cosechada diariamente.', '3500.00', 600, 'Unidad', 'https://freshmate.cl/cdn/shop/files/pepino_en_tabla_de_madera_38_11zon.webp?v=1724716656', '2026-08-18 14:11:19', NULL, 49, 'yuca-miel', 'Montes de María', 'Venta por kg', 'Natural', '600'),
(69, 49, 'Queso', 'Suave y blando', '1000.00', 0, NULL, '/uploads/products/1787256498299-720633876-2f9156e32a47ba76bf2e6a8bb43c2cb9.png', '2026-08-21 01:08:18', NULL, 49, 'cosechas', 'Montes de María, Colombia', 'Empaque fresco de finca', 'Conservar en lugar fresco y seco', 'agotado');

-- --------------------------------------------------------
-- Estructura de tabla: `proveedores`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `representante` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `proveedores`
INSERT INTO `proveedores` (`id_proveedor`, `nombre_empresa`, `representante`, `telefono`, `correo`, `direccion`, `ciudad`) VALUES
(1, 'Asociación Campesina Montes de María', 'Carlos Pérez', '3001112233', 'contacto@montesdemaria.com', 'Vereda El Salado', 'El Carmen de Bolívar'),
(2, 'Lácteos San Jacinto', 'Laura Díaz', '3015557788', 'ventas@lacteossanjacinto.com', 'Carrera 15 #40-22', 'San Jacinto');

-- --------------------------------------------------------
-- Estructura de tabla: `roles`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `roles`
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`) VALUES
(1, 'Administrador', 'Control total de la plataforma'),
(2, 'Vendedor', 'Productor campesino y vendedor'),
(3, 'Cliente', 'Comprador de productos del campo'),
(4, 'Soporte', 'Atención al cliente y soporte técnico en vivo');

-- --------------------------------------------------------
-- Estructura de tabla: `soporte_calificaciones`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `soporte_calificaciones`;
CREATE TABLE `soporte_calificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_agente` int DEFAULT NULL,
  `nombre_agente` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estrellas` int NOT NULL,
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `soporte_calificaciones_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `soporte_tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `soporte_calificaciones_chk_1` CHECK ((`estrellas` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `soporte_calificaciones`
INSERT INTO `soporte_calificaciones` (`id`, `ticket_id`, `session_id`, `id_agente`, `nombre_agente`, `estrellas`, `comentario`, `created_at`) VALUES
(1, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asesor de Soporte', 1, 'Calificación de 1 estrellas recibida por el usuario.', '2026-08-20 07:59:46');

-- --------------------------------------------------------
-- Estructura de tabla: `soporte_mensajes`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `soporte_mensajes`;
CREATE TABLE `soporte_mensajes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int DEFAULT NULL,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `nombre_remitente` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `soporte_mensajes_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `soporte_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `soporte_mensajes`
INSERT INTO `soporte_mensajes` (`id`, `ticket_id`, `session_id`, `id_usuario`, `nombre_remitente`, `rol`, `mensaje`, `leido`, `fecha`) VALUES
(1, 1, 'sess_czjid5wp51787060863988', NULL, 'Danilo', 'user', 'Ayuda', 0, '2026-08-18 23:47:44'),
(2, 1, 'sess_czjid5wp51787060863988', NULL, 'Asistente Bot', 'bot', '¡Hola Danilo! 👋 Soy el asistente de soporte de **De los Montes de María**.\n\nHe registrado tu solicitud (**TK-PF7CMP**) sobre: **[OTRO] 😨**.\n\n¿En qué podemos colaborarte hoy?', 0, '2026-08-18 23:47:44'),
(3, 1, 'sess_czjid5wp51787060863988', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! Estoy aquí para ayudarte. ¿En qué necesitas asistencia?', 0, '2026-08-18 23:47:45'),
(4, 1, 'sess_czjid5wp51787060863988', NULL, 'Sistema', 'sistema', '🔔 Has solicitado atención con un asesor humano. Te atenderemos en breve aquí mismo.', 0, '2026-08-18 23:47:57'),
(5, 1, 'sess_czjid5wp51787060863988', NULL, 'Danilo', 'user', 'Hola', 0, '2026-08-18 23:47:59'),
(6, 1, 'sess_czjid5wp51787060863988', NULL, 'Danilo', 'user', 'Como esta', 0, '2026-08-18 23:48:11'),
(7, 1, 'sess_czjid5wp51787060863988', NULL, 'Danilo', 'user', 'Ayudassas', 0, '2026-08-18 23:48:24'),
(8, 1, 'sess_czjid5wp51787060863988', NULL, 'Asesor de Soporte', 'agente', 'Hola', 0, '2026-08-19 00:21:45'),
(9, 2, 'tg_5486332856_1787064462898', NULL, 'Danilo Gómez Rodelo', 'user', 'Ayuda', 0, '2026-08-19 00:47:43'),
(10, 2, 'tg_5486332856_1787064462898', NULL, 'Asistente Bot', 'bot', '¡Hola Danilo! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?', 0, '2026-08-19 00:47:44'),
(11, 2, 'tg_5486332856_1787064462898', NULL, 'Danilo Gómez Rodelo', 'user', 'Hola', 0, '2026-08-19 00:47:53'),
(12, 2, 'tg_5486332856_1787064462898', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! ¿En qué puedo ayudarte hoy?', 0, '2026-08-19 00:47:53'),
(13, 2, 'tg_5486332856_1787064462898', NULL, 'Danilo Gómez Rodelo', 'user', 'Como estás?', 0, '2026-08-19 00:48:00'),
(14, 2, 'tg_5486332856_1787064462898', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?', 0, '2026-08-19 00:48:00'),
(15, 2, 'tg_5486332856_1787064462898', NULL, 'Danilo Gómez Rodelo', 'user', 'Que haces?', 0, '2026-08-19 00:48:08'),
(16, 2, 'tg_5486332856_1787064462898', NULL, 'Asistente Bot', 'bot', '¡Hola! Soy tu asistente virtual, aquí para ayudarte con cualquier pregunta o necesidad que tengas relacionada con "De los Montes de María". Puedo ayudar con pedidos, productos, información sobre la cuenta, entre otros. ¿En qué puedo asistirte hoy?', 0, '2026-08-19 00:48:09'),
(17, 3, 'tg_5486332856_1787073069897', NULL, 'Danilo Gómez Rodelo', 'user', 'Problemas para iniciar sesion', 0, '2026-08-19 03:11:10'),
(18, 3, 'tg_5486332856_1787073069897', NULL, 'Asistente Bot', 'bot', 'Lamento que estés teniendo problemas para iniciar sesión. Para asistirte mejor, ¿podrías confirmarme si necesitas ayuda para recuperar tu contraseña o si el problema es diferente?', 0, '2026-08-19 03:11:11'),
(19, 3, 'tg_5486332856_1787073069897', NULL, 'Danilo Gómez Rodelo', 'user', 'Problemas para iniciar sesion', 0, '2026-08-19 03:11:38'),
(20, 3, 'tg_5486332856_1787073069897', NULL, 'Asistente Bot', 'bot', 'Comprendo que estás teniendo dificultades para iniciar sesión. Para ayudarte mejor, ¿podrías verificar si has olvidado tu contraseña y si es así, te gustaría que te enviara un código de seguridad a tu correo para cambiarla?', 0, '2026-08-19 03:11:40'),
(21, 3, 'tg_5486332856_1787073069897', NULL, 'Danilo Gómez Rodelo', 'user', 'Sí', 0, '2026-08-19 03:11:48'),
(22, 3, 'tg_5486332856_1787073069897', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! ¿En qué puedo ayudarte hoy?', 0, '2026-08-19 03:11:49'),
(23, 3, 'tg_5486332856_1787073069897', NULL, 'Danilo Gómez Rodelo', 'user', 'Cambiar contraseña', 0, '2026-08-19 03:11:58'),
(24, 3, 'tg_5486332856_1787073069897', NULL, 'Asistente Bot', 'bot', 'Para cambiar tu contraseña, primero debes iniciar sesión en tu cuenta. Una vez que estés dentro, podrás acceder a la opción de cambiar contraseña. Si necesitas ayuda para iniciar sesión, no dudes en decírmelo.', 0, '2026-08-19 03:12:00'),
(25, 4, 'tg_5486332856_1787075562361', NULL, 'Danilo', 'user', 'Problemas para iniciar sesion', 0, '2026-08-19 03:52:42'),
(26, 4, 'tg_5486332856_1787075562361', NULL, 'Asistente Bot', 'bot', 'Lamento que estés teniendo problemas para iniciar sesión. Para poder ayudarte mejor, ¿podrías decirme si olvidaste tu contraseña o si estás experimentando algún otro problema específico al intentar iniciar sesión?', 0, '2026-08-19 03:52:44'),
(27, 4, 'tg_5486332856_1787075562361', NULL, 'Danilo', 'user', 'Hola', 0, '2026-08-19 03:52:48'),
(28, 4, 'tg_5486332856_1787075562361', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! ¿En qué puedo ayudarte hoy?', 0, '2026-08-19 03:52:49'),
(29, 4, 'tg_5486332856_1787075562361', NULL, 'Danilo', 'user', 'Hola', 0, '2026-08-19 03:53:06'),
(30, 4, 'tg_5486332856_1787075562361', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! ¿En qué puedo ayudarte hoy?', 0, '2026-08-19 03:53:06'),
(31, 4, 'tg_5486332856_1787075562361', NULL, 'Danilo', 'user', 'Como estás?', 0, '2026-08-19 03:53:14'),
(32, 4, 'tg_5486332856_1787075562361', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?', 0, '2026-08-19 03:53:15'),
(33, 4, 'tg_5486332856_1787075562361', NULL, 'Sistema', 'sistema', '🔔 El cliente en Telegram ha solicitado atención con un asesor humano.', 0, '2026-08-19 03:53:23'),
(34, 4, 'tg_5486332856_1787075562361', NULL, 'Danilo', 'user', 'Hola', 0, '2026-08-19 03:53:27'),
(35, 4, 'tg_5486332856_1787075562361', NULL, 'Danilo', 'user', 'Como estás?', 0, '2026-08-19 03:54:34'),
(36, 4, 'tg_5486332856_1787075562361', NULL, 'Danilo', 'user', 'Tengo una duda', 0, '2026-08-19 03:55:33'),
(37, 4, 'tg_5486332856_1787075562361', NULL, 'Sistema', 'sistema', '✅ El ticket ha sido cerrado y resuelto.', 0, '2026-08-19 03:55:51'),
(38, 3, 'tg_5486332856_1787073069897', 2, 'Danilo Rodelo', 'agente', 'Hola', 0, '2026-08-19 04:30:49'),
(39, 5, 'sess_folzjr7rz1787079603141', NULL, 'Keiner Hernandez', 'user', 'ayuda', 0, '2026-08-19 05:00:03'),
(40, 5, 'sess_folzjr7rz1787079603141', NULL, 'Asistente Bot', 'bot', '¡Hola Keiner Hernandez! 👋 Soy el asistente de soporte de **De los Montes de María**.\n\nHe registrado tu solicitud (**TK-Q5MFTB**) sobre: **[OTRO] ayuda**.\n\n¿En qué podemos colaborarte hoy?', 0, '2026-08-19 05:00:03'),
(41, 5, 'sess_folzjr7rz1787079603141', NULL, 'Asistente Bot', 'bot', '¡Hola, Keiner! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?', 0, '2026-08-19 05:00:04'),
(42, 5, 'sess_folzjr7rz1787079603141', NULL, 'Keiner Hernandez', 'user', 'hablar con un asesor', 0, '2026-08-19 05:00:13'),
(43, 5, 'sess_folzjr7rz1787079603141', NULL, 'Sistema', 'sistema', '🔔 He transferido tu consulta a la cola de atención prioritaria. Un asesor humano se conectará enseguida contigo en este chat.', 0, '2026-08-19 05:00:14'),
(44, 5, 'sess_folzjr7rz1787079603141', NULL, 'Keiner Hernandez', 'user', 'hola buenos dias', 0, '2026-08-19 05:00:22'),
(45, 5, 'sess_folzjr7rz1787079603141', NULL, 'Keiner Hernandez', 'user', 'holaaaaa', 0, '2026-08-19 05:00:30'),
(46, 5, 'sess_folzjr7rz1787079603141', NULL, 'Keiner Hernandez', 'user', 'hola', 0, '2026-08-19 05:00:39'),
(47, 5, 'sess_folzjr7rz1787079603141', NULL, 'Equipo de Soporte', 'agente', 'Hola', 0, '2026-08-19 05:00:46'),
(48, 5, 'sess_folzjr7rz1787079603141', NULL, 'Keiner Hernandez', 'user', 'como estas?', 0, '2026-08-19 05:01:00'),
(49, 5, 'sess_folzjr7rz1787079603141', NULL, 'Equipo de Soporte', 'agente', 'Hols', 0, '2026-08-19 05:01:25'),
(50, 5, 'sess_folzjr7rz1787079603141', NULL, 'Administrador', 'sistema', '🔒 El ticket ha sido cerrado y resuelto por el equipo de soporte.', 0, '2026-08-19 05:02:27'),
(51, 5, 'sess_folzjr7rz1787079603141', NULL, 'Administrador', 'sistema', '🔒 El ticket ha sido cerrado y resuelto por el equipo de soporte.', 0, '2026-08-19 05:02:32'),
(52, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Keiner Hernandez', 'user', 'Ayuda', 0, '2026-08-19 05:16:49'),
(53, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Asistente Bot', 'bot', '¡Hola Keiner Hernandez! 👋 Soy el asistente de soporte de **De los Montes de María**.\n\nHe registrado tu solicitud (**TK-CTJSBU**) sobre: **[PEDIDOS] Ayuda**.\n\n¿En qué podemos colaborarte hoy?', 0, '2026-08-19 05:16:49'),
(54, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Asistente Bot', 'bot', '¡Hola, Keiner! Estoy aquí para ayudarte. ¿Cuál es tu consulta o problema?', 0, '2026-08-19 05:16:50'),
(55, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Keiner Hernandez', 'user', 'Hola', 0, '2026-08-19 05:17:10'),
(56, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Asistente Bot', 'bot', '¡Hola, Keiner! ¿En qué puedo ayudarte hoy?', 0, '2026-08-19 05:17:11'),
(57, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Keiner Hernandez', 'user', 'Hablar con un asesor', 0, '2026-08-19 05:17:25'),
(58, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Sistema', 'sistema', '🔔 He transferido tu consulta a la cola de atención prioritaria. Un asesor humano se conectará enseguida contigo en este chat.', 0, '2026-08-19 05:17:26'),
(59, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Keiner Hernandez', 'user', 'Hola', 0, '2026-08-19 05:17:34'),
(60, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Equipo de Soporte', 'agente', 'Hola', 0, '2026-08-19 05:18:07'),
(61, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Keiner Hernandez', 'user', 'Como estas?', 0, '2026-08-19 05:19:55'),
(62, 6, 'sess_t8yahmmwl1787080608572', NULL, 'Equipo de Soporte', 'agente', 'Bien y tú?', 0, '2026-08-19 05:20:06'),
(63, 6, 'sess_t8yahmmwl1787080608572', 2, 'Danilo Rodelo', 'sistema', '🔒 El ticket ha sido cerrado y resuelto por el equipo de soporte.', 0, '2026-08-19 06:03:43'),
(64, 2, 'tg_5486332856_1787064462898', 2, 'Danilo Rodelo', 'sistema', '🔒 El ticket ha sido cerrado y resuelto por el equipo de soporte.', 0, '2026-08-19 06:03:45'),
(65, 1, 'sess_czjid5wp51787060863988', 2, 'Danilo Rodelo', 'sistema', '🔒 El ticket ha sido cerrado y resuelto por el equipo de soporte.', 0, '2026-08-19 06:03:46'),
(66, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', 'Hola', 0, '2026-08-19 06:11:23'),
(67, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! ¿Cómo puedo ayudarte hoy?', 0, '2026-08-19 06:11:24'),
(68, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', 'Hola', 0, '2026-08-19 06:11:32'),
(69, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! ¿En qué puedo ayudarte hoy?', 0, '2026-08-19 06:11:33'),
(70, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', 'Como estás?', 0, '2026-08-19 06:11:40'),
(71, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', '¡Hola, Danilo! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?', 0, '2026-08-19 06:11:42'),
(72, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', 'Que haces?', 0, '2026-08-19 06:12:57'),
(73, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', '¡Hola! Soy tu asistente virtual de soporte de "De los Montes de María". Estoy aquí para ayudarte con cualquier pregunta o inquietud que tengas, ya sea sobre productos, pedidos, o cualquier otro tema. ¿En qué puedo asistirte hoy?', 0, '2026-08-19 06:12:58'),
(74, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', 'Puedo cambiar mi contraseña?', 0, '2026-08-19 06:13:18'),
(75, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', 'He enviado un código de seguridad a tu correo electrónico (alejandrolopezmoran604@gmail.com). Por favor, revisa tu bandeja de entrada y sigue las instrucciones para cambiar tu contraseña. Si necesitas más ayuda, no dudes en preguntar.', 0, '2026-08-19 06:13:22'),
(76, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', '933690', 0, '2026-08-19 06:13:40'),
(77, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', 'Código verificado correctamente. Por favor ingresa tu **nueva contraseña** (mínimo 8 caracteres):', 0, '2026-08-19 06:13:40'),
(78, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', 'Danilo.1050', 0, '2026-08-19 06:13:50'),
(79, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', 'Tu contraseña ha sido actualizada exitosamente.', 0, '2026-08-19 06:13:52'),
(80, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', 'Gracias', 0, '2026-08-19 06:13:57'),
(81, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', '¡De nada, Danilo! Si necesitas ayuda con algo más, no dudes en decírmelo. Estoy aquí para ayudarte.', 0, '2026-08-19 06:13:58'),
(82, 7, 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'user', 'Nadamas sería eso', 0, '2026-08-19 06:14:04'),
(83, 7, 'tg_5486332856_1787083883399', NULL, 'Asistente Bot', 'bot', 'Hola Danilo, ¿en qué puedo ayudarte hoy? Si necesitas información sobre un pedido, un producto o algún otro tema, no dudes en decírmelo.', 0, '2026-08-19 06:14:05'),
(84, 8, 'sess_idqublexb1787105909803', NULL, 'pedro_montes', 'user', 'Eliminar mi cuenta', 0, '2026-08-19 12:18:30'),
(85, 8, 'sess_idqublexb1787105909803', NULL, 'Asistente Bot', 'bot', '¡Hola pedro_montes! 👋 Soy el asistente de soporte de **De los Montes de María**.\n\nHe registrado tu solicitud (**TK-HUQ3YD**) sobre: **[OTRO] eliminar mi cuenta**.\n\n¿En qué podemos colaborarte hoy?', 0, '2026-08-19 12:18:30'),
(86, 8, 'sess_idqublexb1787105909803', NULL, 'Asistente Bot', 'bot', 'Lamento que quieras eliminar tu cuenta. Sin embargo, no puedo realizar esa acción directamente. Te recomendaría que te pongas en contacto con nuestro soporte al cliente a través del correo electrónico o el número de teléfono que aparece en nuestra página de contacto. Ellos podrán asistirte con el proceso de eliminación de cuenta. Si tienes alguna otra consulta, estaré encantado de ayudarte.', 0, '2026-08-19 12:18:31'),
(87, 8, 'sess_idqublexb1787105909803', NULL, 'pedro_montes', 'user', 'elimina mi cuenta', 0, '2026-08-19 12:18:50'),
(88, 8, 'sess_idqublexb1787105909803', NULL, 'Asistente Bot', 'bot', 'Lamento saber que deseas eliminar tu cuenta. Sin embargo, no tengo la capacidad para eliminar cuentas directamente. Te recomendaría que contactes al servicio de atención al cliente de "De los Montes de María" a través de su correo electrónico o número de teléfono para obtener ayuda con este proceso. \n\nSi hay algo más en lo que pueda asistirte, házmelo saber.', 0, '2026-08-19 12:18:53'),
(89, 8, 'sess_idqublexb1787105909803', NULL, 'pedro_montes', 'user', 'hablar con un asesor', 0, '2026-08-19 12:18:59'),
(90, 8, 'sess_idqublexb1787105909803', NULL, 'Sistema', 'sistema', '🔔 He transferido tu consulta a la cola de atención prioritaria. Un asesor humano se conectará enseguida contigo en este chat.', 0, '2026-08-19 12:18:59'),
(91, 8, 'sess_idqublexb1787105909803', 2, 'Danilo Rodelo', 'agente', 'Hola buenas noches', 0, '2026-08-19 12:20:10'),
(92, 8, 'sess_idqublexb1787105909803', 2, 'Danilo Rodelo', 'agente', 'Hola', 0, '2026-08-19 12:20:18'),
(93, 8, 'sess_idqublexb1787105909803', NULL, 'pedro_montes', 'user', 'hola', 0, '2026-08-19 12:20:34'),
(94, 8, 'sess_idqublexb1787105909803', 2, 'Danilo Rodelo', 'agente', 'Cuéntame', 0, '2026-08-19 12:20:43'),
(95, 8, 'sess_idqublexb1787105909803', NULL, 'pedro_montes', 'user', 'quiero eliminar mi cuenta', 0, '2026-08-19 12:20:50'),
(96, 8, 'sess_idqublexb1787105909803', 2, 'Danilo Rodelo', 'agente', 'Ok, ya te ayudo', 0, '2026-08-19 12:21:09'),
(97, 8, 'sess_idqublexb1787105909803', 2, 'Danilo Rodelo', 'agente', 'Listo, su cuenta quedó eliminada de nuestra base de datos', 0, '2026-08-19 12:21:54'),
(98, 8, 'sess_idqublexb1787105909803', 2, 'Danilo Rodelo', 'agente', 'Algo más?', 0, '2026-08-19 12:21:56'),
(99, 8, 'sess_idqublexb1787105909803', NULL, 'pedro_montes', 'user', 'no nadamas seria eso', 0, '2026-08-19 12:22:03'),
(100, 8, 'sess_idqublexb1787105909803', 2, 'Danilo Rodelo', 'agente', 'Listo pues', 0, '2026-08-19 12:22:13'),
(101, 8, 'sess_idqublexb1787105909803', 2, 'Danilo Rodelo', 'sistema', '🔒 El ticket ha sido cerrado y resuelto por el equipo de soporte.', 0, '2026-08-19 12:22:20'),
(102, 9, 'tg_5486332856_1787108922261', NULL, '/tienda', 'user', 'problemas para iniciar sesion', 0, '2026-08-19 13:08:42'),
(103, 9, 'tg_5486332856_1787108922261', NULL, 'Asistente Bot', 'bot', 'Lamento que estés teniendo problemas para iniciar sesión. ¿Te gustaría que te ayudara a restablecer tu contraseña? Puedo enviarte un código de seguridad a tu correo electrónico.', 0, '2026-08-19 13:08:44'),
(104, 9, 'tg_5486332856_1787108922261', NULL, '/tienda', 'user', 'Quiero cambiar mi contraseña', 0, '2026-08-19 13:08:54'),
(105, 9, 'tg_5486332856_1787108922261', NULL, 'Asistente Bot', 'bot', 'Para cambiar tu contraseña, primero necesitas iniciar sesión en tu cuenta. Si tienes problemas para acceder, por favor házmelo saber y te ayudaré.', 0, '2026-08-19 13:08:56'),
(106, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Nëîfėr Åşçåņîö', 'user', 'problemas con mi pedido', 0, '2026-08-20 07:57:04'),
(107, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asistente Bot', 'bot', '¡Hola Nëîfėr Åşçåņîö! 👋 Soy el asistente de soporte de **De los Montes de María**.\n\nHe registrado tu solicitud (**TK-WJBRTX**) sobre: **[PEDIDOS] estado**.\n\n¿En qué podemos colaborarte hoy?', 0, '2026-08-20 07:57:04'),
(108, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asistente Bot', 'bot', 'Hola, Nëîfėr. Para poder ayudarte con tu pedido, necesito que te autentiques. Por favor, proporciona tu información de inicio de sesión o verifica que estés registrado. Estoy aquí para ayudarte.', 0, '2026-08-20 07:57:08'),
(109, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Nëîfėr Åşçåņîö', 'user', 'me llegaron malos los productos y no era los que yo queria', 0, '2026-08-20 07:57:41'),
(110, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asistente Bot', 'bot', 'Parece que no tengo acceso a tus pedidos porque no estoy autenticado con tu información. Te recomiendo que por favor verifiques tu correo o que me proporciones más detalles sobre tu pedido, como el número de orden o los nombres de los productos que esperabas recibir. Así podré ayudarte mejor a resolver este inconveniente.', 0, '2026-08-20 07:57:44'),
(111, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Nëîfėr Åşçåņîö', 'user', 'quiero hablar con un asesor', 0, '2026-08-20 07:58:51'),
(112, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Sistema', 'sistema', '🔔 He transferido tu consulta a la cola de atención prioritaria. Un asesor humano se conectará enseguida contigo en este chat.', 0, '2026-08-20 07:58:51'),
(113, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asesor de Soporte', 'agente', 'hola neifer', 0, '2026-08-20 07:58:57'),
(114, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Nëîfėr Åşçåņîö', 'user', 'rapido', 0, '2026-08-20 07:58:59'),
(115, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asesor de Soporte', 'agente', 'que paso?', 0, '2026-08-20 07:59:01'),
(116, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Nëîfėr Åşçåņîö', 'user', 'necesito plata', 0, '2026-08-20 07:59:06'),
(117, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asesor de Soporte', 'agente', 'no hay plata', 0, '2026-08-20 07:59:11'),
(118, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asesor de Soporte', 'agente', 'hay meke', 0, '2026-08-20 07:59:14'),
(119, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Nëîfėr Åşçåņîö', 'user', 'boy a hack un banco', 0, '2026-08-20 07:59:30'),
(120, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Asesor de Soporte', 'agente', 'vaya a dormir', 0, '2026-08-20 07:59:38'),
(121, 10, 'sess_5jpbpp0ne1787194623989', NULL, 'Sistema', 'sistema', '✅ El ticket ha sido cerrado y resuelto.', 0, '2026-08-20 07:59:41');

-- --------------------------------------------------------
-- Estructura de tabla: `soporte_tickets`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `soporte_tickets`;
CREATE TABLE `soporte_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `nombre_cliente` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo_cliente` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono_cliente` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `asunto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'bot',
  `id_agente` int DEFAULT NULL,
  `nombre_agente` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_code` (`ticket_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `soporte_tickets`
INSERT INTO `soporte_tickets` (`id`, `ticket_code`, `session_id`, `id_usuario`, `nombre_cliente`, `correo_cliente`, `telefono_cliente`, `asunto`, `estado`, `id_agente`, `nombre_agente`, `created_at`, `updated_at`) VALUES
(1, 'TK-PF7CMP', 'sess_czjid5wp51787060863988', NULL, 'Danilo', 'danilorodelo355@gmail.com', 'Sin registrar', '[OTRO] 😨', 'cerrado', 2, 'Danilo Rodelo', '2026-08-18 23:47:43', '2026-08-19 06:03:45'),
(2, 'TK-DCQLSX', 'tg_5486332856_1787064462898', NULL, 'Danilo Gómez Rodelo', 'danilorodelo355@gmail.com', '3008723989', '❓ Consulta General: Ayuda...', 'cerrado', 2, 'Danilo Rodelo', '2026-08-19 00:47:42', '2026-08-19 06:03:44'),
(3, 'TK-8WWUKV', 'tg_5486332856_1787073069897', NULL, 'Danilo Gómez Rodelo', 'danilorodelo355@gmail.com', '3008723986', '❓ Consulta General: Problemas para iniciar sesion...', 'cerrado', 2, 'Danilo Rodelo', '2026-08-19 03:11:09', '2026-08-19 04:31:01'),
(4, 'TK-3N4QQD', 'tg_5486332856_1787075562361', NULL, 'Danilo', 'danilorodelo355@gmail.com', '3008723989', '❓ Consulta General: Problemas para iniciar sesion...', 'cerrado', NULL, NULL, '2026-08-19 03:52:42', '2026-08-19 03:55:51'),
(5, 'TK-Q5MFTB', 'sess_folzjr7rz1787079603141', NULL, 'Keiner Hernandez', 'hkeiner663@gmail.com', 'Sin registrar', '[OTRO] ayuda', 'cerrado', NULL, 'Administrador', '2026-08-19 05:00:03', '2026-08-19 05:02:32'),
(6, 'TK-CTJSBU', 'sess_t8yahmmwl1787080608572', NULL, 'Keiner Hernandez', 'hkeiner663@gmail.com', 'Sin registrar', '[PEDIDOS] Ayuda', 'cerrado', 2, 'Danilo Rodelo', '2026-08-19 05:16:48', '2026-08-19 06:03:43'),
(7, 'TK-27FWHE', 'tg_5486332856_1787083883399', 48, 'Danilo Gómez', 'alejandrolopezmoran604@gmail.com', 'Sin registrar', '❓ Consulta General: Hola...', 'cerrado', NULL, NULL, '2026-08-19 06:11:23', '2026-08-19 06:14:11'),
(8, 'TK-HUQ3YD', 'sess_idqublexb1787105909803', NULL, 'pedro_montes', 'pedro@agrocampo.com', 'Sin registrar', '[OTRO] eliminar mi cuenta', 'cerrado', 2, 'Danilo Rodelo', '2026-08-19 12:18:29', '2026-08-19 12:22:20'),
(9, 'TK-G3NL4Z', 'tg_5486332856_1787108922261', NULL, '/tienda', 'danilorodelo355@gmail.com', 'Sin registrar', '❓ Consulta General: problemas para iniciar sesion...', 'bot', NULL, NULL, '2026-08-19 13:08:42', '2026-08-19 13:08:42'),
(10, 'TK-WJBRTX', 'sess_5jpbpp0ne1787194623989', NULL, 'Nëîfėr Åşçåņîö', 'neiferascanio81@gmail.com', 'Sin registrar', '[PEDIDOS] estado', 'cerrado', NULL, 'Asesor de Soporte', '2026-08-20 07:57:03', '2026-08-20 07:59:40');

-- --------------------------------------------------------
-- Estructura de tabla: `telegram_auth_codigos`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `telegram_auth_codigos`;
CREATE TABLE `telegram_auth_codigos` (
  `chat_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` int NOT NULL,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`chat_id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `telegram_auth_codigos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Estructura de tabla: `telegram_sesiones`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `telegram_sesiones`;
CREATE TABLE `telegram_sesiones` (
  `chat_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`chat_id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `telegram_sesiones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `telegram_sesiones`
INSERT INTO `telegram_sesiones` (`chat_id`, `id_usuario`, `created_at`, `updated_at`) VALUES
('5486332856', 2, '2026-08-19 15:00:33', '2026-08-19 15:00:33');

-- --------------------------------------------------------
-- Estructura de tabla: `usuarios`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apodo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contrasena` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_rol` int DEFAULT '3',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `avatar` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reset_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `creditos` decimal(10,2) DEFAULT '0.00',
  `google_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `foto_portada` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `categoria_productos` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `apodo` (`apodo`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros de `usuarios`
INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apodo`, `correo`, `telefono`, `direccion`, `contrasena`, `id_rol`, `created_at`, `avatar`, `reset_code`, `reset_expires`, `creditos`, `google_id`, `estado`, `foto_portada`, `descripcion`, `categoria_productos`) VALUES
(2, 'Danilo Rodelo', 'danilo_rodelo', 'danilorodelo355@gmail.com', '3008723989', 'El Carmen de Bolívar', '$2b$12$xLd2yFkEOvGH5h4FsAzIDOdwYZOYe3ZoRUjm2c67qVizKFZsCMBzS', 1, '2026-08-18 14:11:19', 'https://lh3.googleusercontent.com/a/ACg8ocJ0GO_7Wl8XZyXRKL2UqR--b919IC2BqxEfwoZ0hjeVzPJlCoS4=s96-c', NULL, NULL, '50000.00', '105601790078576967479', 'activo', NULL, 'Fundador y Administrador', 'Cosechas, Lácteos'),
(48, 'Danilo Gómez', 'alejandrolopezmoran604', 'alejandrolopezmoran604@gmail.com', NULL, NULL, '$2b$12$5LJnLEt.ZHt5okUH17EFzODNbDlTjGJKsHRoujqgyhduyTLOwYvUW', 3, '2026-08-18 14:41:54', 'https://lh3.googleusercontent.com/a/ACg8ocK-q8gw6T7vXvK7Z-uYW0CCAWA6F7MIyxiG5AeZIb4m_6tWIWYI=s96-c', NULL, NULL, '0.00', '107455632671028295110', 'activo', NULL, NULL, NULL),
(49, 'Keiner Hernandez', 'hkeiner663', 'hkeiner663@gmail.com', '', '', '$2b$12$ehfkFVZYUcBGfsT5msWh/ezWYo0xf.xlXhpEjS9oUWJndW./8y8F6', 2, '2026-08-19 04:21:12', NULL, NULL, NULL, '0.00', '107936414092993898331', 'activo', NULL, NULL, NULL),
(50, 'Nëîfėr Åşçåņîö', 'neiferascanio81', 'neiferascanio81@gmail.com', NULL, NULL, '$2b$12$eUkW4otDNGJ4Xe0/CGXJTeL3xc5aQeb1VgGGkYxfVK44LTacOlnHy', 3, '2026-08-19 13:31:44', 'https://lh3.googleusercontent.com/a/ACg8ocIH9xgc6cGTskzxbCQyBJRZl8UdFwp1UhhUE40OloDnZS6QgknSIA=s96-c', NULL, NULL, '0.00', '114727836779141438999', 'activo', NULL, NULL, NULL),
(51, 'Danilo Gómez', 'danxrodelo_g', 'danxrodelo@gmail.com', NULL, NULL, '$2b$12$uGzKEif.PrveHVuDySshCesal.asUrfMsH4Hs4ZG7.Kl1MQIJAjWe', 3, '2026-09-03 05:28:13', 'https://lh3.googleusercontent.com/a/ACg8ocJXev7dgAtSDV2TykG6nJujwGHKgilReHbVyoxB0HwgJzzOayo=s96-c', NULL, NULL, '0.00', '100002125857502557941', 'activo', NULL, NULL, NULL),
(52, 'MUNDO TIENDA', 'mundotienda19', 'mundotienda19@gmail.com', NULL, NULL, '$2b$12$.kMmXIgUV/q2qU5C295JAOCvKxUbakITwZRty4i0R.b0OVSRJ75pq', 3, '2026-09-04 05:59:55', 'https://lh3.googleusercontent.com/a/ACg8ocIFsfcUEkwRvhPQDyB7tDXpNKWQYsmC81l6eveWWDlAh3aYtQ=s96-c', NULL, NULL, '0.00', '118396160301961113296', 'activo', NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
