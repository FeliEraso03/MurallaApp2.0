package com.muralla.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A single edge (arc) in a saved graph.
 * Fields are compatible with PnsEdge DTO:
 *   start_node_id ↔ PnsEdge.startNodeId
 *   end_node_id   ↔ PnsEdge.endNodeId
 *   weight        ↔ PnsEdge.weight
 *   capacity      ↔ PnsEdge.capacity
 *   time          ↔ PnsEdge.time
 *   enable        ↔ PnsEdge.enable
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "graph_edges")
public class GraphEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "graph_id", nullable = false)
    private Graph graph;

    /** Compatible with PnsEdge.startNodeId */
    @Column(name = "start_node_id", nullable = false, length = 100)
    private String startNodeId;

    /** Compatible with PnsEdge.endNodeId */
    @Column(name = "end_node_id", nullable = false, length = 100)
    private String endNodeId;

    /** Compatible with PnsEdge.weight */
    @Column(nullable = false)
    @Builder.Default
    private Double weight = 10.0;

    /** Compatible with PnsEdge.capacity */
    @Column(nullable = false)
    @Builder.Default
    private Double capacity = 50.0;

    /** Compatible with PnsEdge.time */
    @Column(name = "time", nullable = false)
    @Builder.Default
    private Double time = 5.0;

    /** Compatible with PnsEdge.enable */
    @Column(nullable = false)
    @Builder.Default
    private Boolean enable = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
