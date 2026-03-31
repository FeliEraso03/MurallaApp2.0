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
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    /** Hours available for the tour route (2, 4, 6, 8) */
    private Integer defaultTimeAvailableHours;

    /** Mobility type: "WALK" | "MULTI" */
    private String mobilityType;

    /** Group composition: "SOLO" | "COUPLE" | "FAMILY" | "GROUP" */
    private String groupType;

    /** Demographic analysis: "LOCAL" | "NATIONAL" | "INTERNATIONAL" */
    private String touristType;

    /** Age range: "18-25" | "26-35" | "36-50" | "50+" */
    private String ageRange;

    // ── Interest weights 1-10 ──────────────────────────

    /** Historical / Colonial cultural sites */
    private Integer interestCulture;

    /** Religious sites and temples */
    private Integer interestReligion;

    /** Gastronomic experience */
    private Integer interestGastronomy;

    /** Nature, plazas and open spaces */
    private Integer interestNature;

    /** Street art, crafts and live culture */
    private Integer interestArts;

    /** Urban exploration and off-the-beaten-path */
    private Integer interestAdventure;
}
