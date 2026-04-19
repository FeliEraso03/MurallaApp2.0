# Muralla App 2.0 - Análisis Técnico Completo

## Plataforma de Planificación de Rutas Turísticas con Algoritmo P-Graph

**Centro Histórico de Cartagena de Indias**

---

**Version**: 2.0.0  
**Estado**: Activo  
**Fecha de Análisis**: 18 de abril de 2026

---

## Índice

- [1. Visión General del Proyecto](#1-visión-general-del-proyecto)
- [2. Funcionamiento de la Aplicación](#2-funcionamiento-de-la-aplicación)
- [3. Arquitectura del Sistema](#3-arquitectura-del-sistema)
- [4. Backend - Análisis Detallado](#4-backend---análisis-detallado)
- [5. Frontend - Análisis Detallado](#5-frontend---análisis-detallado)
- [6. Solver P-Graph - Análisis Detallado](#6-solver-p-graph---análisis-detallado)
- [7. Infraestructura y Docker](#7-infraestructura-y-docker)
- [8. Seguridad y Autenticación](#8-seguridad-y-autenticación)
- [9. Base de Datos y Modelado](#9-base-de-datos-y-modelado)
- [10. Resumen Técnico](#10-resumen-técnico)

---

## 1. Visión General del Proyecto

Muralla App 2.0 es una plataforma web interactiva diseñada para resolver el Tourist Trip Design Problem (TTDP) en el Centro Histórico de Cartagena de Indias mediante la implementación del algoritmo P-Graph (Process Graph). La aplicación permite a los usuarios planificar rutas turísticas personalizadas basadas en sus preferencias, restricciones de tiempo y presupuesto, generando múltiples soluciones óptimas mediante algoritmos de optimización combinatoria.

### Características Principales

| Característica | Descripción |
|---------------|-------------|
| Mapas Interactivos | Visualización bidimensional y tridimensional utilizando MapLibre GL para renderizado de mapas vectoriales de alto rendimiento |
| Algoritmo P-Graph | Implementación de MSG (Maximal Structure Generation), SSG (Solution Structure Generation) y ABB (Accelerated Branch and Bound) para generación de rutas óptimas |
| Sistema de Personalización | Captura detallada de preferencias turísticas mediante sliders de 1-10 para diferentes categorías de interés |
| Autenticación Segura | Implementación de JSON Web Tokens (JWT) para autenticación stateless y OAuth2 para integración con Google Identity Platform |
| Persistencia de Datos | PostgreSQL 16 con extensión PostGIS 3.4 para almacenamiento relacional y capacidades geoespaciales avanzadas |
| Arquitectura Microservicios | Despliegue en contenedores Docker para backend (Spring Boot), frontend (React + Nginx) y servicio solver (Node.js + Wine) |

---

## 2. Funcionamiento de la Aplicación

### Flujo de Usuario

El flujo de interacción del usuario sigue la siguiente secuencia:

1. Registro o autenticación en la plataforma
2. Completación del wizard de preferencias turísticas (4 pasos)
3. Acceso al editor de grafo para definir puntos de interés (POIs)
4. Generación de rutas mediante algoritmos de optimización
5. Visualización y selección entre múltiples soluciones generadas
6. Visualización interactiva en mapas 2D/3D
7. Persistencia o compartición de grafos generados

### Experiencia de Usuario

#### Fase 1: Onboarding y Captura de Preferencias

El proceso de incorporación del usuario se divide en dos modalidades de autenticación:

- Autenticación tradicional: Mediante correo electrónico y contraseña con hashing BCrypt
- Autenticación OAuth2: Integración con Google Identity Platform para autenticación social

Posterior al registro, el usuario completa un wizard de cuatro pasos:

1. Selección de idioma: Español, Inglés, Portugués, Chino, Hindi o Arabe
2. Definición de intereses culturales: Seis sliders con escala 1-10 para Cultura, Religión, Gastronomía, Naturaleza, Arte y Aventura
3. Configuración logística: Tiempo disponible (1-10+ horas), tipo de grupo (SOLO, COUPLE, FAMILY, GROUP), movilidad (WALK, MULTI) y presupuesto opcional con conversión multi-moneda
4. Confirmación: Resumen del perfil de viajero generado según intereses predominantes

#### Fase 2: Editor de Grafo

La aplicación ofrece tres modos de operación:

- Modo Planner: Configuración de parámetros para generación de rutas
- Modo Editor: Edición interactiva del grafo mediante clic en mapa para agregar nodos (POIs) y conexiones (aristas)
- Modo Graphs: Gestión de grafos guardados, incluyendo listado, carga, actualización, eliminación y compartición

#### Fase 3: Generación de Rutas

El sistema implementa tres algoritmos de optimización:

- Dijkstra: Cálculo de ruta más corta entre dos puntos mediante ponderación de aristas
- Ford-Fulkerson: Cálculo de flujo máximo en redes para optimización de capacidad
- P-Graph Solver: Generación de múltiples soluciones factibles (k-best) mediante algoritmo P-Graph externo

Los resultados se presentan mediante un selector de soluciones que permite visualizar alternativas ordenadas por utilidad, con renderizado en mapas 2D (modo oscuro/claro) y 3D (edificios extruidos con control de opacidad).

---

## 3. Arquitectura del Sistema

La arquitectura del sistema sigue un patrón de microservicios con comunicación REST entre componentes:

```
Frontend (React + Vite + MapLibre GL)
         |
         | HTTP/HTTPS (JWT Bearer Token)
         v
Backend (Spring Boot 3.4.1)
  - Controllers (REST API Endpoints)
  - Services (Business Logic Layer)
  - Security (JWT + OAuth2 Configuration)
         |
         | JDBC (JPA/Hibernate ORM)
         v
PostgreSQL 16 + PostGIS 3.4
  - User Management and Preferences
  - Graph Persistence (Nodes and Edges)
  - Geospatial Data Storage
         |
         | HTTP (REST)
         v
Solver Service (Node.js + Wine)
  - WDG2PNSv2.jar (Preprocessing)
  - pgraph_solver.exe (P-Graph Algorithm via Wine)
```

### Patrones de Diseño Implementados

- Model-View-Controller (MVC): Separación de responsabilidades en Spring Boot
- Repository Pattern: Abstracción de acceso a datos mediante JPA Repositories
- Data Transfer Object (DTO): Transferencia de datos entre capas con validación
- Builder Pattern: Construcción fluida de objetos complejos mediante Lombok @Builder
- Service Layer: Centralización de lógica de negocio en servicios Spring @Service
- Filter Chain: Interceptación de peticiones JWT mediante JwtAuthenticationFilter
- Context API: Gestión de estado global en React (autenticación e internacionalización)
- Custom Hooks: Lógica reutilizable encapsulada en hooks React

---

## 4. Backend - Análisis Detallado

### Stack Tecnológico

| Tecnología | Versión | Descripción y Propósito |
|------------|---------|------------------------|
| Java | 21 (LTS) | Lenguaje de programación principal con soporte a largo plazo, virtual threads y mejoras de rendimiento |
| Spring Boot | 3.4.1 | Framework de aplicaciones que simplifica la configuración y despliegue de aplicaciones Spring, con auto-configuración y starters |
| Spring Security | 6.x | Framework de seguridad y control de acceso para aplicaciones Spring, implementando autenticación y autorización |
| Spring Data JPA | 3.x | Abstracción sobre JPA/Hibernate para simplificar el acceso a datos con repositorios |
| PostgreSQL | 16 | Sistema de bases de datos relacional objeto-relacional de código abierto con alto rendimiento |
| PostGIS | 3.4 | Extensión de PostgreSQL que añade soporte para objetos geográficos, permitiendo consultas espaciales |
| Flyway | 10.x | Herramienta de migración de bases de datos para versionado y control de esquemas |
| Lombok | 1.18.x | Biblioteca que reduce código boilerplate mediante anotaciones para getters, setters, builders, etc. |
| JWT (jjwt) | 0.11.5 | Biblioteca para creación y validación de JSON Web Tokens para autenticación stateless |
| Hibernate Spatial | Integrado | Extensión de Hibernate para mapeo de tipos geoespaciales de PostGIS |

### Estructura del Proyecto Backend

```
muralla-backend/
├── src/main/java/com/muralla/
│   ├── MurallaApplication.java          # Clase principal Spring Boot
│   ├── config/
│   │   ├── ApplicationConfig.java       # Configuración de beans y componentes
│   │   └── SecurityConfig.java          # Configuración Spring Security y OAuth2
│   ├── controller/
│   │   ├── AuthController.java          # Endpoints de autenticación (register, login)
│   │   ├── UserController.java          # Gestión de usuarios y preferencias
│   │   ├── GraphController.java         # CRUD de grafos y control de acceso
│   │   ├── RouteController.java         # Generación de rutas con algoritmos
│   │   └── SolverController.java        # Integración con servicio solver externo
│   ├── service/
│   │   ├── AuthService.java             # Lógica de autenticación y registro
│   │   ├── PGraphAlgorithmService.java  # Implementación de algoritmos de rutas
│   │   ├── GraphStorageService.java     # Persistencia y gestión de grafos
│   │   ├── CurrencyConversionService.java # Conversión de divisas en tiempo real
│   │   └── OAuth2UserService.java       # Integración con Google OAuth2
│   ├── security/
│   │   ├── JwtService.java              # Generación y validación de tokens JWT
│   │   └── JwtAuthenticationFilter.java # Filtro para interceptación de peticiones JWT
│   ├── model/
│   │   ├── User.java                    # Entidad de usuario con UserDetails
│   │   ├── UserPreference.java          # Preferencias turísticas del usuario
│   │   ├── Graph.java                   # Entidad de grafo guardado
│   │   ├── GraphNode.java               # Nodos del grafo (POIs)
│   │   ├── GraphEdge.java               # Aristas del grafo (conexiones)
│   │   └── Role.java                    # Enumeración de roles (USER, ADMIN)
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── GraphRepository.java
│   │   ├── GraphNodeRepository.java
│   │   └── GraphEdgeRepository.java
│   └── dto/
│       ├── AuthRequest.java
│       ├── AuthResponse.java
│       ├── RegisterRequest.java
│       ├── PreferenceRequest.java
│       ├── GraphRequest.java
│       ├── GraphResponse.java
│       └── PnsNode.java, PnsEdge.java
└── src/main/resources/
    ├── application.properties          # Configuración Spring Boot
    └── db/migration/                   # Scripts de migración Flyway
```

### Configuración de Seguridad

La configuración de seguridad implementa las siguientes características:

- JWT Stateless: Tokens con duración de 24 horas sin estado mantenido en servidor
- OAuth2 Google: Integración con Google Identity Platform para autenticación social
- CORS Configurado: Restricción de origen cruzado únicamente al frontend configurado
- BCrypt Password Hashing: Hashing seguro de contraseñas con salt automático
- Role-Based Access Control: Implementación de roles USER y ADMIN para autorización
- Method Security: Anotaciones @PreAuthorize para autorización a nivel de método

### Modelado de Datos

#### Entidad User

```java
@Entity
@Table(name = "_user")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String fullName;
    private String profilePictureUrl;
    
    @Column(unique = true, nullable = false)
    private String email; // Utilizado como username
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserPreference preference;
    
    // Implementación de UserDetails para Spring Security
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }
    
    @Override
    public String getUsername() {
        return email;
    }
}
```

#### Entidad UserPreference

```java
@Entity
@Table(name = "user_preferences")
public class UserPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    // Parámetros logísticos
    private Integer defaultTimeAvailableHours; // 1, 2, 4, 6, 8, 10
    private String mobilityType;                // WALK | MULTI
    private String groupType;                   // SOLO | COUPLE | FAMILY | GROUP
    private String touristType;                 // LOCAL | NATIONAL | INTERNATIONAL
    private String ageRange;                    // 18-25 | 26-35 | 36-50 | 50+
    private String gender;                      // MALE | FEMALE | OTHER | NON_DISCLOSED
    
    // Intereses culturales (escala 1-10)
    private Integer interestCulture;      // Histórico/Cultural
    private Integer interestReligion;     // Religioso/Espiritual
    private Integer interestGastronomy;   // Gastronómico
    private Integer interestNature;       // Naturaleza/Espacios abiertos
    private Integer interestArts;         // Arte vivo/Artesanías
    private Integer interestAdventure;    // Exploración/Aventura
    
    // Presupuesto y moneda (almacenado en COP internamente)
    private BigDecimal budget;
    private String currency;              // USD, EUR, GBP, JPY, CNY, COP
    
    // Idioma de preferencia
    private String language;              // es, en, pt, zh, hi, ar
    
    // Estado del wizard de preferencias
    private Boolean preferencesSeen;
}
```

### Endpoints API

| Método HTTP | Endpoint | Descripción | Autenticación |
|-------------|----------|-------------|---------------|
| POST | /api/auth/register | Registro de nuevo usuario con validación de credenciales | Pública |
| POST | /api/auth/login | Autenticación de usuario existente y generación de JWT | Pública |
| GET | /oauth2/authorization/google | Inicio de flujo OAuth2 con Google | Pública |
| GET | /api/users/me | Obtener perfil y preferencias del usuario actual | JWT requerido |
| PUT | /api/users/preferences | Actualizar preferencias del usuario actual | JWT requerido |
| POST | /api/users/change-password | Cambiar contraseña del usuario actual | JWT requerido |
| GET | /api/users/budget-ranges | Obtener rangos de presupuesto por moneda con conversión | Pública |
| POST | /api/graphs | Guardar nuevo grafo con nodos y aristas | JWT requerido |
| GET | /api/graphs | Listar grafos del usuario con paginación | JWT requerido |
| GET | /api/graphs/public | Listar grafos públicos con paginación | Pública |
| GET | /api/graphs/{id} | Cargar grafo específico por UUID | JWT requerido |
| PUT | /api/graphs/{id} | Actualizar grafo existente | JWT requerido |
| DELETE | /api/graphs/{id} | Eliminar grafo existente | JWT requerido |
| POST | /api/routes/generate | Generar rutas óptimas mediante algoritmos | JWT requerido |
| GET | /api/routes/history | Obtener historial de rutas generadas | JWT requerido |
| POST | /api/solver/solve | Resolver grafo con servicio solver P-Graph externo | Pública |

---

## 5. Frontend - Análisis Detallado

### Stack Tecnológico

| Tecnología | Versión | Descripción y Propósito |
|------------|---------|------------------------|
| React | 18.3.1 | Biblioteca JavaScript para construcción de interfaces de usuario con componentes y estado |
| Vite | 6.0.5 | Herramienta de build y servidor de desarrollo con Hot Module Replacement (HMR) ultrarrápido |
| React Router | 7.13.2 | Biblioteca de enrutamiento para aplicaciones React Single Page Application (SPA) |
| MapLibre GL | 4.7.1 | Biblioteca de mapas vectoriales open-source alternativa a Mapbox GL JS para renderizado WebGL |
| Leaflet | 1.9.4 | Biblioteca ligera de mapas para visualización de mapas con tiles |
| React Leaflet | 4.2.1 | Bindings de React para integración con Leaflet |
| Axios | 1.7.2 | Cliente HTTP basado en promesas para navegador y Node.js con interceptores |
| Lucide React | 1.7.0 | Biblioteca de iconos SVG consistentes y personalizables para React |

### Estructura del Proyecto Frontend

```
muralla-frontend/
├── src/
│   ├── main.jsx                          # Punto de entrada React
│   ├── App.jsx                           # Componente principal con estado global
│   ├── App.css                           # Estilos globales y variables CSS
│   ├── auth.css                          # Estilos específicos de autenticación
│   ├── components/
│   │   ├── MapGraphEditor.jsx            # Componente headless para MapLibre GL
│   │   ├── MapLabels.jsx                 # Componente para etiquetas de POIs
│   │   ├── ElementModal.jsx              # Modal de edición de nodos/aristas
│   │   ├── RouteSolutionSelector.jsx     # Selector de soluciones del solver
│   │   ├── GraphManager.jsx              # Gestión de grafos guardados/compartidos
│   │   ├── Navbar.jsx                    # Barra de navegación principal
│   │   └── Icons.jsx                     # Iconos SVG personalizados
│   ├── pages/
│   │   ├── LandingPage.jsx               # Página de inicio pública
│   │   ├── LoginPage.jsx                 # Página de inicio de sesión
│   │   ├── RegisterPage.jsx              # Página de registro
│   │   ├── PreferencesPage.jsx           # Wizard de preferencias (4 pasos)
│   │   ├── UserProfilePage.jsx           # Página de perfil de usuario
│   │   ├── OAuth2CallbackPage.jsx        # Página de callback OAuth2
│   │   ├── AboutUs.jsx                   # Página sobre nosotros
│   │   └── Instructions.jsx              # Página de instrucciones de uso
│   ├── contexts/
│   │   └── I18nContext.jsx               # Contexto de internacionalización
│   ├── hooks/
│   │   └── (custom hooks si existieran)
│   ├── utils/
│   │   ├── authContext.jsx               # Contexto de autenticación global
│   │   ├── wdg2pns.js                    # Parser de salida del solver P-Graph
│   │   └── Wdg2PnsParser.js              # Parser alternativo de soluciones
│   └── i18n/
│       ├── es.json                       # Traducciones al español
│       ├── en.json                       # Traducciones al inglés
│       ├── index.js                      # Configuración de i18n
├── public/
│   ├── index.html                        # Template HTML principal
│   ├── assets/                           # Assets estáticos (imágenes, fuentes)
│   └── data/                             # Datos de ejemplo y GeoJSON de prueba
├── package.json                          # Dependencias y scripts npm
├── vite.config.js                        # Configuración de Vite
├── nginx.conf                            # Configuración de Nginx para producción
└── Dockerfile                            # Imagen Docker para despliegue
```

### Componentes Principales

#### App.jsx (Componente Principal)

Responsabilidades principales:

- Gestión de estado global de la aplicación (nodos, aristas, soluciones de rutas)
- Inicialización y configuración de MapLibre GL con estilos personalizados
- Coordinación entre componentes hijos mediante props
- Gestión de modos de operación (planner, editor, graphs)
- Integración con backend mediante llamadas HTTP y con solver externo
- Implementación de lógica de exportación/importación de grafos en formato GeoJSON

Estado principal gestionado:

```javascript
const [nodes, setNodes] = useState([]);           // Nodos del grafo (POIs)
const [edges, setEdges] = useState([]);           // Aristas del grafo (conexiones)
const [graphMode, setGraphMode] = useState('IDLE'); // Modo de edición
const [routeSolutions, setRouteSolutions] = useState([]); // Soluciones generadas
const [activeSolution, setActiveSolution] = useState(0);   // Solución activa
const [is3DMode, setIs3DMode] = useState(false);  // Modo de visualización 3D
const [mapStyle, setMapStyle] = useState(STYLE_DARK); // Estilo de mapa
const [showLabels, setShowLabels] = useState(false); // Etiquetas de POIs
const [showGrid, setShowGrid] = useState(false);   // Grid de referencia
```

#### MapGraphEditor.jsx (Componente Headless)

Responsabilidades principales:

- Gestión completa de capas de MapLibre GL (fuentes y capas)
- Renderizado de nodos en modo 2D (círculos) y 3D (polígonos extruidos)
- Renderizado de aristas en modo 2D (líneas) y 3D (extrusiones)
- Renderizado de rutas generadas por el solver
- Manejo de eventos de clic para selección de elementos
- Sincronización de visibilidad y opacidad de capas
- Implementación de grid de referencia geográfica

Capas gestionadas internamente:

- src-grid: Fuente de datos para grid de referencia
- src-edges: Fuente de datos para aristas del grafo
- src-route: Fuente de datos para rutas generadas
- src-nodes: Fuente de datos para nodos del grafo
- src-nodes-3d: Fuente de datos para nodos en 3D (polygons)
- src-route-3d: Fuente de datos para rutas en 3D (extruded)
- src-muralla-3d: Fuente de datos para murallas en 3D (extruded)

#### PreferencesPage.jsx (Wizard de Preferencias)

Responsabilidades principales:

- Implementación de wizard de 4 pasos para captura de preferencias
- Sliders interactivos para intereses culturales (escala 1-10)
- Selección de parámetros logísticos con UI intuitiva
- Carga y redimensionamiento de imagen de perfil
- Integración con backend para guardar preferencias
- Generación dinámica de perfil de viajero según intereses

Pasos del wizard:

1. Selección de idioma con soporte multiidioma
2. Definición de intereses mediante 6 sliders con descripciones detalladas
3. Configuración logística (tiempo, grupo, movilidad, presupuesto)
4. Confirmación con resumen visual del perfil generado

#### LoginPage.jsx (Autenticación)

Responsabilidades principales:

- Formulario de login tradicional con validación
- Botón de integración OAuth2 con Google
- Manejo de errores y mensajes de validación
- Redirección post-login según estado de preferencias
- Toggle de visibilidad de contraseña

#### GraphManager.jsx (Gestión de Grafos)

Responsabilidades principales:

- Listado de grafos del usuario con paginación
- Listado de grafos públicos disponibles
- Carga de grafos guardados desde backend
- Eliminación de grafos con confirmación
- Toggle de visibilidad pública/privada para compartir grafos

### Internacionalización

Idiomas soportados con traducciones completas:

- Español (es)
- Inglés (en)
- Portugués (pt)
- Chino (zh)
- Hindi (hi)
- Arabe (ar)

Estructura de traducciones con claves jerárquicas para organizacion modular.

### Sistema de Estilos

Variables CSS principales para consistencia visual:

```css
:root {
  --navy: #1a1a2e;           /* Color principal oscuro */
  --navy-mid: #16213e;       /* Color secundario oscuro */
  --navy-light: #1f4068;     /* Color terciario oscuro */
  --orange: #f77f00;         /* Color de acento principal */
  --orange-light: #fca311;   /* Color de acento secundario */
  --white: #ffffff;          /* Color de texto principal */
  --gray: #e0e0e0;          /* Color de texto secundario */
  --success: #2ecc71;        /* Color de éxito */
  --error: #e74c3c;          /* Color de error */
  --warning: #f39c12;        /* Color de advertencia */
}
```

Clases utilitarias para componentes de autenticación y preferencias con diseño consistente.

---

## 6. Solver P-Graph - Análisis Detallado

### Algoritmo P-Graph

El método P-Graph (Process Graph) es un marco teórico matemático y computacional originalmente diseñado para la síntesis de redes de procesos industriales. En Muralla App, se adapta para resolver problemas de optimización combinatoria en rutas turísticas.

#### Componentes Matemáticos

- M-NODES (Materials): Representan los estados de localización del turista. Un material inicial corresponde al punto de partida y un material final al destino o fin de la jornada.
- O-NODES (Operating Units): Representan las acciones o actividades. En este contexto, corresponden a desplazamientos entre POIs o visitas a sitios de interés.
- C-NODES (Constraints): Representan las restricciones del sistema, incluyendo tiempo disponible, presupuesto y capacidad de los POIs.

#### Algoritmos Core Implementados

- MSG (Maximal Structure Generation): Construye la estructura máxima que contiene todos los recorridos posibles entre los POIs seleccionados, generando el grafo completo de alternativas.
- SSG (Solution Structure Generation): Extrae todas las sub-estructuras que representan rutas completas y factibles que cumplen con las restricciones impuestas.
- ABB (Accelerated Branch and Bound): Evalúa y ordena las soluciones para encontrar no solo la mejor, sino las k-mejores (k-best solutions) para ofrecer alternativas al turista.

### Arquitectura del Solver

El servicio solver implementa la siguiente cadena de procesamiento:

```
Node.js Express Server
         ↓
Recibir GeoJSON via POST /upload-geojson
         ↓
Extraer nodos (tipo 1=origen, tipo 3=destino) y aristas
         ↓
Ejecutar WDG2PNSv2.jar (Java)
         ↓
Generar archivo .in con formato de entrada del solver
         ↓
Ejecutar pgraph_solver.exe via Wine
         ↓
Parsear salida texto plano con soluciones
         ↓
Retornar JSON con soluciones al backend
```

### Formato de Entrada/Salida

#### Entrada: GeoJSON

El solver recibe un GeoJSON con la siguiente estructura:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-75.549548, 10.425248]
      },
      "properties": {
        "id": "Node1",
        "type": 1,
        "initialContent": 0,
        "maximumCapacity": 100,
        "enable": true
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-75.550000, 10.426000]
      },
      "properties": {
        "id": "Node2",
        "type": 3,
        "initialContent": 0,
        "maximumCapacity": 100,
        "enable": true
      }
    }
  ]
}
```

#### Salida: Texto Plano

El solver retorna soluciones en formato texto plano:

```
Feasible structure #1: Materials: Node1: 100.0, Node2: 0.0 
Operating units: Node1_Node2 => Node2 
Total annual cost= 1000.0 Euro/yr

Feasible structure #2: Materials: Node1: 50.0, Node2: 50.0 
Operating units: Node1_Node2 => Node2 
Total annual cost= 500.0 Euro/yr
```

### Parser de Salida

El frontend implementa un parser (wdg2pns.js) que convierte la salida del solver en GeoJSON de soluciones, extrayendo nodos y aristas correspondientes a cada solución factible generada.

---

## 7. Infraestructura y Docker

### Docker Compose

El despliegue utiliza Docker Compose para orquestar cuatro servicios principales:

- db: PostgreSQL 16 con PostGIS 3.4 (puerto 5432) - Base de datos relacional con capacidades geoespaciales
- backend: Spring Boot (puerto 8081) - API REST con lógica de negocio
- frontend: Nginx + React (puerto 80) - Servidor web con aplicación React compilada
- solver: Node.js + Wine (puerto 3000) - Servicio solver con ejecución de binarios Windows

### Dockerfiles

#### Backend Dockerfile

Implementa multi-stage build para optimizar tamaño de imagen:

- Stage 1 (Build): Maven 3.9.6 con Eclipse Temurin 21 Alpine para compilación
- Stage 2 (Runtime): Eclipse Temurin 21 JRE Alpine para ejecución
- Usuario no-root (muralla) por seguridad
- Puerto 8081 expuesto para comunicación HTTP

#### Frontend Dockerfile

Implementa multi-stage build para serving estático eficiente:

- Stage 1 (Build): Node.js 20 Alpine para compilación con Vite
- Stage 2 (Serve): Nginx Alpine para serving de assets estáticos
- Configuración personalizada de Nginx para proxy de API
- Puerto 80 expuesto para tráfico HTTP

#### Solver Dockerfile

Implementa contenedor Node.js con Wine:

- Node.js 20 Alpine como base
- Wine instalado para ejecución de binarios Windows
- Archivos JAR y EXE copiados para procesamiento
- Puerto 3000 expuesto para comunicación HTTP

### Configuración Nginx

El archivo de configuración implementa:

- Serving de archivos estáticos de React compilada
- Proxy de peticiones /api/ hacia backend en puerto 8081
- Configuración de gzip compression para optimización
- Manejo de SPA con fallback a index.html para rutas React Router

---

## 8. Seguridad y Autenticación

### Arquitectura de Seguridad

#### JWT (JSON Web Tokens)

Implementación de tokens stateless con las siguientes características:

- Algoritmo de firma: HS256 (HMAC SHA-256)
- Duración: 24 horas (86400000 milisegundos)
- Secret: Almacenado en variable de entorno JWT_SECRET
- Payload: Contiene subject (email) y timestamp de expiración

#### OAuth2 Google

Integración con Google Identity Platform mediante:

- Flujo estándar OAuth2 con redirección
- Callback en /login/oauth2/code/google
- Extracción de perfil (email, name, picture)
- Creación automática de usuario si no existe
- Redirección a frontend con token en URL hash (#token=...)

#### JwtAuthenticationFilter

Filtro que intercepta peticiones a endpoints protegidos:

- Intercepta todas las peticiones a /api/**
- Extrae token del header Authorization: Bearer <token>
- Valida firma y expiración del token
- Establece contexto de seguridad de Spring con autenticación
- Retorna 401 Unauthorized si token es inválido o expirado

### Medidas de Seguridad Implementadas

| Medida | Implementación | Propósito |
|--------|---------------|-----------|
| BCrypt | Password hashing con salt automático | Protección de contraseñas en base de datos |
| JWT | Tokens de 24 horas sin estado en servidor | Autenticación stateless escalable |
| CORS | Origen configurado a URL del frontend | Prevención de ataques de origen cruzado |
| Role-Based Access | Roles USER y ADMIN con @PreAuthorize | Control de acceso granular |
| Secret Injection | Variables de entorno para secretos | Protección de credenciales sensibles |
| Non-root User | Contenedores Docker ejecutan como usuario no-root | Principio de mínimo privilegio |

---

## 9. Base de Datos y Modelado

### PostgreSQL + PostGIS

#### Justificación de PostGIS

PostGIS se selecciona por las siguientes capacidades:

- Soporte nativo para datos geoespaciales con tipos de datos especializados
- Funciones espaciales avanzadas (ST_Within, ST_Distance, ST_Intersects, ST_Envelope)
- Índices espaciales GIST para consultas geográficas de alto rendimiento
- SRID 4326 (WGS84) para coordenadas GPS estándar
- Compatibilidad completa con Hibernate Spatial para mapeo ORM

### Esquema de Base de Datos

Relaciones principales entre entidades:

```
_user (1:1) user_preferences
graphs (1:N) graph_nodes
graphs (1:N) graph_edges
```

### Tipos de Datos Geoespaciales

Implementación de tipos PostGIS en entidades JPA:

- geometry(Point, 4326): Para coordenadas de nodos (POIs)
- geometry(Geometry, 4326): Para bounding boxes de grafos completos

### Migraciones Flyway

Ubicación de scripts de migración: src/main/resources/db/migration/

Configuración en application.properties:

```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=0
spring.flyway.locations=classpath:db/migration
```

---

## 10. Resumen Técnico

| Aspecto | Tecnología | Descripción |
|---------|------------|-------------|
| Backend | Java 21, Spring Boot 3.4.1, PostgreSQL 16 | Lenguaje LTS, framework de aplicaciones, base de datos relacional |
| Frontend | React 18.3.1, Vite 6.0.5, MapLibre GL 4.7.1 | Biblioteca UI, build tool, motor de mapas WebGL |
| Seguridad | JWT, OAuth2 Google, BCrypt | Autenticación stateless, autenticación social, hashing de contraseñas |
| Base de Datos | PostgreSQL + PostGIS | Base de datos relacional con extensiones geoespaciales |
| Algoritmos | P-Graph, Dijkstra, Ford-Fulkerson | Optimización combinatoria, ruta más corta, flujo máximo |
| Infraestructura | Docker, Docker Compose, Nginx | Contenerización, orquestración, servidor web |
| Integración | Solver externo vía Wine | Ejecución de binarios Windows en contenedor Linux |

---

**Muralla App 2.0 - Documentación Técnica Completa**

*Generado el 18 de abril de 2026*
