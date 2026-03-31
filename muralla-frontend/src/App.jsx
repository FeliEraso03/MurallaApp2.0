import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapGraphEditor } from './components/MapGraphEditor';
import { ElementModal } from './components/ElementModal';
import { parseResolveGraphOutput } from './utils/Wdg2PnsParser';
import { useAuth } from './utils/authContext';
import { Link } from 'react-router-dom';
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
  
  const { user } = useAuth();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [graphMode, setGraphMode] = useState('IDLE');
  const [selectedNodeA, setSelectedNodeA] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
  const [routeSolutions, setRouteSolutions] = useState([]);
  const [activeSolution, setActiveSolution] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showDirection, setShowDirection] = useState(false);
  const [isDirected, setIsDirected] = useState(false);
  const [algorithmMode, setAlgorithmMode] = useState('NONE'); // 'NONE' | 'DIJKSTRA' | 'FORD_FULKERSON'
  const [algorithmSelectedNodes, setAlgorithmSelectedNodes] = useState([]);

  // Initialize MapLibre
  useEffect(() => {
    if (mapInstance) return;
    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', 
      center: [CENTRO_HISTORICO.lng, CENTRO_HISTORICO.lat],
      zoom: 16,
      maxBounds: BOUNDS
    });

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    
    m.on('load', () => {
      setMapInstance(m);

      // Add high-contrast custom POIs for Cartagena
      m.addSource('cartagena-pois', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5495, 10.4235] }, properties: { name: '🏰 Torre del Reloj', type: 'monument' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5510, 10.4243] }, properties: { name: '⛪ Plaza San Pedro Claver', type: 'plaza' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5515, 10.4258] }, properties: { name: '🏛️ Palacio de la Inquisición', type: 'museum' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5504, 10.4265] }, properties: { name: '🌳 Plaza de Bolívar', type: 'plaza' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5528, 10.4245] }, properties: { name: '🍽️ Plaza Santo Domingo', type: 'plaza' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5460, 10.4215] }, properties: { name: '🎨 Barrio Getsemaní', type: 'culture' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5482, 10.4222] }, properties: { name: '🍻 Plazuela de la Trinidad', type: 'plaza' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5520, 10.4285] }, properties: { name: '🏫 Las Bóvedas', type: 'history' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5398, 10.4225] }, properties: { name: '⛰️ Castillo de San Felipe', type: 'fortress' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5455, 10.4261] }, properties: { name: '🛍️ Mercado de Bazurto', type: 'local' } }
          ]
        }
      });

      m.addLayer({
        id: 'cartagena-poi-labels',
        type: 'symbol',
        source: 'cartagena-pois',
        layout: {
          'text-field': '{name}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
          'text-anchor': 'bottom',
          'text-offset': [0, -1]
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#f77f00',
          'text-halo-width': 1.5,
          'text-halo-blur': 1
        }
      });
      
      // Make roads pop even more by lightening the highway layer of the basemap
      if (m.getLayer('highway_name_other')) {
        m.setPaintProperty('highway_name_other', 'text-color', '#00b4d8');
        m.setPaintProperty('highway_name_other', 'text-halo-color', '#000000');
      }

      // ── LIVE OVERPASS API POIS (Restaurants, Bars, Museums) ──
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="restaurant"](10.415,-75.555,10.430,-75.540);
          node["amenity"="cafe"](10.415,-75.555,10.430,-75.540);
          node["amenity"="bar"](10.415,-75.555,10.430,-75.540);
          node["tourism"="museum"](10.415,-75.555,10.430,-75.540);
        );
        out body;
      `;

      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(overpassQuery)
      })
      .then(res => res.json())
      .then(data => {
        const dynamicFeatures = data.elements
          .filter(el => el.tags && el.tags.name) // Solo lugares que tengan nombre oficial
          .map(el => {
            let icon = '📍';
            if (el.tags.amenity === 'restaurant') icon = '🍽️';
            else if (el.tags.amenity === 'cafe') icon = '☕';
            else if (el.tags.amenity === 'bar') icon = '🍹';
            else if (el.tags.tourism === 'museum') icon = '🎭';
            
            return {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [el.lon, el.lat] },
              properties: { name: `${icon} ${el.tags.name}` }
            };
          });

        m.addSource('osm-dynamic-pois', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: dynamicFeatures }
        });

        m.addLayer({
          id: 'osm-dynamic-poi-labels',
          type: 'symbol',
          source: 'osm-dynamic-pois',
          minzoom: 16.5, // Solo mostrar para evitar sobresaturación cuando el mapa esté alejado
          layout: {
            'text-field': '{name}',
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 11,
            'text-anchor': 'bottom',
            'text-offset': [0, -0.5]
          },
          paint: {
            'text-color': '#bde0fe',
            'text-halo-color': '#023e8a',
            'text-halo-width': 1.2
          }
        });
      })
      .catch(err => console.error("Error cargando POIs dinámicos de Overpass:", err));
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
    setModalConfig({ isOpen: true, type: 'NODE', data: { lat, lng }, editMode: false });

  const handleSelectNode = (node) => {
    // 1. Logic for Algorithm Selection Mode
    if (algorithmMode !== 'NONE') {
      setAlgorithmSelectedNodes(prev => {
        if (prev.some(n => n.id === node.id)) return prev;
        if (prev.length >= 2) return [node]; // Reset on 3rd click
        return [...prev, node];
      });
      return;
    }

    // 2. Edge Creation Mode
    if (graphMode === 'ADD_EDGE') {
      if (!selectedNodeA) { setSelectedNodeA(node); return; }
      if (selectedNodeA.id !== node.id) {
        setModalConfig({ isOpen: true, type: 'EDGE', data: { startNodeId: selectedNodeA.id, endNodeId: node.id }, editMode: false });
      }
      setSelectedNodeA(null);
      setGraphMode('IDLE');
      return;
    }

    // 3. IDLE mode → Edit the node
    if (graphMode === 'IDLE') {
      const fullNode = nodes.find(n => n.id === node.id);
      if (fullNode) {
        setModalConfig({
          isOpen: true,
          type: 'NODE',
          data: fullNode,
          editMode: true,
        });
      }
    }
  };

  const handleSelectEdge = (edgeIdx) => {
    if (graphMode !== 'IDLE') return;
    const edge = edges[edgeIdx];
    if (!edge) return;
    setModalConfig({
      isOpen: true,
      type: 'EDGE',
      data: { ...edge, idx: edgeIdx },
      editMode: true,
    });
  };

  const handleModalSave = (formData) => {
    if (modalConfig.editMode) {
      // ── EDIT existing element ──
      if (modalConfig.type === 'NODE') {
        setNodes(prev => prev.map(n =>
          n.id === modalConfig.data.id
            ? { ...n, type: formData.type, initialContent: formData.initialContent, maximumCapacity: formData.maximumCapacity }
            : n
        ));
      } else if (modalConfig.type === 'EDGE') {
        setEdges(prev => prev.map((e, i) =>
          i === modalConfig.data.idx
            ? { ...e, startNodeId: formData.startNodeId, endNodeId: formData.endNodeId, weight: formData.weight, capacity: formData.capacity, time: formData.time }
            : e
        ));
      }
    } else {
      // ── CREATE new element ──
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
    }
    setModalConfig({ isOpen: false, type: null, data: null, editMode: false });
  };

  const handleModalDelete = () => {
    if (modalConfig.type === 'NODE' && modalConfig.editMode) {
      const nodeId = modalConfig.data.id;
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setEdges(prev => prev.filter(e => e.startNodeId !== nodeId && e.endNodeId !== nodeId));
    } else if (modalConfig.type === 'EDGE' && modalConfig.editMode) {
      setEdges(prev => prev.filter((_, i) => i !== modalConfig.data.idx));
    }
    setModalConfig({ isOpen: false, type: null, data: null, editMode: false });
  };

  const handleModalCancel = () => setModalConfig({ isOpen: false, type: null, data: null, editMode: false });

  const handleExportGeoJSON = () => {
    if (nodes.length === 0) { alert('No hay datos para exportar.'); return; }
    
    const geojson = {
      type: "FeatureCollection",
      features: [
        ...nodes.map(n => ({
          type: "Feature",
          properties: {
            id: n.id,
            type: n.type,
            initialContent: n.initialContent,
            maximumCapacity: n.maximumCapacity,
            enable: n.enable
          },
          geometry: { type: "Point", coordinates: [n.lng, n.lat] }
        })),
        ...edges.map(e => {
          const startNode = nodes.find(n => n.id === e.startNodeId);
          const endNode = nodes.find(n => n.id === e.endNodeId);
          return {
            type: "Feature",
            properties: {
              startNodeId: e.startNodeId,
              endNodeId: e.endNodeId,
              weight: e.weight,
              capacity: e.capacity,
              time: e.time,
              enable: e.enable
            },
            geometry: { 
              type: "LineString", 
              coordinates: (startNode && endNode) ? [[startNode.lng, startNode.lat], [endNode.lng, endNode.lat]] : [] 
            }
          };
        })
      ]
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muralla_grafo_${nodes.length}n_${edges.length}a.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRoutes = async () => {
    if (nodes.length < 2) { alert('Se necesitan al menos 2 nodos en el grafo.'); return; }
    if (algorithmMode !== 'NONE' && algorithmMode !== 'RESOLVE_GRAPH' && algorithmSelectedNodes.length < 2) { alert('Seleccione nodo origen y destino en el mapa.'); return; }

    const headers = { 'Content-Type': 'application/json' };

    setIsGenerating(true);
    try {
      if (algorithmMode === 'RESOLVE_GRAPH') {
        const geojson = {
          type: "FeatureCollection",
          features: [
            ...nodes.map(n => ({
              type: "Feature",
              properties: { id: n.id, type: n.type, initialContent: n.initialContent, maximumCapacity: n.maximumCapacity, enable: n.enable },
              geometry: { type: "Point", coordinates: [n.lng, n.lat] }
            })),
            ...edges.map(e => ({
              type: "Feature",
              properties: { startNodeId: e.startNodeId, endNodeId: e.endNodeId, weight: e.weight, capacity: e.capacity, time: e.time, enable: e.enable },
              geometry: { type: "LineString", coordinates: [] } 
            }))
          ]
        };

        const resp = await fetch('http://localhost:3000/upload-geojson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geojson)
        });
        if (!resp.ok) throw new Error(`Error ${resp.status}`);
        const responseData = await resp.json();
        
        const stringOutput = typeof responseData === 'string' ? responseData : responseData.output || JSON.stringify(responseData);
        const soluciones = parseResolveGraphOutput(stringOutput, nodes, edges);
        
        if (soluciones.length === 0) alert('No se encontraron soluciones.');
        setRouteSolutions(soluciones);
        setActiveSolution(0);
        return;
      }

      const payload = {
        nodes,
        edges,
        algorithmMode: algorithmMode === 'NONE' ? 'DIJKSTRA' : algorithmMode,
        sourceNodeId: algorithmSelectedNodes[0]?.id,
        targetNodeId: algorithmSelectedNodes[1]?.id
      };

      const resp = await fetch('http://localhost:8081/api/routes/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const solutions = await resp.json();
      setRouteSolutions(solutions);
      setActiveSolution(0);
    } catch (e) {
      console.error(e);
      alert('Error conectando con el backend en puerto :8081');
    } finally {
      setIsGenerating(false);
    }
  };

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        const newNodes = [], newEdges = [];
        data.features.forEach(f => {
          if (f.geometry.type === 'Point') newNodes.push({
            id: f.properties.id,
            lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0],
            type: parseInt(f.properties.type) || 1,
            initialContent: parseInt(f.properties.initialContent) || 0,
            maximumCapacity: parseInt(f.properties.maximumCapacity) || 100,
            enable: f.properties.enable !== false // keep true by default
          });
          else if (f.geometry.type === 'LineString') newEdges.push({
            startNodeId: f.properties.startNodeId, endNodeId: f.properties.endNodeId,
            weight: parseInt(f.properties.weight) || 10,
            capacity: parseInt(f.properties.capacity) || 50,
            time: parseInt(f.properties.time) || 5,
            enable: f.properties.enable !== false
          });
        });
        setNodes(newNodes); setEdges(newEdges); setGraphMode('IDLE');
        e.target.value = null; 
      } catch (err) { alert('Error parseando el archivo JSON/GeoJSON. '+err.message); }
    };
    reader.readAsText(file);
  };

  const loadDefaultGraph = async () => {
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
          enable: f.properties.enable !== false
        });
        else if (f.geometry.type === 'LineString') newEdges.push({
          startNodeId: f.properties.startNodeId, endNodeId: f.properties.endNodeId,
          weight: parseInt(f.properties.weight) || 10,
          capacity: parseInt(f.properties.capacity) || 50,
          time: parseInt(f.properties.time) || 5,
          enable: f.properties.enable !== false
        });
      });
      setNodes(newNodes); setEdges(newEdges); setGraphMode('IDLE');
    } catch (e) { alert('Error cargando el grafo predeterminado.'); }
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
        <div className="topbar-stats" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span className="stat-chip">{nodes.length} <small>nodos</small></span>
          <span className="stat-chip">{edges.length} <small>aristas</small></span>
          
          {user && (
            <Link to="/preferences" title="Mi perfil de viajero" style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--orange), #e55d02)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem',
              boxShadow: '0 0 10px rgba(247, 127, 0, 0.4)', border: '2px solid rgba(255,255,255,0.1)',
              marginLeft: '10px'
            }}>
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Link>
          )}
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
                <h3 className="section-title">Visualización</h3>
                <div className="toggle-group">
                  <label className="switch-control">
                    <span>Mostrar Cuadrícula</span>
                    <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                  <label className="switch-control" style={{marginTop: '12px'}}>
                    <span>Visualizar Sentido</span>
                    <input type="checkbox" checked={showDirection} onChange={e => setShowDirection(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

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
                <h3 className="section-title">Algoritmos</h3>
                <div className="algorithm-grid">
                  <button 
                    className={`algo-btn ${algorithmMode === 'DIJKSTRA' ? 'active' : ''}`} 
                    onClick={() => {
                        setAlgorithmMode(algorithmMode === 'DIJKSTRA' ? 'NONE' : 'DIJKSTRA');
                        setAlgorithmSelectedNodes([]);
                        setRouteSolutions([]);
                        setActiveSolution(0);
                    }}
                  >
                    Dijkstra
                  </button>
                  <button 
                    className={`algo-btn ${algorithmMode === 'FORD_FULKERSON' ? 'active' : ''}`} 
                    onClick={() => {
                        setAlgorithmMode(algorithmMode === 'FORD_FULKERSON' ? 'NONE' : 'FORD_FULKERSON');
                        setAlgorithmSelectedNodes([]);
                        setRouteSolutions([]);
                        setActiveSolution(0);
                    }}
                  >
                    Ford-Fulkerson
                  </button>
                  <button 
                    className={`algo-btn ${algorithmMode === 'RESOLVE_GRAPH' ? 'active' : ''}`} 
                    onClick={() => {
                        setAlgorithmMode(algorithmMode === 'RESOLVE_GRAPH' ? 'NONE' : 'RESOLVE_GRAPH');
                        setAlgorithmSelectedNodes([]);
                        setRouteSolutions([]);
                        setActiveSolution(0);
                    }}
                    style={{ background: algorithmMode === 'RESOLVE_GRAPH' ? '#ff6b6b' : 'rgba(255, 107, 107, 0.1)' }}
                  >
                    Resolve Graph
                  </button>
                </div>
                {algorithmMode !== 'NONE' && (
                  <div className="selection-info">
                    {algorithmMode !== 'RESOLVE_GRAPH' ? (
                      <>
                        <div className="selection-step">
                          <span className={`step-dot ${algorithmSelectedNodes.length >= 1 ? 'filled' : 'empty'}`}></span>
                          <span>Origen: {algorithmSelectedNodes[0]?.id || '...'}</span>
                        </div>
                        <div className="selection-step">
                          <span className={`step-dot ${algorithmSelectedNodes.length >= 2 ? 'filled' : 'empty'}`}></span>
                          <span>Destino: {algorithmSelectedNodes[1]?.id || '...'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="selection-step">
                        <span className="step-dot filled"></span>
                        <span>Se enviará todo el grafo actual.</span>
                      </div>
                    )}
                    
                    {(algorithmSelectedNodes.length === 2 || algorithmMode === 'RESOLVE_GRAPH') && (
                        <button className="cta-btn primary" style={{marginTop: '1rem'}} onClick={generateRoutes}>
                            Calcular {algorithmMode === 'DIJKSTRA' ? 'Dijkstra' : algorithmMode === 'FORD_FULKERSON' ? 'Max Flow' : 'Solución Global'}
                        </button>
                    )}
                  </div>
                )}
              </div>

              <div className="sidebar-section">
                <h3 className="section-title">Datos del Grafo</h3>
                <div className="graph-stats-grid">
                  <div className="graph-stat"><span className="graph-stat-num">{nodes.length}</span><span className="graph-stat-label">Nodos</span></div>
                  <div className="graph-stat"><span className="graph-stat-num">{edges.length}</span><span className="graph-stat-label">Aristas</span></div>
                </div>
                <div className="action-list">
                  <input type="file" accept=".json,.geojson" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} />
                  <button className="action-btn" onClick={loadDefaultGraph} style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}><IconMap /> Cargar Cartagena (Full)</button>
                  <button className="action-btn" onClick={() => fileInputRef.current?.click()}><IconUpload /> Importar Grafo Local</button>
                  <button className="action-btn" onClick={handleExportGeoJSON} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#fff' }}>Exportar GEOJSON</button>
                  <button className="action-btn danger" onClick={() => { 
                    setNodes([]); setEdges([]); setSelectedNodeA(null); 
                    setGraphMode('IDLE'); setAlgorithmSelectedNodes([]);
                    setRouteSolutions([]); setActiveSolution(0); 
                  }}><IconTrash /> Limpiar todo</button>
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
               onSelectEdge={handleSelectEdge}
               routeSolutions={routeSolutions}
               activeSolution={activeSolution}
               showGrid={showGrid}
               showDirection={showDirection}
               algorithmSelectedNodes={algorithmSelectedNodes}
             />
          )}
        </div>
      </div>

      <ElementModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        initialData={modalConfig.editMode ? modalConfig.data : null}
        editMode={modalConfig.editMode}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
        onDelete={modalConfig.editMode ? handleModalDelete : null}
      />
    </div>
  );
}

export default App;
