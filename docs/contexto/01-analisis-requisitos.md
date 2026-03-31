# Muralla App: Análisis de Requisitos y Arquitectura

## 1. Visión General del Proyecto
**Muralla App** es una plataforma web interactiva diseñada para la gestión y visualización de rutas turísticas en el Centro Histórico de Cartagena de Indias. El objetivo principal es resolver el **Tourist Trip Design Problem (TTDP)** mediante la generación de múltiples rutas óptimas y alternativas ($k$-best solutions) que se ajusten a las restricciones de tiempo y preferencias del usuario.

## 2. Requisitos del Sistema
Según los documentos de inscripción y propuesta de grado (basados en el estándar ISO/IEC/IEEE 29148:2018):

### Requisitos Funcionales (Principales)
- **Gestión de POIs (Points of Interest):** Localización y detalles de sitios emblemáticos en el Centro Histórico.
- **Generación de Rutas Personalizadas:** Implementación del algoritmo P-graph para calcular rutas eficientes basadas en el perfil del usuario.
- **Autenticación e Inicio de Sesión:** Sistema para que los usuarios guarden sus preferencias y rutas favoritas.
- **Captura de Datos para Personalización:** Formulario inicial para definir intereses (Cultura, Gastronomía, Religión, etc.).
- **Visualización SIG:** Interfaz de mapa interactivo para mostrar las rutas generadas.

### Requisitos No Funcionales (Arquitectura)
- **Diseño Responsivo (Mobile First):** La aplicación debe ser completamente funcional en dispositivos móviles y tablets.
- **Arquitectura en Capas:** Desacoplamiento de la lógica de negocio, persistencia y presentación (MVC).
- **Paradigma:** Programación Orientada a Objetos (POO).
- **Desempeño:** Respuesta eficiente en el cálculo de combinatorias complejas.
- **Escalabilidad:** Capacidad para integrar nuevos servicios de geolocalización o APIs externas.

## 3. Arquitectura Propuesta
El proyecto migrará de un esquema básico a una arquitectura robusta de 3 capas:

1.  **Capa de Presentación (Frontend):** React + Vite. Alta interactividad y renderizado dinámico de mapas.
2.  **Capa de Negocio (Backend):** Spring Boot (Java). Centraliza la lógica algorítmica del P-graph.
3.  **Capa de Datos:** PostgreSQL + PostGIS (recomendado para soporte geográfico avanzado).
