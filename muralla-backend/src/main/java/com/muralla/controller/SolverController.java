package com.muralla.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

@RestController
@RequestMapping("/api/solver")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SolverController {
    
    private final RestTemplate restTemplate;
    private final String SOLVER_URL = "https://muralla-solver.onrender.com/upload-geojson";
    
    @PostMapping("/solve")
    public ResponseEntity<?> solveGraph(@RequestBody Map<String, Object> geojson) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(geojson, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                SOLVER_URL, 
                request, 
                Map.class
            );
            
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error al procesar con el solver: " + e.getMessage()
            ));
        }
    }
}
