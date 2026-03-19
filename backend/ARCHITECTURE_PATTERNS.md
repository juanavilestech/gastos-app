# Arquitectura y Patrones de Diseño de la API

Este documento describe la estructura y las decisiones de diseño tomadas en el desarrollo de la API de Gastos App.

## 🏛️ Estructura de la Arquitectura

La API sigue un patrón de **Arquitectura en Capas**, lo que facilita la separación de responsabilidades y el mantenimiento del código.

### 1. Capa de Servidor (`server.js` & `app.js`)

- **Responsabilidad**: Punto de entrada de la aplicación y configuración de Express.
- **Detalle**: Configuración de middlewares globales, base de datos y arranque del servidor.

### 2. Capa de Rutas (`src/routes/`)

- **Responsabilidad**: Definir los endpoints de la API y mapearlos a funciones del controlador.
- **Detalle**: No contiene lógica de negocio, solo define la interfaz de entrada.

### 3. Capa de Controladores (`src/controllers/`)

- **Responsabilidad**: Manejar las peticiones HTTP (req, res).
- **Detalle**: Extrae parámetros de la petición, llama a los servicios necesarios y retorna la respuesta JSON al cliente.

### 4. Capa de Servicios (`src/services/`)

- **Responsabilidad**: Contiene la **lógica de negocio**.
- **Detalle**: Coordina las operaciones entre modelos, realiza validaciones complejas y orquestra el flujo de los datos.

### 5. Capa de Modelos (`src/models/`)

- **Responsabilidad**: Abstracción de la base de datos (Data Access Layer).
- **Detalle**: Ejecuta las consultas SQL directas. Protege al resto de la aplicación de saber cómo se almacenan exactamente los datos.

### 6. Capa de Esquemas (`src/schemas/`)

- **Responsabilidad**: Validación estructural de datos.
- **Detalle**: Utiliza **Zod** para asegurar que los datos que entran a la aplicación cumplen con el contrato esperado.

---

## 🎨 Patrones de Diseño Implementados

### 1. Controller-Service-Model (CSM)

Es el patrón principal de organización.

- **Beneficio**: Permite reutilizar lógica de negocio en diferentes controladores o procesos (como scripts CRON) sin duplicar código.

### 2. Singleton (Database Pool)

El archivo `src/config/db.js` exporta una única instancia de `Pool`.

- **Beneficio**: Gestión eficiente de conexiones a PostgreSQL, evitando la creación excesiva de sockets.

### 3. Middleware Pattern

Utilizado para el manejo de errores y parsing de datos.

- **Detalle**: `errorHandler` y `asyncHandler` actúan como interceptores en el ciclo de vida de la petición.

### 4. Global Error Handling

Implementado mediante un middleware centralizado y manejadores de procesos (`uncaughtException`, `unhandledRejection`).

- **Beneficio**: El servidor es resiliente; un error en una petición no tumba todo el proceso.

### 5. Repository-like Pattern (Modelos)

Aunque simplificado, los modelos actúan como repositorios que encapsulan la persistencia.

---

## 🛠️ Tecnologías Core

- **Node.js & Express**: Entorno de ejecución y framework web.
- **PostgreSQL (pg)**: Base de datos relacional.
- **Zod**: Validación de esquemas schema-first.
- **Dotenv**: Gestión de configuración mediante variables de entorno.
