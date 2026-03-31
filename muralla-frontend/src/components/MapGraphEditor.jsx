import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';

/**
 * MapGraphEditor — headless React component that manages all MapLibre layers
 * for the graph (nodes, edges, arrows, grid) and routes.
 *
 * Architecture:
 *   • ONE setup effect (runs once when `map` becomes available).
 *   • ONE data-sync effect (runs when nodes/edges/route data changes).
 *   • ONE click-handler effect (runs when interaction mode changes).
 *   • ONE visibility effect (runs when toggle states change).
 *
 * All sources use EXPLICIT named ids so we never lose references.
 */
export const MapGraphEditor = ({
    map,
    nodes,
    edges,
    mode,
    onAddNode,
    onSelectNode,
    onSelectEdge,
    selectedNodeA,
    routeSolutions,
    activeSolution,
    showGrid,
    showDirection,
    algorithmSelectedNodes,
}) => {
    // Track whether layers have been set up
    const layersReady = useRef(false);
    // Keep a ref to the moveend handler so we can remove it cleanly
    const gridHandler = useRef(null);

    // ─── Grid GeoJSON generator ────────────────────────────────
    const buildGrid = useCallback((bounds) => {
        const step = 0.00025; // ~28 m cells
        const features = [];
        const w = Math.floor(bounds.getWest() / step) * step;
        const e = Math.ceil(bounds.getEast() / step) * step;
        const s = Math.floor(bounds.getSouth() / step) * step;
        const n = Math.ceil(bounds.getNorth() / step) * step;

        for (let x = w; x <= e; x += step) {
            features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[x, s], [x, n]] } });
        }
        for (let y = s; y <= n; y += step) {
            features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[w, y], [e, y]] } });
        }
        return { type: 'FeatureCollection', features };
    }, []);

    // ═══════════════════════════════════════════════════════════
    //  EFFECT 1 — One-time layer setup (runs once after map load)
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!map) return;

        const setup = () => {
            if (layersReady.current) return;

            try {
                // ── Sources ──────────────────────────────────────
                const empty = { type: 'FeatureCollection', features: [] };

                if (!map.getSource('src-grid'))   map.addSource('src-grid',   { type: 'geojson', data: empty });
                if (!map.getSource('src-edges'))  map.addSource('src-edges',  { type: 'geojson', data: empty });
                if (!map.getSource('src-route'))  map.addSource('src-route',  { type: 'geojson', data: empty });
                if (!map.getSource('src-nodes'))  map.addSource('src-nodes',  { type: 'geojson', data: empty });

                // ── Layers (bottom → top) ────────────────────────

                // 1. Grid
                if (!map.getLayer('lyr-grid')) {
                    map.addLayer({
                        id: 'lyr-grid',
                        type: 'line',
                        source: 'src-grid',
                        layout: { visibility: 'none' },
                        paint: {
                            'line-color': '#f77f00',
                            'line-opacity': 0.30,
                            'line-width': 1.2,
                        },
                    });
                }

                // 2. Edges (lines) — modern teal/cyan
                if (!map.getLayer('lyr-edges')) {
                    map.addLayer({
                        id: 'lyr-edges',
                        type: 'line',
                        source: 'src-edges',
                        layout: { 'line-cap': 'round', 'line-join': 'round' },
                        paint: {
                            'line-color': '#06d6a0',
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                11, 0.5,
                                16, 4
                            ],
                            'line-opacity': 0.9,
                        },
                    });
                }

                // 3. Edge direction arrows — runtime-generated triangle icon
                //    (CARTO's glyph server doesn't have ► so we draw our own)
                if (!map.hasImage('arrow-right')) {
                    const sz = 40;
                    const c = document.createElement('canvas');
                    c.width = sz; c.height = sz;
                    const ctx = c.getContext('2d');
                    // Bright filled triangle pointing right
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#7c3aed';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(6, 5);
                    ctx.lineTo(sz - 4, sz / 2);
                    ctx.lineTo(6, sz - 5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    const imgData = ctx.getImageData(0, 0, sz, sz);
                    map.addImage('arrow-right', imgData, { sdf: false });
                }

                if (!map.getLayer('lyr-arrows')) {
                    map.addLayer({
                        id: 'lyr-arrows',
                        type: 'symbol',
                        source: 'src-edges',
                        layout: {
                            visibility: 'none',
                            'symbol-placement': 'line',
                            'symbol-spacing': 60,
                            'icon-image': 'arrow-right',
                            'icon-size': [
                                'interpolate', ['linear'], ['zoom'],
                                11, 0.08,
                                16, 0.55
                            ],
                            'icon-rotation-alignment': 'map',
                            'icon-allow-overlap': true,
                            'icon-ignore-placement': true,
                        },
                    });
                }

                // 4. Active route highlight
                if (!map.getLayer('lyr-route')) {
                    map.addLayer({
                        id: 'lyr-route',
                        type: 'line',
                        source: 'src-route',
                        layout: { 'line-cap': 'round', 'line-join': 'round' },
                        paint: {
                            'line-color': '#e040fb',
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                11, 1.5,
                                16, 8
                            ],
                            'line-opacity': 0.95,
                        },
                    });
                }

                // 5. Nodes (circles) — modern vibrant purple palette
                if (!map.getLayer('lyr-nodes')) {
                    map.addLayer({
                        id: 'lyr-nodes',
                        type: 'circle',
                        source: 'src-nodes',
                        paint: {
                            'circle-radius': [
                                'interpolate', ['linear'], ['zoom'],
                                11, [
                                    'case',
                                    ['==', ['get', 'nodeType'], 'algoSource'], 4,
                                    ['==', ['get', 'nodeType'], 'algoSink'],   4,
                                    ['==', ['get', 'nodeType'], 'selected'],   3,
                                    1.5
                                ],
                                16, [
                                    'case',
                                    ['==', ['get', 'nodeType'], 'algoSource'], 14,
                                    ['==', ['get', 'nodeType'], 'algoSink'],   14,
                                    ['==', ['get', 'nodeType'], 'selected'],   13,
                                    10
                                ]
                            ],
                            'circle-color': [
                                'case',
                                ['==', ['get', 'nodeType'], 'algoSource'], '#22d3ee',
                                ['==', ['get', 'nodeType'], 'algoSink'],   '#f43f5e',
                                ['==', ['get', 'nodeType'], 'selected'],   '#a78bfa',
                                ['==', ['get', 'type'], '1'], '#f59e0b',
                                ['==', ['get', 'type'], '3'], '#ef4444',
                                '#7c3aed',
                            ],
                            'circle-stroke-width': 3,
                            'circle-stroke-color': '#ffffff',
                        },
                    });
                }

                // 6. Node labels — only visible when zoomed in close
                if (!map.getLayer('lyr-labels')) {
                    map.addLayer({
                        id: 'lyr-labels',
                        type: 'symbol',
                        source: 'src-nodes',
                        minzoom: 17,
                        layout: {
                            'text-field': ['get', 'id'],
                            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                            'text-size': [
                                'interpolate', ['linear'], ['zoom'],
                                17, 10,
                                19, 14,
                            ],
                            'text-offset': [0, 1.6],
                            'text-anchor': 'top',
                            'text-allow-overlap': true,
                            'text-ignore-placement': true,
                        },
                        paint: {
                            'text-color': '#ffffff',
                            'text-halo-color': '#0d1b2a',
                            'text-halo-width': 2,
                        },
                    });
                }

                layersReady.current = true;
            } catch (err) {
                console.error('MapGraphEditor setup error:', err);
            }
        };

        if (map.isStyleLoaded()) setup();
        else map.once('style.load', setup);

        // Cleanup on unmount
        return () => {
            if (!map || !layersReady.current) return;
            const layers = ['lyr-labels', 'lyr-nodes', 'lyr-route', 'lyr-arrows', 'lyr-edges', 'lyr-grid'];
            const sources = ['src-nodes', 'src-route', 'src-edges', 'src-grid'];
            layers.forEach(id => { try { if (map.getLayer(id)) map.removeLayer(id); } catch (e) {} });
            sources.forEach(id => { try { if (map.getSource(id)) map.removeSource(id); } catch (e) {} });
            layersReady.current = false;
        };
    }, [map]);

    // ═══════════════════════════════════════════════════════════
    //  EFFECT 2 — Data sync (nodes, edges, route, algo-selection)
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!map || !layersReady.current) return;

        // Wait a tick for layers to be on the map
        const timer = setTimeout(() => {
            if (!map.getSource('src-nodes')) return;

            // ── Build node features with a nodeType property
            // that encodes selection/algorithm state INSIDE the data
            // instead of using feature-state (which requires numeric IDs).
            const algoSrcId = algorithmSelectedNodes?.[0]?.id;
            const algoSinkId = algorithmSelectedNodes?.[1]?.id;
            const selId = selectedNodeA?.id;

            const nodeFeatures = nodes.map(n => {
                let nodeType = 'normal';
                if (n.id === algoSrcId)  nodeType = 'algoSource';
                else if (n.id === algoSinkId) nodeType = 'algoSink';
                else if (n.id === selId) nodeType = 'selected';

                return {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
                    properties: {
                        id: String(n.id),
                        type: String(n.type ?? '2'),
                        nodeType,
                        lat: n.lat,
                        lng: n.lng,
                    },
                };
            });

            map.getSource('src-nodes').setData({
                type: 'FeatureCollection',
                features: nodeFeatures,
            });

            // ── Build edge features
            const edgeFeatures = edges
                .map((e, idx) => {
                    const n1 = nodes.find(n => n.id === e.startNodeId);
                    const n2 = nodes.find(n => n.id === e.endNodeId);
                    if (!n1 || !n2) return null;
                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: [[n1.lng, n1.lat], [n2.lng, n2.lat]],
                        },
                        properties: { idx, startNodeId: e.startNodeId, endNodeId: e.endNodeId, weight: e.weight, capacity: e.capacity, time: e.time },
                    };
                })
                .filter(Boolean);

            map.getSource('src-edges').setData({
                type: 'FeatureCollection',
                features: edgeFeatures,
            });

            // ── Active route
            const routeSrc = map.getSource('src-route');
            if (routeSrc) {
                if (routeSolutions?.[activeSolution]) {
                    const sol = routeSolutions[activeSolution];
                    const features = sol.features
                        ? sol.features.filter(f => f.geometry.type === 'LineString')
                        : [];
                    routeSrc.setData({ type: 'FeatureCollection', features });
                } else {
                    routeSrc.setData({ type: 'FeatureCollection', features: [] });
                }
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [map, nodes, edges, selectedNodeA, algorithmSelectedNodes, routeSolutions, activeSolution]);

    // ═══════════════════════════════════════════════════════════
    //  EFFECT 3 — Click interaction (add nodes / select nodes / select edges)
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!map) return;

        const onClick = (e) => {
            // 1. Check if click hits a node
            const nodeHits = map.queryRenderedFeatures(e.point, { layers: ['lyr-nodes'] });
            if (nodeHits.length > 0) {
                const p = nodeHits[0].properties;
                onSelectNode({
                    id: p.id,
                    lat: parseFloat(p.lat),
                    lng: parseFloat(p.lng),
                    type: parseInt(p.type, 10),
                });
                return;
            }
            // 2. Check if click hits an edge (for editing)
            const edgeHits = map.queryRenderedFeatures(e.point, { layers: ['lyr-edges'] });
            if (edgeHits.length > 0 && onSelectEdge && mode === 'IDLE') {
                const p = edgeHits[0].properties;
                onSelectEdge(parseInt(p.idx, 10));
                return;
            }
            // 3. Otherwise, if in ADD_NODE mode, add a new node
            if (mode === 'ADD_NODE') {
                onAddNode(e.lngLat.lat, e.lngLat.lng);
            }
        };

        const onEnterNode = () => { map.getCanvas().style.cursor = 'pointer'; };
        const onLeaveNode = () => { map.getCanvas().style.cursor = ''; };
        const onEnterEdge = () => { map.getCanvas().style.cursor = 'pointer'; };
        const onLeaveEdge = () => { map.getCanvas().style.cursor = ''; };

        map.on('click', onClick);
        map.on('mouseenter', 'lyr-nodes', onEnterNode);
        map.on('mouseleave', 'lyr-nodes', onLeaveNode);
        map.on('mouseenter', 'lyr-edges', onEnterEdge);
        map.on('mouseleave', 'lyr-edges', onLeaveEdge);

        return () => {
            map.off('click', onClick);
            map.off('mouseenter', 'lyr-nodes', onEnterNode);
            map.off('mouseleave', 'lyr-nodes', onLeaveNode);
            map.off('mouseenter', 'lyr-edges', onEnterEdge);
            map.off('mouseleave', 'lyr-edges', onLeaveEdge);
        };
    }, [map, mode, onSelectNode, onSelectEdge, onAddNode]);

    // ═══════════════════════════════════════════════════════════
    //  EFFECT 4 — Visibility toggles (grid, direction arrows)
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!map || !layersReady.current) return;

        // ── Grid visibility
        if (map.getLayer('lyr-grid')) {
            map.setLayoutProperty('lyr-grid', 'visibility', showGrid ? 'visible' : 'none');
        }

        // ── Grid data: attach / detach moveend listener
        if (gridHandler.current) {
            map.off('moveend', gridHandler.current);
            gridHandler.current = null;
        }

        if (showGrid) {
            const refresh = () => {
                const src = map.getSource('src-grid');
                if (src) src.setData(buildGrid(map.getBounds()));
            };
            refresh(); // initial paint
            map.on('moveend', refresh);
            gridHandler.current = refresh;
        }

        // ── Arrow visibility
        if (map.getLayer('lyr-arrows')) {
            map.setLayoutProperty('lyr-arrows', 'visibility', showDirection ? 'visible' : 'none');
        }

        return () => {
            if (gridHandler.current) {
                map.off('moveend', gridHandler.current);
                gridHandler.current = null;
            }
        };
    }, [map, showGrid, showDirection, buildGrid]);

    return null; // headless component
};
