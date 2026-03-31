# Design Spec: Muralla App 2.0 Mapping & Graph Editor Enhancements

## Context
Migrate and adapt key mapping features from version 1.0 (Leaflet-based) to the new MapLibre engine (version 2.0). Specifically focused on adding a dynamic grid (cuadrícula) and expanding the graph creation and selection interface.

## Goals
1.  **Dynamic Grid Overlay**: Replicate the visualization of a map grid that adapts to the current geographic bounds.
2.  **Directed/Undirected Graph Selection**: Add control for creating directed or undirected edges.
3.  **Algorithm Selection Interface**: Create the UI flow for selecting nodes (Origin/Destination) for Dijkstra and Ford-Fulkerson algorithms.

## Proposed Architecture

### 1. `MapGraphEditor.jsx` (Map Visualization Layer)
- **Grid Source & Layer**:
    - `source id='grid-source'`: Type `geojson`, contains a collection of `LineString` features.
    - `layer id='grid-layer'`: Type `line`, paint property `line-opacity: 0.15`, color `line-color: #3a86ff`.
- **Edge Directionality**:
    - Visual update to `edges-layer` to support directed arrows if `isDirected` is true.
- **Selection Highlighting**:
    - Update `nodes-layer` or add a new `selection-layer` for algorithm selection. Selected nodes (Source/Sink) should have distinct colors.

### 2. `App.jsx` (State & Control Layer)
- **New Reactive States**:
    - `showGrid` (boolean): Default `false`.
    - `isDirected` (boolean): Default `false`.
    - `algorithmMode` (`'NONE' | 'DIJKSTRA' | 'FORD_FULKERSON'`): Controls the selection logic.
    - `selectedAlgorithmNodes` (array): Holds 0, 1, or 2 nodes picked by the user.
- **UI Sections (Sidebar - Editor Tab)**:
    - **Map Overlays**: "Mostrar Cuadrícula" (Toggle Switch).
    - **Configuración de Grafo**: "Aristas Dirigidas" (Toggle Switch).
    - **Algoritmos Locales**: Button group for "Dijkstra" and "Ford-Fulkerson". When active, show selection progress ("Selecciona Origen", "Selecciona Destino").

### 3. Logic Detail - Dynamic Grid Generation
A internal helper within `MapGraphEditor` will:
1.  Listen to `map.on('moveend')`.
2.  Get current `map.getBounds()`.
3.  Generate vertical and horizontal lines every fixed step (e.g., 0.0005 degrees).
4.  Update `'grid-source'` data via `setData`.

## Performance Considerations
- Grid generation only runs when the map is idle (`moveend`) and when `showGrid` is true.
- Efficient GeoJSON updates avoid recreating full map layers.

## Success Criteria
- User can toggle a visible grid on/off.
- The grid remains visible and correctly spaced as the map moves.
- User can toggle directed graph mode in the sidebar.
- User can select nodes for algorithms, and they are visually highlighted on the map.
