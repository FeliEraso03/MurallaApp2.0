# Modernización de Marca y Limpieza Visual (Muralla App 2.0)
Fecha: 2026-03-31

## Objetivo
Estandarizar la identidad visual de la aplicación y profesionalizar la interfaz mediante la eliminación de emojis y la actualización de la marca.

## Cambios Realizados

### 1. Estandarización de Marca
- Se añadió la etiqueta "**2.0**" de forma secundaria y pequeña para denotar la evolución técnica.
- Archivos afectados: `Navbar.jsx`, `LandingPage.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`, entre otros.

### 2. Eliminación de Emojis
- Se realizó una auditoría profunda para eliminar emojis informales (🏰, ⛪, 🗑️, ⚠️) y reemplazarlos por iconos de la librería `lucide-react`.
- Este cambio asegura una estética profesional y consistente con aplicaciones de mapas modernas.
- Se agregaron iconos: `Castle`, `History`, `Church`, `AlertCircle`, `Trash2`, `User`, etc.

### 3. Corrección de Navegación
- Se resolvieron errores de `ReferenceError: Link is not defined` en las páginas de información (`AboutUs`, `Instructions`) mediante la importación correcta de `react-router-dom`.

## Impacto
La aplicación ahora presenta una imagen corporativa sólida y una interfaz libre de elementos distractores, alineada con los estándares de diseño premium exigidos.
