# APP PRUEBA

## Portal de Equipo con Tablero de Notas

Aplicación web full-stack desarrollada como solución para una prueba técnica. Permite autenticar usuarios, administrar roles, gestionar usuarios y trabajar sobre un tablero compartido de notas.

La aplicación puede ejecutarse completamente en local mediante Docker Compose. También incluye una propuesta de infraestructura AWS definida con SAM y CloudFormation.

## Contenido

- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Ejecución local](#ejecución-local)
- [Usuarios demo](#usuarios-demo)
- [Persistencia](#persistencia)
- [Variables de entorno](#variables-de-entorno)
- [API](#api)
- [Lambda de métricas](#lambda-de-métricas)
- [Arquitectura](#arquitectura)
- [Infraestructura AWS](#infraestructura-aws)
- [Imagen Docker del backend](#imagen-docker-del-backend)
- [Despliegue preparado](#despliegue-preparado)
- [Eliminación de infraestructura](#eliminación-de-infraestructura)
- [Estado del despliegue AWS](#estado-del-despliegue-aws)
- [Validaciones](#validaciones)
- [Limitaciones](#limitaciones)
- [Tiempo de desarrollo](#tiempo-de-desarrollo)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Estado de entrega](#estado-de-entrega)

## Funcionalidades

### Autenticación

- Inicio de sesión.
- Cierre de sesión.
- Autenticación mediante JWT.
- Validación de usuario activo.
- Protección de rutas privadas.
- Control de acceso por rol.

Los usuarios inactivos no pueden iniciar sesión ni continuar utilizando el área autenticada.

### Gestión de usuarios

Disponible para usuarios con rol `ADMIN`:

- Consultar usuarios.
- Crear usuarios.
- Editar usuarios.
- Asignar roles `ADMIN` o `USER`.
- Activar y desactivar usuarios.
- Consultar el estado de cada usuario.

La aplicación evita desactivar al último administrador activo.

#### Usuarios creados desde la aplicación

Un administrador puede crear nuevos usuarios desde la opción **Gestionar usuarios**. Para crear un usuario se registran nombre, correo electrónico, contraseña, rol y estado.

Una vez creado y activo, el usuario puede cerrar la sesión actual e iniciar sesión con sus credenciales. Si posteriormente el administrador lo desactiva, no podrá iniciar sesión ni continuar utilizando el área autenticada.

### Tablero compartido

Todos los usuarios activos pueden trabajar sobre el mismo tablero. Cada nota contiene:

- Título.
- Contenido.
- Estado.
- Posición dentro del tablero.

Estados disponibles:

- `PENDIENTE`
- `EN_CURSO`
- `HECHO`

Las notas se pueden crear, editar, cambiar de estado, mover mediante drag and drop y eliminar. La posición se guarda automáticamente después de mover una nota.

Los cambios permanecen almacenados en PostgreSQL mientras no se elimine el volumen de la base de datos.

### Dashboard

El dashboard muestra:

- Total de notas.
- Notas pendientes.
- Notas en curso.
- Notas hechas.

Las métricas se calculan a partir de las notas almacenadas en el sistema mediante la lógica compartida con la función Lambda.

## Tecnologías

### Frontend

- React
- Vite
- JavaScript
- Axios
- CSS

### Backend

- Node.js
- Express
- JWT
- bcryptjs
- PostgreSQL
- pg

### Infraestructura y despliegue

- Docker
- Docker Compose
- AWS Lambda
- Amazon API Gateway
- Amazon EC2
- Amazon ECR
- Amazon S3
- Amazon CloudFront
- AWS SAM
- AWS CloudFormation

## Requisitos

Para ejecutar la aplicación localmente se requiere:

- Docker Desktop.
- Docker Compose.

Node.js solo es necesario para ejecutar comandos locales fuera de Docker, por ejemplo para realizar pruebas directas de la lógica de Lambda.

AWS CLI y AWS SAM CLI solo son necesarios para realizar un despliegue real en AWS.

## Ejecución local

Desde la carpeta raíz del proyecto:

```powershell
docker compose up --build
```

Servicios disponibles:

| Servicio | Dirección |
| --- | --- |
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend | [http://localhost:3000](http://localhost:3000) |
| Health check | [http://localhost:3000/api/health](http://localhost:3000/api/health) |
| PostgreSQL | `localhost:5432` |

Para detener los servicios:

```powershell
docker compose down
```

Para reiniciarlos conservando los datos:

```powershell
docker compose down
docker compose up --build
```

> No utilizar `docker compose down -v` si se desea conservar la información almacenada en PostgreSQL.

## Usuarios demo

### Administrador

```text
Correo: admin@apprueba.com
Contraseña: Admin123*
Rol: ADMIN
```

El administrador puede acceder al dashboard, al tablero y a la gestión de usuarios.

### Usuario

```text
Correo: usuario@apprueba.com
Contraseña: Usuario123*
Rol: USER
```

El usuario puede acceder al dashboard y al tablero, pero no a la gestión de usuarios.

## Persistencia

PostgreSQL se ejecuta mediante Docker Compose y utiliza el volumen:

```text
postgres_data
```

El volumen conserva:

- Usuarios.
- Notas.
- Estados.
- Posiciones de las notas.

Al detener o recrear los contenedores, la información permanece almacenada mientras el volumen no sea eliminado.

La estructura de la base de datos se define en [database/init.sql](database/init.sql). Los usuarios demo se crean mediante [backend/src/seed.js](backend/src/seed.js) sin duplicar usuarios existentes.

Para conservar la información no se debe utilizar:

```powershell
docker compose down -v
```

La opción `-v` elimina el volumen de PostgreSQL y los datos almacenados en él.

## Variables de entorno

El backend utiliza las siguientes variables en el entorno local:

```text
PORT=3000

DB_HOST=db
DB_PORT=5432
DB_NAME=app_prueba
DB_USER=app_prueba
DB_PASSWORD=app_prueba123

JWT_SECRET=app_prueba_secret_123
```

En un entorno real se deben utilizar valores seguros y un sistema de gestión de secretos.

## API

### Autenticación

```text
POST /api/auth/login
```

Permite iniciar sesión y obtener el token JWT.

### Notas

```text
GET    /api/notas
POST   /api/notas
PUT    /api/notas/:id
DELETE /api/notas/:id
```

La ruta `PUT` permite actualizar los datos de una nota, incluyendo su posición después de realizar un movimiento en el tablero.

### Usuarios

```text
GET    /api/usuarios
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

Estas rutas requieren autenticación. Las operaciones administrativas requieren rol `ADMIN`.

### Métricas locales

```text
GET /api/metricas
```

Esta ruta permite obtener las métricas del tablero en el entorno local.

## Lambda de métricas

La función Lambda se encuentra en [lambda/metrics/index.js](lambda/metrics/index.js) y calcula:

```text
total
pendientes
enCurso
hechas
```

La Lambda admite eventos directos y eventos provenientes de API Gateway, incluyendo cuerpos codificados en Base64. En el entorno local, el backend reutiliza el mismo handler para calcular las métricas.

La función está preparada para exponerse mediante API Gateway durante un despliegue AWS.

### Prueba local

También se puede comprobar la ruta local:

```text
GET http://localhost:3000/api/metricas
```

O ejecutar directamente la función desde la raíz del proyecto:

```powershell
node lambda/metrics/index.js '{"notas":[{"estado":"PENDIENTE"},{"estado":"EN_CURSO"},{"estado":"HECHO"}]}'
```

Resultado esperado:

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

## Arquitectura

### Arquitectura local

```text
┌─────────────────────────────┐
│      Frontend React         │
│           + Vite            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     Backend Node.js         │
│        + Express            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
└─────────────────────────────┘
```

Docker Compose levanta el frontend, el backend y PostgreSQL. El backend obtiene las métricas utilizando la misma lógica definida para la función Lambda.

### Arquitectura AWS propuesta

```text
                 ┌──────────────────┐
                 │    CloudFront    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │       S3         │
                 │ Frontend estático│
                 └──────────────────┘

                 ┌──────────────────┐
                 │   API Gateway    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │      Lambda      │
                 │    Métricas      │
                 └──────────────────┘

                 ┌──────────────────┐
                 │       EC2        │
                 │      Docker      │
                 │   API Express    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │    PostgreSQL    │
                 │     externo      │
                 └──────────────────┘
```

## Infraestructura AWS

La infraestructura está definida en [infra/template.yaml](infra/template.yaml) mediante AWS SAM y CloudFormation.

| Componente | Responsabilidad |
| --- | --- |
| EC2 | Ejecuta la API Express dentro de Docker |
| Amazon ECR | Registro donde se publica la imagen Docker del backend |
| Lambda | Calcula las métricas del tablero |
| API Gateway | Expone la Lambda mediante `POST /metrics` |
| S3 | Almacena el frontend compilado |
| CloudFront | Distribuye el frontend públicamente |
| PostgreSQL | Base de datos accesible desde EC2 |

La infraestructura no crea PostgreSQL. Para un despliegue real, el parámetro `DbHost` debe apuntar a una instancia PostgreSQL accesible desde EC2.

Amazon ECR debe estar preparado antes del despliegue de la infraestructura, ya que `ApiImageUri` recibe la ubicación de la imagen del backend.

## Imagen Docker del backend

El Dockerfile del backend necesita la raíz del repositorio como contexto porque copia tanto `backend/` como `lambda/`.

Para construir la imagen:

```powershell
docker build -f backend/Dockerfile -t app-prueba-backend .
```

Para AWS, la imagen debe publicarse en Amazon ECR. Ejemplo de `ApiImageUri`:

```text
123456789012.dkr.ecr.us-east-1.amazonaws.com/app-prueba-backend:latest
```

La instancia EC2 utiliza este valor para obtener y ejecutar la imagen:

```bash
docker pull ${ApiImageUri}
docker run -d -p 3000:3000 ...
```

## Despliegue preparado

El archivo [infra/deploy.ps1](infra/deploy.ps1) prepara el siguiente flujo:

1. Verifica AWS CLI.
2. Verifica SAM CLI.
3. Verifica las credenciales AWS.
4. Ejecuta `sam validate`.
5. Ejecuta `sam build`.
6. Ejecuta `sam deploy`.
7. Muestra los outputs del stack.

El script no se ejecuta automáticamente y acepta estos parámetros:

- `-KeyName`
- `-VpcId`
- `-SubnetId`
- `-ApiImageUri`
- `-DbHost`
- `-DbName`
- `-DbUser`
- `-DbPassword`
- `-JwtSecret`

Ejemplo:

```powershell
.\infra\deploy.ps1 `
  -KeyName "mi-key-pair" `
  -VpcId "vpc-xxxxxxxx" `
  -SubnetId "subnet-xxxxxxxx" `
  -ApiImageUri "123456789012.dkr.ecr.us-east-1.amazonaws.com/app-prueba-backend:latest" `
  -DbHost "mi-postgres.example.com" `
  -DbPassword "contraseña-segura" `
  -JwtSecret "secreto-jwt-seguro"
```

También se pueden omitir `-DbPassword` y `-JwtSecret` para que el script los solicite de forma segura.

La configuración de SAM está en [samconfig.toml](samconfig.toml), ubicado en la raíz del proyecto.

## Eliminación de infraestructura

El archivo [infra/destroy.ps1](infra/destroy.ps1) solicita escribir:

```text
ELIMINAR
```

como confirmación antes de iniciar la eliminación.

Antes de borrar el stack, obtiene el nombre del bucket S3 y elimina su contenido. Esto evita que CloudFormation falle al intentar eliminar un bucket no vacío.

La eliminación es destructiva y no se ejecuta automáticamente.

## Estado del despliegue AWS

No se realizó un despliegue real en AWS durante la prueba técnica. Por lo tanto:

- No se crearon recursos AWS.
- No se generó una URL pública.
- No se publicó el frontend en S3.
- No se creó una instancia EC2 real.
- No se creó una distribución CloudFront real.
- No se generaron costos de infraestructura asociados al despliegue.

La infraestructura y los scripts quedan preparados para un despliegue posterior.

## Validaciones

### Aplicación

- Login de administrador.
- Login de usuario.
- Logout.
- Bloqueo de usuarios inactivos.
- Protección de rutas por rol.
- Gestión de usuarios.
- Protección del último administrador activo.
- Creación, edición y eliminación de notas.
- Cambio de estado.
- Movimiento y persistencia de posiciones.
- Persistencia mediante PostgreSQL.
- Reinicio de Docker conservando información.
- Actualización de métricas del dashboard.
- Acceso restringido a gestión de usuarios según el rol.

### Herramientas

- `npm run lint` del frontend.
- `npm run build` del frontend.
- Ejecución local de la lógica de métricas.
- `docker compose build`.
- `docker compose up`.
- Validación de sintaxis de los scripts PowerShell de infraestructura.

## Limitaciones

Las siguientes funcionalidades quedan fuera del alcance de la prueba técnica:

- Múltiples tableros.
- Columnas Kanban.
- Asignación de notas a usuarios.
- Fechas de vencimiento.
- Comentarios.
- Archivos adjuntos.
- Notificaciones.
- Historial de cambios.
- Colaboración en tiempo real.
- Aplicación móvil nativa.
- Despliegue real en AWS.

## Tiempo de desarrollo

```text
Tiempo efectivo utilizado: [COMPLETAR CON EL TIEMPO REAL]
```

No se incluye un tiempo inventado. Este campo debe completarse con el tiempo real antes de entregar la prueba.

## Estructura del proyecto

```text
Prueba Tecnica/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── infra/
│   ├── template.yaml
│   ├── deploy.ps1
│   └── destroy.ps1
├── lambda/
│   └── metrics/index.js
├── docker-compose.yml
├── samconfig.toml
└── README.md
```

## Estado de entrega

| Componente | Estado |
| --- | --- |
| Frontend React | Listo |
| Backend Express | Listo |
| PostgreSQL | Listo |
| Docker Compose | Listo |
| Autenticación JWT | Listo |
| Roles ADMIN / USER | Listo |
| Gestión de usuarios | Listo |
| Tablero compartido | Listo |
| Drag and drop | Listo |
| Persistencia | Listo |
| Dashboard | Listo |
| Lambda de métricas | Listo |
| Infraestructura AWS | Preparada |
| Despliegue AWS real | No realizado |
| Video de demostración | Pendiente |

## Antes de entregar

1. Sustituye `[COMPLETAR CON EL TIEMPO REAL]` por el tiempo efectivo que utilizaste.
2. Realiza el video de demostración.
3. Cambia `Video de demostración` a `Listo` cuando hayas terminado el video.
4. No ejecutes `deploy.ps1` salvo que quieras realizar un despliegue real en AWS.
