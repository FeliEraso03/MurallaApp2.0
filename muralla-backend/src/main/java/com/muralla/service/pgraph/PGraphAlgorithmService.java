package com.muralla.service.pgraph;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class PGraphAlgorithmService {

    // Helper classes for back-tracking
    public static class GraphMemory {
        public Map<String, PnsNode> nodesById = new HashMap<>();
        public Map<String, List<PnsEdge>> adjacencyList = new HashMap<>();
        public List<String> sourceNodes = new ArrayList<>();
        public List<String> targetNodes = new ArrayList<>();
    }

    public static class PathResult {
        public List<String> nodeIds = new ArrayList<>();
        public List<PnsEdge> edges = new ArrayList<>();
        public double totalTime = 0.0;
        public double totalWeight = 0.0;
        public double bottleneckCapacity = Double.MAX_VALUE;
    }

    /**
     * Maximal Structure Generation (MSG)
     * Compiles the raw JS objects into an efficient Adjacency memory structure.
     */
    public GraphMemory generateMaximalStructure(List<PnsNode> rawNodes, List<PnsEdge> rawEdges) {
        log.info("Starting MSG Algorithm with {} nodes and {} edges", rawNodes.size(), rawEdges.size());
        GraphMemory memory = new GraphMemory();

        for (PnsNode node : rawNodes) {
            if (Boolean.TRUE.equals(node.getEnable())) {
                memory.nodesById.put(node.getId(), node);
                memory.adjacencyList.putIfAbsent(node.getId(), new ArrayList<>());
                
                // Identify Origin (Type 1) and Destination (Type 3)
                if (node.getType() != null && node.getType() == 1) {
                    memory.sourceNodes.add(node.getId());
                } else if (node.getType() != null && node.getType() == 3) {
                    memory.targetNodes.add(node.getId());
                }
            }
        }

        for (PnsEdge edge : rawEdges) {
            if (Boolean.TRUE.equals(edge.getEnable())) {
                if (memory.nodesById.containsKey(edge.getStartNodeId()) && memory.nodesById.containsKey(edge.getEndNodeId())) {
                    memory.adjacencyList.get(edge.getStartNodeId()).add(edge);
                }
            }
        }
        log.info("MSG Completed. Discovered {} Sources and {} Targets.", memory.sourceNodes.size(), memory.targetNodes.size());
        return memory;
    }

    /**
     * Solution Structure Generation (SSG)
     * Backtracking DFS to find all valid acyclic routes between Sources and Targets.
     */
    public List<PathResult> generateSolutionStructures(GraphMemory memory) {
        log.info("Starting SSG DFS Algorithm");
        List<PathResult> validPaths = new ArrayList<>();

        for (String startNodeId : memory.sourceNodes) {
            Set<String> visited = new HashSet<>();
            PathResult currentPath = new PathResult();
            currentPath.nodeIds.add(startNodeId);
            visited.add(startNodeId);
            
            dfs(startNodeId, memory, visited, currentPath, validPaths);
        }

        log.info("SSG Emitted {} valid routes", validPaths.size());
        return validPaths;
    }

    private void dfs(String currentNode, GraphMemory memory, Set<String> visited, PathResult currentPath, List<PathResult> validPaths) {
        // If we reached a target node, register the solution and continue (or stop depending on rules)
        if (memory.targetNodes.contains(currentNode)) {
            // Found a valid structure!
            PathResult solution = new PathResult();
            solution.nodeIds.addAll(currentPath.nodeIds);
            solution.edges.addAll(currentPath.edges);
            solution.totalTime = currentPath.totalTime;
            solution.totalWeight = currentPath.totalWeight;
            solution.bottleneckCapacity = currentPath.bottleneckCapacity;
            validPaths.add(solution);
            // Optionally we can return here if we don't want to path-find past destinations
            // return;
        }

        List<PnsEdge> neighbors = memory.adjacencyList.getOrDefault(currentNode, new ArrayList<>());
        for (PnsEdge edge : neighbors) {
            String nextNode = edge.getEndNodeId();
            if (!visited.contains(nextNode)) {
                // Branch bounds - Add to path
                visited.add(nextNode);
                currentPath.nodeIds.add(nextNode);
                currentPath.edges.add(edge);
                
                double edgeTime = edge.getTime() != null ? edge.getTime() : 0.0;
                double edgeWeight = edge.getWeight() != null ? edge.getWeight() : 0.0;
                double edgeCap = edge.getCapacity() != null ? edge.getCapacity() : Double.MAX_VALUE;

                currentPath.totalTime += edgeTime;
                currentPath.totalWeight += edgeWeight;
                double oldBottleneck = currentPath.bottleneckCapacity;
                currentPath.bottleneckCapacity = Math.min(oldBottleneck, edgeCap);

                // Recursion
                dfs(nextNode, memory, visited, currentPath, validPaths);

                // Backtrack
                visited.remove(nextNode);
                currentPath.nodeIds.remove(currentPath.nodeIds.size() - 1);
                currentPath.edges.remove(currentPath.edges.size() - 1);
                currentPath.totalTime -= edgeTime;
                currentPath.totalWeight -= edgeWeight;
                currentPath.bottleneckCapacity = oldBottleneck;
            }
        }
    }

    /**
     * Accelerated Branch and Bound (ABB)
     * Sorts solutions matching constraints, limits to Top-K, and formats Output.
     */
    public List<Object> executeABB(List<PathResult> ssgPaths, GraphMemory memory) {
        log.info("Executing ABB to find Top K solutions");
        
        // Example: Sort by minimum weight
        ssgPaths.sort(Comparator.comparingDouble(p -> p.totalWeight));

        List<Object> frontendResponses = new ArrayList<>();
        
        // Take Top 3 solutions
        int limit = Math.min(3, ssgPaths.size());
        for (int i = 0; i < limit; i++) {
            PathResult path = ssgPaths.get(i);
            
            // Format to a GeoJSON-like Feature collection dictionary that JS parses
            Map<String, Object> solutionJson = new HashMap<>();
            solutionJson.put("solucion", i + 1);
            solutionJson.put("totalWeight", path.totalWeight);
            solutionJson.put("totalTime", path.totalTime);
            
            List<Map<String, Object>> features = new ArrayList<>();
            // Append Nodes
            for (String nodeId : path.nodeIds) {
                PnsNode n = memory.nodesById.get(nodeId);
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
            }
            
            // Append Edges
            for (PnsEdge e : path.edges) {
                Map<String, Object> feature = new HashMap<>();
                Map<String, Object> props = new HashMap<>();
                props.put("startNodeId", e.getStartNodeId());
                props.put("endNodeId", e.getEndNodeId());
                props.put("enable", true);
                
                Map<String, Object> geom = new HashMap<>();
                geom.put("type", "LineString");
                
                PnsNode n1 = memory.nodesById.get(e.getStartNodeId());
                PnsNode n2 = memory.nodesById.get(e.getEndNodeId());
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
            
            solutionJson.put("features", features);
            frontendResponses.add(solutionJson);
        }

        return frontendResponses;
    }
}
