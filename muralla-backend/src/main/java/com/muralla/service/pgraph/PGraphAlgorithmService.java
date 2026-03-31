package com.muralla.service.pgraph;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class PGraphAlgorithmService {

    // ────────────────────────────────────────────────────────────────────────── //
    // ───────────────────────────── DIJKSTRA ALGORITHM ───────────────────────── //
    // ────────────────────────────────────────────────────────────────────────── //

    /**
     * Executes Dijkstra's algorithm returning a GeoJSON FeatureCollection structure
     * compatible with the frontend. Treats edges as undirected based on V1 logic.
     */
    public List<Object> executeDijkstra(GraphRequest request) {
        log.info("Executing Dijkstra algorithm from {} to {}", request.getSourceNodeId(), request.getTargetNodeId());

        Map<String, PnsNode> nodeMap = new HashMap<>();
        for (PnsNode n : request.getNodes()) {
            if (Boolean.TRUE.equals(n.getEnable())) {
                nodeMap.put(n.getId(), n);
            }
        }

        // Build Adjacency matrix (Undirected as per V1.0 convertGeoJSONToGraph logic)
        Map<String, Map<String, PnsEdge>> graph = new HashMap<>();
        for (String nodeId : nodeMap.keySet()) {
            graph.put(nodeId, new HashMap<>());
        }

        for (PnsEdge e : request.getEdges()) {
            if (Boolean.TRUE.equals(e.getEnable()) && graph.containsKey(e.getStartNodeId()) && graph.containsKey(e.getEndNodeId())) {
                graph.get(e.getStartNodeId()).put(e.getEndNodeId(), e);
                // Also add reverse for undirected traversal
                graph.get(e.getEndNodeId()).put(e.getStartNodeId(), e);
            }
        }

        String start = request.getSourceNodeId();
        String end = request.getTargetNodeId();

        if (!graph.containsKey(start) || !graph.containsKey(end)) {
            log.warn("Source or Target node not found in graph.");
            return Collections.emptyList();
        }

        Map<String, Double> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        for (String node : graph.keySet()) {
            distances.put(node, Double.MAX_VALUE);
            previous.put(node, null);
        }
        distances.put(start, 0.0);

        PriorityQueue<NodeDistance> pq = new PriorityQueue<>(Comparator.comparingDouble(nd -> nd.distance));
        pq.offer(new NodeDistance(start, 0.0));

        boolean found = false;

        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            String currentId = current.id;

            if (currentId.equals(end)) {
                found = true;
                break;
            }

            if (current.distance > distances.get(currentId)) continue;

            Map<String, PnsEdge> neighbors = graph.get(currentId);
            if (neighbors == null) continue;

            for (Map.Entry<String, PnsEdge> entry : neighbors.entrySet()) {
                String neighborId = entry.getKey();
                PnsEdge edge = entry.getValue();
                double weight = (edge.getWeight() != null) ? edge.getWeight() : 0.0;

                double newDistance = distances.get(currentId) + weight;

                if (newDistance < distances.get(neighborId)) {
                    distances.put(neighborId, newDistance);
                    previous.put(neighborId, currentId);
                    pq.offer(new NodeDistance(neighborId, newDistance));
                }
            }
        }

        if (!found) {
            log.warn("No path found between {} and {}", start, end);
            return Collections.emptyList();
        }

        // Reconstruct path
        List<String> pathNodes = new ArrayList<>();
        String curr = end;
        while (curr != null) {
            pathNodes.add(curr);
            curr = previous.get(curr);
        }
        Collections.reverse(pathNodes);

        double totalDistance = distances.get(end);
        
        // Calculate Total Time by traversing the path again
        double totalTime = 0.0;
        for (int i = 0; i < pathNodes.size() - 1; i++) {
            String n1 = pathNodes.get(i);
            String n2 = pathNodes.get(i + 1);
            PnsEdge edge = graph.get(n1).get(n2);
            if (edge != null && edge.getTime() != null) {
                totalTime += edge.getTime();
            }
        }

        log.info("Dijkstra path found with {} nodes, distance={}", pathNodes.size(), totalDistance);

        return formatPathResponse(pathNodes, nodeMap, request.getEdges(), totalDistance, totalTime, "Dijkstra");
    }

    private static class NodeDistance {
        String id;
        double distance;
        NodeDistance(String id, double distance) { this.id = id; this.distance = distance; }
    }

    // ────────────────────────────────────────────────────────────────────────── //
    // ────────────────────── FORD-FULKERSON ALGORITHM ────────────────────────── //
    // ────────────────────────────────────────────────────────────────────────── //

    /**
     * Executes Ford-Fulkerson algorithm based on V1.0 logic (Directed Graph).
     */
    public List<Object> executeFordFulkerson(GraphRequest request) {
        log.info("Executing Ford-Fulkerson algorithm from {} to {}", request.getSourceNodeId(), request.getTargetNodeId());

        Map<String, PnsNode> nodeMap = new HashMap<>();
        for (PnsNode n : request.getNodes()) {
            if (Boolean.TRUE.equals(n.getEnable())) {
                nodeMap.put(n.getId(), n);
            }
        }

        String source = request.getSourceNodeId();
        String sink = request.getTargetNodeId();

        if (!nodeMap.containsKey(source) || !nodeMap.containsKey(sink)) {
            log.warn("Source or Sink node not found in graph.");
            return Collections.emptyList();
        }

        // 1. Initialize capacities and residual graph mapping
        Map<String, Map<String, Double>> residualGraph = new HashMap<>();
        Map<String, Map<String, Double>> originalCapacities = new HashMap<>();

        for (String nodeId : nodeMap.keySet()) {
            residualGraph.put(nodeId, new HashMap<>());
            originalCapacities.put(nodeId, new HashMap<>());
        }

        // Populate directed capacities
        for (PnsEdge e : request.getEdges()) {
            if (Boolean.TRUE.equals(e.getEnable()) && nodeMap.containsKey(e.getStartNodeId()) && nodeMap.containsKey(e.getEndNodeId())) {
                String u = e.getStartNodeId();
                String v = e.getEndNodeId();
                double cap = (e.getCapacity() != null) ? e.getCapacity() : 0.0;
                
                originalCapacities.get(u).put(v, cap);
                
                // Set initial residual capacity
                residualGraph.get(u).put(v, cap);
                // Inverse edge 0 capacity if it doesn't exist
                if (!residualGraph.get(v).containsKey(u)) {
                    residualGraph.get(v).put(u, 0.0);
                }
            }
        }

        double maxFlow = 0;
        Map<String, String> parent = new HashMap<>();

        while (bfsFordFulkerson(residualGraph, source, sink, parent)) {
            double pathFlow = Double.MAX_VALUE;
            String s = sink;

            // Find bottleneck capacity of this augmenting path
            while (!s.equals(source)) {
                String p = parent.get(s);
                pathFlow = Math.min(pathFlow, residualGraph.get(p).get(s));
                s = p;
            }

            // Update residual capacities of the edges and reverse edges
            s = sink;
            while (!s.equals(source)) {
                String p = parent.get(s);
                
                double forwardCurrent = residualGraph.get(p).get(s);
                residualGraph.get(p).put(s, forwardCurrent - pathFlow);

                double backwardCurrent = residualGraph.get(s).get(p);
                residualGraph.get(s).put(p, backwardCurrent + pathFlow);

                s = p;
            }
            maxFlow += pathFlow;
        }

        log.info("Ford-Fulkerson Max Flow Result: {}", maxFlow);

        // Subgraph Generation (edges with flow > 0)
        Set<String> activeNodes = new HashSet<>();
        List<PnsEdge> activeEdges = new ArrayList<>();

        for (PnsEdge e : request.getEdges()) {
            if (Boolean.TRUE.equals(e.getEnable())) {
                String u = e.getStartNodeId();
                String v = e.getEndNodeId();
                if (originalCapacities.containsKey(u) && originalCapacities.get(u).containsKey(v)) {
                    double origCap = originalCapacities.get(u).get(v);
                    double residCap = residualGraph.get(u).get(v);
                    double flow = origCap - residCap;

                    if (flow > 0) {
                        activeNodes.add(u);
                        activeNodes.add(v);
                        activeEdges.add(e);
                        // Optional: modify e.capacity to match the flow pushed for display?
                        // The V1 code does edge.edgeData.capacity = flow
                        // For the frontend, let's keep the original edge intact, but we only emit active edges.
                    }
                }
            }
        }

        List<String> pathNodesList = new ArrayList<>(activeNodes);
        
        // We will format the response similarly to Dijkstra but with totalWeight mapping to maxFlow, and only active subgraph.
        return formatPathResponse(pathNodesList, nodeMap, activeEdges, maxFlow, 0.0, "Ford-Fulkerson");
    }

    private boolean bfsFordFulkerson(Map<String, Map<String, Double>> residualGraph, String source, String sink, Map<String, String> parent) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(source);
        visited.add(source);
        parent.clear();

        while (!queue.isEmpty()) {
            String u = queue.poll();

            for (Map.Entry<String, Double> entry : residualGraph.get(u).entrySet()) {
                String v = entry.getKey();
                double capacity = entry.getValue();

                if (!visited.contains(v) && capacity > 0) {
                    parent.put(v, u);
                    if (v.equals(sink)) {
                        return true;
                    }
                    visited.add(v);
                    queue.add(v);
                }
            }
        }
        return false;
    }

    // ────────────────────────────────────────────────────────────────────────── //
    // ──────────────────────────── UTIL METHODS ──────────────────────────────── //
    // ────────────────────────────────────────────────────────────────────────── //

    private List<Object> formatPathResponse(List<String> pathNodes, Map<String, PnsNode> nodeMap, List<PnsEdge> activeEdges, double totalWeight, double totalTime, String algoName) {
        Map<String, Object> solutionJson = new HashMap<>();
        solutionJson.put("solucion", algoName);
        solutionJson.put("totalWeight", totalWeight); // For FF, this is Max Flow
        solutionJson.put("totalTime", totalTime);
        
        List<Map<String, Object>> features = new ArrayList<>();
        
        Set<String> addedNodes = new HashSet<>();
        
        // Append Active Nodes
        for (String nodeId : pathNodes) {
             PnsNode n = nodeMap.get(nodeId);
             if (n == null || addedNodes.contains(nodeId)) continue;
             
             Map<String, Object> feature = new HashMap<>();
             Map<String, Object> props = new HashMap<>();
             props.put("id", n.getId());
             props.put("type", n.getType());
             props.put("enable", true);
             
             Map<String, Object> geom = new HashMap<>();
             geom.put("type", "Point");
             geom.put("coordinates", Arrays.asList(n.getLng(), n.getLat()));
             
             feature.put("properties", props);
             feature.put("geometry", geom);
             features.add(feature);
             addedNodes.add(nodeId);
        }

        // Add Edges belonging to the active path/flow
        for (PnsEdge e : activeEdges) {
            String u = e.getStartNodeId();
            String v = e.getEndNodeId();
            // Basic check if edges belong to the returned nodes
            if (addedNodes.contains(u) && addedNodes.contains(v)) {
                Map<String, Object> feature = new HashMap<>();
                Map<String, Object> props = new HashMap<>();
                props.put("startNodeId", u);
                props.put("endNodeId", v);
                props.put("enable", true);
                // Copy properties
                props.put("weight", e.getWeight());
                props.put("capacity", e.getCapacity());
                props.put("time", e.getTime());
                
                Map<String, Object> geom = new HashMap<>();
                geom.put("type", "LineString");
                
                PnsNode n1 = nodeMap.get(u);
                PnsNode n2 = nodeMap.get(v);
                if (n1 != null && n2 != null) {
                   geom.put("coordinates", Arrays.asList(
                       Arrays.asList(n1.getLng(), n1.getLat()),
                       Arrays.asList(n2.getLng(), n2.getLat())
                   ));
                }
                
                feature.put("properties", props);
                feature.put("geometry", geom);
                features.add(feature);
            }
        }
        
        solutionJson.put("features", features);

        return Collections.singletonList(solutionJson);
    }
}
