# Guías de Desarrollo - Muralla App

## Reglas de Internacionalización (i18n)

### Frontend (React)
- **TODO**: Todo texto visible en interfaces de usuario DEBE usar el sistema i18n (función `t()` en React)
- NO se permiten strings hardcoded en español o inglés en componentes UI
- Usar claves de traducción en formato `seccion.subseccion.clave`
- Ejemplo: `t('graphManager.saveButton')` en lugar de `"Guardar Grafo"`
- Sistema de internacionalización: `src/i18n.js`
- Archivos de traducción: `src/locales/{lang}.json`
- Idiomas soportados: es, en, pt, zh, hi, ar, de, ru, fr, it, ja, ko, tr, id, nl

### Backend (Spring Boot)
- Los mensajes de error y validación deben ser internacionalizados usando MessageSource
- Usar archivos `messages_{lang}.properties` en `src/main/resources/`
- Ejemplo: `messageSource.getMessage("error.graph.notFound", null, locale)`

## Arquitectura Backend (Spring Boot)

### Estructura de Paquetes
- `model/` - Entidades JPA (Graph, GraphNode, GraphEdge, User, etc.)
- `repository/` - Repositorios Spring Data JPA
- `service/` - Servicios de negocio (GraphStorageService, PGraphAlgorithmService, AuthService, etc.)
- `dto/` - DTOs para requests/responses (GraphRequest, PnsNode, PnsEdge, AuthRequest, etc.)
- `controller/` - Controladores REST (GraphController, RouteController, UserController, etc.)
- `security/` - Configuración de seguridad y JWT
- `config/` - Configuración de la aplicación

### DTOs Existentes
- `PnsNode`: id, lat, lng, type (1: Source, 2: Intermediate, 3: Output), initialContent, maximumCapacity, enable
- `PnsEdge`: startNodeId, endNodeId, weight, capacity, time, enable
- `GraphRequest`: algorithmMode, sourceNodeId, targetNodeId, nodes (List<PnsNode>), edges (List<PnsEdge>)

### Compatibilidad
- Las nuevas entidades JPA deben mapearse a estos DTOs para compatibilidad con PGraphAlgorithmService
- GraphNode debe ser compatible con PnsNode
- GraphEdge debe ser compatible con PnsEdge

## Arquitectura Frontend (React)

### Estructura de Archivos
- `src/i18n.js` - Sistema de internacionalización
- `src/locales/` - Archivos de traducción JSON por idioma
- `src/components/` - Componentes UI reutilizables
- `src/pages/` - Páginas de la aplicación
- `src/contexts/` - Contextos React (I18nContext, AuthContext)
- `src/hooks/` - Custom hooks (useI18n, useAuth)
- `src/App.jsx` - Estado global de la aplicación
- `src/main.jsx` - Punto de entrada de React

### Internacionalización
- Usar hook `useI18n()` para acceder a la función `t()`
- Claves de traducción en formato `seccion.subseccion.clave`
- Ejemplo de uso:
```jsx
import { useI18n } from '../hooks/useI18n';

function MyComponent() {
  const { t } = useI18n();
  return <button>{t('graphManager.saveButton')}</button>;
}
```

## Convenciones de Código

### Java (Backend)
- Usar Lombok para reducir boilerplate (@Data, @NoArgsConstructor, @AllArgsConstructor)
- Seguir convenciones de nombres de Java (camelCase para variables, PascalCase para clases)
- Usar @Service para servicios, @Repository para repositorios, @RestController para controladores
- Validar inputs con @Valid y @NotNull/@NotBlank

### JavaScript/React (Frontend)
- Usar componentes funcionales y hooks
- Usar ESLint y Prettier para formato consistente
- Separar lógica de presentación
- Usar PropTypes o TypeScript para validación de props

## Git Workflow

### Ramas
- `main` - Rama principal para producción
- `feature/{nombre}` - Ramas para nuevas funcionalidades
- `fix/{nombre}` - Ramas para correcciones de bugs

### Convenciones de Commit
- `feat: descripción` - Nueva funcionalidad
- `fix: descripción` - Corrección de bug
- `docs: descripción` - Cambios en documentación
- `refactor: descripción` - Refactorización
- `style: descripción` - Cambios de formato
- `test: descripción` - Pruebas
- `chore: descripción` - Mantenimiento
