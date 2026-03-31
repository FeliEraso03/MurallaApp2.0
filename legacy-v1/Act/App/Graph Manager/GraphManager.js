import { GraphControls } from './GraphControls.js';
import { Graph } from './Graph.js';
import { Mathematics } from '../Mathematical Operations/Mathematics.js';

export class GraphManager {
    constructor(map) {
        this.map = map;
        this.routePlanner = null;
        this.graphCreationEnabled = false;
        this.dijkstraEnable = false;
        this.fordFulkersonEnable = false;
        this.selectNodesEnable = false;
        this.selectNodesAlgorim = [];
        this.editEnabled = false;
        this.selectNodes = [];
        this.directedGraph = false;
        this.disableSelection = false;
        this.e = null;
        this.graph = new Graph();
        this.graphControls = new GraphControls(this);
    }

    removeGraph() {
        this.clearGraphMap();
        this.graph = new Graph();
    }

    createNodeByUnid() {
        if (
            this.graphCreationEnabled ||
            this.dijkstraEnable ||
            this.fordFulkersonEnable
        ) {
            var clickedNode = this.graph.nodes.find((node) => {
                var nodeLatLng = node.layer.getLatLng();
                var nodeRadius = node.layer.getRadius();
                var distance = this.e.latlng.distanceTo(nodeLatLng);
                return distance <= nodeRadius;
            });
            if (clickedNode) {
                if (this.selectNodes.includes(clickedNode)) {
                    clickedNode.layer.setStyle({ fillColor: '#ff7800' });
                    this.disableSelection = false;
                    this.selectNodes = this.selectNodes.filter(
                        (node) => node !== clickedNode
                    );
                } else {
                    if (!this.disableSelection) {
                        if (this.selectNodes.length < 2) {
                            this.selectNodes.push(clickedNode);
                            clickedNode.layer.setStyle({
                                fillColor: '#00ff00',
                            });
                        }
                        if (this.selectNodes.length === 2) {
                            if (this.graphCreationEnabled) {
                                this.selectNodes.forEach((node) =>
                                    node.layer.setStyle({
                                        fillColor: '#ff7800',
                                    })
                                );
                                this.createEdge(
                                    this.selectNodes[0],
                                    this.selectNodes[1]
                                );
                                this.selectNodes = [];
                            } else if (
                                this.dijkstraEnable ||
                                this.fordFulkersonEnable
                            ) {
                                this.selectNodesAlgorim =
                                    this.selectNodes.slice();
                                this.disableSelection = true;
                            }
                        }
                    }
                }
            } else {
                if (this.graphCreationEnabled) {
                    this.createNode(this.e.latlng.lat, this.e.latlng.lng);
                }
            }
        }
    }
    createNode(
        lat,
        lng,
        type = null,
        initialC = null,
        maximumC = null,
        enable = true
    ) {
        let maxNodeId = 0;
        this.graph.nodes.forEach((node) => {
            const nodeIdNumber = parseInt(node.nodeData.id.replace('Node', ''));
            if (!isNaN(nodeIdNumber) && nodeIdNumber > maxNodeId) {
                maxNodeId = nodeIdNumber;
            }
        });

        const nodeId = 'Node' + (maxNodeId + 1);

        const createAndAddNode = (
            nodeType,
            initialContent,
            maximumCapacity
        ) => {
            if (this.validateNodeType(nodeType)) {
                var newNode = {
                    nodeData: {
                        id: nodeId,
                        lat: lat,
                        lng: lng,
                        type: nodeType,
                        initialContent: initialContent,
                        maximumCapacity: maximumCapacity,
                        enable: enable,
                    },
                };

                this.graph.nodes.push(newNode);
                this.drawGraphMap();
            }
        };

        if (type === null) {
            this.graphControls.showModal(
                'Create ' + nodeId,
                [
                    {
                        label: 'Type (1: Source, 2: Intermediate, 3: Output)',
                        id: 'nodeType',
                        type: 'number',
                    },
                    {
                        label: 'Initial Content',
                        id: 'initialContent',
                        type: 'number',
                    },
                    {
                        label: 'Maximun Capacity',
                        id: 'maximumCapacity',
                        type: 'number',
                    },
                ],
                (data) => {
                    createAndAddNode(
                        data.nodeType,
                        data.initialContent,
                        data.maximumCapacity
                    );
                }
            );
        } else {
            createAndAddNode(type, initialC, maximumC);
        }
    }

    /**
     * Método para validar el tipo de nodo.
     * @param {number} type - Tipo de nodo.
     * @returns {boolean} - true si el tipo de nodo es válido, de lo contrario false.
     */
    validateNodeType(type) {
        return type == 1 || type == 2 || type == 3;
    }

    /**
     * Método para crear una arista.
     * @param {Object} nodeA - Nodo de inicio de la arista.
     * @param {Object} nodeB - Nodo de fin de la arista.
     * @param {number} weight - Peso de la arista.
     * @param {number} capacity - Capacidad de la arista.
     * @param {number} time - Tiempo de la arista.
     */
    createEdge(
        nodeA,
        nodeB,
        weight = null,
        capacity = null,
        time = null,
        enable = true
    ) {
        var startPoint = [nodeA.nodeData.lat, nodeA.nodeData.lng];
        var endPoint = [nodeB.nodeData.lat, nodeB.nodeData.lng];

        var calculatedDistance = Mathematics.calculateDistance(
            startPoint[0],
            startPoint[1],
            endPoint[0],
            endPoint[1]
        );

        const addEdge = (weight, capacity, time) => {
            var [middlePoint, arrowPoint1, arrowPoint2] =
                Mathematics.calculateEdgeDistance(
                    startPoint,
                    endPoint,
                    0.00009
                );

            var arrowLine = {
                edgeData: {
                    startNodeId: nodeA.nodeData.id,
                    endNodeId: nodeB.nodeData.id,
                    weight: weight,
                    capacity: capacity,
                    time: time,
                    distance: calculatedDistance,
                    arrowPolygon: [middlePoint, arrowPoint1, arrowPoint2],
                    enable: enable,
                },
            };

            this.graph.edges.push(arrowLine);
            this.drawGraphMap();
        };

        // Mostrar modal para ingresar datos de la arista si no se proporcionan
        if (capacity === null && weight === null && time === null) {
            this.graphControls.showModal(
                `Create Edge From ${nodeA.nodeData.id} a ${nodeB.nodeData.id}`,
                [
                    { label: 'Capacity', id: 'capacity', type: 'number' },
                    { label: 'Time', id: 'time', type: 'number' },
                    { label: 'Weight', id: 'weight', type: 'number' },
                ],
                (data) => {
                    addEdge(data.weight, data.capacity, data.time);
                }
            );
        } else {
            addEdge(weight, capacity, time);
        }
    }

    /**
     * Método para editar un elemento del grafo (* nodo o arista).
     * @param {L.CircleMarker | L.Polyline} element - Elemento del grafo a editar.
     */
    editElement(element) {
        if (element instanceof L.CircleMarker) {
            this.graphControls.showModal(
                'Edit ' + element.nodeData.id,
                [
                    {
                        label: 'Type (1: Source, 2: Intermediate, 3: Output)',
                        id: 'nodeType',
                        type: 'number',
                        value: element.nodeData.type,
                    },
                    {
                        label: 'Initial Content',
                        id: 'initialContent',
                        type: 'number',
                        value: element.nodeData.initialContent,
                    },
                    {
                        label: 'Maximun Capacity',
                        id: 'maximumCapacity',
                        type: 'number',
                        value: element.nodeData.maximumCapacity,
                    },
                ],
                (data) => {
                    element.nodeData.type = data.nodeType;
                    element.nodeData.initialContent = data.initialContent;
                    element.nodeData.maximumCapacity = data.maximumCapacity;
                },
                () => {
                    this.deleteNode(element.nodeData.id);
                },
                true
            );
        } else if (element instanceof L.Polyline) {
            // Mostrar modal para editar arista
            this.graphControls.showModal(
                'Edit Edge ',
                [
                    {
                        label: 'Capacity ',
                        id: 'capacity',
                        type: 'number',
                        value: element.edgeData.capacity,
                    },
                    {
                        label: 'Time ',
                        id: 'time',
                        type: 'number',
                        value: element.edgeData.time,
                    },
                    {
                        label: 'Weight ',
                        id: 'weight',
                        type: 'number',
                        value: element.edgeData.weight,
                    },
                ],
                (data) => {
                    element.edgeData.weight = data.weight;
                    element.edgeData.time = data.time;
                    element.edgeData.capacity = data.capacity;
                },
                () => {
                    this.deleteEdge(
                        element.edgeData.startNodeId,
                        element.edgeData.endNodeId
                    );
                },
                true
            );
        }
    }
    hasNeighbors(nodeId) {
        return this.graph.edges.some(
            (edge) =>
                edge.edgeData.startNodeId === nodeId ||
                edge.edgeData.endNodeId === nodeId
        );
    }

    allow_display() {
        this.graph.nodes.forEach((node) => {
            node.nodeData.enable = true;
        });
        // Actualizar el estado de las aristas en el grafo principal
        this.graph.edges.forEach((edge) => {
            edge.edgeData.enable = true;
        });
        this.drawGraphMap();
    }

    drawGraphMap() {
        if (
            !this.map ||
            !Array.isArray(this.graph.nodes) ||
            !Array.isArray(this.graph.edges)
        ) {
            console.error(
                'The map or node/edge lists are not properly initialized.'
            );
            return;
        }

        this.clearGraphMap();

        // Dibujar aristas
        this.graph.edges.forEach((edge) => {
            var startNode = this.graph.nodes.find(
                (node) => node.nodeData.id === edge.edgeData.startNodeId
            );
            var endNode = this.graph.nodes.find(
                (node) => node.nodeData.id === edge.edgeData.endNodeId
            );

            if (startNode && endNode) {
                var startPoint = [
                    startNode.nodeData.lat,
                    startNode.nodeData.lng,
                ];
                var endPoint = [endNode.nodeData.lat, endNode.nodeData.lng];

                var opacity = edge.edgeData.enable ? 1 : 0.3; // Determinar la opacidad basada en el atributo enable

                var arrowLine = L.polyline([startPoint, endPoint], {
                    color: 'blue',
                    opacity: opacity,
                }).addTo(this.map);
                arrowLine.edgeData = edge.edgeData;

                if (this.directedGraph) {
                    var arrowPolygon = L.polygon(edge.edgeData.arrowPolygon, {
                        color: 'red',
                        opacity: opacity,
                        fillOpacity: opacity,
                    }).addTo(this.map);
                    arrowLine.arrowPolygon = arrowPolygon;
                }

                // Eventos de clic y mouseover para editar aristas
                arrowLine.on('click', () => {
                    if (this.editEnabled) {
                        this.editElement(arrowLine);
                    }
                });

                arrowLine.on('mouseover', () => {
                    this.graphControls.showEdgeAttributes(arrowLine);
                });

                edge.layer = arrowLine;
            }
        });

        // Dibujar nodos
        this.graph.nodes.forEach((node) => {
            var opacity = node.nodeData.enable ? 1 : 0.5; // Determinar la opacidad basada en el atributo enable
            var newNode = L.circle([node.nodeData.lat, node.nodeData.lng], {
                draggable: false,
                title: node.nodeData.id,
                radius: 5,
                fillColor: '#ff7800',
                color: '#000',
                weight: 1,
                opacity: opacity,
                fillOpacity: opacity,
            }).addTo(this.map);

            newNode.nodeData = node.nodeData;

            // Eventos de clic y mouseover para editar nodos
            newNode.on('click', () => {
                if (this.editEnabled) {
                    this.editElement(newNode);
                }
            });

            newNode.on('mouseover', () => {
                this.graphControls.showNodeAttributes(newNode);
            });

            node.layer = newNode;
        });
    }

    /**
     * Método para limpiar el grafo del mapa Leaflet.
     */
    clearGraphMap() {
        // Remover nodos del mapa
        this.graph.nodes.forEach((node) => {
            if (node.layer) {
                this.map.removeLayer(node.layer);
            }
        });

        // Remover aristas del mapa
        this.graph.edges.forEach((edge) => {
            if (edge.layer) {
                this.map.removeLayer(edge.layer);
                if (edge.layer.arrowPolygon) {
                    this.map.removeLayer(edge.layer.arrowPolygon);
                }
            }
        });
    }

    /**
     * Método para eliminar un nodo del grafo.
     * @param {string} nodeId - ID del nodo a eliminar.
     */
    deleteNode(nodeId) {
        const node = this.graph.nodes.find((n) => n.nodeData.id === nodeId);
        if (node && node.layer) {
            this.map.removeLayer(node.layer);
        }
        this.graph.nodes = this.graph.nodes.filter((n) => n !== node);

        // Eliminar aristas conectadas al nodo eliminado
        this.graph.edges = this.graph.edges.filter((edge) => {
            if (edge) {
                if (
                    edge.edgeData.startNodeId === nodeId ||
                    edge.edgeData.endNodeId === nodeId
                ) {
                    if (edge.layer) {
                        this.map.removeLayer(edge.layer);
                    }
                    if (edge.layer.arrowPolygon) {
                        this.map.removeLayer(edge.layer.arrowPolygon);
                    }
                    return false;
                }
                return true;
            }
        });
    }

    /**
     * Método para eliminar una arista del grafo.
     * @param {string} startNodeId - ID del nodo de inicio de la arista.
     * @param {string} endNodeId - ID del nodo de fin de la arista.
     */

    deleteEdge(startNodeId, endNodeId) {
        this.graph.edges = this.graph.edges.filter((edge) => {
            if (edge) {
                if (
                    (edge.edgeData.startNodeId === startNodeId &&
                        edge.edgeData.endNodeId === endNodeId) ||
                    (edge.edgeData.startNodeId === endNodeId &&
                        edge.edgeData.endNodeId === startNodeId)
                ) {
                    if (edge.layer) {
                        this.map.removeLayer(edge.layer);
                    }
                    if (edge.layer.arrowPolygon) {
                        this.map.removeLayer(edge.layer.arrowPolygon);
                    }
                    return false;
                }
                return true;
            }
        });
    }
}
