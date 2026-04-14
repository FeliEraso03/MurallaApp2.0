package com.muralla.controller;

import com.muralla.dto.PasswordChangeRequest;
import com.muralla.dto.PreferenceRequest;
import com.muralla.model.User;
import com.muralla.model.UserPreference;
import com.muralla.repository.UserRepository;
import com.muralla.service.CurrencyConversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrencyConversionService currencyConversionService;

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

        if (req.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(req.getProfilePictureUrl());
        }
        if (req.getFullName() != null) {
            user.setFullName(req.getFullName());
        }

        if (req.getDefaultTimeAvailableHours() != null)
            pref.setDefaultTimeAvailableHours(req.getDefaultTimeAvailableHours());
        if (req.getMobilityType() != null)
            pref.setMobilityType(req.getMobilityType());
        if (req.getGroupType() != null)
            pref.setGroupType(req.getGroupType());
        if (req.getTouristType() != null)
            pref.setTouristType(req.getTouristType());
        if (req.getAgeRange() != null)
            pref.setAgeRange(req.getAgeRange());
        if (req.getGender() != null)
            pref.setGender(req.getGender());
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

        // Handle budget and currency with conversion to COP
        if (req.getBudget() != null && req.getCurrency() != null) {
            // Convert budget from user's currency to COP for internal storage
            java.math.BigDecimal budgetInCOP = currencyConversionService.convertToCOP(req.getBudget(), req.getCurrency());
            pref.setBudget(budgetInCOP);
            pref.setCurrency(req.getCurrency());
        }

        user.setPreference(pref);
        userRepository.save(user);

        return ResponseEntity.ok(buildResponse(user));
    }

    /**
     * GET /api/users/budget-ranges — returns budget ranges for all currencies based on current exchange rates.
     */
    @GetMapping("/budget-ranges")
    public ResponseEntity<?> getBudgetRanges() {
        // Base budget in COP: 40 million pesos
        java.math.BigDecimal baseBudgetCOP = new java.math.BigDecimal("40000000");

        String[] currencies = currencyConversionService.getSupportedCurrencies();
        java.util.Map<String, java.util.Map<String, Object>> ranges = new java.util.HashMap<>();

        for (String currency : currencies) {
            java.math.BigDecimal maxInCurrency = currencyConversionService.convertFromCOP(baseBudgetCOP, currency);
            java.math.BigDecimal minInCurrency = maxInCurrency.divide(new java.math.BigDecimal("80"), 2, java.math.RoundingMode.HALF_UP); // ~1.25% of max

            java.util.Map<String, Object> range = new java.util.HashMap<>();
            range.put("min", minInCurrency);
            range.put("max", maxInCurrency);
            range.put("step", calculateStep(minInCurrency, maxInCurrency));
            ranges.put(currency, range);
        }

        return ResponseEntity.ok(ranges);
    }

    private java.math.BigDecimal calculateStep(java.math.BigDecimal min, java.math.BigDecimal max) {
        java.math.BigDecimal range = max.subtract(min);
        // Aim for ~100 steps
        java.math.BigDecimal step = range.divide(new java.math.BigDecimal("100"), 0, java.math.RoundingMode.UP);
        // Round to nice numbers
        if (step.compareTo(new java.math.BigDecimal("10")) < 0) {
            return new java.math.BigDecimal("1");
        } else if (step.compareTo(new java.math.BigDecimal("100")) < 0) {
            return new java.math.BigDecimal("10");
        } else if (step.compareTo(new java.math.BigDecimal("1000")) < 0) {
            return new java.math.BigDecimal("50");
        } else if (step.compareTo(new java.math.BigDecimal("10000")) < 0) {
            return new java.math.BigDecimal("500");
        } else if (step.compareTo(new java.math.BigDecimal("100000")) < 0) {
            return new java.math.BigDecimal("5000");
        } else {
            return new java.math.BigDecimal("50000");
        }
    }

    /**
     * POST /api/users/change-password — update the current user's password.
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PasswordChangeRequest req
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate current password
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La contraseña actual es incorrecta.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Contraseña actualizada correctamente.");
    }

    private Object buildResponse(User user) {
        UserPreference p = user.getPreference();
        java.util.HashMap<String, Object> response = new java.util.HashMap<>();
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("profilePictureUrl", user.getProfilePictureUrl());

        // Convert budget from COP to user's preferred currency
        if (p != null && p.getBudget() != null && p.getCurrency() != null) {
            java.math.BigDecimal budgetInUserCurrency = currencyConversionService.convertFromCOP(p.getBudget(), p.getCurrency());
            // Create a copy of the preference with converted budget
            UserPreference pCopy = new UserPreference();
            pCopy.setId(p.getId());
            pCopy.setDefaultTimeAvailableHours(p.getDefaultTimeAvailableHours());
            pCopy.setMobilityType(p.getMobilityType());
            pCopy.setGroupType(p.getGroupType());
            pCopy.setTouristType(p.getTouristType());
            pCopy.setAgeRange(p.getAgeRange());
            pCopy.setGender(p.getGender());
            pCopy.setInterestCulture(p.getInterestCulture());
            pCopy.setInterestReligion(p.getInterestReligion());
            pCopy.setInterestGastronomy(p.getInterestGastronomy());
            pCopy.setInterestNature(p.getInterestNature());
            pCopy.setInterestArts(p.getInterestArts());
            pCopy.setInterestAdventure(p.getInterestAdventure());
            pCopy.setBudget(budgetInUserCurrency);
            pCopy.setCurrency(p.getCurrency());
            response.put("preferences", pCopy);
        } else {
            response.put("preferences", p);
        }

        return response;
    }
}
