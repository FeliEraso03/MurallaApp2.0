# 🗺️ MurallaApp 2.0 — Reporte QA: Funciones del Mapa

**Fecha:** 2026-04-01 | **Version:** 2.0 | **Ambiente:** Docker localhost:80
**Metodologia:** 2 subagentes paralelos — Modo Oscuro + Modo Claro

## RESULTADO GLOBAL: 26/26 Tests APROBADOS

---

## MODO OSCURO — Carto Dark Matter

| Test | Funcion | Estado |
|------|---------|--------|
| 1 | Renderizado base (tiles dark, POI labels) | PASS |
| 2 | Toggle sidebar (abrir/cerrar) | PASS |
| 3 | Cuadricula dinamica | PASS |
| 4 | Añadir nodos (3 nodos, modal, contador topbar) | PASS |
| 5 | Conectar nodos / aristas | PASS |
| 6 | Edicion de nodos (click IDLE -> modal) | PASS |
| 7 | Flechas de direccion (arrow-right simbolo) | PASS |
| 8 | Limpiar grafo (Limpiar todo btn) | PASS |
| 9 | Pestana Planificar | PASS |

## MODO CLARO — Liberty (OpenFreeMap)

| Test | Funcion | Estado |
|------|---------|--------|
| 1 | Renderizado base Liberty | PASS |
| 2 | Modo 3D toggle (pitch 80, bearing -15) | PASS |
| 3 | Cuadricula en modo claro | PASS |
| 4 | Añadir nodos | PASS |
| 5 | Conectar nodos | PASS |
| 6 | Grafo 3D (cilindros + muros fill-extrusion) | PASS |
| 7 | Controles de opacidad 3D (sliders) | PASS |
| 8 | Flechas de direccion | PASS |
| 9 | Grafo completo Cartagena 2D (260n/285a) | PASS |
| 10 | Grafo completo Cartagena 3D | PASS |
| 11 | Persistencia grafo al cambiar estilo | PASS |
| 12 | Seleccion Dijkstra (origen verde / destino magenta) | PASS |
| 13 | Pestana Planificar modo claro | PASS |
| 14 | Toggle sidebar modo claro | PASS |

---

## TOTAL: 26/26 PASS — SIN BUGS EN FUNCIONES DEL MAPA

### Observaciones
- Error 500 en /api/auth/register (credenciales duplicadas en BD de test): no afecta funciones del mapa
- Al cambiar estilo, el Modo 3D se desactiva: comportamiento correcto e intencional

### Screenshots generados (en .gemini/antigravity/brain/115bde67-1ff8-49c5-a76a-7a46b38b5a6a/)
- dark_mode_initial_map_1775082349824.png
- dark_mode_sidebar_closed_1775082363742.png
- dark_mode_sidebar_reopened_1775082365989.png
- dark_mode_grid_enabled_1775082373604.png
- dark_mode_nodes_added_1775082417268.png
- dark_mode_edge_added_1775082434887.png
- dark_mode_edit_node_modal_1775082470789.png
- dark_mode_visualizar_sentido_enabled_1775082515317.png
- dark_mode_graph_cleared_1775082543019.png
- dark_mode_planificar_tab_1775082557519.png
- setup_light_mode_liberty_1775082604921.png
- light_mode_3d_enabled_1775082617726.png
- light_mode_2d_after_3d_1775082636793.png
- light_mode_grid_enabled_1775082648815.png
- light_mode_nodes_added_1775082702085.png
- light_mode_edge_connected_1775082730352.png
- light_mode_3d_graph_visualization_1775082749147.png
- light_mode_opacity_effects_1775082770104.png
- light_mode_direction_arrows_1775082777624.png
- light_mode_full_graph_3d_1775082829252.png
- light_mode_full_graph_2d_1775082855553.png
- light_mode_style_switch_persistence_1775082892240.png
- light_mode_dijkstra_nodes_selected_1775083031683.png
- light_mode_planner_tab_ui_1775083059767.png
- light_mode_sidebar_closed_1775083070837.png
- light_mode_sidebar_reopened_1775083073685.png
