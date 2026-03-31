# Stack Tecnológico y Arquitectura del Microservicio de IA

Este documento describe las tecnologías utilizadas en el microservicio de Inteligencia Artificial (IA) y cómo se integran en el ecosistema de la App de Gastos.

## 🛠️ Tecnologías Core

| Tecnología          | Rol               | Uso en este sistema                                                                                   |
| :------------------ | :---------------- | :---------------------------------------------------------------------------------------------------- |
| **Python**          | Lenguaje Base     | Motor principal para procesamiento de datos y modelos de ML.                                          |
| **FastAPI**         | Framework Web     | Expone los endpoints (`/analyze`, `/predict-category`, `/ask`) de manera asíncrona y rápida.          |
| **Pandas**          | Análisis de Datos | Limpieza, estructuración y cálculos estadísticos sobre los gastos (totales, promedios, anomalías).    |
| **Scikit-Learn**    | Machine Learning  | Implementa el modelo `MultinomialNB` para la clasificación automática de descripciones en categorías. |
| **Psycopg2-binary** | Driver DB         | Conexión directa a PostgreSQL para el reentrenamiento del modelo con datos reales.                    |
| **Uvicorn**         | Servidor ASGI     | Servidor de alto rendimiento para correr la aplicación FastAPI.                                       |

---

## 🚀 Capacidades del Sistema de IA

### 1. Clasificación Inteligente (`/predict-category`)

**Uso:** Cuando registras un nuevo gasto, el sistema predice automáticamente la categoría basándose en la descripción (ej: "Pizza" → "Comida").

- **Técnica:** Vectorización de texto (CountVectorizer) y Clasificadores Naive Bayes.

### 2. Análisis Estadístico y Detección de Anomalías (`/analyze`)

**Uso:** Genera resúmenes avanzados y detecta comportamientos inusuales.

- **Detección:** Identifica si un gasto es significativamente mayor al promedio actual (2x).
- **Proyecciones:** Calcula cuánto gastarás al final del mes basándose en tu ritmo actual.

### 3. Asistente Conversacional (`/ask`)

**Uso:** Responde preguntas en lenguaje natural sobre tus finanzas.

- **Consultas soportadas:**
  - "¿Cuánto gasté este mes?"
  - "¿Cómo puedo ahorrar?"
  - "Dime mi balance actual"

### 4. Ciclo de Aprendizaje (`/retrain`)

**Uso:** El sistema puede reentrenarse con tus propios datos históricos guardados en la base de datos `gastos_db`, haciendo que la precisión mejore con el uso.

---

## 🔗 Integración en el Ecosistema

- **Backend (Node.js):** Actúa como puente, consultando a la IA para enriquecer los datos antes de guardarlos o para mostrar insights en el Dashboard.
- **Frontend (React):** Muestra los resúmenes de la IA, sugerencias de ahorro y el chat interactivo para consultas rápidas.
