package com.muralla.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for graph metadata and content.
 * Nodes and edges use PnsNode/PnsEdge for compatibility
 * with PGraphAlgorithmService.
 */
@Data
@Builder
public class GraphResponse {

    private UUID id;
    private Integer userId;
    private String name;
    private String description;
    private Boolean isPublic;

    /** Bounding box as [minLng, minLat, maxLng, maxLat] */
    private double[] bounds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Nodes in PnsNode format for algorithm compatibility */
    private List<PnsNode> nodes;

    /** Edges in PnsEdge format for algorithm compatibility */
    private List<PnsEdge> edges;
}
