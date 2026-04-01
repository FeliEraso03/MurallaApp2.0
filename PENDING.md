# Funcionalidades Pendientes y Backlog (P-Graph Project)

Este documento rastrea las funcionalidades de **MurallaApp 2.0** que no se han implementado o que han sido postergadas deliberadamente.

## Pendientes Críticos

### Algoritmo WDG2PNS ⏳
- **Descripción**: Algoritmo especializado para la interpretación de estructuras factibles generadas por un motor matemático externo (P-Graph).
- **Ubicación en V1 (Legacy)**: `legacy-v1\Act\App\Graph Manager\WDG2PNS.js`.
- **Estatus**: En espera (**WAITING**).
- **Razón**: Dependencia crítica de un servicio externo de optimización que entrega resultados en formato de texto plano.
- **Flujo de Operación Identificado**:
    1. **Entrada de Datos**: Recibe un archivo de texto con el formato `Feasible structure #n`.
    2. **Extracción (Parsing)**: Utiliza expresiones regulares para identificar unidades operativas (`Operating units`) y conexiones de flujo (`START => END`).
    3. **Filtrado Geográfico**: Cruza los IDs extraídos con el GeoJSON base de la aplicación para seleccionar únicamente los nodos y aristas que componen la solución factible.
    4. **Generación de Soluciones**: Empaqueta los resultados en un objeto `SolucionesGeoJSON`.
    5. **Visualización**: El frontend utiliza este objeto para poblar el control de selección (`Path Selection`) y renderizar sub-grafos específicos en el mapa.
- **Acción Requerida**: Integrar el parser de texto en el backend de Spring Boot (`muralla-backend`) para procesar las respuestas del servicio externo una vez esté disponible.

## Postergados

### Mapa de Calor (Heatmap) ⛔
- **Descripción**: Visualización de intensidad de puntos de tráfico o interés.
- **Razón**: No hay interés por parte del usuario en transferirlo de la misma forma que en la versión legacy-v1. 
- **Nota**: Se reconsiderará su implementación en el futuro si hay un nuevo requerimiento de diseño.

---
*Documento creado el: 2026-03-31*
