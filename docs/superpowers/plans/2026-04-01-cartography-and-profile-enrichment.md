# Enriquecimiento Cartográfico y Perfil de Usuario (Muralla App 2.0)
Fecha: 2026-04-01

## Objetivo
Densificar el mapa de Cartagena con una red de puntos de interés (POIs) de alta precisión y expandir las capacidades del perfil del viajero.

## Cambios Realizados

### 1. Cartografía de Alta Fidelidad
- Se investigaron e integraron 30 **Puntos de Interés (POIs)** permanentes con coordenadas de alta resolución (7 decimales) de **Google Maps**.
- Los puntos cubren el Centro Histórico, San Diego, Getsemaní, y monumentos clave como el **Castillo de San Felipe** y el **Convento de la Popa**.
- Se posicionaron con exactitud estructuras de la muralla (Baluartes), evitando desplazamientos previos hacia el mar.

### 2. Categorización Visual Dinámica
- Se implementó un sistema de **código de colores** para las categorías de POIs:
    - 🔵 Plazas | 💎 Iglesias | 🟣 Museos | 🟡 Historia | 🟢 Parques | 🟠 Monumentos | 🔥 Cultura
- Se refinó la carga de datos de **OpenStreetMap (Overpass API)** para incluir prefijos informativos como `[Museo]` o `[Mirador]` en el mapa.

### 3. Perfil de Usuario Premium
- **Identidad**: Saludo dinámico ("Hola, [Nombre]") y visualización del correo electrónico en la cabecera.
- **Nuevos Campos**: Incorporación del campo **Género (opcional)** con las opciones: `Masculino`, `Femenino`, `Preferido no decirlo`, `Otro`.
- **Análisis Demográfico**: Mejora en la visualización de la naturalez del visitante (Local, Nacional, Internacional).

### 4. Seguridad de Perfil
- Implementación de la sección de **Seguridad** con formulario de **Cambio de Contraseña**.
- Validación de la contraseña actual frente a la base de datos y confirmación de la nueva en tiempo real.
- Arreglo de estilos CSS para asegurar legibilidad total de los menús desplegables (selects) en modo oscuro.

## Impacto Técnico
La base cartográfica es ahora robusta y profesional, mientras que el perfil de usuario captura datos vitales para la optimización de rutas mediante los algoritmos de la aplicación.
