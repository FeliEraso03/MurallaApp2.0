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
        
        // Build the preferences from the payload
        UserPreference preference = UserPreference.builder()
                .defaultTimeAvailableHours(request.getDefaultTimeAvailableHours() != null ? request.getDefaultTimeAvailableHours() : 4)
                .interestCulture(request.getInterestCulture() != null ? request.getInterestCulture() : 5)
                .interestGastronomy(request.getInterestGastronomy() != null ? request.getInterestGastronomy() : 5)
                .interestReligion(request.getInterestReligion() != null ? request.getInterestReligion() : 5)
                .interestAdventure(request.getInterestAdventure() != null ? request.getInterestAdventure() : 5)
                .build();

        var user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .preference(preference) // Link preference
                .build();
                
        // Bidirectional consistency
        preference.setUser(user);

        // Save User (which cascaded saves UserPreference)
        repository.save(user);

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If we reach here, user is authenticated
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}
