package com.muralla.service.pgraph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PnsEdge {
    private String startNodeId;
    private String endNodeId;
    private Double weight;
    private Double capacity;
    private Double time;
    private Boolean enable;
}
