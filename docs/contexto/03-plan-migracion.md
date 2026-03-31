# Plan de Migración: Muralla App 2.0

## 1. Situación Actual vs. Meta
- **Origen:** Desarrollo básico en JavaScript (cliente) y HTML estático. Lógica dispersa y limitada en escalabilidad.
- **Destino:** Arquitectura desacoplada.
    - **Frontend:** React (Vite) para una UI/UX moderna y reactiva.
    - **Backend:** Spring Boot (Java) para la lógica de optimización y seguridad.

## 2. Fase 1: Configuración del Entorno y Backend (Spring Boot)
1.  **Inicialización:** Configura Maven, dependencias (Spring Web, JPA, PostGIS, **Spring Security**).
2.  **Seguridad:** Implementación de autenticación JWT y perfiles de usuario.
3.  **Modelado de Datos:** Entidades para `POI`, `Ruta`, `Usuario` y `Preferencia`.
4.  **Core Algorítmico:** Migración y optimización del P-graph a servicios de Java.
5.  **End-points REST:** API REST para gestión de POIs y generación de rutas.

## 3. Fase 2: Desarrollo del Frontend (React + Vite)
1.  **Enfoque Mobile-First:** Desarrollo de UI adaptativa mediante CSS moderno (Flexbox/Grid).
2.  **Scaffolding:** Configura Vite con React y Axios.
3.  **Librería de Mapas:** Integración de Leaflet (visualización interactiva de puntos y rutas).
4.  **Componentes:**
    - Registro e inicio de sesión.
    - Formulario de captura de preferencias.
    - Mapa responsivo.
5.  **Consumo de API:** Integración de servicios para conectar con el backend de Spring Boot.

## 4. Fase 3: Lógica P-graph en el Backend
- Implementación de la generación de la estructura máxima (MSG) en el servidor.
- Optimización de cálculos de distancia utilizando la API de Google Maps o OSRM desde el backend para mayor precisión.

## 5. Cronograma Sugerido
- **Semana 1:** Setup y migración de base de datos.
- **Semana 2:** Desarrollo de lógica P-graph en Java.
- **Semana 3:** UI de React y visualización de mapas.
- **Semana 4:** Pruebas funcionales e integración.
