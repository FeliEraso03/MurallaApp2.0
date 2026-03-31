package com.muralla.controller;

import com.muralla.service.pgraph.GraphRequest;
import com.muralla.service.pgraph.PGraphAlgorithmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final PGraphAlgorithmService pGraphService;

    /**
     * Endpoint for generating optimal routes.
     * Uses the P-Graph algorithm (MSG, SSG, ABB) based on the user's preferences.
     * Requires an authenticated user (Bearer JWT).
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<List<Object>> generateCustomRoute(@RequestBody GraphRequest request) {
        
        // 1. Generate Maximal Structure (MSG)
        PGraphAlgorithmService.GraphMemory memory = pGraphService.generateMaximalStructure(request.getNodes(), request.getEdges());
        
        // 2. Generate Solution Structures (SSG)
        List<PGraphAlgorithmService.PathResult> ssgPaths = pGraphService.generateSolutionStructures(memory);
        
        // 3. Accelerated Branch and Bound (ABB)
        List<Object> kBestRoutes = pGraphService.executeABB(ssgPaths, memory);
        
        return ResponseEntity.ok(kBestRoutes);
    }

    /**
     * Endpoint to fetch the user's previously generated routes.
     */
    @GetMapping("/history")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<List<Object>> getUserRouteHistory() {
        // TODO: Fetch from SavedRoute table
        return ResponseEntity.ok(new ArrayList<>());
    }
}
