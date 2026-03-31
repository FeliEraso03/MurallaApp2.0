import { PriorityQueue } from './PriorityQueue.js';
import { Mathematics } from '../Mathematical Operations/Mathematics.js';

export class Dijkstra {
    constructor(graphManager) {
        this.graphManager = graphManager;
        this.graph = graphManager.graph;
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

    dijkstra(geojson, start, end) {
        let graph = this.convertGeoJSONToGraph(geojson);
        let distances = {};
        let pq = new PriorityQueue();
        let previous = {};

        // Inicializar las distancias de todos los nodos como infinito y los nodos previos como nulos
        for (let node in graph) {
            distances[node] = Infinity;
            previous[node] = null;
        }

        // La distancia desde el nodo de inicio a sí mismo es 0
        distances[start] = 0;
        pq.enqueue(start, 0); // Encolar el nodo de inicio con prioridad 0

        // Bucle principal del algoritmo de Dijkstra
        while (!pq.isEmpty()) {
            let current = pq.dequeue().element; // Extraer el nodo con la menor distancia actual

            // Si se alcanza el nodo de destino, reconstruir el camino y devolverlo
            if (current === end) {
                let path = [];
                while (previous[current]) {
                    path.push(current);
                    current = previous[current];
                }
                path.push(start);
                // Devolver el resultado con la distancia y el camino
                return { distance: distances[end], path: path.reverse() };
            }

            // Si el nodo actual no tiene vecinos, pasar al siguiente ciclo
            if (!graph[current]) {
                continue;
            }

            // Explorar los vecinos del nodo actual
            for (let neighbor of Object.keys(graph[current].edges)) {
                let edge = graph[current].edges[neighbor];
                if (
                    !edge ||
                    !edge.properties ||
                    typeof edge.properties.distance === 'undefined'
                ) {
                    // Si la conexión o la distancia son undefined, continuar con el siguiente vecino
                    continue;
                }
                let weight = edge.properties.distance; // Peso de la arista entre el nodo actual y su vecino

                let newDistance = distances[current] + weight; // Calcular la nueva distancia desde el nodo de inicio al vecino

                // Si la nueva distancia es menor que la distancia actual almacenada para el vecino
                if (newDistance < distances[neighbor]) {
                    // Actualizar la distancia y el nodo previo del vecino
                    distances[neighbor] = newDistance;
                    previous[neighbor] = current;

                    // Encolar el vecino con su nueva distancia como prioridad
                    pq.enqueue(neighbor, newDistance);
                }
            }
        }

        // Si no se encuentra una ruta entre los puntos de inicio y fin, devolver un objeto con distancia undefined
        return { distance: undefined, path: [] };
    }

    /*
        async seeDijkstra(data) {
            //const data = await loadGeoJSON(File);
    
            let pointCoordinates = {};
            for (let feature of data.features) {
                if (feature.geometry.type === 'Point') {
                    pointCoordinates[feature.properties.id] = feature.geometry.coordinates;
                }
            }
    
            let startId = prompt("Ingrese el ID del punto de inicio: ");
            let endId = prompt("Ingrese el ID del punto de fin: ");
    
            if (!(startId in pointCoordinates) || !(endId in pointCoordinates)) {
                console.log("Los IDs de los puntos de inicio o fin no existen en el archivo GeoJSON.");
                return;
            }
    
            let result = this.dijkstra(data, startId, endId);
            if (!result || result.distance === undefined) {
                console.log("No se pudo encontrar una ruta entre los puntos especificados.");
                return;
            }
            let { distance, path } = result;
    
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `
            <p>La distancia más corta entre el punto ${startId} y el punto ${endId} es: ${distance.toFixed(2)} m</p>
            <p>La ruta más corta es: ${path.join(" -> ")}</p>
            `;
            alert(path);
    
            let graphFeatures = [];
    
            // Agregar nodos al grafo
            for (let feature of data.features) {
                if (feature.geometry.type === 'Point') {
                    let nodeId = feature.properties.id;
                    let enable = path.includes(nodeId); // Verificar si el nodo está en el camino más corto
                    graphFeatures.push({
                        type: "Feature",
                        properties: {
                            id: nodeId,
                            type: feature.properties.type,
                            initialContent: feature.properties.initialContent,
                            maximumCapacity: feature.properties.maximumCapacity,
                            enable: enable // Marcar el nodo según si está en el camino más corto
                        },
                        geometry: { type: "Point", coordinates: pointCoordinates[nodeId] }
                    });
                }
            }
    
            // Agregar aristas del camino más corto al grafo
            for (let i = 0; i < path.length - 1; i++) {
                let node1 = path[i];
                let node2 = path[i + 1];
                let edgeFeature = data.features.find(f => f.geometry.type === 'LineString' && ((f.properties.startNodeId === node1 && f.properties.endNodeId === node2) || (f.properties.startNodeId === node2 && f.properties.endNodeId === node1)));
                if (edgeFeature) {
                    edgeFeature.properties.enable = true; // Marcar la arista como parte del camino más corto
                    graphFeatures.push(edgeFeature);
                }
            }
    
            // Marcar las aristas que no están en el camino más corto como disable
    
    
            for (let feature of data.features) {
                if (feature.geometry.type === 'LineString') {
                    let start = feature.properties.startNodeId;
                    let end = feature.properties.endNodeId;
                    let enable = path.includes(start) && path.includes(end);
                    feature.properties.enable = enable;
                    graphFeatures.push(feature);
                }
            }
    
    
    
            let graphGeoJSON = {
                type: "FeatureCollection",
                features: graphFeatures
            };
    
            return graphGeoJSON; // Devuelve el GeoJSON generado
        }
    */

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
}
