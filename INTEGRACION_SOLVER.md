# Integración del Solver P-Graph con la Aplicación

## Estado Actual

✅ **Servicio Solver Dockerizado**: Corriendo en `http://localhost:3000`
- Contenedor: `muralla-solver`
- Endpoint: `POST /upload-geojson`
- API: Recibe GeoJSON, procesa con WDG2PNSv2.jar + Wine + pgraph_solver.exe

✅ **Backend Spring Boot**: Endpoint del solver implementado
- Archivo: `muralla-backend/src/main/java/com/muralla/controller/SolverController.java`
- Endpoint: `POST /api/solver/solve`
- URL del backend: `http://localhost:8081/api/solver/solve`

✅ **Frontend React**: Integración completa
- Archivo: `muralla-frontend/src/App.jsx`
- Archivo: `muralla-frontend/src/utils/wdg2pns.js` (parser de salida del solver)
- Archivo: `muralla-frontend/src/components/MapGraphEditor.jsx` (renderizado de soluciones)
- Archivo: `muralla-frontend/src/components/RouteSolutionSelector.jsx` (selector de soluciones)

✅ **Selector de Soluciones**: Funcional
- Muestra todas las soluciones generadas por el solver
- Permite cambiar entre soluciones
- Renderiza la solución seleccionada en el mapa

## Correcciones Realizadas

1. **MapGraphEditor.jsx**: Corregido para usar `routeSolutions.soluciones.find(s => s.solucion === activeSolution)` en lugar de `routeSolutions[activeSolution]`
2. **MapGraphEditor.jsx**: Corregidas verificaciones de longitud para usar `routeSolutions.soluciones.length > 0`
3. **App.jsx**: Corregido selector de soluciones para usar `routeSolutions.soluciones` en lugar de `routeSolutions`
4. **wdg2pns.js**: Parser actualizado para manejar correctamente las conexiones con IDs compuestos (ej: Node1_Node2)

## Pasos para Integración

### 1. Backend Spring Boot - Crear Endpoint del Solver

**Archivo:** `muralla-backend/src/main/java/com/muralla/controller/SolverController.java`

```java
package com.muralla.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;

@RestController
@RequestMapping("/api/solver")
@CrossOrigin(origins = "*")
public class SolverController {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final String SOLVER_URL = "http://muralla-solver:3000/upload-geojson";
    
    @PostMapping("/solve")
    public ResponseEntity<?> solveGraph(@RequestBody Map<String, Object> geojson) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(geojson, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                SOLVER_URL, 
                request, 
                Map.class
            );
            
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error al procesar con el solver: " + e.getMessage()
            ));
        }
    }
}
```

### 2. Frontend - Agregar Botón de Solver

**Archivo:** `muralla-frontend/src/components/MapGraphEditor.jsx`

Agregar prop para el solver:
```jsx
export const MapGraphEditor = ({
    // ... props existentes
    onSolveGraph, // Nueva prop
}) => {
    // ... código existente
```

Agregar botón en la UI:
```jsx
// En el render, agregar botón para resolver
<button onClick={() => onSolveGraph(currentGeoJSON)}>
    Generar Rutas P-Graph
</button>
```

### 3. Frontend - Llamar al Backend

**Archivo:** `muralla-frontend/src/App.jsx` o componente principal

```jsx
const handleSolveGraph = async (geojson) => {
    try {
        const response = await fetch('http://localhost:8081/api/solver/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geojson)
        });
        
        const result = await response.json();
        console.log('Resultado del solver:', result);
        
        // Procesar el resultado y actualizar el estado
        if (result.output) {
            // Parsear el output del solver usando el algoritmo WDG2PNS
            const solutions = parseSolverOutput(result.output, geojson);
            setRouteSolutions(solutions);
        }
    } catch (error) {
        console.error('Error al llamar al solver:', error);
    }
};
```

### 4. Frontend - Adaptar Algoritmo WDG2PNS Legacy

**Archivo:** `muralla-frontend/src/utils/wdg2pns.js` (nuevo archivo)

```javascript
export function parseSolverOutput(outputText, baseGeoJSON) {
    const regexSoluciones = /Feasible structure #(\d+):\s+Materials:[\s\S]*?Operating units:\s+([\s\S]*?)Total annual cost=.*?Euro\/yr/g;
    const soluciones = [];
    let match;
    
    while ((match = regexSoluciones.exec(outputText)) !== null) {
        const index = Number(match[1]);
        const operaciones = match[2].trim().split('\n');
        const conexiones = operaciones
            .map((line) => {
                const flechaMatch = line.match(/(\w+)_\w+.*?=> (\w+)/);
                if (flechaMatch) {
                    return { inicio: flechaMatch[1], fin: flechaMatch[2] };
                }
                return null;
            })
            .filter(Boolean);
        
        const nodosSet = new Set();
        const aristasSet = new Set();
        
        conexiones.forEach(({ inicio, fin }) => {
            nodosSet.add(inicio);
            nodosSet.add(fin);
            aristasSet.add(`${inicio}_${fin}`);
        });
        
        const features = baseGeoJSON.features.filter((f) => {
            if (f.geometry.type === 'Point') {
                return nodosSet.has(f.properties.id);
            } else if (f.geometry.type === 'LineString') {
                const { startNodeId, endNodeId } = f.properties;
                return aristasSet.has(`${startNodeId}_${endNodeId}`);
            }
            return false;
        });
        
        soluciones.push({
            solucion: index,
            features,
            name: `Solución #${index}`
        });
    }
    
    return {
        type: 'SolucionesGeoJSON',
        soluciones
    };
}
```

### 5. Frontend - Selector de Soluciones

**Archivo:** `muralla-frontend/src/components/RouteSolutionSelector.jsx` (nuevo archivo)

```jsx
import React from 'react';

export const RouteSolutionSelector = ({ solutions, activeSolution, onSelectSolution }) => {
    if (!solutions || solutions.length === 0) return null;
    
    return (
        <div className="solution-selector">
            <label htmlFor="solution-select">Seleccionar Solución:</label>
            <select 
                id="solution-select"
                value={activeSolution || ''}
                onChange={(e) => onSelectSolution(Number(e.target.value))}
            >
                <option value="">-- Seleccionar --</option>
                {solutions.map((sol) => (
                    <option key={sol.solucion} value={sol.solucion}>
                        {sol.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
```

## Flujo Completo de Integración

1. **Usuario carga grafo** en la aplicación
2. **Usuario hace clic** en "Generar Rutas P-Graph"
3. **Frontend envía GeoJSON** al backend (`POST /api/solver/solve`)
4. **Backend llama al solver** (`http://muralla-solver:3000/upload-geojson`)
5. **Solver procesa**:
   - Extrae nodos tipo 1 (origen) y tipo 3 (destino)
   - Ejecuta WDG2PNSv2.jar para generar .in
   - Ejecuta pgraph_solver.exe vía Wine
   - Retorna texto plano con soluciones
6. **Backend devuelve resultado** al frontend
7. **Frontend parsea resultado** usando función WDG2PNS
8. **Frontend muestra selector** de soluciones
9. **Usuario selecciona solución**
10. **Frontend renderiza** la solución seleccionada en el mapa

## Requisitos del GeoJSON

El GeoJSON enviado al solver debe tener:
- **Nodos** con `type: 1` (origen) y `type: 3` (destino)
- **Aristas** con `startNodeId`, `endNodeId`, `distance`
- **IDs de nodos** deben seguir el formato `Node\d+` (ej: Node1, Node2)

Ejemplo:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-75.549548, 10.425248] },
      "properties": { "id": "Node1", "type": 1 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-75.550000, 10.426000] },
      "properties": { "id": "Node2", "type": 3 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [...] },
      "properties": { "startNodeId": "Node1", "endNodeId": "Node2", "distance": 100 }
    }
  ]
}
```

## Pruebas

1. **Verificar contenedores**:
   ```bash
   docker-compose ps
   ```

2. **Probar solver directamente**:
   ```bash
   curl -X POST http://localhost:3000/upload-geojson \
     -H "Content-Type: application/json" \
     -d @test-geojson.json
   ```

3. **Verificar logs del solver**:
   ```bash
   docker logs muralla-solver
   ```

## Notas Importantes

- El primer inicio del solver puede ser lento debido a la inicialización de Wine
- El solver requiere que el GeoJSON tenga nodos con tipos específicos (1 = origen, 3 = destino)
- Las soluciones múltiples se generan automáticamente por el solver P-Graph
- El backend debe tener conectividad con el contenedor solver (red Docker)
