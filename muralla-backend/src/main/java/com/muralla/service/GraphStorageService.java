package com.muralla.service;

import com.muralla.dto.GraphSaveRequest;
import com.muralla.dto.GraphResponse;
import com.muralla.dto.GraphSummaryResponse;
import com.muralla.dto.PnsEdge;
import com.muralla.dto.PnsNode;
import com.muralla.model.Graph;
import com.muralla.model.GraphEdge;
import com.muralla.model.GraphNode;
import com.muralla.model.User;
import com.muralla.repository.GraphEdgeRepository;
import com.muralla.repository.GraphNodeRepository;
import com.muralla.repository.GraphRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for persisting and loading P-graphs with PostGIS support.
 * Converts between JPA entities and PnsNode/PnsEdge DTOs for compatibility
 * with PGraphAlgorithmService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GraphStorageService {

    private static final int SRID_WGS84 = 4326;

    private final GraphRepository graphRepository;
    private final GraphNodeRepository graphNodeRepository;
    private final GraphEdgeRepository graphEdgeRepository;

    /** JTS GeometryFactory configured for WGS84 */
    private final GeometryFactory geometryFactory =
            new GeometryFactory(new PrecisionModel(), SRID_WGS84);

    // ── Save ─────────────────────────────────────────────────────────────────

    /**
     * Saves a new graph for the given user.
     *
     * @param user    authenticated user (owner)
     * @param request graph data including nodes and edges
     * @return persisted graph summary
     */
    public GraphSummaryResponse saveGraph(User user, GraphSaveRequest request) {
        log.info("Saving graph '{}' for user {}", request.getName(), user.getId());

        Graph graph = Graph.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .isPublic(Boolean.TRUE.equals(request.getIsPublic()))
                .build();

        graph = graphRepository.save(graph);

        // Persist nodes
        final UUID graphId = graph.getId();
        Envelope envelope = new Envelope();

        for (PnsNode pnsNode : request.getNodes()) {
            Point point = geometryFactory.createPoint(
                    new Coordinate(pnsNode.getLng(), pnsNode.getLat()));
            point.setSRID(SRID_WGS84);
            envelope.expandToInclude(pnsNode.getLng(), pnsNode.getLat());

            GraphNode node = GraphNode.builder()
                    .graph(graph)
                    .nodeId(pnsNode.getId())
                    .lat(pnsNode.getLat())
                    .lng(pnsNode.getLng())
                    .type(pnsNode.getType() != null ? pnsNode.getType() : 2)
                    .initialContent(pnsNode.getInitialContent() != null ? pnsNode.getInitialContent() : 0.0)
                    .maximumCapacity(pnsNode.getMaximumCapacity() != null ? pnsNode.getMaximumCapacity() : 100.0)
                    .enable(Boolean.TRUE.equals(pnsNode.getEnable()))
                    .coordinates(point)
                    .build();

            graphNodeRepository.save(node);
        }

        // Persist edges
        for (PnsEdge pnsEdge : request.getEdges()) {
            GraphEdge edge = GraphEdge.builder()
                    .graph(graph)
                    .startNodeId(pnsEdge.getStartNodeId())
                    .endNodeId(pnsEdge.getEndNodeId())
                    .weight(pnsEdge.getWeight() != null ? pnsEdge.getWeight() : 10.0)
                    .capacity(pnsEdge.getCapacity() != null ? pnsEdge.getCapacity() : 50.0)
                    .time(pnsEdge.getTime() != null ? pnsEdge.getTime() : 5.0)
                    .enable(Boolean.TRUE.equals(pnsEdge.getEnable()))
                    .build();

            graphEdgeRepository.save(edge);
        }

        // Calculate and persist bounding box
        if (!envelope.isNull()) {
            org.locationtech.jts.geom.Geometry bounds =
                    geometryFactory.toGeometry(envelope);
            bounds.setSRID(SRID_WGS84);
            graph.setBounds(bounds);
            graph = graphRepository.save(graph);
        }

        log.info("Graph '{}' saved with ID {}", graph.getName(), graph.getId());
        return toSummary(graph, request.getNodes().size(), request.getEdges().size());
    }

    // ── List ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<GraphSummaryResponse> listGraphs(User user, Pageable pageable) {
        return graphRepository.findByUserIdOrderByUpdatedAtDesc(user.getId(), pageable)
                .map(g -> toSummary(g,
                        graphNodeRepository.findByGraphIdOrderByCreatedAtAsc(g.getId()).size(),
                        graphEdgeRepository.findByGraphIdOrderByCreatedAtAsc(g.getId()).size()));
    }

    @Transactional(readOnly = true)
    public Page<GraphSummaryResponse> listPublicGraphs(Pageable pageable) {
        return graphRepository.findByIsPublicTrueOrderByUpdatedAtDesc(pageable)
                .map(g -> toSummary(g,
                        graphNodeRepository.findByGraphIdOrderByCreatedAtAsc(g.getId()).size(),
                        graphEdgeRepository.findByGraphIdOrderByCreatedAtAsc(g.getId()).size()));
    }

    // ── Load ─────────────────────────────────────────────────────────────────

    /**
     * Loads a graph by ID. For public graphs, any user may load.
     * For private graphs, only the owner may load.
     */
    @Transactional(readOnly = true)
    public GraphResponse loadGraph(UUID graphId, User user) {
        Graph graph = graphRepository.findById(graphId)
                .orElseThrow(() -> new IllegalArgumentException("Graph not found: " + graphId));

        // Access control: owner or public
        boolean isOwner = graph.getUser().getId().equals(user.getId());
        if (!isOwner && !Boolean.TRUE.equals(graph.getIsPublic())) {
            throw new SecurityException("Access denied to graph: " + graphId);
        }

        List<PnsNode> nodes = graphNodeRepository
                .findByGraphIdOrderByCreatedAtAsc(graphId)
                .stream()
                .map(this::toNodeDto)
                .collect(Collectors.toList());

        List<PnsEdge> edges = graphEdgeRepository
                .findByGraphIdOrderByCreatedAtAsc(graphId)
                .stream()
                .map(this::toEdgeDto)
                .collect(Collectors.toList());

        return toResponse(graph, nodes, edges);
    }

    // ── Update ───────────────────────────────────────────────────────────────

    /**
     * Updates graph metadata and optionally replaces nodes/edges.
     * Only the owner can update.
     */
    public GraphSummaryResponse updateGraph(UUID graphId, User user, GraphSaveRequest request) {
        Graph graph = graphRepository.findByIdAndUserId(graphId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Graph not found or access denied: " + graphId));

        graph.setName(request.getName());
        graph.setDescription(request.getDescription());
        graph.setIsPublic(Boolean.TRUE.equals(request.getIsPublic()));
        graph = graphRepository.save(graph);

        // Replace nodes and edges entirely
        graphNodeRepository.deleteAll(
                graphNodeRepository.findByGraphIdOrderByCreatedAtAsc(graphId));
        graphEdgeRepository.deleteAll(
                graphEdgeRepository.findByGraphIdOrderByCreatedAtAsc(graphId));

        // Re-save using saveGraph logic (reuse the node/edge saving)
        GraphSaveRequest rebuiltRequest = new GraphSaveRequest();
        rebuiltRequest.setName(graph.getName());
        rebuiltRequest.setDescription(graph.getDescription());
        rebuiltRequest.setIsPublic(graph.getIsPublic());
        rebuiltRequest.setNodes(request.getNodes());
        rebuiltRequest.setEdges(request.getEdges());

        // Persist new nodes
        Envelope envelope = new Envelope();
        for (PnsNode pnsNode : request.getNodes()) {
            Point point = geometryFactory.createPoint(
                    new Coordinate(pnsNode.getLng(), pnsNode.getLat()));
            point.setSRID(SRID_WGS84);
            envelope.expandToInclude(pnsNode.getLng(), pnsNode.getLat());

            GraphNode node = GraphNode.builder()
                    .graph(graph)
                    .nodeId(pnsNode.getId())
                    .lat(pnsNode.getLat())
                    .lng(pnsNode.getLng())
                    .type(pnsNode.getType() != null ? pnsNode.getType() : 2)
                    .initialContent(pnsNode.getInitialContent() != null ? pnsNode.getInitialContent() : 0.0)
                    .maximumCapacity(pnsNode.getMaximumCapacity() != null ? pnsNode.getMaximumCapacity() : 100.0)
                    .enable(Boolean.TRUE.equals(pnsNode.getEnable()))
                    .coordinates(point)
                    .build();
            graphNodeRepository.save(node);
        }

        for (PnsEdge pnsEdge : request.getEdges()) {
            GraphEdge edge = GraphEdge.builder()
                    .graph(graph)
                    .startNodeId(pnsEdge.getStartNodeId())
                    .endNodeId(pnsEdge.getEndNodeId())
                    .weight(pnsEdge.getWeight() != null ? pnsEdge.getWeight() : 10.0)
                    .capacity(pnsEdge.getCapacity() != null ? pnsEdge.getCapacity() : 50.0)
                    .time(pnsEdge.getTime() != null ? pnsEdge.getTime() : 5.0)
                    .enable(Boolean.TRUE.equals(pnsEdge.getEnable()))
                    .build();
            graphEdgeRepository.save(edge);
        }

        if (!envelope.isNull()) {
            org.locationtech.jts.geom.Geometry bounds = geometryFactory.toGeometry(envelope);
            bounds.setSRID(SRID_WGS84);
            graph.setBounds(bounds);
            graph = graphRepository.save(graph);
        }

        return toSummary(graph, request.getNodes().size(), request.getEdges().size());
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    /**
     * Deletes a graph. Only the owner can delete.
     * Cascade delete handles nodes and edges automatically.
     */
    public void deleteGraph(UUID graphId, User user) {
        Graph graph = graphRepository.findByIdAndUserId(graphId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Graph not found or access denied: " + graphId));
        graphRepository.delete(graph);
        log.info("Graph {} deleted by user {}", graphId, user.getId());
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private PnsNode toNodeDto(GraphNode n) {
        return new PnsNode(
                n.getNodeId(),
                n.getLat(),
                n.getLng(),
                n.getType(),
                n.getInitialContent(),
                n.getMaximumCapacity(),
                n.getEnable()
        );
    }

    private PnsEdge toEdgeDto(GraphEdge e) {
        return new PnsEdge(
                e.getStartNodeId(),
                e.getEndNodeId(),
                e.getWeight(),
                e.getCapacity(),
                e.getTime(),
                e.getEnable()
        );
    }

    private double[] extractBounds(Graph g) {
        if (g.getBounds() == null) return null;
        Envelope env = g.getBounds().getEnvelopeInternal();
        return new double[]{env.getMinX(), env.getMinY(), env.getMaxX(), env.getMaxY()};
    }

    private GraphSummaryResponse toSummary(Graph g, int nodeCount, int edgeCount) {
        return GraphSummaryResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .description(g.getDescription())
                .isPublic(g.getIsPublic())
                .nodeCount(nodeCount)
                .edgeCount(edgeCount)
                .bounds(extractBounds(g))
                .createdAt(g.getCreatedAt())
                .updatedAt(g.getUpdatedAt())
                .build();
    }

    private GraphResponse toResponse(Graph g, List<PnsNode> nodes, List<PnsEdge> edges) {
        return GraphResponse.builder()
                .id(g.getId())
                .userId(g.getUser().getId())
                .name(g.getName())
                .description(g.getDescription())
                .isPublic(g.getIsPublic())
                .bounds(extractBounds(g))
                .createdAt(g.getCreatedAt())
                .updatedAt(g.getUpdatedAt())
                .nodes(nodes)
                .edges(edges)
                .build();
    }
}
