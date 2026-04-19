package com.muralla.service;

import com.muralla.model.Role;
import com.muralla.model.User;
import com.muralla.model.UserPreference;
import com.muralla.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.net.URL;
import java.util.Base64;


@Service
@RequiredArgsConstructor
public class OAuth2UserService {

    private final UserRepository repository;

    @Transactional
    public User createOrGetOAuth2User(String email, String fullName, String picture) {
        final String savedPicture = downloadAndEncodeImage(picture);
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
                    .profilePictureUrl(savedPicture)
                    .password("") // no password for OAuth2 users
                    .role(Role.USER)
                    .preference(pref)
                    .build();

            pref.setUser(newUser);
            return repository.save(newUser);
        });
    }

    private String downloadAndEncodeImage(String pictureUrl) {
        if (pictureUrl == null || pictureUrl.isEmpty() || !pictureUrl.startsWith("http")) {
            return pictureUrl; // Fallback to original
        }
        try {
            URL url = new URL(pictureUrl);
            try (InputStream is = url.openStream()) {
                byte[] bytes = is.readAllBytes();
                String base64 = Base64.getEncoder().encodeToString(bytes);
                // Detemine MIME roughly. Google returns jpeg usually
                return "data:image/jpeg;base64," + base64;
            }
        } catch (Exception e) {
            System.err.println("Failed to download profile picture: " + e.getMessage());
            return pictureUrl; // Fallback to original URL string
        }
    }
}
