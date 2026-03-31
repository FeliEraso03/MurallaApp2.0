package com.muralla.controller;

import com.muralla.dto.PreferenceRequest;
import com.muralla.model.User;
import com.muralla.model.UserPreference;
import com.muralla.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * GET /api/users/me — returns the current user's preferences.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(buildResponse(user));
    }

    /**
     * PUT /api/users/preferences — update the current user's preferences.
     */
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PreferenceRequest req
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreference pref = user.getPreference();
        if (pref == null) {
            pref = new UserPreference();
            pref.setUser(user);
        }

        if (req.getDefaultTimeAvailableHours() != null)
            pref.setDefaultTimeAvailableHours(req.getDefaultTimeAvailableHours());
        if (req.getMobilityType() != null)
            pref.setMobilityType(req.getMobilityType());
        if (req.getGroupType() != null)
            pref.setGroupType(req.getGroupType());
        if (req.getInterestCulture() != null)
            pref.setInterestCulture(req.getInterestCulture());
        if (req.getInterestReligion() != null)
            pref.setInterestReligion(req.getInterestReligion());
        if (req.getInterestGastronomy() != null)
            pref.setInterestGastronomy(req.getInterestGastronomy());
        if (req.getInterestNature() != null)
            pref.setInterestNature(req.getInterestNature());
        if (req.getInterestArts() != null)
            pref.setInterestArts(req.getInterestArts());
        if (req.getInterestAdventure() != null)
            pref.setInterestAdventure(req.getInterestAdventure());

        user.setPreference(pref);
        userRepository.save(user);

        return ResponseEntity.ok(buildResponse(user));
    }

    private Object buildResponse(User user) {
        UserPreference p = user.getPreference();
        return new java.util.HashMap<>() {{
            put("email", user.getEmail());
            put("fullName", user.getFullName());
            put("preferences", p);
        }};
    }
}
