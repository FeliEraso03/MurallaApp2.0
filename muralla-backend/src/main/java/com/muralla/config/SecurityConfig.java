package com.muralla.config;

import com.muralla.model.Role;
import com.muralla.model.User;
import com.muralla.model.UserPreference;
import com.muralla.repository.UserRepository;
import com.muralla.security.JwtAuthenticationFilter;
import com.muralla.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(org.springframework.security.config.Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/", "/error", "/api/auth/**", "/api/routes/generate",
                                "/oauth2/**", "/login/oauth2/**").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        // Use IF_REQUIRED so OAuth2 login flow can maintain session temporarily
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // ── Google OAuth2 login flow ──────────────────────────
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oauth2SuccessHandler()));

        return http.build();
    }

    /**
     * After Google redirects back:
     * 1. Find or create a User from the OAuth2 principal.
     * 2. Generate a JWT.
     * 3. Redirect to the frontend /preferences page with the token in the URL fragment.
     *    The frontend reads it and stores it in localStorage.
     */
    @Bean
    public AuthenticationSuccessHandler oauth2SuccessHandler() {
        return new AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(HttpServletRequest request,
                                                HttpServletResponse response,
                                                Authentication authentication) throws IOException {
                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

                String email    = oauth2User.getAttribute("email");
                String fullName = oauth2User.getAttribute("name");

                // Find or create user
                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    UserPreference pref = UserPreference.builder()
                            .defaultTimeAvailableHours(4)
                            .mobilityType("WALK")
                            .groupType("SOLO")
                            .interestCulture(5)
                            .interestReligion(5)
                            .interestGastronomy(5)
                            .interestNature(5)
                            .interestArts(5)
                            .interestAdventure(5)
                            .build();

                    User newUser = User.builder()
                            .fullName(fullName)
                            .email(email)
                            .password("") // no password for OAuth2 users
                            .role(Role.USER)
                            .preference(pref)
                            .build();

                    pref.setUser(newUser);
                    User saved = userRepository.save(newUser);
                    return saved;
                });

                String token = jwtService.generateToken(user);

                // Redirect to frontend with token in the URL hash
                // The frontend's OAuth2Callback page reads window.location.hash
                response.sendRedirect(frontendUrl + "/oauth2-callback#token=" + token
                        + "&email=" + email
                        + "&name=" + java.net.URLEncoder.encode(fullName != null ? fullName : "", "UTF-8"));
            }
        };
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOriginPatterns(java.util.List.of("*"));
        configuration.setAllowedMethods(java.util.List.of("*"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(false);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
