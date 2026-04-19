-- ============================================================
-- V1: Enable PostGIS extension
-- ============================================================
-- This migration enables the PostGIS spatial extension.
-- It must run BEFORE any table creation that uses geometry types.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
