# Preferencias de Rutas Turísticas — MurallaApp 2.0

> **Documento de diseño** — Define las dimensiones, categorías y metodología de captura de preferencias turísticas para la personalización de rutas en el Centro Histórico de Cartagena de Indias.

---

## 1. Contexto y Justificación

El sistema de planificación de rutas de MurallaApp 2.0 utiliza el **P-graph** (Process Graph) junto con algoritmos como Dijkstra y Ford-Fulkerson para calcular rutas óptimas entre puntos de interés (POI) dentro de la Ciudad Amurallada. La personalización de estas rutas depende directamente de las **preferencias del usuario**, que actúan como pesos en los nodos y aristas del grafo.

Capturar preferencias bien estructuradas permite al sistema:
- Priorizar nodos con categorías de mayor interés (ej. cultura > gastronomía).
- Ajustar los pesos de las aristas según restricciones de tiempo y movilidad.
- Generar rutas verdaderamente personalizadas y no solo óptimas en distancia o tiempo.

Las categorías definidas aquí están basadas en:
- **Literatura académica** sobre tipologías de turistas culturales (McKercher & du Cros, 2002).
- **Estudios del Observatorio Turístico de Cartagena** y el DANE.
- **Encuestas de salida** del Aeropuerto Internacional Rafael Núñez.
- **Análisis del inventario de POIs** del Centro Histórico de Cartagena.

---

## 2. Dimensiones de Preferencia

### 2.1 Categorías de Interés (Pesos 1–10)

Cada categoría recibe un peso de **1 (poco interés)** a **10 (máximo interés)**. Estos valores se traducen directamente como multiplicadores de prioridad en los nodos del P-graph.

#### 🏛️ Interés Cultural e Histórico (`interestCulture`)
Mide el atractivo por el patrimonio construido y la historia colonial.

**POIs representativos:**
- Murallas de Cartagena (Baluartes San Francisco Javier, Santiago, Santa Catalina)
- Castillo de San Felipe de Barajas
- Museo del Oro Zenú (Banco de la República)
- Casa de la Inquisición - Palacio de la Inquisición
- Museo de Arte Moderno de Cartagena
- Claustro de La Merced / Teatro Adolfo Mejía

**Pregunta de captura:** *"¿Qué tan interesado estás en visitar museos, murallas, plazas históricas y sitios del patrimonio colonial?"*

---

#### ⛪ Interés Religioso y Espiritual (`interestReligion`)
Mide el atractivo por templos, conventos y sitios de devoción.

**POIs representativos:**
- Catedral de Santa Catalina de Alejandría
- Iglesia y Convento de San Pedro Claver
- Iglesia de Santo Domingo (La Volteada)
- Iglesia de La Trinidad (Getsemaní)
- Convento de La Popa
- Santuario de nuestra señora de la Candelaria

**Pregunta de captura:** *"¿Qué tanto valoras en tu recorrido los templos, conventos e iglesias históricas?"*

---

#### 🍽️ Interés Gastronómico (`interestGastronomy`)
Mide el interés en la gastronomía local marina y caribeña.

**POIs representativos:**
- Mercado de Bazurto (cultura culinaria popular)
- Restaurantes tipicos del Barrio Getsemaní
- Plazas de Mercado del Centro
- Restaurantes en el Casco Histórico (arroz con coco, fish & chips caribeño)
- Heladerías, fruterías y juguerías tradicionales
- La Cevichería / La Mulata (referentes gastronómicos)

**Pregunta de captura:** *"¿Qué tan importante es para ti explorar la gastronomía cartagenera durante tu ruta?"*

---

#### 🌿 Interés en Naturaleza y Espacios Abiertos (`interestNature`)
Mide el interés en parques, plazas al aire libre y espacios verdes.

**POIs representativos:**
- Plaza de los Coches / Plaza de la Aduana
- Plaza de Bolívar
- Parque del Centenario
- Boulevard del Centro Histórico
- Parque de la Marina
- Terrazas y miradores de las murallas

**Pregunta de captura:** *"¿Prefieres incluir plazas, parques y espacios al aire libre en tu recorrido?"*

---

#### 🎭 Interés Cultural Vivo y Artesanías (`interestArts`)
Mide el interés en arte urbano, artesanías y expresiones culturales contemporáneas.

**POIs representativos:**
- Barrio Getsemaní (arte mural / graffiti cultural)
- Plaza de la Trinidad (vida bohemia, artistas locales)
- Mercado de Artesanías - Portal de los Dulces
- Las Bóvedas (tiendas de artesanías y joyería)
- Galerías de Arte del Centro Histórico
- Centro de Formación de la Cooperación Española

**Pregunta de captura:** *"¿Te interesan los espacios de arte, artesanías y cultura viva del barrio Getsemaní?"*

---

#### 🗺️ Interés en Exploración y Aventura Urbana (`interestAdventure`)
Mide la disposición a recorrer rutas menos transitadas, callejones y zonas emergentes.

**POIs representativos:**
- Callejón del Embudo (Getsemaní)
- Barrios de la Periferia Histórica
- Rutas de las murallas exteriores
- Zonas de expansión del casco antiguo hacia Manga
- Caminos alternativos a San Diego y Pie de la Popa

**Pregunta de captura:** *"¿Estás dispuesto a explorar callejones, barrios emergentes y rutas poco convencionales?"*

---

### 2.2 Parámetros Logísticos

#### ⏰ Tiempo Disponible (`defaultTimeAvailableHours`)
Duración disponible del usuario para completar la ruta.

| Valor | Descripción |
|-------|-------------|
| 2h    | Recorrido express — principales hitos |
| 4h    | Recorrido estándar — centro + Getsemaní |
| 6h    | Recorrido completo — incluye murallas y museos |
| 8h+   | Día completo — recorrido profundo con paradas gastronómicas |

**Impacto en el grafo:** Actúa como restricción de tiempo máxima en la función objetivo del P-graph.

---

#### 🚶 Modalidad de Desplazamiento (`mobilityType`)
Define qué tipo de aristas son accesibles en el grafo.

| Valor | Descripción |
|-------|-------------|
| `WALK` | Solo a pie — prioriza distancias cortas |
| `MULTI` | Combinado — incluye coches de caballos y tuk-tuks |

**Impacto en el grafo:** Filtra aristas según capacidad y tiempo de cada tipo de transporte.

---

#### 👥 Composición del Grupo (`groupType`)
Define el tipo de grupo para ajustar rutas (accesibilidad, ritmo).

| Valor | Descripción |
|-------|-------------|
| `SOLO` | Viajero individual — ritmo libre, más exploración |
| `COUPLE` | Pareja — balance romantico/cultural |
| `FAMILY` | Familia con niños — prioriza accesibilidad y tiempos cortos |
| `GROUP` | Grupo — prioriza capacidad de los nodos (atractivos con aforo) |

**Impacto en el grafo:** Afecta `maximumCapacity` y tiempo de permanencia en nodos.

---

## 3. Escala de Medición y UI

Las preferencias de interés (secciones 2.1) se capturan mediante **sliders de 1 a 10** con iconografía visual clara. La escala se interpreta así:

| Rango | Interpretación |
|-------|---------------|
| 1 – 3 | Poco o ningún interés — el sistema asigna peso bajo a estos nodos |
| 4 – 6 | Interés moderado — equilibrio estándar |
| 7 – 9 | Alto interés — el sistema prioriza estos nodos |
| 10    | Interés máximo — nodos de esta categoría son obligatorios en la ruta |

---

## 4. Mapeo con el Modelo de Datos

```java
// Entidad UserPreference (Spring Boot / JPA)
public class UserPreference {
    private Integer interestCulture;      // 1-10 → Histórico/Cultural
    private Integer interestReligion;     // 1-10 → Religioso/Espiritual
    private Integer interestGastronomy;   // 1-10 → Gastronómico
    private Integer interestNature;       // 1-10 → Naturaleza/Espacios abiertos
    private Integer interestArts;         // 1-10 → Arte vivo / Artesanías
    private Integer interestAdventure;    // 1-10 → Exploración/Aventura
    
    private Integer defaultTimeAvailableHours; // 2 | 4 | 6 | 8
    private String  mobilityType;              // "WALK" | "MULTI"
    private String  groupType;                 // "SOLO" | "COUPLE" | "FAMILY" | "GROUP"
}
```

---

## 5. Algoritmo de Ponderación en el P-graph

Cuando el usuario inicia una sesión y solicita una ruta, el sistema aplica las preferencias como sigue:

1. **Carga de preferencias:** Se recupera el `UserPreference` desde la BD mediante JWT.
2. **Normalización:** Los valores 1–10 se normalizan a [0.1, 1.0].
3. **Ponderación de nodos:** Cada nodo del grafo tiene una o más categorías asociadas. Su peso efectivo es:

```
peso_nodo = peso_base × max(interestCategoría_i)
```

4. **Restricción de tiempo:** Ford-Fulkerson y Dijkstra reciben como cota superior el `defaultTimeAvailableHours` convertido a minutos.
5. **Filtrado por movilidad:** Se eliminan del grafo las aristas inaccesibles según `mobilityType`.
6. **Ajuste por grupo:** Los nodos con `maximumCapacity` menor que el tamaño del grupo se marcan como `disabled`.

---

## 6. Consideraciones de UX en la Captura

- El formulario se presenta como un **wizard de 3 pasos** (onboarding post-registro):
  - **Paso 1:** Datos básicos (nombre, tiempo, tipo de grupo)
  - **Paso 2:** Intereses culturales y temáticos (sliders)
  - **Paso 3:** Confirmación y avatar de perfil de viajero generado

- El usuario puede **modificar sus preferencias** en cualquier momento desde el panel de usuario dentro de la aplicación.

- Las preferencias tienen **valores por defecto de 5/10** para no bloquear el acceso al editor si el usuario omite el formulario.

---

## 7. Referencias

- McKercher, B. & du Cros, H. (2002). *Cultural Tourism: The Partnership Between Tourism and Cultural Heritage Management*. The Haworth Hospitality Press.
- Observatorio Turístico de Cartagena — *Indicadores de Demanda 2023*.
- DANE — *Encuesta de Gasto Turismo Interno 2022*.
- Ministerio de Comercio, Industria y Turismo de Colombia — *Plan Sectorial de Turismo 2022-2026*.
- Instituto de Patrimonio y Cultura de Cartagena (IPCC) — *Inventario de Bienes de Interés Cultural*.
