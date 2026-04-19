package com.muralla.controller;

import com.muralla.dto.GraphResponse;
import com.muralla.dto.GraphSaveRequest;
import com.muralla.dto.GraphSummaryResponse;
import com.muralla.model.User;
import com.muralla.repository.UserRepository;
import com.muralla.service.GraphStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API for graph persistence (save/load/update/delete/share).
 * All write operations require authentication (JWT).
 * Public graphs are readable by any authenticated user.
 */
@RestController
@RequestMapping("/api/graphs")
@RequiredArgsConstructor
public class GraphController {

    private final GraphStorageService graphStorageService;
    private final UserRepository userRepository;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── POST /api/graphs — save new graph ────────────────────────────────────

    @PostMapping
    public ResponseEntity<GraphSummaryResponse> saveGraph(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody GraphSaveRequest request) {

        User user = resolveUser(userDetails);
        GraphSummaryResponse response = graphStorageService.saveGraph(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/graphs — list user's graphs (paginated) ────────────────────

    @GetMapping
    public ResponseEntity<Page<GraphSummaryResponse>> listGraphs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User user = resolveUser(userDetails);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(graphStorageService.listGraphs(user, pageable));
    }

    // ── GET /api/graphs/public — list public graphs (paginated) ─────────────

    @GetMapping("/public")
    public ResponseEntity<Page<GraphSummaryResponse>> listPublicGraphs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(graphStorageService.listPublicGraphs(pageable));
    }

    // ── GET /api/graphs/{id} — load specific graph ──────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<GraphResponse> loadGraph(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {

        User user = resolveUser(userDetails);
        try {
            GraphResponse response = graphStorageService.loadGraph(id, user);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    // ── PUT /api/graphs/{id} — update graph ─────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<GraphSummaryResponse> updateGraph(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody GraphSaveRequest request) {

        User user = resolveUser(userDetails);
        try {
            GraphSummaryResponse response = graphStorageService.updateGraph(id, user, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ── DELETE /api/graphs/{id} — delete graph ───────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGraph(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {

        User user = resolveUser(userDetails);
        try {
            graphStorageService.deleteGraph(id, user);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
