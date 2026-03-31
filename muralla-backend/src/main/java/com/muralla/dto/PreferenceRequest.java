package com.muralla.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO for updating user preferences (PUT /api/users/preferences) */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PreferenceRequest {

    private Integer defaultTimeAvailableHours;
    private String  mobilityType;
    private String  groupType;

    private Integer interestCulture;
    private Integer interestReligion;
    private Integer interestGastronomy;
    private Integer interestNature;
    private Integer interestArts;
    private Integer interestAdventure;
}
