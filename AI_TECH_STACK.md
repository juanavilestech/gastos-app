# Stack Tecnológico y Arquitectura del Microservicio de IA

Este documento describe las tecnologías utilizadas en el microservicio de Inteligencia Artificial (IA) y cómo se integran en el ecosistema global de **IntelliGastos**.

## 🛠️ Tecnologías Core

| Tecnología       | Rol               | Uso en este sistema                                                                                    |
| :--------------- | :---------------- | :----------------------------------------------------------------------------------------------------- |
| **Python**       | Lenguaje Base     | Motor principal para procesamiento de datos y modelos de ML.                                           |
| **FastAPI**      | Framework Web     | Expone los endpoints (`/analyze`, `/predict-category`, `/retrain`, `/ask`) asíncronos y ultrarrápidos. |
| **Pandas**       | Análisis de Datos | Limpieza, estructuración y cálculos estadísticos sobre los gastos (totales, promedios, anomalías).     |
| **Scikit-Learn** | Machine Learning  | Implementa el modelo `MultinomialNB` emparejado con `TfidfVectorizer` para una clasificación precisa.  |
| **REGEX (re)**   | Sanitización      | Normalización de texto (remoción de acentos, caracteres especiales, y regularización de espacios).     |
| **Psycopg2**     | Conexión DB       | Conexión directa a PostgreSQL vía variables de entorno seguras para el reentrenamiento del modelo.     |

---

## 🚀 Capacidades y Funcionalidades de IA en IntelliGastos

### 1. "Magic Categorization" + Detección de Tipo (`/predict-category`)

**Uso:** Cuando ingresas un nuevo movimiento, el sistema predice instantáneamente a qué categoría pertenece basándose en tu descripción.

- **Pipeline de Procesamiento NLP:**
  1. **Limpieza de Texto:** Elimina números, símbolos y acentos ("Págó Fr33lancé!!" → "pago freelance").
  2. **Vectorización TF-IDF:** Extrae el peso semántico de las palabras, dándole mayor valor a términos representativos y filtrando ruido (reemplazando al antiguo `CountVectorizer`).
  3. **Clasificador Naive Bayes:** Calcula la probabilidad de la categoría basada en tu historial.
- **Auto-Switch (Ingreso vs Egreso):** La IA consulta la base de datos para saber si la categoría predicha es de tipo "Ingreso" o "Gasto", y automáticamente cambia la interfaz del usuario para ti.

### 2. Entrenamiento Continuo Interactivo (`/retrain`)

**Uso:** La IA nunca deja de aprender gracias al módulo **Entrenador IA** integrado en la aplicación.

- **Auditoría en Tiempo Real:** Interfaz tabular que compara tus últimos 15 movimientos registrados contra las predicciones actuales de la IA detectando "fallas potenciales" en color rojo.
- **Entrenamiento Manual Dinámico:** Formulario inteligente que te permite ingresar ejemplos difíciles, forzando a la IA a aprender nuevas reglas personalizadas (ej. enseñar que "Suscripción" pertenece a "Entretenimiento").
- **Reentrenamiento Síncrono:** Botón de "Sincronizar y Reentrenar" que extrae los datos más recientes desde PostgreSQL y actualiza el modelo analítico al instante.

### 3. Insights Financieros y Detección de Anomalías (`/analyze`)

**Uso:** Motor estadístico que escanea tu perfil financiero y genera consejos accionables.

- **Detección de Valores Atípicos:** Rastrea transacciones únicas que superen el 200% (2x) de tu promedio de gastos habituales.
- **Proyecciones a Corto Plazo:** Calcula tu ritmo de gasto diario (`burn rate`) proyectando matemáticamente cómo terminarás el mes.
- **Resúmenes Condicionales:** Identifica automáticamente tu "categoría vampiro" (la que consume más presupuesto) y genera textos de recomendación específicos.

### 4. Asistente Conversacional (Chatbot)

**Uso:** Interfaz interactiva de chat para que consultes tus finanzas utilizando lenguaje natural.

- **Acciones de Respuesta Rápida:** Integra "Preguntas Sugeridas" dinámicas ("¿Cuánto gasté en total?", "¿Cómo está mi balance?") que disparan respuestas matemáticas asíncronas de inmediato sin necesidad de escribir.
- **Procesamiento Contextual:** La IA entiende el contexto para calcular sumatorias totales, detectar deudas o sugerir el establecimiento de un fondo de emergencia dependiendo de si tu balance es positivo o negativo.

---

## 🔗 Integración en el Ecosistema

- **Backend (Node.js):** Actúa como middleware de paso seguro, inyectando los tokens JWT, leyendo las credenciales de entorno y comunicando al cliente con los algoritmos en Python.
- **Frontend (React + Animaciones):** Muestra el Dashboard de Insights, la consola completa del Entrenador IA y el modal de éxito (`framer-motion`) tras cada pipeline de reentrenamiento exitoso.
