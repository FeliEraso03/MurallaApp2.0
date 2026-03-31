export class FordFulkerson {
    constructor(graphManager) {
        this.graphManager = graphManager;
        this.graph = graphManager.graph;
        this.residualGraph = this.createResidualGraph();
        this.originalCapacities = this.createOriginalCapacities();
        this.paths = []; // Array para almacenar los caminos que contribuyen al flujo máximo
    }

    createResidualGraph() {
        let residualGraph = new Map();

        this.graph.nodes.forEach((node) => {
            residualGraph.set(node.nodeData.id, new Map());
        });

        this.graph.edges.forEach((edge) => {
            let startNode = edge.edgeData.startNodeId;
            let endNode = edge.edgeData.endNodeId;
            let capacity = edge.edgeData.capacity;

            residualGraph.get(startNode).set(endNode, capacity);

            if (!residualGraph.get(endNode).has(startNode)) {
                residualGraph.get(endNode).set(startNode, 0); // Añadir arista inversa con capacidad 0 si no existe
            }
        });

        return residualGraph;
    }

    createOriginalCapacities() {
        let originalCapacities = new Map();

        this.graph.nodes.forEach((node) => {
            originalCapacities.set(node.nodeData.id, new Map());
        });

        this.graph.edges.forEach((edge) => {
            let startNode = edge.edgeData.startNodeId;
            let endNode = edge.edgeData.endNodeId;
            let capacity = edge.edgeData.capacity;

            originalCapacities.get(startNode).set(endNode, capacity);
        });

        return originalCapacities;
    }

    // Realizar una búsqueda en anchura para encontrar un camino desde la fuente hasta el sumidero
    bfs(source, sink, parent) {
        let visited = new Set();
        let queue = [source];
        visited.add(source);

        while (queue.length > 0) {
            let u = queue.shift();

            for (let [v, capacity] of this.residualGraph.get(u).entries()) {
                if (!visited.has(v) && capacity > 0) {
                    parent[v] = u;
                    if (v === sink) {
                        return true;
                    }
                    visited.add(v);
                    queue.push(v);
                }
            }
        }

        return false;
    }

    // Implementación del algoritmo de Ford-Fulkerson para calcular el flujo máximo
    fordFulkerson(source, sink) {
        let parent = {};
        let maxFlow = 0;

        while (this.bfs(source, sink, parent)) {
            let pathFlow = Infinity;
            let s = sink;
            let path = [];

            while (s !== source) {
                pathFlow = Math.min(
                    pathFlow,
                    this.residualGraph.get(parent[s]).get(s)
                );
                path.push(s);
                s = parent[s];
            }
            path.push(source);
            path.reverse();
            this.paths.push({ path, flow: pathFlow });

            let v = sink;
            while (v !== source) {
                let u = parent[v];
                this.residualGraph
                    .get(u)
                    .set(v, this.residualGraph.get(u).get(v) - pathFlow);
                this.residualGraph
                    .get(v)
                    .set(u, this.residualGraph.get(v).get(u) + pathFlow);
                v = parent[v];
            }

            maxFlow += pathFlow;
        }

        return maxFlow;
    }

    getPaths() {
        return this.paths;
    }

    createSubgraphFromResidualGraph() {
        let subgraph = {
            nodes: [],
            edges: [],
        };

        this.residualGraph.forEach((neighbors, startNodeId) => {
            neighbors.forEach((capacity, endNodeId) => {
                let originalCapacity = this.originalCapacities
                    .get(startNodeId)
                    .get(endNodeId);
                let flow = originalCapacity - capacity;

                if (flow > 0) {
                    // Añadir nodos al subgrafo si no existen
                    if (
                        !subgraph.nodes.some(
                            (node) => node.nodeData.id === startNodeId
                        )
                    ) {
                        let originalNode = this.graph.nodes.find(
                            (node) => node.nodeData.id === startNodeId
                        );
                        subgraph.nodes.push({ ...originalNode });
                    }
                    if (
                        !subgraph.nodes.some(
                            (node) => node.nodeData.id === endNodeId
                        )
                    ) {
                        let originalNode = this.graph.nodes.find(
                            (node) => node.nodeData.id === endNodeId
                        );
                        subgraph.nodes.push({ ...originalNode });
                    }

                    // Añadir arista al subgrafo con la capacidad ajustada
                    let originalEdge = this.graph.edges.find(
                        (edge) =>
                            edge.edgeData.startNodeId === startNodeId &&
                            edge.edgeData.endNodeId === endNodeId
                    );

                    let adjustedEdge = { ...originalEdge };
                    adjustedEdge.edgeData.capacity = flow; // Ajustar la capacidad para reflejar el flujo

                    subgraph.edges.push(adjustedEdge);
                }
            });
        });

        return subgraph;
    }

    calculateMaxFlowAndSubgraphs(sourceId, sinkId) {
        const maxFlow = this.fordFulkerson(sourceId, sinkId);
        const subgraph = this.createSubgraphFromResidualGraph();
        return { maxFlow, subgraph };
    }

    updateGraphWithMaxFlow(subgraph) {
        const subgraphNodes = subgraph.nodes.map((node) => node.nodeData.id);
        const subgraphEdges = subgraph.edges.map((edge) => edge.edgeData);

        // Actualizar el estado de los nodos en el grafo principal
        this.graph.nodes.forEach((node) => {
            if (subgraphNodes.includes(node.nodeData.id)) {
                node.nodeData.enable = true;
            } else {
                node.nodeData.enable = false;
            }
        });

        // Actualizar el estado de las aristas en el grafo principal
        this.graph.edges.forEach((edge) => {
            if (
                subgraphEdges.some(
                    (subEdge) =>
                        subEdge.startNodeId === edge.edgeData.startNodeId &&
                        subEdge.endNodeId === edge.edgeData.endNodeId
                )
            ) {
                let subEdge = subgraphEdges.find(
                    (subEdge) =>
                        subEdge.startNodeId === edge.edgeData.startNodeId &&
                        subEdge.endNodeId === edge.edgeData.endNodeId
                );
                edge.edgeData.capacity = subEdge.capacity; // Ajustar la capacidad
                edge.edgeData.enable = true;
            } else {
                edge.edgeData.enable = false;
            }
        });
        this.graphManager.drawGraphMap();
    }

    startAlg() {
        let sourceId = this.graphManager.selectNodesAlgorim[0].nodeData.id;
        let sinkId = this.graphManager.selectNodesAlgorim[1].nodeData.id;
        const result = this.calculateMaxFlowAndSubgraphs(sourceId, sinkId);
        const maxFlow = result.maxFlow;
        const subgraph = result.subgraph;
        const resultDiv = document.getElementById('resultadito');
        if (maxFlow !== 0) {
            resultDiv.innerHTML = `
    <p>The maximum flow is: ${maxFlow}</p>
    `;
        } else {
            resultDiv.innerHTML = `
    <p>The maximum flow is zero. There is no path available from the source to the sink.</p>
    `;
        }

        this.updateGraphWithMaxFlow(subgraph);
    }
}
