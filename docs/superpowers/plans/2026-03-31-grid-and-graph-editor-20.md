# Grid and Graph Editor 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate a dynamic grid overlay and enhanced graph editing controls (directed mode, algorithm selection UI) into Muralla App 2.0.

**Architecture:** 
- `App.jsx` handles core state (`showGrid`, `isDirected`, `algorithmMode`).
- `MapGraphEditor.jsx` observes state and renders the grid using a MapLibre GeoJSON source, updating it on map movement. It also handles directed edge styling.
- `App.css` provides the modern styling for the new sidebar controls.

**Tech Stack:** React, MapLibre GL JS, CSS Modules/Vanilla CSS.

---

### Task 1: Initialize New States in App.jsx

**Files:**
- Modify: `c:\Tareas-Proyectos-Practicas\MurallaApp2.0\muralla-frontend\src\App.jsx`

- [ ] **Step 1: Add showGrid, isDirected, and algorithmMode states**
```javascript
// Inside App function, near other states
const [showGrid, setShowGrid] = useState(false);
const [isDirected, setIsDirected] = useState(false);
const [algorithmMode, setAlgorithmMode] = useState('NONE'); // 'NONE' | 'DIJKSTRA' | 'FORD_FULKERSON'
const [algorithmSelectedNodes, setAlgorithmSelectedNodes] = useState([]);
```

- [ ] **Step 2: Update handleSelectNode logic**
Modify `handleSelectNode` to support algorithm selection.
```javascript
const handleSelectNode = (node) => {
    if (algorithmMode !== 'NONE') {
        setAlgorithmSelectedNodes(prev => {
            if (prev.find(n => n.id === node.id)) return prev; // Avoid duplicates
            const next = [...prev, node].slice(-2); // Keep only last 2
            return next;
        });
        return;
    }
    // Existing edge creation logic...
    if (graphMode !== 'ADD_EDGE') return;
    // ...
};
```

- [ ] **Step 3: Commit state changes**
```bash
git add muralla-frontend/src/App.jsx
git commit -m "feat: add grid and algorithm selection states to App.jsx"
```

---

### Task 2: Implement Dynamic Grid in MapGraphEditor.jsx

**Files:**
- Modify: `c:\Tareas-Proyectos-Practicas\MurallaApp2.0\muralla-frontend\src\components\MapGraphEditor.jsx`

- [ ] **Step 1: Define Grid Generation Helper**
Add a helper inside `MapGraphEditor` to generate a GeoJSON grid based on current bounds.
```javascript
const generateGridGeoJSON = (bounds) => {
    const features = [];
    const step = 0.0005; // ~50-100m depending on lat
    const west = Math.floor(bounds.getWest() / step) * step;
    const east = Math.ceil(bounds.getEast() / step) * step;
    const south = Math.floor(bounds.getSouth() / step) * step;
    const north = Math.ceil(bounds.getNorth() / step) * step;

    for (let x = west; x <= east; x += step) {
        features.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[x, south], [x, north]] }
        });
    }
    for (let y = south; y <= north; y += step) {
        features.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[west, y], [east, y]] }
        });
    }
    return { type: 'FeatureCollection', features };
};
```

- [ ] **Step 2: Add grid-source and grid-layer in setupMapStyle**
```javascript
if (!map.getSource('grid-source')) {
    map.addSource('grid-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
        id: 'grid-layer',
        type: 'line',
        source: 'grid-source',
        paint: { 'line-color': '#3a86ff', 'line-opacity': 0.1, 'line-width': 1 }
    });
}
```

- [ ] **Step 3: Update effect to handle grid visibility and updates**
```javascript
useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    
    const gridLayerVisible = showGrid ? 'visible' : 'none';
    if (map.getLayer('grid-layer')) {
        map.setLayoutProperty('grid-layer', 'visibility', gridLayerVisible);
    }
    
    if (showGrid) {
        const updateGrid = () => {
            const bounds = map.getBounds();
            const gridData = generateGridGeoJSON(bounds);
            if (map.getSource('grid-source')) map.getSource('grid-source').setData(gridData);
        };
        updateGrid();
        map.on('moveend', updateGrid);
        return () => map.off('moveend', updateGrid);
    }
}, [map, showGrid]);
```

- [ ] **Step 4: Commit grid implementation**
```bash
git add muralla-frontend/src/components/MapGraphEditor.jsx
git commit -m "feat: implement dynamic grid visualization in MapGraphEditor"
```

---

### Task 3: Update UI Controls in App.jsx (Sidebar)

**Files:**
- Modify: `c:\Tareas-Proyectos-Practicas\MurallaApp2.0\muralla-frontend\src\App.jsx`
- Modify: `c:\Tareas-Proyectos-Practicas\MurallaApp2.0\muralla-frontend\src\App.css`

- [ ] **Step 1: Add "Map Overlays" section with Grid Toggle**
In the "Editor" tab of the sidebar:
```jsx
<div className="sidebar-section">
    <h3 className="section-title">Opciones de Mapa</h3>
    <div className="toggle-group">
        <label className="switch-label">
            <span>Mostrar Cuadrícula</span>
            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
        </label>
    </div>
</div>
```

- [ ] **Step 2: Add "Algorithm Selection" section**
```jsx
<div className="sidebar-section">
    <h3 className="section-title">Algoritmos</h3>
    <div className="algorithm-buttons">
        <button 
            className={`tool-card ${algorithmMode === 'DIJKSTRA' ? 'active' : ''}`}
            onClick={() => setAlgorithmMode(algorithmMode === 'DIJKSTRA' ? 'NONE' : 'DIJKSTRA')}
        >
            <span>Dijkstra</span>
        </button>
        <button 
            className={`tool-card ${algorithmMode === 'FORD_FULKERSON' ? 'active' : ''}`}
            onClick={() => setAlgorithmMode(algorithmMode === 'FORD_FULKERSON' ? 'NONE' : 'FORD_FULKERSON')}
        >
            <span>Ford-Fulkerson</span>
        </button>
    </div>
    {algorithmMode !== 'NONE' && (
        <div className="selection-status">
            {algorithmSelectedNodes.length === 0 && <p>Selecciona nodo de ORIGEN</p>}
            {algorithmSelectedNodes.length === 1 && <p>Selecciona nodo de DESTINO</p>}
            {algorithmSelectedNodes.length === 2 && (
                <button className="cta-btn primary">Iniciar Cálculo</button>
            )}
        </div>
    )}
</div>
```

- [ ] **Step 3: Basic CSS for new controls**
Add styles in `App.css` for `.switch-label`, `.algorithm-buttons`, etc.

- [ ] **Step 4: Commit UI changes**
```bash
git add muralla-frontend/src/App.jsx muralla-frontend/src/App.css
git commit -m "feat: add grid and algorithm controls to sidebar"
```

---

### Task 4: Visual Feedback for Selection & Directionality

**Files:**
- Modify: `c:\Tareas-Proyectos-Practicas\MurallaApp2.0\muralla-frontend\src\components\MapGraphEditor.jsx`

- [ ] **Step 1: Add selection highlighting in nodes-layer paint**
Update the `circle-color` to reflect algorithm selection.
```javascript
'circle-color': [
    'case',
    ['boolean', ['feature-state', 'selected'], false], '#00ffc8',
    ['==', ['get', 'id'], algorithmSelectedNodes[0]?.id || ''], '#4cc9f0', // Source color
    ['==', ['get', 'id'], algorithmSelectedNodes[1]?.id || ''], '#f72585', // Sink color
    ['==', ['get', 'type'], 1], '#ff7800',
    ['==', ['get', 'type'], 3], '#d62828',
    '#3a86ff'
],
```

- [ ] **Step 2: Add directed arrows (Optional/Basic)**
If `isDirected` is true, add a symbol layer for arrows on edges.
```javascript
// In data sync effect:
if (isDirected) {
    // Logic to add arrows using icon-image if available, or just a simple line styling
}
```

- [ ] **Step 3: Commit visual feedback**
```bash
git add muralla-frontend/src/components/MapGraphEditor.jsx
git commit -m "feat: add visual feedback for algorithm selection and edge directionality"
```
