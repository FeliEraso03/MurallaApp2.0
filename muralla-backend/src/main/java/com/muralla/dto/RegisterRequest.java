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
    
    // Preferences required during setup
    private Integer defaultTimeAvailableHours;
    private Integer interestCulture;
    private Integer interestGastronomy;
    private Integer interestReligion;
    private Integer interestAdventure;
}
