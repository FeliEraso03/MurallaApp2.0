package com.muralla.service.pgraph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PnsNode {
    private String id;
    private Double lat;
    private Double lng;
    private Integer type; // 1: Source, 2: Intermediate, 3: Output
    private Double initialContent;
    private Double maximumCapacity;
    private Boolean enable;
}
