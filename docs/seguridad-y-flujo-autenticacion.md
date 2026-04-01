# Seguridad y Flujo de Autenticación — Muralla App 2.0

Esta documentación detalla la arquitectura de seguridad, los protocolos de comunicación y el flujo de los tokens dentro de la aplicación.

## 🛡️ Arquitectura de Seguridad

La aplicación utiliza un modelo de **autenticación sin estado (Stateless)** basado en **JSON Web Tokens (JWT)** para el backend de Spring Boot y un cliente React que gestiona la sesión localmente.

### Tecnologías Principales
- **Spring Security**: Motor de autorización y protección de rutas.
- **JWT (io.jsonwebtoken)**: Generación y validación de tokens de acceso (HS256).
- **Google OAuth2**: Integración de inicio de sesión social.
- **BCrypt**: Hasing de contraseñas para cuentas de registro manual.

---

## 🔄 Flujo de Autenticación

### 1. Registro / Inicio de Sesión Manual
1. El usuario envía sus credenciales (Email/Password) vía POST a `/api/auth/login`.
2. El backend valida el hash BCrypt con la base de datos.
3. Si es válido, se genera un **JWT** firmado con una `SECRET_KEY` (almacenada en variables de entorno).
4. El token se devuelve en la respuesta JSON junto con los datos básicos del perfil.
5. El Frontend guarda el token en `localStorage` (`muralla_token`).

### 2. Flujo Google OAuth2
1. El usuario hace clic en "Continuar con Google".
2. Redirección al servidor de Google para autorización.
3. El backend procesa el éxito (`oauth2SuccessHandler`):
   - Busca al usuario por email.
   - Si no existe, crea un registro básico.
   - Genera un **JWT**.
4. **Entrega**: El backend redirige al frontend pasando el token en el fragmento de la URL (`#token=...`).
5. El componente `OAuth2CallbackPage` del frontend extrae el token y lo persiste en `localStorage`.

### 3. Peticiones Protegidas
- Cada petición a una ruta `/api/**` (excepto las públicas) debe incluir el encabezado:
  `Authorization: Bearer <JWT_TOKEN_AQUÍ>`
- El `JwtAuthenticationFilter` intercepta cada petición, extrae el token, valida su firma y expiración (24h) y establece el contexto de seguridad de Spring.

---

## 🔒 Medidas de Protección Implementadas

### Aislamiento de Secretos
La clave de firma de los tokens y las credenciales de Google **no están en el código fuente**. Se inyectan dinámicamente:
- **Backend**: `@Value("${app.jwt.secret}")` en `JwtService.java`.
- **Configuración**: `application.properties` mapea valores desde variables de entorno de Docker.

### Política de CORS (Seguridad del Navegador)
El backend restringe el acceso de origen cruzado (`CORS`) únicamente a la URL configurada en `app.frontend.url`. Esto impide que otros sitios intenten realizar peticiones en nombre del usuario.

### Manejo de Sesión Expirada
Para evitar errores de redirección (`302`) que causan bloqueos de CORS, el API devuelve un **401 Unauthorized** puro si el token ha expirado. El frontend captura este 401 y redirige al usuario automáticamente a la página de login.

---

## 📝 Notas de Producción

| Aspecto | Implementación Actual | Recomendación para Escalar |
| :--- | :--- | :--- |
| **Protocolo** | HTTP (Localhost) | **HTTPS Obligatorio** para cifrar tráfico. |
| **Almacenamiento** | `localStorage` | **HttpOnly Cookies** para evitar robos vía XSS. |
| **Secretos** | Variables de entorno | **Secret Managers** (AWS/Azure/GCP). |
| **CSRF** | Deshabilitado (JWT) | Mantener deshabilitado si no se usan cookies. |

---

> [!TIP]
> **Mantenimiento**: Si cambias la `JWT_SECRET` en el servidor, todas las sesiones activas se invalidarán automáticamente y los usuarios deberán iniciar sesión de nuevo.
