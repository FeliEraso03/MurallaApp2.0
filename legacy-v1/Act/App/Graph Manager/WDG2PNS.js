import { PriorityQueue } from './PriorityQueue.js';
import { Mathematics } from '../Mathematical Operations/Mathematics.js';
import { Map } from '../Map Manager/Map.js';

export class WDG2PNS {
    constructor(graphManager) {
        this.graphManager = graphManager;
        this.graph = graphManager.graph;
        console.log('HERE');
    }
    convertGeoJSONToGraph(geojson) {
        let graph = {};

        // Agregar nodos al grafo
        geojson.features.forEach((feature) => {
            if (feature.geometry.type === 'Point') {
                const nodeId = feature.properties.id;
                if (!graph[nodeId]) {
                    graph[nodeId] = {
                        properties: feature.properties, // Guarda las propiedades del nodo
                        edges: {}, // Inicializa las aristas del nodo
                    };
                }
            }
        });

        // Agregar aristas al grafo
        geojson.features.forEach((feature) => {
            if (feature.geometry.type === 'LineString') {
                const startNodeId = feature.properties.startNodeId;
                const endNodeId = feature.properties.endNodeId;
                const distance = feature.properties.distance;

                if (graph[startNodeId] && graph[endNodeId]) {
                    graph[startNodeId].edges[endNodeId] = {
                        // Guarda la arista y sus propiedades
                        properties: {
                            distance: distance,
                        },
                    };
                    graph[endNodeId].edges[startNodeId] = {
                        // Guarda la arista inversa con las mismas propiedades
                        properties: {
                            distance: distance,
                        },
                    };
                }
            }
        });

        return graph;
    }

    WDG2PNS(geojson, process) {
        let graph = this.convertGeoJSONToGraph(geojson);
        let distances = {};
        
        // Si no se encuentra una ruta entre los puntos de inicio y fin, devolver un objeto con distancia undefined
        return { distance: undefined, path: [] };
    }


    async seeDijkstra(data) {
        let pointCoordinates = {};
        for (let feature of data.features) {
            if (feature.geometry.type === 'Point') {
                pointCoordinates[feature.properties.id] =
                    feature.geometry.coordinates;
            }
        }

        let startId = this.graphManager.selectNodesAlgorim[0].nodeData.id;
        let endId = this.graphManager.selectNodesAlgorim[1].nodeData.id;

        if (!(startId in pointCoordinates) || !(endId in pointCoordinates)) {
            console.log(
                'Los IDs de los puntos de inicio o fin no existen en el archivo GeoJSON.'
            );
            return;
        }

        let result = this.dijkstra(data, startId, endId);
        if (!result || result.distance === undefined) {
            console.log(
                'No se pudo encontrar una ruta entre los puntos especificados.'
            );
            return;
        }
        let { distance, path } = result;

        const resultDiv = document.getElementById('resultadito');
        resultDiv.innerHTML = `
    <p>La distancia más corta entre el punto ${startId} y el punto ${endId} es: ${distance.toFixed(
            2
        )} m</p>
    <p>La ruta más corta es: ${path.join(' -> ')}</p>
    `;

        let graphFeatures = [];

        // Agregar nodos al grafo
        for (let feature of data.features) {
            if (feature.geometry.type === 'Point') {
                let nodeId = feature.properties.id;
                let enable = path.includes(nodeId);
                graphFeatures.push({
                    type: 'Feature',
                    properties: {
                        id: nodeId,
                        type: feature.properties.type,
                        initialContent: feature.properties.initialContent,
                        maximumCapacity: feature.properties.maximumCapacity,
                        enable: enable,
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: pointCoordinates[nodeId],
                    },
                });
            }
        }

        // Agregar aristas del camino más corto al grafo y calcular las flechas
        for (let i = 0; i < path.length - 1; i++) {
            let node1 = path[i];
            let node2 = path[i + 1];
            let edgeFeature = data.features.find(
                (f) =>
                    f.geometry.type === 'LineString' &&
                    ((f.properties.startNodeId === node1 &&
                        f.properties.endNodeId === node2) ||
                        (f.properties.startNodeId === node2 &&
                            f.properties.endNodeId === node1))
            );

            if (edgeFeature) {
                // Asegurarse de que la arista esté en la dirección correcta
                if (edgeFeature.properties.startNodeId === node2) {
                    [
                        edgeFeature.properties.startNodeId,
                        edgeFeature.properties.endNodeId,
                    ] = [
                        edgeFeature.properties.endNodeId,
                        edgeFeature.properties.startNodeId,
                    ];
                }

                // Calcular las flechas
                let startPointA = this.graph.nodes.find(
                    (node) =>
                        node.nodeData.id === edgeFeature.properties.startNodeId
                );
                let endPointA = this.graph.nodes.find(
                    (node) =>
                        node.nodeData.id === edgeFeature.properties.endNodeId
                );
                let startPointLL = [
                    startPointA.nodeData.lat,
                    startPointA.nodeData.lng,
                ];
                let endPointLL = [
                    endPointA.nodeData.lat,
                    endPointA.nodeData.lng,
                ];
                let [middlePoint, arrowPoint1, arrowPoint2] =
                    Mathematics.calculateEdgeDistance(
                        startPointLL,
                        endPointLL,
                        0.00009
                    );

                edgeFeature.properties.enable = true;
                edgeFeature.properties.arrowPolygon = [
                    middlePoint,
                    arrowPoint1,
                    arrowPoint2,
                ]; // Guardar las flechas
                graphFeatures.push(edgeFeature);
            }
        }

        // Agregar aristas que no están en el camino más corto
        for (let feature of data.features) {
            if (
                feature.geometry.type === 'LineString' &&
                !graphFeatures.includes(feature)
            ) {
                feature.properties.enable = false;
                graphFeatures.push(feature);
            }
        }

        let graphGeoJSON = {
            type: 'FeatureCollection',
            features: graphFeatures,
        };

        return graphGeoJSON;
    }

    doCleanPaths(response){
        alert('HERE2');
        console.log(response);
    }

    outToGeoJson(outText, baseGeoJSON) {
        const regexSoluciones = /Feasible structure #(\d+):\s+Materials:[\s\S]*?Operating units:\s+([\s\S]*?)Total annual cost=.*?Euro\/yr/g;
        const soluciones = [];
        let match;
    
        while ((match = regexSoluciones.exec(outText)) !== null) {
            const index = Number(match[1]);
            const operaciones = match[2].trim().split('\n');
            const conexiones = operaciones
                .map((line) => {
                    const flechaMatch =
                        line.match(/(\w+)_\w+.*?=> (\w+)/);
                    if (flechaMatch) {
                        return {
                            inicio: flechaMatch[1],
                            fin: flechaMatch[2],
                        };
                    }
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

            const features = baseGeoJSON.features.filter((f) => {
                if (f.geometry.type === 'Point') {
                    return nodosSet.has(f.properties.id);
                } else if (f.geometry.type === 'LineString') {
                    const { startNodeId, endNodeId } = f.properties;
                    return aristasSet.has(
                        `${startNodeId}_${endNodeId}`
                    );
                }
                return false;
            });
            console.log(features);
            soluciones.push({
                solucion: index,
                features,
            });
        }

        return {
            type: 'SolucionesGeoJSON',
            soluciones,
        };
    }
}
