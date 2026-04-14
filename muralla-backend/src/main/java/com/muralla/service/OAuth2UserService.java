package com.muralla.service;

import com.muralla.model.Role;
import com.muralla.model.User;
import com.muralla.model.UserPreference;
import com.muralla.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OAuth2UserService {

    private final UserRepository repository;

    @Transactional
    public User createOrGetOAuth2User(String email, String fullName, String picture) {
        return repository.findByEmail(email).orElseGet(() -> {
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
                    .profilePictureUrl(picture)
                    .password("") // no password for OAuth2 users
                    .role(Role.USER)
                    .preference(pref)
                    .build();

            pref.setUser(newUser);
            return repository.save(newUser);
        });
    }
}
