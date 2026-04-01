# Especificación Detallada de Propuestas de Innovación
## MurallaApp 2.0: Sistema Avanzado de Análisis de Grafos y Patrimonio

Este documento expande las propuestas iniciales, proporcionando un marco técnico y funcional para la evolución de la plataforma hacia una herramienta de grado investigativo y turístico de alto nivel.

---

### I. Análisis Geoespacial y Visualización Inmersiva

#### 1. Sistema de Capas Históricas Temporales (Time-Travel Layers)
Implementación de un selector de época que permita al usuario viajar a través de la evolución urbana de Cartagena.
- **Detalle Técnico**: Uso de tilesets rasterizados georreferenciados (planos coloniales) cargados mediante `addLayer` de tipo `raster`. Se integrará un control de opacidad dinámico (slider) para comparar el pasado con el presente.
- **Caso de Uso**: Observar cómo la construcción de la Muralla en el siglo XVII alteró el flujo de agua y el acceso a la zona de Getsemaní en comparación con la cartografía actual.
- **Valor Funcional**: Permite identificar baluartes desaparecidos o modificados en relación con el grafo actual.

#### 2. Visualización 3D y Extrusión de Datos (Urban Context)
Transformación de la vista plana 2D en una representación tridimensional del relieve urbano.
- **Detalle Técnico**: Aplicación de la propiedad `fill-extrusion` de MapLibre a los polígonos de edificios del Centro Histórico. Los lienzos de la Muralla se representarán con alturas proporcionales a sus datos reales.
- **Caso de Uso**: Comprender la visibilidad estratégica desde lo alto de los baluartes (puntos elevados) hacia el mar o el interior de la ciudad.
- **Valor Funcional**: Mejora la comprensión espacial de los obstáculos físicos que influyen en las rutas del grafo.

#### 3. Modo Sandbox: Escenarios de Análisis Comparativo (Strategy & Defense)
Herramienta de simulación para evaluar la resiliencia y eficiencia de la red de caminos.
- **Detalle Técnico**: Interfaz para guardar "Instantáneas del Grafo" (JSON snapshots). Los usuarios pueden modificar estados (ej. desactivar el Baluarte de Santo Domingo) y comparar el resultado de un algoritmo (Dijkstra) contra el estado base en una vista dividida (split-view).
- **Caso de Uso**: Determinar la ruta de evacuación más rápida si una de las puertas principales de la ciudad (ej. Puerta del Reloj) está inaccesible.
- **Valor Funcional**: Convierte la app en una herramienta de toma de decisiones estratégicas.

---

### II. Enriquecimiento de Datos e Interpretación Histórica

#### 4. Integración de Puntos de Interés (POI) Dinámicos
Capa de información contextual vinculada directamente a los nodos del grafo.
- **Detalle Técnico**: Implementación de un panel lateral (Side Drawer) que se activa al hacer clic en nodos marcados como POI. Integración de galerías de imágenes (fotos actuales vs grabados antiguos) y texto histórico enriquecido.
- **Caso de Uso**: Al seleccionar el nodo del Castillo de San Felipe, el usuario recibe una ficha técnica de su construcción y un resumen de los ataques que resistió.
- **Valor Funcional**: Añade una capa narrativa al análisis matemático del grafo.

#### 5. Algoritmos de Enrutamiento Temático (Contextual Pathfinding)
Evolución del algoritmo Dijkstra tradicional mediante la ponderación de rutas por factores históricos o arquitectónicos.
- **Detalle Técnico**: Modificación de la función de coste del algoritmo. En lugar de usar la distancia física mínima, el coste se reduce si la arista pertenece a una categoría temática (ej. "Ruta de los Túneles" o "Camino de la Artillería").
- **Caso de Uso**: El usuario solicita la "Ruta de la Ingeniería Escarpada" y la app genera un recorrido que prioriza pasar por los baluartes con los sistemas de defensa mejor conservados.
- **Valor Funcional**: Ofrece experiencias personalizadas basadas en el interés del investigador o turista.

---

### III. Infraestructura de Datos y Portabilidad

#### 6. Exportación de Inteligencia de Datos (Data Mastery)
Middleware para la extracción de datos analíticos del sistema.
- **Detalle Técnico**: Endpoint en Spring Boot que consolida el estado actual del grafo del usuario (incluyendo modificaciones temporales) y lo devuelve como un archivo descargable.
    - **GeoJSON**: Para visualización en mapas externos.
    - **CSV/Excel**: Para cálculos estadísticos de pesos y capacidades.
- **Valor Funcional**: Permite que los resultados obtenidos en MurallaApp 2.0 se integren en publicaciones académicas o informes técnicos de conservación.

#### 7. Soporte Offline Progresivo (PWA & Tile Caching)
Garantía de operatividad en entornos de baja conectividad dentro de las murallas.
- **Detalle Técnico**: Registro de un Service Worker para cachear tiles vectoriales y recursos estáticos. Almacenamiento local del grafo mediante `IndexedDB` en el frontend, sincronizándose con el backend de Spring Boot una vez detectada una conexión estable.
- **Valor Funcional**: Asegura que el usuario nunca pierda acceso al mapa o a su trabajo de análisis mientras recorre físicamente el Centro Histórico.

---

### IV. Experiencia del Usuario no Técnico (Enfoque Narrativo y Turístico)

Estas propuestas buscan convertir la rigurosidad técnica de los grafos en una experiencia accesible, educativa y atractiva para visitantes o entusiastas de la historia que no requieren interactuar con la lógica matemática subyacente.

#### 8. Experiencias de Guía Narrativa (Storytelling Tours)
Transformación de las rutas abstractas en recorridos paso a paso con una narrativa histórica coherente.
- **Detalle Funcional**: Selección de un recorrido (ej. "El Asedio de 1741") que guía al usuario nodo por nodo. Cada punto de control activa un fragmento de audio o texto que narra los eventos ocurridos en ese lugar específico.
- **Valor**: Convierte el mapa en un guía turístico digital de bolsillo.

#### 9. Gamificación y Reconocimiento (The Bastion Quest)
Sistema de incentivos para fomentar el recorrido físico y virtual de la Muralla de Cartagena.
- **Detalle Funcional**: Implementación de "Sellos Virtuales" o insignias que se desbloquean al visitar cada baluarte o completar rutas temáticas específicas. Los usuarios pueden ver su progreso en una barra de "Maestría en Historia de la Ciudad".
- **Valor**: Aumenta la retención del usuario y fomenta la exploración de puntos menos conocidos del Centro Histórico.

#### 10. Comparativa Visual 360° (Before & After)
Uso de visores de imagen envolvente para comparar el estado actual de los sitios históricos con su apariencia en siglos pasados.
- **Detalle Funcional**: En puntos clave de la muralla, el usuario puede deslizar un control sobre una imagen 360° para ver una reconstrucción digital o un cuadro antiguo del mismo ángulo de visión.
- **Valor**: Ofrece un impacto visual inmediato sin necesidad de comprender la topografía del grafo.

#### 11. Enrutamiento por "Estado de Ánimo" (Curated Smart Routes)
Reemplazo de los selectores técnicos de algoritmos por una interfaz simple basada en la experiencia deseada del usuario.
- **Detalle Funcional**: En lugar de "Dijkstra" o "Flujo Máximo", el usuario selecciona opciones como:
    - **Ruta del Atardecer**: Prioriza tramos sobre la muralla con vista al mar.
    - **Ruta Express**: Los 3 baluartes más importantes en 20 minutos.
    - **Ruta de la Ingeniería**: Enfoque técnico simplificado para aficionados a la arquitectura.
- **Valor**: Democratiza el acceso a la potencia de los algoritmos de la aplicación para el público general.

#### 12. Integración de Servicios Locales (Local Business Link)
Conexión de la historia con la vida moderna del Centro Histórico.
- **Detalle Funcional**: En el panel de información de los POI, se incluyen recomendaciones de servicios cercanos (cafés, artesanías, museos) que respetan la estética y el valor histórico del entorno.
- **Valor**: Proporciona una utilidad práctica adicional para los usuarios que recorren la ciudad de forma física.

---
*Fin de la especificación extendida para usuarios no técnicos*
