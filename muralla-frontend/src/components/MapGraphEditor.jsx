import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

export const MapGraphEditor = ({ 
    map, nodes, edges, mode, onAddNode, onSelectNode, 
    selectedNodeA, routeSolutions, activeSolution
}) => {
    
    // 1. Initial Setup: Layers & Style Customization
    useEffect(() => {
        if (!map) return;

        const setupMapStyle = () => {
            // Remove building shadows/extrusions for a flatter, cleaner look
            const layers = map.getStyle().layers;
            layers.forEach(layer => {
                if (layer.type === 'fill-extrusion') {
                    map.setPaintProperty(layer.id, 'fill-extrusion-height', 0);
                    map.setPaintProperty(layer.id, 'fill-extrusion-base', 0);
                }
                // Hide some specific shadow/heavy layers if they exist by name
                if (layer.id.includes('shadow') || layer.id.includes('building-3d')) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
                // Ensure POIs are visible (many styles hide them at low zoom)
                if (layer.id.includes('poi') || layer.id.includes('park') || layer.id.includes('place')) {
                   try {
                     map.setLayoutProperty(layer.id, 'visibility', 'visible');
                     // Make icons/text bigger for easier spotting
                     if (layer.layout && layer.layout['icon-size']) map.setLayoutProperty(layer.id, 'icon-size', 1.2);
                   } catch(e){}
                }
            });

            // Add Sources if not present
            if (!map.getSource('nodes')) {
                map.addSource('nodes', { 
                    type: 'geojson', 
                    data: { type: 'FeatureCollection', features: [] },
                    promoteId: 'id' // crucial for feature-state highlighting
                });

                // Helper layers for visuals
                map.addLayer({
                    id: 'edges-layer',
                    type: 'line',
                    source: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
                    layout: { 'line-cap': 'round', 'line-join': 'round' },
                    paint: {
                        'line-color': '#3a86ff',
                        'line-width': 4,
                        'line-opacity': 0.7
                    }
                });

                map.addLayer({
                    id: 'route-active-layer',
                    type: 'line',
                    source: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
                    layout: { 'line-cap': 'round', 'line-join': 'round' },
                    paint: {
                        'line-color': '#f77f00',
                        'line-width': 8,
                        'line-opacity': 0.9,
                        'line-blur': 2
                    }
                });

                map.addLayer({
                    id: 'nodes-layer',
                    type: 'circle',
                    source: 'nodes',
                    paint: {
                        'circle-radius': [
                            'case',
                            ['boolean', ['feature-state', 'selected'], false], 14,
                            10
                        ],
                        'circle-color': [
                            'case',
                            ['boolean', ['feature-state', 'selected'], false], '#00ffc8', // bright teal for selection
                            ['==', ['get', 'type'], 1], '#ff7800', // orange source
                            ['==', ['get', 'type'], 3], '#d62828', // red output
                            '#3a86ff' // blue intermediate
                        ],
                        'circle-stroke-width': [
                            'case',
                            ['boolean', ['feature-state', 'selected'], false], 4,
                            2
                        ],
                        'circle-stroke-color': '#ffffff'
                    }
                });
                
                // Add labels for nodes
                map.addLayer({
                    id: 'node-labels',
                    type: 'symbol',
                    source: 'nodes',
                    layout: {
                        'text-field': ['get', 'id'],
                        'text-font': ['Open Sans Semibold'],
                        'text-size': 12,
                        'text-offset': [0, 1.5],
                        'text-anchor': 'top'
                    },
                    paint: {
                        'text-color': '#ffffff',
                        'text-halo-color': '#0d1b2a',
                        'text-halo-width': 2
                    }
                });
            }
        };

        if (map.isStyleLoaded()) setupMapStyle();
        else map.once('style.load', setupMapStyle);

    }, [map]);

    // 2. Click Logic: Handles adding nodes and connecting them
    useEffect(() => {
        if (!map) return;

        const handleClick = (e) => {
            // Check if we clicked a node FIRST
            const features = map.queryRenderedFeatures(e.point, { layers: ['nodes-layer'] });
            
            if (features.length > 0) {
                // We clicked a node
                const props = features[0].properties;
                // Important: props in MapLibre might come as strings if the source wasn't typed
                const nodeObj = {
                    ...props,
                    id: props.id,
                    lat: parseFloat(props.lat),
                    lng: parseFloat(props.lng)
                };
                onSelectNode(nodeObj);
            } else {
                // We clicked empty map space
                if (mode === 'ADD_NODE') {
                    onAddNode(e.lngLat.lat, e.lngLat.lng);
                }
            }
        };

        map.on('click', handleClick);
        map.on('mouseenter', 'nodes-layer', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'nodes-layer', () => map.getCanvas().style.cursor = '');

        return () => {
            map.off('click', handleClick);
            map.off('mouseenter', 'nodes-layer');
            map.off('mouseleave', 'nodes-layer');
        };
    }, [map, mode, onSelectNode, onAddNode]);

    // 3. Data Sync: Sync nodes, edges and solutions to map
    useEffect(() => {
        if (!map || !map.isStyleLoaded() || !map.getSource('nodes')) return;

        // Sync Nodes
        const nodeFeatures = nodes.map(n => ({
            type: 'Feature',
            id: n.id, // for promoteId
            geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
            properties: { ...n }
        }));
        map.getSource('nodes').setData({ type: 'FeatureCollection', features: nodeFeatures });

        // Update Highlighting state
        nodes.forEach(n => {
            const isSel = selectedNodeA && selectedNodeA.id === n.id;
            map.setFeatureState({ source: 'nodes', id: n.id }, { selected: isSel });
        });

        // Sync Edges (using its own anonymous source for simple redraw)
        const edgeFeatures = edges.map((e, idx) => {
            const n1 = nodes.find(n => n.id === e.startNodeId);
            const n2 = nodes.find(n => n.id === e.endNodeId);
            if (!n1 || !n2) return null;
            return {
                type: 'Feature',
                id: `edge-${idx}`,
                geometry: {
                    type: 'LineString',
                    coordinates: [[n1.lng, n1.lat], [n2.lng, n2.lat]]
                },
                properties: { ...e }
            };
        }).filter(Boolean);
        
        const edgeSrc = map.getSource(map.getLayer('edges-layer').source);
        if (edgeSrc) edgeSrc.setData({ type: 'FeatureCollection', features: edgeFeatures });

        // Sync Active Route
        if (routeSolutions && routeSolutions[activeSolution]) {
            const sol = routeSolutions[activeSolution];
            const solFeatures = sol.features ? sol.features.filter(f => f.geometry.type === 'LineString') : [];
            const routeSrc = map.getSource(map.getLayer('route-active-layer').source);
            if (routeSrc) routeSrc.setData({ type: 'FeatureCollection', features: solFeatures });
        } else {
            const routeSrc = map.getSource(map.getLayer('route-active-layer').source);
            if (routeSrc) routeSrc.setData({ type: 'FeatureCollection', features: [] });
        }

    }, [nodes, edges, routeSolutions, activeSolution, map, selectedNodeA]);

    return null;
};
