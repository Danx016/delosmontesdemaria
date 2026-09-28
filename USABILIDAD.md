# 🎨 Leyes y Principios de Usabilidad - De los Montes de María

> Este documento establece las leyes y principios de usabilidad que guían el diseño y desarrollo de la plataforma "De los Montes de María" para garantizar una experiencia de usuario óptima para productores campesinos y consumidores.

---

## 📋 Tabla de Contenidos

1. [Leyes Fundamentales de Usabilidad](#leyes-fundamentales-de-usabilidad)
2. [Principios de Diseño UI/UX](#principios-de-diseño-uiux)
3. [Reglas Específicas para la Plataforma](#reglas-específicas-para-la-plataforma)
4. [Guías de Accesibilidad](#guías-de-accesibilidad)
5. [Métricas de Usabilidad](#métricas-de-usabilidad)

---

## 🔷 Leyes Fundamentales de Usabilidad

### 1. Ley de Jakob (Jakob's Law)
**Los usuarios pasan la mayor parte del tiempo en otros sitios.**
- **Aplicación:** Utilizar patrones de diseño familiares y convenciones de e-commerce estándar
- **Implementación:**
  - Carrito de compras en la esquina superior derecha
  - Búsqueda accesible desde cualquier página
  - Navegación por categorías en el menú principal
  - Breadcrumbs para mostrar la ruta de navegación

### 2. Ley de Fitts (Fitts's Law)
**El tiempo para alcanzar un objetivo es función del tamaño y distancia del objetivo.**
- **Aplicación:** Elementos interactivos grandes y fácilmente accesibles
- **Implementación:**
  - Botones de CTA (Call to Action) con tamaño mínimo de 44x44px
  - Espaciado generoso entre elementos interactivos
  - Áreas de toque amplias para dispositivos móviles
  - Botones principales ubicados en posiciones prominentes

### 3. Ley de Miller (Miller's Law)
**La memoria de trabajo promedio puede mantener 7±2 elementos.**
- **Aplicación:** Simplificar la información presentada
- **Implementación:**
  - Máximo 5-7 productos por fila en el catálogo
  - Paginación de resultados (no scroll infinito)
  - Filtrado progresivo para reducir carga cognitiva
  - Agrupación lógica de información en secciones

### 4. Ley de Hick (Hick's Law)
**El tiempo para tomar una decisión aumenta con el número y complejidad de las opciones.**
- **Aplicación:** Minimizar opciones y simplificar decisiones
- **Implementación:**
  - Filtrado por categorías principales en lugar de listas extensas
  - Valor por defecto en formularios cuando sea apropiado
  - Destacar las opciones más populares/recomendadas
  - Progresión de información: resumen → detalles → especificaciones

### 5. Ley de Postel (Postel's Law)
**Sé conservador en lo que envías, sé liberal en lo que aceptas.**
- **Aplicación:** Flexibilidad en entrada de datos del usuario
- **Implementación:**
  - Aceptar múltiples formatos de números telefónicos
  - Autocompletado en campos de dirección
  - Validación flexible de nombres y descripciones
  - Mensajes de error claros y constructivos

### 6. Ley de Gestalt (Gestalt Principles)
**El percibe el todo antes que las partes.**
- **Aplicación:** Agrupación visual y jerarquía clara
- **Implementación:**
  - Agrupación de productos por categoría
  - Uso consistente de espaciado y márgenes
  - Agrupación visual de elementos relacionados
  - Separación clara entre secciones

---

## 🎨 Principios de Diseño UI/UX

### 1. Consistencia (Consistency)
- **Código:** Utilizar mismos patrones de componentes en toda la aplicación
- **Visual:** Colores, tipografías y espaciados consistentes
- **Funcional:** Mismas interacciones producen mismos resultados
- **Implementación:**
  - Sistema de diseño con tokens de diseño (Design Tokens)
  - Componentes reutilizables en `components/`
  - Guía de estilos en CSS global

### 2. Feedback Inmediato (Immediate Feedback)
- **Interacciones:** Respuesta visual inmediata a acciones del usuario
- **Implementación:**
  - Estados hover en botones y enlaces
  - Indicadores de carga (spinners, skeletons)
  - Confirmaciones visuales de acciones (toasts, modales)
  - Animaciones sutiles para transiciones

### 3. Prevención de Errores (Error Prevention)
- **Diseño:** Prevenir errores antes de que ocurran
- **Implementación:**
  - Validación en tiempo real de formularios
  - Deshabilitar botones cuando no sea aplicable
  - Confirmación para acciones destructivas
  - Autoguardado de formularios largos

### 4. Recuperación de Errores (Error Recovery)
- **Mensajes:** Claros, específicos y constructivos
- **Implementación:**
  - Mensajes de error en lenguaje natural
  - Sugerencias de cómo corregir el error
  - Preservar datos ingresados cuando ocurre error
  - Opción para contactar soporte si el error persiste

### 5. Jerarquía Visual (Visual Hierarchy)
- **Importancia:** Elementos más importantes visualmente destacados
- **Implementación:**
  - Tamaños de fuente proporcionales a importancia
  - Uso de color para destacar elementos clave
  - Contraste apropiado para legibilidad
  - Espaciado para crear grupos y separaciones

### 6. Accesibilidad (Accessibility)
- **Inclusión:** Diseño para todos los usuarios
- **Implementación:**
  - Contraste de color mínimo 4.5:1 para texto
  - Navegación por teclado funcional
  - Textos alternativos para imágenes
  - Etiquetas ARIA apropiadas

---

## 🌾 Reglas Específicas para la Plataforma

### 1. Diseño para Productores Campesinos
- **Simplicidad:** Interfaz intuitiva para usuarios con limitada experiencia digital
- **Implementación:**
  - Iconos grandes y claros con etiquetas textuales
  - Flujos de trabajo paso a paso con indicadores de progreso
  - Lenguaje simple y evitar tecnicismos
  - Botones grandes y fáciles de tocar

### 2. Optimización para Conexiones Lentas
- **Performance:** Carga rápida incluso en conexiones 3G/4G
- **Implementación:**
  - Imágenes optimizadas y comprimidas
  - Lazy loading de imágenes y componentes
  - Cache agresivo de recursos estáticos
  - Progressive loading de contenido

### 3. Diseño Mobile-First
- **Prioridad:** Experiencia óptima en dispositivos móviles
- **Implementación:**
  - Diseño responsive con breakpoints apropiados
  - Touch targets de mínimo 44x44px
  - Navegación por gestos cuando sea apropiado
  - Evitar elementos que requieran hover en móviles

### 4. Confianza y Seguridad
- **Percepción:** Transmitir confianza y seguridad
- **Implementación:**
  - Indicadores visuales de seguridad (HTTPS, validaciones)
  - Testimonios y calificaciones visibles
  - Información de contacto clara y accesible
  - Políticas de privacidad y términos accesibles

### 5. Soporte Multilingüe
- **Inclusión:** Preparado para español y futuros idiomas
- **Implementación:**
  - Textos externalizados (no hardcodeados)
  - Soporte para RTL (derecha a izquierda) si es necesario
  - Consideración de longitud de texto en diferentes idiomas
  - Formatos de fecha/hora localizados

---

## ♿ Guías de Accesibilidad

### 1. WCAG 2.1 Nivel AA
- **Contraste:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **Tamaño de fuente:** Mínimo 16px para texto principal, ajustable hasta 200%
- **Navegación por teclado:** Todos los elementos interactivos accesibles por Tab
- **Focus visible:** Indicador claro de elemento enfocado

### 2. Soporte de Lectores de Pantalla
- **ARIA Labels:** Etiquetas descriptivas para elementos interactivos
- **Semántica HTML:** Uso correcto de elementos semánticos
- **Anuncios de estado:** Notificaciones de cambios importantes
- **Alt text:** Descripciones significativas para imágenes

### 3. Adaptabilidad
- **Orientación:** Funciona en portrait y landscape
- **Zoom:** Funciona con zoom hasta 200% sin pérdida de funcionalidad
- **Contraste:** Opción de alto contraste disponible
- **Animaciones:** Opción para reducir movimientos

---

## 📊 Métricas de Usabilidad

### 1. Métricas de Rendimiento
- **Tiempo de Carga:** < 3 segundos en 3G
- **Time to Interactive:** < 5 segundos
- **First Contentful Paint:** < 1.5 segundos
- **Largest Contentful Paint:** < 2.5 segundos

### 2. Métricas de Experiencia
- **Task Success Rate:** > 95% para tareas principales
- **Time on Task:** < 2 minutos para compra simple
- **Error Rate:** < 5% en flujos críticos
- **Satisfaction Score:** > 4/5 en encuestas

### 3. Métricas de Accesibilidad
- **Keyboard Navigation:** 100% de elementos accesibles
- **Screen Reader Compatibility:** 100% de contenido accesible
- **Color Contrast:** 100% de texto cumple WCAG AA
- **Touch Target Size:** 100% de elementos ≥ 44x44px

---

## 🔍 Checklist de Revisión

Antes de implementar cualquier nueva funcionalidad, verificar:

- [ ] Cumple con la Ley de Jakob (patrones familiares)
- [ ] Elementos interactivos ≥ 44x44px (Ley de Fitts)
- [ ] Máximo 7±2 elementos por sección (Ley de Miller)
- [ ] Opciones limitadas y claras (Ley de Hick)
- [ ] Validación flexible de entrada (Ley de Postel)
- [ ] Agrupación visual clara (Ley de Gestalt)
- [ ] Consistencia con diseño existente
- [ ] Feedback inmediato para interacciones
- [ ] Prevención de errores común
- [ ] Recuperación clara de errores
- [ ] Jerarquía visual apropiada
- [ ] Cumple estándares WCAG AA
- [ ] Optimizado para mobile
- [ ] Performance aceptable (< 3s carga)
- [ ] Accesible por teclado
- [ ] Compatible con lectores de pantalla

---

## 📚 Referencias

- **Nielsen Norman Group:** https://www.nngroup.com/articles/
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design Guidelines:** https://material.io/design
- **Apple Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/

---

🌾 *Este documento es vivo y debe actualizarse regularmente basándose en feedback de usuarios y mejores prácticas de la industria.*