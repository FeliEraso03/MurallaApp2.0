package com.muralla.repository;

import com.muralla.model.Graph;
import org.locationtech.jts.geom.Geometry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GraphRepository extends JpaRepository<Graph, UUID> {

    /** Graphs owned by a specific user (paginated) */
    Page<Graph> findByUserIdOrderByUpdatedAtDesc(Integer userId, Pageable pageable);

    /** Public graphs (paginated) */
    Page<Graph> findByIsPublicTrueOrderByUpdatedAtDesc(Pageable pageable);

    /** Find a graph by ID, verifying it belongs to the user */
    Optional<Graph> findByIdAndUserId(UUID id, Integer userId);

    /**
     * Spatial: find graphs whose bounds intersect with a given envelope.
     * Uses PostGIS ST_Intersects for index-friendly bbox queries.
     */
    @Query("SELECT g FROM Graph g WHERE function('ST_Intersects', g.bounds, :bbox) = true")
    List<Graph> findByBoundsIntersects(@Param("bbox") Geometry bbox);

    /**
     * Spatial: find public graphs whose bounds are within given distance (meters).
     * Uses PostGIS ST_DWithin (on SRID 4326 geometry).
     */
    @Query(value = """
            SELECT * FROM graphs g
            WHERE is_public = true
              AND ST_DWithin(g.bounds::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)
            """, nativeQuery = true)
    List<Graph> findPublicNear(@Param("lat") double lat,
                                @Param("lng") double lng,
                                @Param("radiusMeters") double radiusMeters);
}
