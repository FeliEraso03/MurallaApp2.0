# Plan de Implementación: PostGIS y Almacenamiento de Grafos

> **Para agentes:** HABILIDAD REQUERIDA: Use superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan sintaxis de checkbox (`- [ ]`) para seguimiento.

**Objetivo:** Implementar soporte geoespacial con PostGIS y permitir que los usuarios guarden grafos creados en su base de datos local.

**Arquitectura:**
- PostgreSQL con extensión PostGIS para datos geoespaciales
- Tablas específicas para almacenamiento de grafos (nodos, aristas, metadatos)
- API REST para CRUD de grafos
- UI en frontend para guardar/cargar grafos
- Integración con el editor de grafos existente

**Arquitectura Backend (Spring Boot):**
- `model/` - Entidades JPA (Graph, GraphNode, GraphEdge)
- `repository/` - Repositorios Spring Data JPA
- `service/` - Servicios de negocio (GraphStorageService, PGraphAlgorithmService existente)
- `dto/` - DTOs para requests/responses (GraphRequest, PnsNode, PnsEdge existentes)
- `controller/` - Controladores REST (GraphController)

**Arquitectura Frontend (React):**
- `src/i18n.js` - Sistema de internacionalización (idiomas: es, en, pt, zh, hi, ar, de, ru, fr, it, ja, ko, tr, id, nl)
- `src/locales/` - Archivos de traducción JSON por idioma
- `src/components/` - Componentes UI (GraphManager, etc.)
- `src/App.jsx` - Estado global de la aplicación

**Regla de Internacionalización:**
- TODO: Todo texto visible en interfaces de usuario DEBE usar el sistema i18n (función `t()` en React)
- NO se permiten strings hardcoded en español o inglés en componentes UI
- Usar claves de traducción en formato `seccion.subseccion.clave`
- Ejemplo: `t('graphManager.saveButton')` en lugar de `"Guardar Grafo"`

**Compatibilidad con DTOs Existentes:**
- PnsNode: id, lat, lng, type (1: Source, 2: Intermediate, 3: Output), initialContent, maximumCapacity, enable
- PnsEdge: startNodeId, endNodeId, weight, capacity, time, enable
- Las entidades JPA deben mapearse a estos DTOs para compatibilidad con PGraphAlgorithmService

**Tech Stack:** PostgreSQL, PostGIS, Spring Boot (backend), React (frontend), MapLibre GL JS

---

## Fase 1: Configuración de Base de Datos con PostGIS

### Tarea 1: Instalar y Configurar PostGIS

**Archivos:**
- Modificar: `docker-compose.yml` (contenedor PostgreSQL)
- Crear: `muralla-backend/src/main/resources/db/migration/V2__add_postgis_extension.sql`

- [ ] **Paso 1: Actualizar docker-compose.yml para incluir PostGIS**
  - Cambiar imagen de PostgreSQL a `postgis/postgis:15-3.3`
  - Agregar variables de entorno para configuración PostGIS
  - Asegurar persistencia de datos

- [ ] **Paso 2: Crear migración de Flyway para habilitar PostGIS**
  - Script SQL para ejecutar `CREATE EXTENSION postgis;`
  - Verificar instalación con `SELECT PostGIS_Version();`

- [ ] **Paso 3: Configurar Spring Boot para tipos geoespaciales**
  - Agregar dependencia `hibernate-spatial` o `postgresql-jdbc` con soporte PostGIS
  - Configurar dialecto de Hibernate para PostgreSQL + PostGIS

- [ ] **Paso 4: Prueba de conexión**
  - Verificar que la extensión PostGIS está activa
  - Test de consulta espacial simple

---

## Fase 2: Diseño de Esquema de Base de Datos

### Tarea 2: Crear Tablas para Almacenamiento de Grafos

**Archivos:**
- Crear: `muralla-backend/src/main/resources/db/migration/V3__create_graphs_tables.sql`

- [ ] **Paso 1: Crear tabla `graphs` (metadatos de grafos)**
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key a users)
  - `name` (VARCHAR, nombre del grafo)
  - `description` (TEXT, descripción opcional)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
  - `is_public` (BOOLEAN, para compartir grafos)
  - `bounds` (geometry, bbox del grafo)

- [ ] **Paso 2: Crear tabla `graph_nodes` (nodos del grafo)**
  - `id` (UUID, primary key)
  - `graph_id` (UUID, foreign key a graphs)
  - `node_id` (VARCHAR, ID del nodo compatible con PnsNode.id)
  - `lat` (DOUBLE, latitud compatible con PnsNode.lat)
  - `lng` (DOUBLE, longitud compatible con PnsNode.lng)
  - `type` (INTEGER, tipo de nodo compatible con PnsNode.type: 1=Source, 2=Intermediate, 3=Output)
  - `initial_content` (DOUBLE, compatible con PnsNode.initialContent)
  - `maximum_capacity` (DOUBLE, compatible con PnsNode.maximumCapacity)
  - `enable` (BOOLEAN, compatible con PnsNode.enable)
  - `coordinates` (geometry, POINT con lat/long para consultas espaciales)
  - `created_at` (TIMESTAMP)

- [ ] **Paso 3: Crear tabla `graph_edges` (aristas del grafo)**
  - `id` (UUID, primary key)
  - `graph_id` (UUID, foreign key a graphs)
  - `start_node_id` (VARCHAR, ID del nodo inicial compatible con PnsEdge.startNodeId)
  - `end_node_id` (VARCHAR, ID del nodo final compatible con PnsEdge.endNodeId)
  - `weight` (DOUBLE, peso de la arista compatible con PnsEdge.weight)
  - `capacity` (DOUBLE, capacidad compatible con PnsEdge.capacity)
  - `time` (DOUBLE, tiempo estimado compatible con PnsEdge.time)
  - `enable` (BOOLEAN, compatible con PnsEdge.enable)
  - `created_at` (TIMESTAMP)

- [ ] **Paso 4: Crear índices espaciales**
  - Índice GiST en `graphs.bounds`
  - Índice GiST en `graph_nodes.coordinates`
  - Índices en claves foráneas para joins rápidos

- [ ] **Paso 5: Crear restricciones y triggers**
  - ON DELETE CASCADE para nodos/aristas al eliminar grafo
  - Trigger para actualizar `updated_at` en graphs

---

## Fase 3: Backend - Modelos y Repositorios

### Tarea 3: Crear Entidades JPA con Soporte PostGIS

**Archivos:**
- Crear: `muralla-backend/src/main/java/com/muralla/model/Graph.java`
- Crear: `muralla-backend/src/main/java/com/muralla/model/GraphNode.java`
- Crear: `muralla-backend/src/main/java/com/muralla/model/GraphEdge.java`

- [ ] **Paso 1: Crear entidad Graph**
  - Mapear tabla `graphs`
  - Relación OneToMany con GraphNode
  - Relación OneToMany con GraphEdge
  - Usar `@Type(type = "jts_geometry")` para campo bounds
  - Integrar con User existente (ManyToOne)
  - Compatibilidad con PnsNode/PnsEdge: id, name, description, isPublic

- [ ] **Paso 2: Crear entidad GraphNode**
  - Mapear tabla `graph_nodes`
  - Relación ManyToOne con Graph
  - Campos: node_id, lat, lng, type, initial_content, maximum_capacity, enable
  - Usar Point de JTS para coordinates (lat/lng para consultas espaciales)
  - Compatibilidad con PnsNode: id=node_id, lat, lng, type, initialContent=initial_content, maximumCapacity=maximum_capacity, enable

- [ ] **Paso 3: Crear entidad GraphEdge**
  - Mapear tabla `graph_edges`
  - Relación ManyToOne con Graph
  - Campos: start_node_id, end_node_id, weight, capacity, time, enable
  - Compatibilidad con PnsEdge: startNodeId=start_node_id, endNodeId=end_node_id, weight, capacity, time, enable

### Tarea 4: Crear Repositorios Spring Data

**Archivos:**
- Crear: `muralla-backend/src/main/java/com/muralla/repository/GraphRepository.java`
- Crear: `muralla-backend/src/main/java/com/muralla/repository/GraphNodeRepository.java`
- Crear: `muralla-backend/src/main/java/com/muralla/repository/GraphEdgeRepository.java`

- [ ] **Paso 1: Crear GraphRepository**
  - Métodos CRUD básicos
  - findByUserId para grafos de un usuario
  - findByIsPublic para grafos públicos
  - Query espacial para buscar grafos cerca de una ubicación

- [ ] **Paso 2: Crear GraphNodeRepository**
  - findByGraphId para nodos de un grafo
  - findByExternalId para buscar nodo por ID del editor

- [ ] **Paso 3: Crear GraphEdgeRepository**
  - findByGraphId para aristas de un grafo
  - findByStartNodeId y findByEndNodeId

---

## Fase 4: Backend - Servicios y Controladores

### Tarea 5: Crear DTOs para Gestión de Grafos

**Archivos:**
- Crear: `muralla-backend/src/main/java/com/muralla/dto/GraphSaveRequest.java`
- Crear: `muralla-backend/src/main/java/com/muralla/dto/GraphResponse.java`
- Crear: `muralla-backend/src/main/java/com/muralla/dto/GraphNodeDTO.java`
- Crear: `muralla-backend/src/main/java/com/muralla/dto/GraphEdgeDTO.java`

- [ ] **Paso 1: Crear GraphSaveRequest**
  - Campos para nombre, descripción, is_public
  - Lista de nodos y aristas (compatibles con formato PnsNode/PnsEdge existentes en dto/)
  - Validación de datos

- [ ] **Paso 2: Crear GraphResponse**
  - Campos de metadatos del grafo
  - Bounds en formato GeoJSON
  - Timestamps

- [ ] **Paso 3: Crear GraphNodeDTO y GraphEdgeDTO**
  - Compatibles con formato PnsNode/PnsEdge existentes en dto/
  - Campos para conversión a/from entidades JPA

### Tarea 6: Crear Servicio de Gestión de Grafos

**Archivos:**
- Crear: `muralla-backend/src/main/java/com/muralla/service/GraphStorageService.java`

- [ ] **Paso 1: Implementar método saveGraph**
  - Recibir GeoJSON completo del frontend
  - Parsear y extraer nodos y aristas
  - Convertir a formato compatible con PnsNode/PnsEdge existentes en dto/
  - Crear entidad Graph con metadatos
  - Guardar nodos y aristas con coordenadas PostGIS
  - Calcular bounds del grafo usando ST_Envelope

- [ ] **Paso 2: Implementar método loadGraph**
  - Buscar grafo por ID
  - Cargar todos sus nodos y aristas
  - Convertir entidades JPA a formato PnsNode/PnsEdge
  - Generar GeoJSON compatible con PGraphAlgorithmService existente en service/
  - Incluir bounds y metadatos

- [ ] **Paso 3: Implementar método listGraphs**
  - Listar grafos del usuario actual
  - Incluir metadatos básicos (nombre, fecha, bounds)
  - Paginación para muchos grafos

- [ ] **Paso 4: Implementar método deleteGraph**
  - Eliminar grafo y sus nodos/aristas (CASCADE)
  - Verificar propiedad del grafo (solo dueño)

- [ ] **Paso 5: Implementar método updateGraph**
  - Actualizar metadatos del grafo
  - Reemplazar nodos y aristas si se proporcionan
  - Mantener compatibilidad con PGraphAlgorithmService existente en service/

- [ ] **Paso 6: Integrar con PGraphAlgorithmService**
  - Convertir entre entidades JPA y DTOs PnsNode/PnsEdge
  - Validar que grafos guardados sean ejecutables por algoritmos

### Tarea 7: Crear Controlador REST

**Archivos:**
- Crear: `muralla-backend/src/main/java/com/muralla/controller/GraphController.java`

- [ ] **Paso 1: Crear endpoint POST /api/graphs**
  - Guardar nuevo grafo
  - Recibir GraphSaveRequest con GeoJSON
  - Usar GraphStorageService de service/
  - Validar datos de entrada

- [ ] **Paso 2: Crear endpoint GET /api/graphs**
  - Listar grafos del usuario
  - Usar GraphStorageService
  - Soportar paginación y filtros

- [ ] **Paso 3: Crear endpoint GET /api/graphs/{id}`
  - Cargar grafo específico
  - Retornar GeoJSON compatible con PGraphAlgorithmService existente en service/
  - Usar GraphStorageService

- [ ] **Paso 4: Crear endpoint PUT /api/graphs/{id}**
  - Actualizar grafo existente
  - Validar propiedad del grafo
  - Usar GraphStorageService de service/
  - Usar GraphStorageService

- [ ] **Paso 5: Crear endpoint DELETE /api/graphs/{id}**
  - Eliminar grafo
  - Validar propiedad del grafo
  - Usar GraphStorageService

- [ ] **Paso 6: Actualizar SecurityConfig**
  - Agregar endpoints a rutas públicas/privadas según corresponda
  - Verificar autenticación para operaciones de escritura
  - Revisar config/security/SecurityConfig.java existente

---

## Fase 5: Frontend - UI para Guardar/Cargar Grafos

### Tarea 8: Agregar UI de Gestión de Grafos en App.jsx

**Archivos:**
- Modificar: `muralla-frontend/src/App.jsx`
- Modificar: `muralla-frontend/src/App.css`

- [ ] **Paso 1: Agregar estados para gestión de grafos**
  - `savedGraphs` (lista de grafos guardados)
  - `currentGraphId` (grafo actualmente cargado)
  - `showGraphsModal` (visibilidad del modal)

- [ ] **Paso 2: Crear función fetchSavedGraphs**
  - Llamar a GET /api/graphs
  - Almacenar en estado savedGraphs

- [ ] **Paso 3: Crear función saveCurrentGraph**
  - Convertir estado actual del editor a GeoJSON
  - Llamar a POST /api/graphs
  - Actualizar lista de grafos guardados

- [ ] **Paso 4: Crear función loadGraph**
  - Llamar a GET /api/graphs/{id}
  - Parsear GeoJSON recibido
  - Actualizar estado del editor con nodos y aristas

- [ ] **Paso 5: Crear función deleteGraph**
  - Llamar a DELETE /api/graphs/{id}
  - Actualizar lista de grafos guardados

### Tarea 8: Crear Componente GraphManager

**Archivos:**
- Crear: `muralla-frontend/src/components/GraphManager.jsx`

- [ ] **Paso 1: Crear componente GraphManager**
  - Modal para listar grafos guardados
  - Lista de grafos con nombre, fecha, descripción
  - Botones para cargar, editar, eliminar cada grafo
  - Botón para guardar grafo actual

- [ ] **Paso 2: Agregar formulario de nuevo grafo**
  - Campo para nombre del grafo
  - Campo para descripción opcional
  - Checkbox para hacer público
  - Botón de guardar

- [ ] **Paso 3: Implementar confirmación de eliminación**
  - Modal de confirmación antes de eliminar
  - Mensaje de advertencia

- [ ] **Paso 4: Agregar indicadores de carga**
  - Spinner mientras se guardan/cargan grafos
  - Mensajes de error/éxito

### Tarea 9: Integrar GraphManager en Sidebar

**Archivos:**
- Modificar: `muralla-frontend/src/App.jsx`

- [ ] **Paso 1: Agregar botón "Mis Grafos" en sidebar**
  - Nueva sección en tab "Editor"
  - Icono de carpeta/grafos
  - Abrir modal GraphManager al hacer clic

- [ ] **Paso 2: Agregar botón "Guardar Grafo" en toolbar**
  - Botón flotante o en toolbar del editor
  - Guardar grafo actual con nombre por defecto

- [ ] **Paso 3: Agregar estilos CSS**
  - Estilos para modal de grafos
  - Estilos para lista de grafos
  - Estilos para formulario de nuevo grafo

---

## Fase 6: Integración con Editor de Grafos

### Tarea 10: Sincronizar GeoJSON con PostGIS

**Archivos:**
- Modificar: `muralla-frontend/src/components/MapGraphEditor.jsx`
- Modificar: `muralla-frontend/src/App.jsx`

- [ ] **Paso 1: Crear función exportGraphToGeoJSON**
  - Exportar estado actual del editor a GeoJSON
  - Incluir nodos (Point) y aristas (LineString)
  - Incluir propiedades de cada feature

- [ ] **Paso 2: Crear función importGraphFromGeoJSON**
  - Parsear GeoJSON recibido del backend
  - Convertir a formato interno del editor
  - Actualizar estado de nodes y edges

- [ ] **Paso 3: Validar GeoJSON antes de guardar**
  - Verificar estructura correcta
  - Validar coordenadas
  - Verificar referencias entre nodos y aristas

- [ ] **Paso 4: Manejar errores de carga**
  - Mostrar mensajes de error si GeoJSON es inválido
  - Recuperar estado anterior si falla carga

---

## Fase 7: Optimizaciones y Funcionalidades Avanzadas

### Tarea 11: Consultas Espaciales

**Archivos:**
- Modificar: `muralla-backend/src/main/java/com/muralla/repository/GraphRepository.java`
- Modificar: `muralla-backend/src/main/java/com/muralla/service/GraphService.java`

- [ ] **Paso 1: Implementar búsqueda de grafos cercanos**
  - Query usando ST_Distance
  - Encontrar grafos dentro de X km de una ubicación
  - Endpoint GET /api/graphs/near?lat=&lon=&radius=

- [ ] **Paso 2: Implementar búsqueda por área**
  - Query usando ST_Within
  - Encontrar grafos dentro de un bbox
  - Endpoint GET /api/graphs/within?bbox=

- [ ] **Paso 3: Agregar índices para búsquedas espaciales**
  - Optimizar queries con índices GiST
  - Analizar rendimiento de queries

### Tarea 12: Compartir Grafos

**Archivos:**
- Modificar: `muralla-backend/src/main/java/com/muralla/service/GraphService.java`
- Modificar: `muralla-frontend/src/components/GraphManager.jsx`

- [ ] **Paso 1: Implementar grafos públicos**
  - Endpoint GET /api/graphs/public para listar grafos públicos
  - Verificar is_public flag en consultas

- [ ] **Paso 2: Agregar UI para compartir grafos**
  - Checkbox "Hacer público" al guardar
  - Indicador visual de grafos públicos
  - Enlace para compartir grafo público

- [ ] **Paso 3: Implementar clonar grafo**
  - Endpoint POST /api/graphs/{id}/clone
  - Crear copia del grafo para otro usuario
  - UI para clonar grafos públicos

---

## Fase 8: Pruebas y Documentación

### Tarea 13: Pruebas de Integración

**Archivos:**
- Crear: `muralla-backend/src/test/java/com/muralla/service/GraphServiceTest.java`
- Crear: `muralla-backend/src/test/java/com/muralla/controller/GraphControllerTest.java`

- [ ] **Paso 1: Pruebas de unidad para GraphService**
  - Test saveGraph con datos válidos
  - Test loadGraph con grafo existente
  - Test deleteGraph con propiedad verificada

- [ ] **Paso 2: Pruebas de integración para GraphController**
  - Test endpoint POST /api/graphs
  - Test endpoint GET /api/graphs
  - Test endpoint GET /api/graphs/{id}

- [ ] **Paso 3: Pruebas de consultas espaciales**
  - Test búsqueda de grafos cercanos
  - Test búsqueda por área

### Tarea 14: Documentación

**Archivos:**
- Crear: `docs/postgis-graph-storage.md`

- [ ] **Paso 1: Documentar esquema de base de datos**
  - Diagrama ER de tablas
  - Descripción de campos y tipos

- [ ] **Paso 2: Documentar API REST**
  - Endpoints disponibles
  - Ejemplos de requests/responses
  - Formatos de GeoJSON

- [ ] **Paso 3: Documentar uso en frontend**
  - Cómo guardar un grafo
  - Cómo cargar un grafo
  - Cómo compartir grafos

- [ ] **Paso 4: Actualizar README principal**
  - Agregar sección sobre almacenamiento de grafos
  - Instrucciones de configuración de PostGIS

---

## Fase 9: Despliegue

### Tarea 15: Preparar Despliegue

**Archivos:**
- Modificar: `docker-compose.yml`
- Crear: `scripts/setup-postgis.sh`

- [ ] **Paso 1: Actualizar docker-compose para producción**
  - Configurar volúmenes persistentes
  - Agregar variables de entorno sensibles
  - Configurar backup de base de datos

- [ ] **Paso 2: Crear script de inicialización**
  - Script para crear extensiones PostGIS
  - Script para migraciones iniciales

- [ ] **Paso 3: Pruebas de despliegue**
  - Desplegar en entorno de staging
  - Verificar que PostGIS funciona correctamente
  - Test de carga con grafos grandes

---

## Resumen de Entregables

**Backend:**
- PostgreSQL + PostGIS configurado
- 3 tablas nuevas (graphs, graph_nodes, graph_edges)
- 3 entidades JPA con soporte espacial
- 3 repositorios Spring Data
- GraphService con 5 métodos principales
- GraphController con 5 endpoints REST
- Migraciones de Flyway

**Frontend:**
- GraphManager component
- UI para guardar/cargar grafos
- Integración con MapGraphEditor
- Modal de gestión de grafos
- Estilos CSS para nuevos componentes

**Documentación:**
- Esquema de base de datos documentado
- API REST documentada
- Guía de uso para usuarios
- README actualizado
