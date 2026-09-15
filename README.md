# APP PRUEBA

Portal de Equipo

## Descripción

APP PRUEBA es una aplicación full-stack para gestionar notas de trabajo por equipo con autenticación, roles y administración de usuarios. La aplicación cuenta con:

- Frontend en React + Vite
- Backend en Node.js + Express
- Base de datos PostgreSQL en Docker
- JWT para autenticación
- Roles ADMIN y USER
- Dashboard de métricas de notas
- Arquitectura AWS SAM para despliegue de Lambda

## Requisitos

- Node.js
- Docker
- Docker Compose
- AWS CLI
- SAM CLI

## Instalación local

1. Clona el repositorio.
2. En la raíz del proyecto ejecuta:

```bash
docker compose up --build
```

Esto levantará:

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Health check: http://localhost:3000/api/health
- PostgreSQL: localhost:5432

Las cuentas demo y las notas iniciales se crean solo si no existen. Los cambios realizados desde la aplicación se conservan al reiniciar los contenedores mientras se mantenga el volumen `postgres_data`.

Para apuntar el frontend a una API distinta, copia `frontend/.env.example` como `frontend/.env` y configura `VITE_API_URL` antes de construirlo.

Tras desplegar SAM, configura también `VITE_METRICS_LAMBDA_URL` con el valor de `MetricsApiUrl`. En local esta variable se deja sin definir: el endpoint `GET /api/metricas` ejecuta el mismo handler de Lambda dentro del backend.

## URLs

### Frontend

```text
http://localhost:5173
```

### API

```text
http://localhost:3000
```

### Health

```text
http://localhost:3000/api/health
```

## Usuarios demo

### Administrador

```text
Correo: admin@apprueba.com
Contraseña: Admin123*
```

### Usuario normal

```text
Correo: usuario@apprueba.com
Contraseña: Usuario123*
```

## Funcionalidades principales

- Login con JWT
- Protección de rutas privadas
- Dashboard con métricas
- Gestión de notas por tablero
- Administración de usuarios desde el rol ADMIN
- Regla del administrador activo

## Crear un usuario desde el sistema

1. Inicia sesión como administrador.
2. Entra al dashboard.
3. Haz clic en "Gestionar usuarios".
4. Completa el formulario con nombre, correo, contraseña y rol.
5. Guarda el usuario.
6. Inicia sesión con ese usuario para probar su acceso.

## AWS SAM / Lambda

La carpeta `lambda/metrics` contiene la función que calcula las métricas del tablero. El endpoint `GET /api/metricas` obtiene los estados de PostgreSQL y ejecuta ese mismo handler, por lo que el dashboard no duplica la lógica de cálculo.

### Ejecutar la Lambda localmente

```bash
node lambda/metrics/index.js '{"notas":[{"estado":"PENDIENTE"},{"estado":"EN_CURSO"},{"estado":"HECHO"}]}'
```

La respuesta esperada será:

```json
{
  "success": true,
  "metricas": {
    "total": 3,
    "pendientes": 1,
    "enCurso": 1,
    "hechas": 1
  }
}
```

### Despliegue con SAM

```bash
sam build
sam deploy
```

### Eliminar stack

```bash
sam delete
```

## Scripts de despliegue

```powershell
./scripts/deploy.ps1
./scripts/destroy.ps1
```

## Arquitectura de referencia

```text
                    AWS
                     │
        ┌────────────┴────────────┐
        │                         │
   CloudFront                   EC2
        │                         │
       S3                     Docker API
                                  │
                              PostgreSQL
                                 
                     Lambda
                       │
                  Métricas
```

## Notas

- La aplicación local funciona sin necesidad de una cuenta AWS.
- La Lambda calcula las métricas que entrega el dashboard en local y puede desplegarse con SAM.
- El tablero actual no se toca; se mantiene la base funcional ya desarrollada.
