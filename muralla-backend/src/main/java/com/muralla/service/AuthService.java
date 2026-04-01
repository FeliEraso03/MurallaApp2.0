package com.muralla.service;

import com.muralla.dto.AuthRequest;
import com.muralla.dto.AuthResponse;
import com.muralla.dto.RegisterRequest;
import com.muralla.model.Role;
import com.muralla.model.User;
import com.muralla.model.UserPreference;
import com.muralla.repository.UserRepository;
import com.muralla.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {

        // Build preferences with safe defaults for wizard-deferred values
        UserPreference preference = UserPreference.builder()
                .defaultTimeAvailableHours(orDefault(request.getDefaultTimeAvailableHours(), 4))
                .mobilityType(request.getMobilityType() != null ? request.getMobilityType() : "WALK")
                .groupType(request.getGroupType() != null ? request.getGroupType() : "SOLO")
                .touristType(request.getTouristType())
                .ageRange(request.getAgeRange())
                .gender(request.getGender())
                .interestCulture(orDefault(request.getInterestCulture(), 5))
                .interestReligion(orDefault(request.getInterestReligion(), 5))
                .interestGastronomy(orDefault(request.getInterestGastronomy(), 5))
                .interestNature(orDefault(request.getInterestNature(), 5))
                .interestArts(orDefault(request.getInterestArts(), 5))
                .interestAdventure(orDefault(request.getInterestAdventure(), 5))
                .build();

        var user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .profilePictureUrl(request.getProfilePictureUrl())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .preference(preference)
                .build();

        // Bidirectional consistency
        preference.setUser(user);

        repository.save(user);

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }

    private Integer orDefault(Integer value, Integer fallback) {
        return value != null ? value : fallback;
    }
}
