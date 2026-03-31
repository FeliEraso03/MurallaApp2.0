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

    private Integer defaultTimeAvailableHours;

    // Weight preferences (1-10) for configuring P-Graph algorithms
    private Integer interestCulture;
    private Integer interestGastronomy;
    private Integer interestReligion;
    private Integer interestAdventure;
}
