# GastosApp

Aplicación web para el registro y análisis de gastos personales con asistencia de IA.

## Características

- **Registro de transacciones**: Registra gastos e ingresos diarios
- **Dashboard financiero**: Visualiza tu balance, ingresos y gastos con gráficos
- **Asistente IA**: Pregunta sobre tus finanzas en lenguaje natural
- **Categorización automática**: La IA predice categorías basadas en descripciones
- **Entrenamiento personalizado**: Enseña a la IA a clasificar correctamente
- **Filtros y búsqueda**: Encuentra rápidamente transacciones específicas

## Stack tecnológico

- **Frontend**: React + Vite, Recharts, Framer Motion, Lucide Icons
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL
- **IA**: Python (FastAPI + scikit-learn) - Microservicio independiente
- **Autenticación**: JWT

## Estructura del proyecto

```
/frontend          - Aplicación React
/backend           - API REST Node.js
/database          - Schema y seeds PostgreSQL
/ai-service       - Microservicio Python para IA
```

## Requisitos previos

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

## Instalación

### Base de datos

1. Crear base de datos PostgreSQL
2. Ejecutar schema: `database/schema.sql`
3. (Opcional) Cargar datos seed: `database/seed.sql`

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configurar variables de entorno
npm run dev
```

### AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Configuración de entorno

### Backend (.env)
```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gastos
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
AI_SERVICE_URL=http://localhost:8000
```

## Uso

1. Inicia los servicios: backend, ai-service y frontend
2. Accede a la aplicación en `http://localhost:5173`
3. Inicia sesión o regístrate
4. Comienza a registrar tus transacciones


