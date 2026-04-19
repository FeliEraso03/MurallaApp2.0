package com.muralla.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request payload for saving or updating a graph.
 * Nodes and edges use the same format as PnsNode/PnsEdge for
 * compatibility with PGraphAlgorithmService.
 */
@Data
public class GraphSaveRequest {

    @NotBlank(message = "Graph name is required")
    private String name;

    private String description;

    private Boolean isPublic = false;

    @NotNull(message = "Nodes list is required")
    @Valid
    private List<PnsNode> nodes;

    @NotNull(message = "Edges list is required")
    @Valid
    private List<PnsEdge> edges;
}
