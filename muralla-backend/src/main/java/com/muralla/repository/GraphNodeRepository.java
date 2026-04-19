package com.muralla.repository;

import com.muralla.model.GraphNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GraphNodeRepository extends JpaRepository<GraphNode, UUID> {

    /** All nodes for a given graph */
    List<GraphNode> findByGraphIdOrderByCreatedAtAsc(UUID graphId);

    /** Find a specific node by its external string ID within a graph */
    Optional<GraphNode> findByGraphIdAndNodeId(UUID graphId, String nodeId);
}
