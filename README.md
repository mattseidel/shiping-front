# Shiping Front — Frontend de Gestión de Envíos

Este repositorio contiene el frontend Angular (v20) para una aplicación de gestión de envíos. La interfaz utiliza Angular Material y consume una API REST (por defecto en http://localhost:4000).

Resumen rápido
- Framework: Angular 20
- UI: Angular Material
- Autenticación: JWT (token guardado en localStorage como `auth_token`)
- API por defecto: `http://localhost:4000`

Requisitos
- Node.js (>=16 recomendado)
- npm
- Backend (API) accesible y con CORS habilitado para `http://localhost:4200` si se desarrolla localmente

Instalación y ejecución
1. Instalar dependencias:

```sh
npm install
```

2. Iniciar servidor de desarrollo:

```sh
npm start
# o `ng serve` — abre en http://localhost:4200
```

3. Build producción:

```sh
npm run build
```

4. Ejecutar tests (si se usan):

```sh
npm test
```

Estructura y componentes principales
- `src/app/features/auth` — Login, Register, Verify
- `src/app/features/dashboard` — Panel principal
- `src/app/features/clients` — Gestión de clientes
- `src/app/features/shipments` — Gestión de envíos
- `src/app/core/services` — Servicios de API (auth, clients, shipments)
- `src/app/shared/components/layout` — Layout principal con sidebar colapsable

Rutas importantes (frontend)
- `/auth/login` — Iniciar sesión
- `/auth/register` — Registro
- `/auth/verify?token=...` — Verificación de email
- `/dashboard` — Dashboard (protegido)
- `/clients` — Clientes
- `/shipments` — Envíos
- `/test-data` — Semilla de datos (UI)

Configuración de la API
Actualmente los servicios usan constantes con la URL base. Archivos relevantes:
- `src/app/core/services/auth.service.ts`  -> `private readonly apiUrl = 'http://localhost:4000'`
- `src/app/core/services/client.service.ts` -> `private readonly apiUrl = 'http://localhost:4000/clients'`
- `src/app/core/services/shipment.service.ts` -> `private readonly apiUrl = 'http://localhost:4000'`

Recomendación: crear `src/environments/environment.ts` y `src/environments/environment.prod.ts` con una propiedad `apiBase` y refactorizar los servicios para usar `environment.apiBase`.

Verificación de email
- El backend expone `GET /auth/verify?token=…` (el token de verificación se envía por email tras el registro).
- Se agregó `VerifyComponent` en `src/app/features/auth/verify/` que lee `?token=` y llama a `AuthService.verifyEmail(token)` mostrando resultado.

Cómo probar verificación localmente
- Abrir en el navegador: `http://localhost:4200/auth/verify?token=TU_TOKEN`

Notas sobre autenticación
- Al hacer login, el backend devuelve `{ accessToken, user }`. El token se almacena en `localStorage` y se añade a las peticiones mediante interceptor HTTP.
- Existe endpoint de refresh: `GET /auth/refresh`.

Sidebar y layout
- El layout principal usa un `mat-sidenav` colapsable. El estado de colapso usa Angular `signal` y los estilos aseguran que, al colapsar, solo queden visibles los iconos.

Debugging y problemas comunes
- Si hay errores CORS: revisar configuración del backend.
- Si las rutas no cargan: comprobar que el backend responde y que la URL base en los servicios es correcta.
- Si el sidebar no se colapsa visualmente: limpiar caché o reconstruir; revisar estilos globales que puedan sobrescribir.

Sugerencias de mejora (opciones que puedo implementar)
- Refactorizar servicios para usar `environment.apiBase` (creo los archivos `src/environments/*` y actualizo los servicios).
- Añadir ejemplos curl para los endpoints principales.
- Añadir instrucciones de despliegue y Dockerfile para la build.

Contribuir
- Crear una rama, realizar cambios y abrir un PR. Mantener consistencia con Angular style guide.

Licencia
- Entregable por encargo. Añadir licencia según acuerdo.

---
Si quieres, implemento ahora la refactorización a `environment.apiBase` y actualizo los servicios automáticamente.
