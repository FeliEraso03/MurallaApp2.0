package com.muralla.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A single node in a saved graph.
 * Fields are compatible with PnsNode DTO:
 *   node_id     ↔ PnsNode.id
 *   lat         ↔ PnsNode.lat
 *   lng         ↔ PnsNode.lng
 *   type        ↔ PnsNode.type  (1=Source, 2=Intermediate, 3=Output)
 *   initialContent  ↔ PnsNode.initialContent
 *   maximumCapacity ↔ PnsNode.maximumCapacity
 *   enable      ↔ PnsNode.enable
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "graph_nodes")
public class GraphNode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "graph_id", nullable = false)
    private Graph graph;

    /** External node identifier, compatible with PnsNode.id */
    @Column(name = "node_id", nullable = false, length = 100)
    private String nodeId;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;

    /**
     * Node type: 1=Source, 2=Intermediate, 3=Output
     * Compatible with PnsNode.type
     */
    @Column(nullable = false)
    private Integer type;

    @Column(name = "initial_content", nullable = false)
    @Builder.Default
    private Double initialContent = 0.0;

    @Column(name = "maximum_capacity", nullable = false)
    @Builder.Default
    private Double maximumCapacity = 100.0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enable = true;

    /**
     * PostGIS Point geometry (SRID 4326) for spatial queries.
     * Populated from lat/lng when persisting.
     */
    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point coordinates;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
