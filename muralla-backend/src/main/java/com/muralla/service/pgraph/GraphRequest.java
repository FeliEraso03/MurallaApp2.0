package com.muralla.service.pgraph;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphRequest {
    private List<PnsNode> nodes;
    private List<PnsEdge> edges;
}
