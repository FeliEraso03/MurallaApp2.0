import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapGraphEditor } from './components/MapGraphEditor';
import { MapLabels } from './components/MapLabels';
import { ElementModal } from './components/ElementModal';
import { parseResolveGraphOutput } from './utils/Wdg2PnsParser';
import { useAuth } from './utils/authContext';
import { useI18n } from './contexts/I18nContext';
import { Link } from 'react-router-dom';
import './App.css';

const CENTRO_HISTORICO = { lat: 10.4231, lng: -75.5494 };
const BOUNDS = [
  [CENTRO_HISTORICO.lng - 0.035, CENTRO_HISTORICO.lat - 0.025],
  [CENTRO_HISTORICO.lng + 0.035, CENTRO_HISTORICO.lat + 0.025]
];

const STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const STYLE_LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';

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
  const { t } = useI18n();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [graphMode, setGraphMode] = useState('IDLE');
  const [selectedNodeA, setSelectedNodeA] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
  const [routeSolutions, setRouteSolutions] = useState([]);
  const [activeSolution, setActiveSolution] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [showDirection, setShowDirection] = useState(false);
  const [isDirected, setIsDirected] = useState(false);
  const [algorithmMode, setAlgorithmMode] = useState('NONE'); // 'NONE' | 'DIJKSTRA' | 'FORD_FULKERSON'
  const [algorithmSelectedNodes, setAlgorithmSelectedNodes] = useState([]);
  
  // ── Unified 2D/3D States ──────────────────────────────────
  const [mapStyle, setMapStyle] = useState(STYLE_DARK);
  const [is3DMode, setIs3DMode] = useState(false);
  const [is3DLoading, setIs3DLoading] = useState(false);
  const [buildingOpacity, setBuildingOpacity] = useState(1.0);
  const [graphOpacity, setGraphOpacity] = useState(1.0);
  const [gridOpacity, setGridOpacity] = useState(0.4);

  // ── POI Labels State ─────────────────────────────────────
  const [showLabels, setShowLabels] = useState(false);
  const [isLabelsLoading, setIsLabelsLoading] = useState(false);

  // Use a ref to always have the latest style in map callbacks
  const mapStyleRef = useRef(mapStyle);
  useEffect(() => {
    mapStyleRef.current = mapStyle;
  }, [mapStyle]);

  // Initialize MapLibre
  useEffect(() => {
    let m;
    const initMap = async () => {
      if (mapContainer.current.innerHTML !== '') return;

      try {
        m = new maplibregl.Map({
          container: mapContainer.current,
          style: mapStyleRef.current,
          center: [CENTRO_HISTORICO.lng, CENTRO_HISTORICO.lat],
          zoom: 16,
          maxBounds: BOUNDS,
          antialias: true,
          maxPitch: 85,
          dragRotate: false,
          transformRequest: (url, resourceType) => {
            // Estabilización global de fuentes (Glyphs)
            if (resourceType === 'Glyphs') {
              const lowerUrl = url.toLowerCase();
              const isBold = lowerUrl.includes('bold') || lowerUrl.includes('medium');
              const font = isBold ? 'Noto Sans Bold' : 'Noto Sans Regular';
              const rangeMatch = url.match(/\/(\d+-\d+\.pbf.*)$/);
              const range = rangeMatch ? rangeMatch[1] : '0-255.pbf';
              return { url: `https://tiles.openfreemap.org/fonts/${encodeURIComponent(font)}/${range}` };
            }
          }
        });

        m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
        
        m.on('styleimagemissing', (e) => {
          // Silenciar warnings de iconos faltantes del basemap
        });

        m.on('load', () => {
          setMapInstance(m);
        });
      } catch (err) {
        console.error("Error initializing map style:", err);
      }
    };

    initMap();

    return () => {
      if (m) {
        m.remove();
        setMapInstance(null);
      }
    };
  }, []);

  const appliedStyle = useRef(mapStyle);
  useEffect(() => {
    if (mapInstance && appliedStyle.current !== mapStyle) {
      // Ocultado preventivo de etiquetas antes del proceso de cambio de estilo
      try {
        if (mapInstance.getLayer('cartagena-poi-labels')) mapInstance.setLayoutProperty('cartagena-poi-labels', 'visibility', 'none');
        if (mapInstance.getLayer('osm-dynamic-poi-labels')) mapInstance.setLayoutProperty('osm-dynamic-poi-labels', 'visibility', 'none');
      } catch (e) {}

      appliedStyle.current = mapStyle;
      mapInstance.setStyle(mapStyle);
    }
  }, [mapStyle, mapInstance]);

  // Handle 3D Mode Transitions (Pitch & Bearing) with loading overlay
  useEffect(() => {
    if (!mapInstance) return;
    if (is3DMode) {
      setIs3DLoading(true);
      mapInstance.dragRotate.enable();
      mapInstance.easeTo({ pitch: 80, bearing: -15, duration: 1000 });
      // Give layers time to render before hiding the overlay
      const t = setTimeout(() => setIs3DLoading(false), 1400);
      return () => clearTimeout(t);
    } else {
      setIs3DLoading(true);
      mapInstance.dragRotate.disable();
      mapInstance.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      const t = setTimeout(() => setIs3DLoading(false), 1000);
      return () => clearTimeout(t);
    }
  }, [is3DMode, mapInstance]);

  const toggleMapStyle = () => {
    const newStyle = mapStyle === STYLE_DARK ? STYLE_LIBERTY : STYLE_DARK;
    setMapStyle(newStyle);
    // Cambiamos el estilo pero MANTENEMOS el modo 2D/3D que el usuario tuviera
    // o forzamos 2D si prefieres, pero el usuario pidió que no se active solo.
  };

  const generateNextNodeId = () => {
    if (nodes.length === 0) return 'Node1';
    const ids = nodes.map(n => {
      const match = n.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const maxId = Math.max(...ids);
    return `Node${maxId + 1}`;
  };

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
          id: generateNextNodeId(),
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
    if (nodes.length < 2) { alert(t('app.error_min_nodes')); return; }
    if (algorithmMode !== 'NONE' && algorithmMode !== 'RESOLVE_GRAPH' && algorithmSelectedNodes.length < 2) { alert(t('app.select_origin_destination')); return; }

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

      const resp = await fetch('/api/routes/generate', {
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
    } catch (e) { alert(t('app.error_loading_graph')); }
  };

  const modeLabel = graphMode === 'ADD_NODE' ? t('app.click_add_node')
    : graphMode === 'ADD_EDGE'
      ? selectedNodeA ? t('app.origin_selected', { id: selectedNodeA.id }) : t('app.select_origin')
      : null;

  return (
    <div className="app-main">
      <header className="topbar">
        <button className="topbar-menu-btn" onClick={() => setSidebarOpen(s => !s)} aria-label="menu">
          {isSidebarOpen ? <IconX /> : <IconMenu />}
        </button>
        <Link to="/" className="topbar-brand" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <span className="brand-name">Muralla App</span>
          <span className="brand-tag">2.0</span>
        </Link>
        <div className="topbar-search">
          <IconSearch />
          <input type="text" placeholder={t('app.search_placeholder')} />
        </div>
        <div className="topbar-stats" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span className="stat-chip">{nodes.length} <small>{t('app.nodes')}</small></span>
          <span className="stat-chip">{edges.length} <small>{t('app.edges')}</small></span>
          
          {user && (
            <Link to="/profile" title={t('app.my_traveler_profile')} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--orange), #e55d02)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem',
              boxShadow: '0 0 10px rgba(247, 127, 0, 0.4)', border: '2px solid rgba(255,255,255,0.1)',
              marginLeft: '10px', overflow: 'hidden'
            }}>
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
                  }}
                />
              ) : (
                user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
              )}
            </Link>
          )}
        </div>
      </header>

      <div className="content-wrapper">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-tabs">
            <button className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>
              <IconMap /> {t('app.plan')}
            </button>
            <button className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>
              <IconEdit /> {t('app.editor')}
            </button>
          </div>

          {activeTab === 'planner' && (
            <div className="tab-content">
              <div className="sidebar-section">
                <h3 className="section-title">{t('app.route_params')}</h3>
                <div className="field-group">
                  <label>{t('app.time_available_hours')}</label>
                  <input type="number" defaultValue={4} min={1} max={12} />
                </div>
                <div className="field-group">
                  <label>{t('app.experience_preference')}</label>
                  <select>
                    <option>{t('app.historic_colonial')}</option>
                    <option>{t('app.gastronomic_maritime')}</option>
                    <option>{t('app.religious_cultural')}</option>
                    <option>{t('app.beach_tourism')}</option>
                  </select>
                </div>
                <button className="cta-btn" onClick={generateRoutes} disabled={isGenerating}>
                  <IconRoute />
                  {isGenerating ? t('app.calculating_routes') : t('app.generate_routes')}
                </button>
              </div>

              {routeSolutions.length > 0 && (
                <div className="sidebar-section">
                  <h3 className="section-title">{t('app.routes_found')} <span className="badge">{routeSolutions.length}</span></h3>
                  <div className="solutions-list">
                    {routeSolutions.map((sol, idx) => (
                      <button key={idx} className={`solution-card ${activeSolution === idx ? 'active' : ''}`} onClick={() => setActiveSolution(idx)}>
                        <div className="sol-header">
                          <span className="sol-number">{t('app.route')} {sol.solucion || idx + 1}</span>
                          {activeSolution === idx && <span className="sol-active-badge">{t('app.active')}</span>}
                        </div>
                        <div className="sol-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          <div className="metric">
                            <span className="metric-label">{t('app.dist')}</span>
                            <span className="metric-val">{(sol.totalWeight || 0).toFixed(0)}m</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">{t('app.time')}</span>
                            <span className="metric-val">{(sol.totalTime || 0).toFixed(0)} min</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">{t('app.nodes_label')}</span>
                            <span className="metric-val">{sol.features.filter(f => f.geometry.type === 'Point' || f.geometry.type === 'circle').length}</span>
                          </div>
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
                <h3 className="section-title">{t('app.map_engine')}</h3>
                <div className="map-engine-switcher">
                  <button
                    className={`engine-btn ${mapStyle === STYLE_DARK ? 'active' : ''}`}
                    onClick={() => { setMapStyle(STYLE_DARK); setIs3DMode(false); }}
                  >
                    <span className="engine-label">{t('app.dark_mode')}<br/><small>{t('app.dark_mode_desc')}</small></span>
                  </button>
                  <button
                    className={`engine-btn ${mapStyle === STYLE_LIBERTY ? 'active' : ''}`}
                    onClick={() => { setMapStyle(STYLE_LIBERTY); }}
                  >
                    <span className="engine-label">{t('app.light_mode')}<br/><small>{t('app.light_mode_desc')}</small></span>
                  </button>
                </div>
                {mapStyle === STYLE_LIBERTY && (
                  <label className="switch-control" style={{marginTop: '14px'}}>
                    <span>{t('app.mode_3d_active')}</span>
                    <input type="checkbox" checked={is3DMode} onChange={e => setIs3DMode(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                )}
                {mapStyle === STYLE_DARK && (
                  <label className="switch-control" style={{marginTop: '14px'}}>
                    <span>{t('app.show_labels')}</span>
                    <input
                      type="checkbox"
                      checked={showLabels}
                      onChange={e => {
                        const val = e.target.checked;
                        if (val) setIsLabelsLoading(true);
                        setShowLabels(val);
                        if (val) setTimeout(() => setIsLabelsLoading(false), 1200);
                      }}
                    />
                    <span className="slider"></span>
                  </label>
                )}
              </div>

              <details className="sidebar-section accordion">
                <summary className="section-title accordion-title">{t('app.visualization')}</summary>
                <div className="toggle-group" style={{marginTop: '12px'}}>
                  <label className="switch-control">
                    <span>{t('app.activate_grid')}</span>
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={e => {
                        const val = e.target.checked;
                        if (val) setIsGridLoading(true);
                        setShowGrid(val);
                        if (val) setTimeout(() => setIsGridLoading(false), 150);
                      }}
                    />
                    <span className="slider"></span>
                  </label>
                  <label className="switch-control" style={{marginTop: '12px'}}>
                    <span>{t('app.visualize_direction')}</span>
                    <input type="checkbox" checked={showDirection} onChange={e => setShowDirection(e.target.checked)} />
                    <span className="slider"></span>
                  </label>

                  <div className="sub-menu-group" style={{ 
                    marginTop: '20px', 
                    padding: '12px', 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px', fontWeight: 'bold' }}>
                      {t('app.opacity_control_3d')}
                    </div>
                    <div className="opacity-controls">
                      <div className="field-group" style={{ marginBottom: '12px', opacity: is3DMode ? 1 : 0.5 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                          <span>{t('app.buildings_3d')}</span>
                          <span>{Math.round(buildingOpacity * 100)}%</span>
                        </label>
                        <input 
                          type="range" min="0" max="1" step="0.05" 
                          value={buildingOpacity} 
                          onChange={e => setBuildingOpacity(parseFloat(e.target.value))}
                          disabled={!is3DMode}
                          style={{ width: '100%', height: '4px' }}
                        />
                      </div>
                      <div className="field-group" style={{ marginBottom: '12px', opacity: is3DMode ? 1 : 0.5 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                          <span>{t('app.graph')}</span>
                          <span>{Math.round(graphOpacity * 100)}%</span>
                        </label>
                        <input 
                          type="range" min="0" max="1" step="0.05" 
                          value={graphOpacity} 
                          onChange={e => setGraphOpacity(parseFloat(e.target.value))}
                          disabled={!is3DMode}
                          style={{ width: '100%', height: '4px' }}
                        />
                      </div>
                      <div className="field-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                          <span>{t('app.grid_opacity')}</span>
                          <span>{Math.round(gridOpacity * 100)}%</span>
                        </label>
                        <input 
                          type="range" min="0" max="1" step="0.05" 
                          value={gridOpacity} 
                          onChange={e => setGridOpacity(parseFloat(e.target.value))}
                          style={{ width: '100%', height: '4px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              <div className="sidebar-section">
                <h3 className="section-title">{t('app.graph_tools')}</h3>
                <p className="section-hint">{t('app.select_tool_hint')}</p>
                <div className="tool-grid">
                  <button className={`tool-card ${graphMode === 'ADD_NODE' ? 'active' : ''}`} onClick={() => setGraphMode(graphMode === 'ADD_NODE' ? 'IDLE' : 'ADD_NODE')}>
                    <span className="tool-icon node-icon"><IconNode /></span>
                    <span className="tool-label">{t('app.add_node')}</span>
                  </button>
                  <button className={`tool-card ${graphMode === 'ADD_EDGE' ? 'active' : ''}`} onClick={() => { setGraphMode(graphMode === 'ADD_EDGE' ? 'IDLE' : 'ADD_EDGE'); setSelectedNodeA(null); }}>
                    <span className="tool-icon edge-icon"><IconEdge /></span>
                    <span className="tool-label">{t('app.connect_nodes')}</span>
                  </button>
                </div>
                {modeLabel && <div className="mode-status"><div className="status-dot pulsing" /><span>{modeLabel}</span></div>}
              </div>

              <details className="sidebar-section accordion">
                <summary className="section-title accordion-title">{t('app.algorithms')}</summary>
                <div className="algorithm-grid" style={{marginTop: '12px'}}>
                  <button 
                    className={`algo-btn ${algorithmMode === 'DIJKSTRA' ? 'active' : ''}`} 
                    onClick={() => {
                        setAlgorithmMode(algorithmMode === 'DIJKSTRA' ? 'NONE' : 'DIJKSTRA');
                        setAlgorithmSelectedNodes([]);
                        setRouteSolutions([]);
                        setActiveSolution(0);
                    }}
                  >
                    {t('app.dijkstra')}
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
                    {t('app.ford_fulkerson')}
                  </button>
                </div>
                {algorithmMode !== 'NONE' && (
                  <div className="selection-info">
                    <div className="selection-step">
                      <span className={`step-dot ${algorithmSelectedNodes.length >= 1 ? 'filled' : 'empty'}`}></span>
                      <span>{t('app.origin', { id: algorithmSelectedNodes[0]?.id || '...' })}</span>
                    </div>
                    <div className="selection-step">
                      <span className={`step-dot ${algorithmSelectedNodes.length >= 2 ? 'filled' : 'empty'}`}></span>
                      <span>{t('app.destination', { id: algorithmSelectedNodes[1]?.id || '...' })}</span>
                    </div>
                    
                    {algorithmSelectedNodes.length === 2 && (
                        <button className="cta-btn primary" style={{marginTop: '1rem'}} onClick={generateRoutes}>
                            {t('app.calculate', { algorithm: algorithmMode === 'DIJKSTRA' ? 'Dijkstra' : 'Max Flow' })}
                        </button>
                    )}
                  </div>
                )}
              </details>

              <details className="sidebar-section accordion">
                <summary className="section-title accordion-title">{t('app.graph_data')}</summary>
                <div className="graph-stats-grid" style={{marginTop: '12px'}}>
                  <div className="graph-stat"><span className="graph-stat-num">{nodes.length}</span><span className="graph-stat-label">{t('app.nodes_label')}</span></div>
                  <div className="graph-stat"><span className="graph-stat-num">{edges.length}</span><span className="graph-stat-label">{t('app.edges')}</span></div>
                </div>
                <div className="action-list">
                  <input type="file" accept=".json,.geojson" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} />
                  <button className="action-btn" onClick={loadDefaultGraph} style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}><IconMap /> {t('app.load_cartagena')}</button>
                  <button className="action-btn" onClick={() => fileInputRef.current?.click()}><IconUpload /> {t('app.import_local_graph')}</button>
                  <button className="action-btn" onClick={handleExportGeoJSON} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#fff' }}>{t('app.export_geojson')}</button>
                  <button className="action-btn danger" onClick={() => { 
                    setNodes([]); setEdges([]); setSelectedNodeA(null); 
                    setGraphMode('IDLE'); setAlgorithmSelectedNodes([]);
                    setRouteSolutions([]); setActiveSolution(0); 
                  }}><IconTrash /> {t('app.clear_all')}</button>
                </div>
              </details>
            </div>
          )}
        </aside>

        {isMobile && isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="map-canvas">
          <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />

          {/* 3D Mode loading overlay */}
          {is3DLoading && (
            <div className="map-mode-overlay">
              <div className="map-mode-spinner"></div>
              <span>{t('app.loading')}</span>
            </div>
          )}

          {/* Grid loading overlay */}
          {isGridLoading && (
            <div className="map-mode-overlay">
              <div className="map-mode-spinner"></div>
              <span>{t('app.generating_grid')}</span>
            </div>
          )}

          {/* Labels loading overlay */}
          {isLabelsLoading && (
            <div className="map-mode-overlay">
              <div className="map-mode-spinner"></div>
              <span>{t('app.loading_poi_labels')}</span>
            </div>
          )}
          
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
               is3DMode={is3DMode}
               buildingOpacity={buildingOpacity}
               graphOpacity={graphOpacity}
               gridOpacity={gridOpacity}
               mapStyle={mapStyle}
             />
          )}

          {mapInstance && (
            <MapLabels
              map={mapInstance}
              isVisible={mapStyle === STYLE_DARK && showLabels}
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
