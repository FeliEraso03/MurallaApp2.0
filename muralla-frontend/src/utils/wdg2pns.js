export function parseSolverOutput(outputText, baseGeoJSON) {
    console.log('Salida del solver:', outputText);
    const regexSoluciones = /Feasible structure #(\d+):\s+Materials:[\s\S]*?Operating units:\s+([\s\S]*?)Total annual cost=.*?Euro\/yr/g;
    const soluciones = [];
    let match;

    while ((match = regexSoluciones.exec(outputText)) !== null) {
        const index = Number(match[1]);
        console.log('Solución encontrada #', index);
        const operaciones = match[2].trim().split('\n');
        console.log('Operaciones:', operaciones);
        const conexiones = operaciones
            .map((line) => {
                const flechaMatch = line.match(/(\w+_\w+).*?=> (\w+)/);
                if (flechaMatch) {
                    const [inicio, fin] = flechaMatch[1].split('_');
                    return { inicio, fin };
                }
                return null;
            })
            .filter(Boolean);

        console.log('Conexiones extraídas:', conexiones);

        const nodosSet = new Set();
        const aristasSet = new Set();

        conexiones.forEach(({ inicio, fin }) => {
            nodosSet.add(inicio);
            nodosSet.add(fin);
            aristasSet.add(`${inicio}_${fin}`);
        });

        console.log('Nodos en solución:', Array.from(nodosSet));
        console.log('Aristas en solución:', Array.from(aristasSet));

        const features = baseGeoJSON.features.filter((f) => {
            if (f.geometry.type === 'Point') {
                return nodosSet.has(f.properties.id);
            } else if (f.geometry.type === 'LineString') {
                const { startNodeId, endNodeId } = f.properties;
                return aristasSet.has(`${startNodeId}_${endNodeId}`);
            }
            return false;
        });

        console.log('Features en solución #', index, ':', features.length);

        soluciones.push({
            solucion: index,
            features,
            name: `Solución #${index}`
        });
    }

    console.log('Total de soluciones procesadas:', soluciones.length);
    return {
        type: 'SolucionesGeoJSON',
        soluciones
    };
}