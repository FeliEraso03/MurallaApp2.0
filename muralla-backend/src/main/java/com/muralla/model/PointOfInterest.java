package com.muralla.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "points_of_interest")
public class PointOfInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    // Geographic Coordinates
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    // Attributes for P-graph logic
    private String category;
    
    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    // "Weight" or importance score to be used by MSG/ABB algorithm
    @Column(name = "relevance_score")
    private Integer relevanceScore;
}
