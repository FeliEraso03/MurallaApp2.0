package com.muralla.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String profilePictureUrl;

    // Optional preferences during registration (wizard fills these after)
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
