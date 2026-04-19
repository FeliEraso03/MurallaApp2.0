-- ============================================================
-- V2: Create graphs, graph_nodes, graph_edges tables
-- ============================================================

-- ── Table: graphs (metadata) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS graphs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     INTEGER NOT NULL REFERENCES _user(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    is_public   BOOLEAN NOT NULL DEFAULT FALSE,
    bounds      geometry(Geometry, 4326),
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- ── Table: graph_nodes ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS graph_nodes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_id         UUID NOT NULL REFERENCES graphs(id) ON DELETE CASCADE,
    node_id          VARCHAR(100) NOT NULL,       -- PnsNode.id  (e.g. "Node1")
    lat              DOUBLE PRECISION NOT NULL,   -- PnsNode.lat
    lng              DOUBLE PRECISION NOT NULL,   -- PnsNode.lng
    type             INTEGER NOT NULL DEFAULT 2,  -- PnsNode.type  1=Source 2=Intermediate 3=Output
    initial_content  DOUBLE PRECISION NOT NULL DEFAULT 0,
    maximum_capacity DOUBLE PRECISION NOT NULL DEFAULT 100,
    enable           BOOLEAN NOT NULL DEFAULT TRUE,
    coordinates      geometry(Point, 4326),
    created_at       TIMESTAMP NOT NULL DEFAULT now()
);

-- ── Table: graph_edges ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS graph_edges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_id      UUID NOT NULL REFERENCES graphs(id) ON DELETE CASCADE,
    start_node_id VARCHAR(100) NOT NULL,  -- PnsEdge.startNodeId
    end_node_id   VARCHAR(100) NOT NULL,  -- PnsEdge.endNodeId
    weight        DOUBLE PRECISION NOT NULL DEFAULT 10,
    capacity      DOUBLE PRECISION NOT NULL DEFAULT 50,
    time          DOUBLE PRECISION NOT NULL DEFAULT 5,
    enable        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- ── Spatial Indexes (GiST) ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_graphs_bounds       ON graphs       USING GIST (bounds);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_coords  ON graph_nodes  USING GIST (coordinates);

-- ── Standard Indexes (FK + lookups) ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_graphs_user_id      ON graphs       (user_id);
CREATE INDEX IF NOT EXISTS idx_graphs_is_public    ON graphs       (is_public);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_graph   ON graph_nodes  (graph_id);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_node_id ON graph_nodes  (node_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_graph   ON graph_edges  (graph_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_start   ON graph_edges  (start_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_end     ON graph_edges  (end_node_id);

-- ── Trigger: auto-update updated_at on graphs ───────────────
CREATE OR REPLACE FUNCTION update_graphs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_graphs_updated_at
    BEFORE UPDATE ON graphs
    FOR EACH ROW EXECUTE FUNCTION update_graphs_updated_at();
