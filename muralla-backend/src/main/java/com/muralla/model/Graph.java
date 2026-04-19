package com.muralla.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Geometry;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a saved P-graph created by a user.
 * Stores metadata and spatial bounds for geospatial queries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "graphs")
public class Graph {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Owner of this graph */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    /**
     * Bounding box of all nodes in the graph (SRID 4326).
     * Used for spatial queries (ST_Within, ST_Distance, etc.).
     */
    @Column(columnDefinition = "geometry(Geometry, 4326)")
    private Geometry bounds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "graph", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GraphNode> nodes = new ArrayList<>();

    @OneToMany(mappedBy = "graph", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GraphEdge> edges = new ArrayList<>();

    @PrePersist
    private void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
