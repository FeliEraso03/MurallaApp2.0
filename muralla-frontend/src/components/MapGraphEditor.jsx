import { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';

/**
 * MapGraphEditor — Headless component for MapLibre GL JS integration.
 * Manages 2D/3D layers for nodes, edges, routes and grid.
 */
export const MapGraphEditor = ({
    map, nodes, edges, mode, onAddNode, onSelectNode, onSelectEdge,
    selectedNodeA, routeSolutions, activeSolution, showGrid, showDirection,
    algorithmSelectedNodes, is3DMode, buildingOpacity, graphOpacity, gridOpacity, mapStyle,
}) => {
    const layersReady = useRef(false);
    const [setupTick, setSetupTick] = useState(0);
    const gridHandler = useRef(null);

    const STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    // ─── UTILS ──────────────────────────────────────────────────
    const createCirclePolygon = useCallback((center, radius, points = 10) => {
        const coords = [];
        for (let i = 0; i < points; i++) {
            const angle = (i * 360) / points;
            const radians = (angle * Math.PI) / 180;
            coords.push([center[0] + radius * Math.cos(radians), center[1] + radius * Math.sin(radians)]);
        }
        coords.push(coords[0]);
        return [coords];
    }, []);

    const buildGrid = useCallback(() => {
        if (!map) return { type: 'FeatureCollection', features: [] };
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        let step = 0.00025;
        if (zoom >= 19) step = 0.00005;
        else if (zoom >= 18) step = 0.0001;
        else if (zoom <= 14.5) step = 0.001;
        const features = [];
        const buffer = step * 5;
        const w = Math.floor((bounds.getWest() - buffer) / step) * step;
        const e = Math.ceil((bounds.getEast() + buffer) / step) * step;
        const s = Math.floor((bounds.getSouth() - buffer) / step) * step;
        const n = Math.ceil((bounds.getNorth() + buffer) / step) * step;
        for (let x = w; x <= e; x += step) features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[x, s], [x, n]] } });
        for (let y = s; y <= n; y += step) features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[w, y], [e, y]] } });
        return { type: 'FeatureCollection', features };
    }, [map]);

    // ═══════════════════════════════════════════════════════════
    //  EFFECT 1 — One-time Layer Setup
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!map) return;
        const setup = () => {
            if (layersReady.current) return;
            const empty = { type: 'FeatureCollection', features: [] };
                if (!map.getSource('src-grid'))   map.addSource('src-grid',   { type: 'geojson', data: empty });
                if (!map.getSource('src-edges'))  map.addSource('src-edges',  { type: 'geojson', data: empty });
                if (!map.getSource('src-route'))  map.addSource('src-route',  { type: 'geojson', data: empty });
                if (!map.getSource('src-route-3d')) map.addSource('src-route-3d', { type: 'geojson', data: empty });
                if (!map.getSource('src-nodes'))  map.addSource('src-nodes',  { type: 'geojson', data: empty });
                if (!map.getSource('src-nodes-3d')) map.addSource('src-nodes-3d', { type: 'geojson', data: empty });
                if (!map.getSource('src-muralla-3d')) map.addSource('src-muralla-3d', { type: 'geojson', data: empty });

            const NODE_COLOR_EXPR = ['case',
                ['==', ['coalesce', ['to-string', ['get', 'nodeType']], ''], 'algoSource'], '#00e5ff',
                ['==', ['coalesce', ['to-string', ['get', 'nodeType']], ''], 'algoSink'],   '#ff6600',
                ['==', ['coalesce', ['to-string', ['get', 'nodeType']], ''], 'selected'],   '#a78bfa',
                ['==', ['coalesce', ['to-string', ['get', 'type']], ''], '1'], '#f59e0b',
                ['==', ['coalesce', ['to-string', ['get', 'type']], ''], '3'], '#ef4444',
                '#7c3aed'];

            // 3D Layers
            if (!map.getLayer('lyr-muralla-3d')) map.addLayer({ id: 'lyr-muralla-3d', type: 'fill-extrusion', source: 'src-muralla-3d', paint: { 'fill-extrusion-color': '#06b6d4', 'fill-extrusion-height': 1.0, 'fill-extrusion-opacity': graphOpacity } });
            if (!map.getLayer('lyr-nodes-3d'))   map.addLayer({ id: 'lyr-nodes-3d',   type: 'fill-extrusion', source: 'src-nodes-3d',   paint: { 'fill-extrusion-color': NODE_COLOR_EXPR, 'fill-extrusion-height': 8.0, 'fill-extrusion-opacity': graphOpacity } });
            if (!map.getLayer('lyr-route-3d'))   map.addLayer({ id: 'lyr-route-3d',   type: 'fill-extrusion', source: 'src-route-3d',   paint: { 'fill-extrusion-color': '#e040fb', 'fill-extrusion-height': 6.0, 'fill-extrusion-opacity': 0.95 } });
            if (!map.getLayer('lyr-buildings-3d') && map.getSource('openmaptiles')) {
                map.addLayer({ 
                  id: 'lyr-buildings-3d', 
                  type: 'fill-extrusion', 
                  source: 'openmaptiles', 
                  'source-layer': 'building', 
                  paint: { 
                    'fill-extrusion-color': '#d1d5db', 
                    'fill-extrusion-height': 2, 
                    'fill-extrusion-opacity': buildingOpacity 
                  } 
                });
            }

            // 2D Layers
            if (!map.getLayer('lyr-grid'))   map.addLayer({ id: 'lyr-grid',   type: 'line', source: 'src-grid', paint: { 'line-color': '#adb5bd', 'line-width': 1.25, 'line-opacity': gridOpacity } });
            if (!map.getLayer('lyr-edges'))  map.addLayer({ id: 'lyr-edges',  type: 'line', source: 'src-edges', paint: { 'line-color': '#06b6d4', 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2, 16, 6], 'line-opacity': 1.0 } });
            if (!map.getLayer('lyr-route'))  map.addLayer({ id: 'lyr-route',  type: 'line', source: 'src-route', paint: { 'line-color': '#e040fb', 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2, 16, 8], 'line-opacity': 1.0 } });
            if (!map.getLayer('lyr-nodes'))  map.addLayer({ id: 'lyr-nodes',  type: 'circle', source: 'src-nodes', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 2, 16, 10], 'circle-color': NODE_COLOR_EXPR, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity': 1.0 } });
            
            if (!map.hasImage('arrow-right')) {
                const c = document.createElement('canvas'); c.width = 40; c.height = 40; const ctx = c.getContext('2d');
                ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(6, 5); ctx.lineTo(36, 20); ctx.lineTo(6, 35); ctx.closePath(); ctx.fill(); ctx.stroke();
                map.addImage('arrow-right', ctx.getImageData(0,0,40,40));
            }
            if (!map.getLayer('lyr-arrows')) map.addLayer({ id: 'lyr-arrows', type: 'symbol', source: 'src-edges', layout: { 'symbol-placement': 'line', 'symbol-spacing': 70, 'icon-image': 'arrow-right', 'icon-size': 0.45, 'icon-rotation-alignment': 'map', 'icon-pitch-alignment': 'viewport', 'icon-allow-overlap': true, 'icon-ignore-placement': true } });

            layersReady.current = true;
            setSetupTick(t => t + 1);
        };

        if (map.isStyleLoaded()) setup();
        else map.once('style.load', setup);

        const onData = () => { if (!map.getLayer('lyr-nodes')) { layersReady.current = false; setup(); } };
        map.on('styledata', onData);
        return () => map.off('styledata', onData);
    }, [map]);

    // ═══════════════════════════════════════════════════════════
    //  EFFECT 2 — Data Sync (Nodes, Edges, Routes)
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!map || !layersReady.current) return;

        const algoSrcId = algorithmSelectedNodes?.[0]?.id;
        const algoSinkId = algorithmSelectedNodes?.[1]?.id;
        const selId = selectedNodeA?.id;

        // 1. Nodes (2D & 3D)
        const nodeFeatures = nodes.map(n => ({
            type: 'Feature', geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
            properties: { id: n.id, type: String(n.type), nodeType: (n.id === algoSrcId ? 'algoSource' : n.id === algoSinkId ? 'algoSink' : n.id === selId ? 'selected' : 'normal'), lat: n.lat, lng: n.lng }
        }));
        map.getSource('src-nodes').setData({ type: 'FeatureCollection', features: nodeFeatures });
        
        const nodes3dSrc = map.getSource('src-nodes-3d');
        if (nodes3dSrc) {
            const buffer = nodeFeatures.map(f => ({
                type: 'Feature', geometry: { type: 'Polygon', coordinates: createCirclePolygon(f.geometry.coordinates, 0.00003) },
                properties: f.properties
            }));
            nodes3dSrc.setData({ type: 'FeatureCollection', features: buffer });
        }

        // 2. Edges & Muralla
        const edgeFeatures = edges.map((e, idx) => {
            const n1 = nodes.find(n => n.id === e.startNodeId);
            const n2 = nodes.find(n => n.id === e.endNodeId);
            if (!n1 || !n2) return null;
            return { type: 'Feature', geometry: { type: 'LineString', coordinates: [[n1.lng, n1.lat], [n2.lng, n2.lat]] }, properties: { idx, ...e } };
        }).filter(Boolean);
        map.getSource('src-edges').setData({ type: 'FeatureCollection', features: edgeFeatures });

        const murallaSrc = map.getSource('src-muralla-3d');
        if (murallaSrc) {
            const buildB = (p1, p2, w) => {
                const dx = p2[0]-p1[0], dy=p2[1]-p1[1], len=Math.sqrt(dx*dx+dy*dy);
                if (len===0) return null;
                const ux=(dx/len)*w, uy=(dy/len)*w, px=-uy, py=ux;
                return [[
                  [p1[0]+px, p1[1]+py],
                  [p2[0]+px, p2[1]+py],
                  [p2[0]-px, p2[1]-py],
                  [p1[0]-px, p1[1]-py],
                  [p1[0]+px, p1[1]+py]
                ]];
            };
            const buffer = edgeFeatures.map(f => {
                const poly = buildB(f.geometry.coordinates[0], f.geometry.coordinates[1], 0.000012);
                if (!poly) return null;
                return { type: 'Feature', geometry: { type: 'Polygon', coordinates: poly }, properties: {} };
            }).filter(Boolean);
            murallaSrc.setData({ type: 'FeatureCollection', features: buffer });
        }

        // 3. Route (2D & 3D)
        const sol = routeSolutions?.[activeSolution];
        const routeLines = sol?.features?.filter(f => f.geometry.type === 'LineString') || [];
        map.getSource('src-route').setData({ type: 'FeatureCollection', features: routeLines });

        const route3dSrc = map.getSource('src-route-3d');
        if (route3dSrc) {
            const buffer = routeLines.map(f => {
                const coords = f.geometry.coordinates;
                const polys = [];
                for (let i=0; i<coords.length-1; i++){
                    const dx=coords[i+1][0]-coords[i][0], dy=coords[i+1][1]-coords[i][1], len=Math.sqrt(dx*dx+dy*dy);
                    if (len===0) continue;
                    const ux=(dx/len)*0.000022, uy=(dy/len)*0.000022, px=-uy, py=ux;
                    polys.push([
                      [coords[i][0]+px, coords[i][1]+py],
                      [coords[i+1][0]+px, coords[i+1][1]+py],
                      [coords[i+1][0]-px, coords[i+1][1]-py],
                      [coords[i][0]-px, coords[i][1]-py],
                      [coords[i][0]+px, coords[i][1]+py]
                    ]);
                }
                return { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: polys.map(p => [p]) }, properties: {} };
            });
            route3dSrc.setData({ type: 'FeatureCollection', features: buffer });
        }
    }, [map, nodes, edges, routeSolutions, activeSolution, algorithmSelectedNodes, selectedNodeA, setupTick]);

    // ═══════════════════════════════════════════════════════════
    //  EFFECT 3 — Global Visibility & Opacity (The "Hot-Sync")
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!map || !layersReady.current) return;

        const visibility = {
            'lyr-nodes': !is3DMode ? 'visible' : 'none',
            'lyr-edges': !is3DMode ? 'visible' : 'none',
            'lyr-route': (!is3DMode && routeSolutions?.length > 0) ? 'visible' : 'none',
            'lyr-arrows': showDirection ? 'visible' : 'none',
            'lyr-grid': showGrid ? 'visible' : 'none',
            'lyr-nodes-3d': (is3DMode && mapStyle === 'https://tiles.openfreemap.org/styles/liberty') ? 'visible' : 'none',
            'lyr-muralla-3d': (is3DMode && mapStyle === 'https://tiles.openfreemap.org/styles/liberty') ? 'visible' : 'none',
            'lyr-buildings-3d': is3DMode ? 'visible' : 'none',
            'lyr-route-3d': (is3DMode && routeSolutions?.length > 0) ? 'visible' : 'none',
        };

        Object.entries(visibility).forEach(([id, val]) => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', val); });

        // OPACITY SYNC
        if (map.getLayer('lyr-muralla-3d')) map.setPaintProperty('lyr-muralla-3d', 'fill-extrusion-opacity', graphOpacity);
        if (map.getLayer('lyr-nodes-3d'))   map.setPaintProperty('lyr-nodes-3d', 'fill-extrusion-opacity', graphOpacity);
        if (map.getLayer('lyr-buildings-3d')) map.setPaintProperty('lyr-buildings-3d', 'fill-extrusion-opacity', buildingOpacity);
        
        // Custom check for base map native building layers
        if (map.getLayer('building')) map.setPaintProperty('building', 'fill-opacity', buildingOpacity);
        if (map.getLayer('building-3d')) map.setPaintProperty('building-3d', 'fill-extrusion-opacity', buildingOpacity);
        
        if (map.getLayer('lyr-grid')) map.setPaintProperty('lyr-grid', 'line-opacity', gridOpacity);
        
        // 2D STAYS SOLID
        if (map.getLayer('lyr-nodes')) map.setPaintProperty('lyr-nodes', 'circle-opacity', 1.0);
        if (map.getLayer('lyr-edges')) map.setPaintProperty('lyr-edges', 'line-opacity', 1.0);
        if (map.getLayer('lyr-route')) map.setPaintProperty('lyr-route', 'line-opacity', 1.0);

    }, [map, is3DMode, graphOpacity, buildingOpacity, gridOpacity, showGrid, showDirection, routeSolutions, setupTick, mapStyle]);

    // ═══════════════════════════════════════════════════════════
    //  EFFECT 4 — Interaction & Events
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!map) return;
        const onClick = (e) => {
            const hits = map.queryRenderedFeatures(e.point, { layers: ['lyr-nodes', 'lyr-nodes-3d', 'lyr-edges'].filter(id => map.getLayer(id)) });
            if (hits.length > 0) {
                const f = hits[0];
                if (f.layer.id.includes('nodes')) onSelectNode({ id: f.properties.id, lat: parseFloat(f.properties.lat), lng: parseFloat(f.properties.lng), type: parseInt(f.properties.type) });
                else if (f.layer.id === 'lyr-edges' && mode === 'IDLE') onSelectEdge(parseInt(f.properties.idx));
                return;
            }
            if (mode === 'ADD_NODE') onAddNode(e.lngLat.lat, e.lngLat.lng);
        };
        map.on('click', onClick);
        
        const enter = () => map.getCanvas().style.cursor = 'pointer';
        const leave = () => map.getCanvas().style.cursor = '';
        ['lyr-nodes', 'lyr-nodes-3d', 'lyr-edges'].forEach(id => { if (map.getLayer(id)) { map.on('mouseenter', id, enter); map.on('mouseleave', id, leave); } });

        if (showGrid) {
            gridHandler.current = () => { const s = map.getSource('src-grid'); if (s) s.setData(buildGrid()); };
            map.on('moveend', gridHandler.current);
        }

        return () => {
            map.off('click', onClick);
            if (gridHandler.current) map.off('moveend', gridHandler.current);
        };
    }, [map, mode, is3DMode, showGrid, buildGrid, onAddNode, onSelectNode, onSelectEdge]);

    return null;
};
