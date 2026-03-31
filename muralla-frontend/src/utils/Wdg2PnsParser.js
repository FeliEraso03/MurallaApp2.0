/**
 * Helper to parse the custom string output from the external Resolve Graph server
 * and convert it into the V2-compatible RouteSolutions array.
 */
export const parseResolveGraphOutput = (outText, nodes, edges) => {
    // Generate a temporary GeoJSON representation for mapping just like in V1
    const baseGeoJSON = {
      features: [
        ...nodes.map(n => ({
          type: "Feature",
          properties: { ...n },
          geometry: { type: "Point", coordinates: [n.lng, n.lat] }
        })),
        ...edges.map(e => ({
          type: "Feature",
          properties: { ...e },
          geometry: { type: "LineString" } // coordinates not strictly needed for this filter
        }))
      ]
    };

    const regexSoluciones = /Feasible structure #(\d+):\s+Materials:[\s\S]*?Operating units:\s+([\s\S]*?)Total annual cost=.*?Euro\/yr/g;
    const soluciones = [];
    let match;

    while ((match = regexSoluciones.exec(outText)) !== null) {
        const index = Number(match[1]);
        const operaciones = match[2].trim().split('\n');
        
        const conexiones = operaciones
            .map((line) => {
                const flechaMatch = line.match(/(\w+)_\w+.*?=> (\w+)/);
                if (flechaMatch) return { inicio: flechaMatch[1], fin: flechaMatch[2] };
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

        // Map subset of active features
        const features = [];
        baseGeoJSON.features.forEach(f => {
            let enable = false;
            if (f.geometry.type === 'Point') {
                enable = nodosSet.has(f.properties.id);
            } else if (f.geometry.type === 'LineString') {
                enable = aristasSet.has(`${f.properties.startNodeId}_${f.properties.endNodeId}`);
            }
            
            if (enable) {
                features.push({
                    ...f,
                    properties: { ...f.properties, enable: true }
                });
            }
        });

        soluciones.push({
            solucion: `Solution ${index}`,
            totalWeight: 0, // Legacy output parsing doesn't attach an obvious weight here unless matched
            totalTime: 0,
            features
        });
    }

    return soluciones;
};
