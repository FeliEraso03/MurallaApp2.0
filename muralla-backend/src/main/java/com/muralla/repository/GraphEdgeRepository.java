package com.muralla.repository;

import com.muralla.model.GraphEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GraphEdgeRepository extends JpaRepository<GraphEdge, UUID> {

    /** All edges for a given graph */
    List<GraphEdge> findByGraphIdOrderByCreatedAtAsc(UUID graphId);

    /** Edges starting from a specific node ID */
    List<GraphEdge> findByGraphIdAndStartNodeId(UUID graphId, String startNodeId);

    /** Edges ending at a specific node ID */
    List<GraphEdge> findByGraphIdAndEndNodeId(UUID graphId, String endNodeId);
}
