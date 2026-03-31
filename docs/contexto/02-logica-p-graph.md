# Lógica del Algoritmo P-graph en Muralla App

## 1. Introducción al Método P-graph
El método **P-graph (Process Graph)** es un marco teórico matemático y computacional originalmente diseñado para la síntesis de redes de procesos industriales. En el contexto de **Muralla App**, se aplica para resolver problemas de optimización combinatoria en rutas turísticas.

## 2. Componentes Matemáticos
El algoritmo se basa en un grafo bipartito con tres tipos de nodos:

- **M-nodes (Materials):** Representan los estados de localización del turista. Un "material" inicial es el punto de partida y un "material" final es el destino o el fin de la jornada.
- **O-nodes (Operating Units):** Representan las acciones o actividades. En nuestro caso, desplazarse de un POI a otro o la visita misma al sitio de interés.
- **C-nodes (Constraints):** Restricciones de tiempo, presupuesto y capacidad.

## 3. Algoritmos Core
Para la generación de rutas en Cartagena, utilizaremos:

1.  **MSG (Maximal Structure Generation):** Construye la estructura máxima que contiene todos los recorridos posibles entre los POIs seleccionados.
2.  **SSG (Solution Structure Generation):** Extrae todas las sub-estructuras que representan rutas completas y factibles.
3.  **Algoritmo ABB (Accelerated Branch and Bound):** Evalúa y ordena las soluciones para encontrar no solo la mejor, sino las **k-mejores (k-best solutions)** para ofrecer alternativas al turista.

## 4. Adaptación al Tourist Trip Design Problem (TTDP)
A diferencia de un GPS tradicional (que busca la ruta más corta entre A y B), el P-graph en Muralla App:
- Evalúa la "utilidad" de cada parada (POI).
- Respeta una "ventana de tiempo" total.
- Genera un catálogo de opciones: "La más histórica", "La más rápida", "La más económica".

## 5. Implementación en Backend (Spring Boot)
La lógica pesada se implementará en Java, permitiendo:
- Manejo de matrices de adyacencia y distancias.
- Persistencia de POIs con coordenadas geográficas.
- API REST para que el frontend (React) consulte y visualice las rutas.
