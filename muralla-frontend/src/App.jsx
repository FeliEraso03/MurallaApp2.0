import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapGraphEditor } from './components/MapGraphEditor';
import { ElementModal } from './components/ElementModal';
import './App.css';

const CENTRO_HISTORICO = { lat: 10.425248, lng: -75.549548 };
const BOUNDS = [
  [CENTRO_HISTORICO.lng - 0.015, CENTRO_HISTORICO.lat - 0.015],
  [CENTRO_HISTORICO.lng + 0.015, CENTRO_HISTORICO.lat + 0.015]
];

// ── SVG Icons ──────────────────────────────────────────────
const IconNode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconEdge = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="5" y1="19" x2="19" y2="5"/>
    <circle cx="5" cy="19" r="2.5" fill="currentColor"/>
    <polygon points="19,5 15,5 19,9" fill="currentColor"/>
  </svg>
);
const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconRoute = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/>
    <path d="M6 16V8a6 6 0 0 1 6-6"/><path d="M18 8v8a6 6 0 0 1-6 6"/>
  </svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

function App() {
  const mapContainer = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState('planner'); 

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [graphMode, setGraphMode] = useState('IDLE');
  const [selectedNodeA, setSelectedNodeA] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
  const [routeSolutions, setRouteSolutions] = useState([]);
  const [activeSolution, setActiveSolution] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (mapInstance) return;
    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty', 
      center: [CENTRO_HISTORICO.lng, CENTRO_HISTORICO.lat],
      zoom: 16,
      maxBounds: BOUNDS
    });

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    
    m.on('load', () => {
      setMapInstance(m);
    });

    return () => {
      if (m) {
        m.remove();
      }
    };
  }, []);

  useEffect(() => {
    const h = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Sync map size on sidebar toggle
  useEffect(() => {
    if (mapInstance) {
      setTimeout(() => mapInstance.resize(), 320);
    }
  }, [isSidebarOpen, mapInstance]);

  const setMode = (mode) => {
    setGraphMode(mode);
    if (mode !== 'IDLE') setActiveTab('editor');
  };

  const handleAddNode = (lat, lng) =>
    setModalConfig({ isOpen: true, type: 'NODE', data: { lat, lng } });

  const handleSelectNode = (node) => {
    if (graphMode !== 'ADD_EDGE') return;
    if (!selectedNodeA) { setSelectedNodeA(node); return; }
    if (selectedNodeA.id !== node.id) {
      setModalConfig({ isOpen: true, type: 'EDGE', data: { startNodeId: selectedNodeA.id, endNodeId: node.id } });
    }
    setSelectedNodeA(null);
    setGraphMode('IDLE');
  };

  const handleModalSave = (formData) => {
    if (modalConfig.type === 'NODE') {
      setNodes(prev => [...prev, {
        id: `Node${prev.length + 1}`,
        lat: modalConfig.data.lat, lng: modalConfig.data.lng,
        type: formData.type || 1,
        initialContent: formData.initialContent || 0,
        maximumCapacity: formData.maximumCapacity || 100,
        enable: true
      }]);
    } else if (modalConfig.type === 'EDGE') {
      setEdges(prev => [...prev, {
        startNodeId: modalConfig.data.startNodeId,
        endNodeId: modalConfig.data.endNodeId,
        weight: formData.weight || 10,
        capacity: formData.capacity || 50,
        time: formData.time || 5,
        enable: true
      }]);
    }
    setModalConfig({ isOpen: false, type: null, data: null });
  };

  const handleModalCancel = () => setModalConfig({ isOpen: false, type: null, data: null });

  const generateRoutes = async () => {
    if (nodes.length < 2) { alert('Se necesitan al menos 2 nodos (origen + destino).'); return; }
    setIsGenerating(true);
    try {
      const resp = await fetch('http://localhost:8080/api/routes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const solutions = await resp.json();
      setRouteSolutions(solutions);
      setActiveSolution(0);
    } catch (e) {
      console.error(e);
      alert('Error conectando con el backend en :8080');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadLegacyGraph = async () => {
    try {
      const resp = await fetch('/data/Grafo_Grande.geojson');
      if (!resp.ok) throw new Error('Not found');
      const data = await resp.json();
      const newNodes = [], newEdges = [];
      data.features.forEach(f => {
        if (f.geometry.type === 'Point') newNodes.push({
          id: f.properties.id,
          lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0],
          type: parseInt(f.properties.type) || 1,
          initialContent: parseInt(f.properties.initialContent) || 0,
          maximumCapacity: parseInt(f.properties.maximumCapacity) || 100,
          enable: f.properties.enable
        });
        else if (f.geometry.type === 'LineString') newEdges.push({
          startNodeId: f.properties.startNodeId, endNodeId: f.properties.endNodeId,
          weight: parseInt(f.properties.weight) || 10,
          capacity: parseInt(f.properties.capacity) || 50,
          time: parseInt(f.properties.time) || 5,
          enable: f.properties.enable
        });
      });
      setNodes(newNodes); setEdges(newEdges); setGraphMode('IDLE');
    } catch (e) { alert('Error cargando Grafo_Grande.geojson'); }
  };

  const modeLabel = graphMode === 'ADD_NODE' ? 'Click en el mapa para añadir un nodo'
    : graphMode === 'ADD_EDGE'
      ? selectedNodeA ? `Origen: ${selectedNodeA.id} — selecciona el destino` : 'Selecciona el nodo origen'
      : null;

  return (
    <div className="app-main">
      <header className="topbar">
        <button className="topbar-menu-btn" onClick={() => setSidebarOpen(s => !s)} aria-label="menu">
          {isSidebarOpen ? <IconX /> : <IconMenu />}
        </button>
        <div className="topbar-brand">
          <span className="brand-name">Muralla</span>
          <span className="brand-tag">2.0</span>
        </div>
        <div className="topbar-search">
          <IconSearch />
          <input type="text" placeholder="Buscar lugar en Cartagena..." />
        </div>
        <div className="topbar-stats">
          <span className="stat-chip">{nodes.length} <small>nodos</small></span>
          <span className="stat-chip">{edges.length} <small>aristas</small></span>
        </div>
      </header>

      <div className="content-wrapper">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-tabs">
            <button className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>
              <IconMap /> Planificar
            </button>
            <button className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>
              <IconEdit /> Editor
            </button>
          </div>

          {activeTab === 'planner' && (
            <div className="tab-content">
              <div className="sidebar-section">
                <h3 className="section-title">Parámetros de Ruta</h3>
                <div className="field-group">
                  <label>Tiempo disponible (horas)</label>
                  <input type="number" defaultValue={4} min={1} max={12} />
                </div>
                <div className="field-group">
                  <label>Preferencia de experiencia</label>
                  <select>
                    <option>🏛️ Histórico Colonial</option>
                    <option>🍽️ Gastronómico Marítimo</option>
                    <option>⛪ Religioso Cultural</option>
                    <option>🌊 Turismo Playero</option>
                  </select>
                </div>
                <button className="cta-btn" onClick={generateRoutes} disabled={isGenerating}>
                  <IconRoute />
                  {isGenerating ? 'Calculando rutas...' : 'Generar Rutas P-graph'}
                </button>
              </div>

              {routeSolutions.length > 0 && (
                <div className="sidebar-section">
                  <h3 className="section-title">Rutas Encontradas <span className="badge">{routeSolutions.length}</span></h3>
                  <div className="solutions-list">
                    {routeSolutions.map((sol, idx) => (
                      <button key={idx} className={`solution-card ${activeSolution === idx ? 'active' : ''}`} onClick={() => setActiveSolution(idx)}>
                        <div className="sol-header">
                          <span className="sol-number">Ruta {sol.solucion || idx + 1}</span>
                          {activeSolution === idx && <span className="sol-active-badge">Activa</span>}
                        </div>
                        <div className="sol-metrics">
                          <div className="metric"><span className="metric-label">Peso</span><span className="metric-val">{sol.totalWeight?.toFixed(1) ?? '—'}</span></div>
                          <div className="metric"><span className="metric-label">Tiempo</span><span className="metric-val">{sol.totalTime?.toFixed(1) ?? '—'}</span></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="tab-content">
              <div className="sidebar-section">
                <h3 className="section-title">Herramientas de Grafo</h3>
                <p className="section-hint">Selecciona una herramienta y haz clic en el mapa</p>
                <div className="tool-grid">
                  <button className={`tool-card ${graphMode === 'ADD_NODE' ? 'active' : ''}`} onClick={() => setGraphMode(graphMode === 'ADD_NODE' ? 'IDLE' : 'ADD_NODE')}>
                    <span className="tool-icon node-icon"><IconNode /></span>
                    <span className="tool-label">Añadir<br/>Nodo</span>
                  </button>
                  <button className={`tool-card ${graphMode === 'ADD_EDGE' ? 'active' : ''}`} onClick={() => { setGraphMode(graphMode === 'ADD_EDGE' ? 'IDLE' : 'ADD_EDGE'); setSelectedNodeA(null); }}>
                    <span className="tool-icon edge-icon"><IconEdge /></span>
                    <span className="tool-label">Conectar<br/>Nodos</span>
                  </button>
                </div>
                {modeLabel && <div className="mode-status"><div className="status-dot pulsing" /><span>{modeLabel}</span></div>}
              </div>
              <div className="sidebar-section">
                <h3 className="section-title">Datos del Grafo</h3>
                <div className="graph-stats-grid">
                  <div className="graph-stat"><span className="graph-stat-num">{nodes.length}</span><span className="graph-stat-label">Nodos</span></div>
                  <div className="graph-stat"><span className="graph-stat-num">{edges.length}</span><span className="graph-stat-label">Aristas</span></div>
                </div>
                <div className="action-list">
                  <button className="action-btn" onClick={loadLegacyGraph}><IconUpload /> Cargar Grafo v1.0</button>
                  <button className="action-btn danger" onClick={() => { setNodes([]); setEdges([]); setSelectedNodeA(null); setGraphMode('IDLE'); }}><IconTrash /> Limpiar todo</button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {isMobile && isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="map-canvas">
          <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
          
          {mapInstance && (
             <MapGraphEditor
               map={mapInstance}
               nodes={nodes}
               edges={edges}
               mode={graphMode}
               selectedNodeA={selectedNodeA}
               onAddNode={handleAddNode}
               onSelectNode={handleSelectNode}
               routeSolutions={routeSolutions}
               activeSolution={activeSolution}
             />
          )}

          {!isSidebarOpen && (
            <button className="sidebar-fab" onClick={() => setSidebarOpen(true)} title={isMobile ? 'Abrir panel' : 'Mostrar panel'}>
              {isMobile ? <IconRoute /> : <IconMenu />}
            </button>
          )}
        </div>
      </div>

      <ElementModal isOpen={modalConfig.isOpen} type={modalConfig.type} onSave={handleModalSave} onCancel={handleModalCancel} />
    </div>
  );
}

export default App;
