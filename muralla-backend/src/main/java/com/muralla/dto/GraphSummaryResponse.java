package com.muralla.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Summary DTO for graph list views (no node/edge data).
 */
@Data
@Builder
public class GraphSummaryResponse {

    private UUID id;
    private String name;
    private String description;
    private Boolean isPublic;
    private int nodeCount;
    private int edgeCount;

    /** Bounding box as [minLng, minLat, maxLng, maxLat] */
    private double[] bounds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
