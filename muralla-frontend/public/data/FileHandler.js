export class FileHandler {
    /**
     * Conviertimos un grafo a formato GeoJSON y lo descarga como un archivo.
     * @param {Object} graph - Objeto que contiene nodes y edges.
     */
    static graphToGeojson(graph, download = true) {
        var geojson = {
            type: 'FeatureCollection',
            features: [],
        };

        // Conviertimos cada nodo del grafo a una Feature de tipo Point en GeoJSON.
        graph.nodes.forEach(function (node) {
            geojson.features.push({
                type: 'Feature',
                properties: {
                    id: node.nodeData.id,
                    type: node.nodeData.type,
                    initialContent: node.nodeData.initialContent,
                    maximumCapacity: node.nodeData.maximumCapacity,
                    enable: node.nodeData.enable,
                },
                geometry: {
                    type: 'Point',
                    coordinates: [
                        node.layer.getLatLng().lng,
                        node.layer.getLatLng().lat,
                    ],
                },
            });
        });

        // Función con la cual convertimos cada arista del grafo a una Feature de tipo LineString en GeoJSON.
        graph.edges.forEach(function (edge) {
            if (
                edge.layer instanceof L.Layer &&
                edge.layer.getLatLngs &&
                edge.edgeData
            ) {
                if (edge.layer.getLatLngs().length >= 2) {
                    var startPoint = edge.layer.getLatLngs()[0];
                    var endPoint = edge.layer.getLatLngs()[1];
                    var weight = edge.edgeData.weight || null;
                    var capacity = edge.edgeData.capacity || null;
                    var time = edge.edgeData.time || null;
                    var startNodeId = edge.edgeData.startNodeId || null;
                    var endNodeId = edge.edgeData.endNodeId || null;
                    var distance = edge.edgeData.distance || null;
                    var arrowPolygon = edge.edgeData.arrowPolygon || null;
                    var enable = edge.edgeData.enable || null;
                    geojson.features.push({
                        type: 'Feature',
                        properties: {
                            startNodeId: startNodeId,
                            endNodeId: endNodeId,
                            weight: weight,
                            time: time,
                            capacity: capacity,
                            distance: distance,
                            arrowPolygon: arrowPolygon,
                            enable: enable,
                        },
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [startPoint.lng, startPoint.lat],
                                [endPoint.lng, endPoint.lat],
                            ],
                        },
                    });
                }
            }
        });

        // Creamos un enlace de descarga y al hacer clic en el descargarmos el archivo GeoJSON.
        if (download) {
            var dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(geojson));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute('href', dataStr);
            downloadAnchorNode.setAttribute('download', 'grafo.geojson');
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
        return geojson;
    }

    /**
     * Cargamos un grafo desde un objeto GeoJSON para así aplicar el algoritmo de Dijkstra.
     * @param {Object} geojson - Objeto GeoJSON con la representación del grafo.
     * @param {Object} graphManager - Objeto que gestiona el grafo.
     * @returns {Promise<void>}
     */
    static async Graphdijkstra(geojson, graphManager) {
        return new Promise((resolve, reject) => {
            try {
                // Limpiamos el grafo existente.
                graphManager.clearGraphMap();
                graphManager.graph.nodes = [];
                graphManager.graph.edges = [];

                // Recorremos cada Feature en el objeto GeoJSON.
                geojson.features.forEach((feature) => {
                    if (feature.geometry.type === 'Point') {
                        // Creamos un nodo y lo agregamos al grafo.
                        var newNode = {
                            nodeData: {
                                id: feature.properties.id || null,
                                lat: feature.geometry.coordinates[1] || null,
                                lng: feature.geometry.coordinates[0] || null,
                                type: feature.properties.type || null,
                                initialContent:
                                    feature.properties.initialContent || null,
                                maximumCapacity:
                                    feature.properties.maximumCapacity || null,
                                enable: feature.properties.enable || false, // Marcamos el nodo según la propiedad "enable" del GeoJSON
                            },
                        };
                        graphManager.graph.nodes.push(newNode);
                    } else if (feature.geometry.type === 'LineString') {
                        // Creamos una arista y la agregamos al grafo.
                        var arrowLine = {
                            edgeData: {
                                startNodeId:
                                    feature.properties.startNodeId || null,
                                endNodeId: feature.properties.endNodeId || null,
                                weight: feature.properties.weight || null,
                                capacity: feature.properties.capacity || null,
                                time: feature.properties.time || null,
                                distance: feature.properties.distance || null,
                                arrowPolygon:
                                    feature.properties.arrowPolygon || null,
                                enable: feature.properties.enable || false, // Marcamos la arista según la propiedad "enable" del GeoJSON
                            },
                        };
                        graphManager.graph.edges.push(arrowLine);
                    }
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Leemos un archivo GeoJSON y lo convertimos en un gráfico mediante el graphManager.
     * @param {File} file - Archivo GeoJSON que se va a leer.
     * @param {Object} graphManager - Objeto que gestiona el gráfico.
     * @returns {Promise<void>}
     */
    static async geojsonToGraph(file, graphManager) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = (e) => {
                var contents = e.target.result;
                var geojson = JSON.parse(contents);

                // Limpiamos el grafo existente.
                graphManager.clearGraphMap();
                graphManager.graph.nodes = [];
                graphManager.graph.edges = [];

                // Recorremos cada Feature en el objeto GeoJSON.
                geojson.features.forEach((feature) => {
                    if (feature.geometry.type === 'Point') {
                        // Creamos un nodo y lo agrega al grafo.
                        var newNode = {
                            nodeData: {
                                id: feature.properties.id || null,
                                lat: feature.geometry.coordinates[1] || null,
                                lng: feature.geometry.coordinates[0] || null,
                                type: feature.properties.type || null,
                                initialContent:
                                    feature.properties.initialContent || null,
                                maximumCapacity:
                                    feature.properties.maximumCapacity || null,
                                enable: feature.properties.enable || null,
                            },
                        };
                        graphManager.graph.nodes.push(newNode);
                    } else if (feature.geometry.type === 'LineString') {
                        // Creamos una arista y la agrega al gráfico.
                        var arrowLine = {
                            edgeData: {
                                startNodeId:
                                    feature.properties.startNodeId || null,
                                endNodeId: feature.properties.endNodeId || null,
                                weight: feature.properties.weight || null,
                                capacity: feature.properties.capacity || null,
                                time: feature.properties.time || null,
                                distance: feature.properties.distance || null,
                                arrowPolygon:
                                    feature.properties.arrowPolygon || null,
                                enable: feature.properties.enable || null,
                            },
                        };
                        graphManager.graph.edges.push(arrowLine);
                    }
                });
                resolve();
            };
            reader.onerror = reject; // Rechazamos en caso de error.
            reader.readAsText(file);
        });
    }

     static async geojsonToGraphFromObject(geojson, graphManager) {
        return new Promise((resolve, reject) => {
            try {
                // Limpiamos el grafo existente.
                graphManager.clearGraphMap();
                graphManager.graph.nodes = [];
                graphManager.graph.edges = [];
    
                // Recorremos cada Feature en el objeto GeoJSON.
                geojson.features.forEach((feature) => {
                    if (feature.geometry.type === 'Point') {
                        const newNode = {
                            nodeData: {
                                id: feature.properties.id || null,
                                lat: feature.geometry.coordinates[1] || null,
                                lng: feature.geometry.coordinates[0] || null,
                                type: feature.properties.type || null,
                                initialContent: feature.properties.initialContent || null,
                                maximumCapacity: feature.properties.maximumCapacity || null,
                                enable: feature.properties.enable || null,
                            },
                        };
                        graphManager.graph.nodes.push(newNode);
                    } else if (feature.geometry.type === 'LineString') {
                        const arrowLine = {
                            edgeData: {
                                startNodeId: feature.properties.startNodeId || null,
                                endNodeId: feature.properties.endNodeId || null,
                                weight: feature.properties.weight || null,
                                capacity: feature.properties.capacity || null,
                                time: feature.properties.time || null,
                                distance: feature.properties.distance || null,
                                arrowPolygon: feature.properties.arrowPolygon || null,
                                enable: feature.properties.enable || null,
                            },
                        };
                        graphManager.graph.edges.push(arrowLine);
                    }
                });
    
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}
