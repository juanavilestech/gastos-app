from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import model as ai_model
from train_model import train_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Expense(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    amount: float
    category: str
    description: Optional[str] = None
    date: str
    type: Optional[str] = 'gasto'

class AnalysisRequest(BaseModel):
    expenses: List[Expense]

class AskRequest(BaseModel):
    question: str
    expenses: List[Expense]

@app.get("/")
def read_root():
    return {"status": "online", "message": "AI Analysis Service is live"}

@app.post("/analyze")
async def analyze_expenses(request: AnalysisRequest):
    # If no expenses, return simple message
    if not request.expenses:
        return {"summary": "No hay gastos registrados", "advice": "¡Empieza registrando un gasto!"}

    # Convert to DataFrame for advanced analysis
    data = [e.dict() for e in request.expenses]
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df['type'] = df['type'].fillna('gasto')
    
    # Separate expenses and incomes
    df_expenses = df[df['type'] != 'ingreso']
    df_incomes = df[df['type'] == 'ingreso']
    
    total_expenses = float(df_expenses["amount"].sum())
    total_incomes = float(df_incomes["amount"].sum())
    
    # If no actual expenses, return simple message
    if df_expenses.empty:
      return {
          "total_amount": total_expenses,
          "summary": f"No hay gastos registrados. Ingresos: ${total_incomes:.2f}.",
          "advice": "¡Empieza registrando un gasto para recibir consejos!"
      }

    avg_expense = float(df_expenses["amount"].mean())
    category_breakdown = df_expenses.groupby("category")["amount"].sum().to_dict()
    top_category = df_expenses.groupby("category")["amount"].sum().idxmax()
    
    # Simple anomaly detection: any expense > 2x average
    anomalies = df_expenses[df_expenses["amount"] > avg_expense * 2].to_dict(orient="records")
    
    # Projection to end of month (assuming 30 days)
    days_recorded = (df['date'].max() - df['date'].min()).days + 1
    daily_avg = total_expenses / days_recorded if days_recorded > 0 else total_expenses
    projected_total = daily_avg * 30
    
    # Generate actionable advice
    advice = []
    if total_expenses > 1000:
        advice.append(f"Tus gastos totales (${total_expenses:.2f}) están subiendo. Prioriza reducir en '{top_category}'.")
    
    if anomalies:
        advice.append(f"He detectado {len(anomalies)} gastos inusualmente altos que podrías revisar.")
        
    if projected_total > 1500:
        advice.append(f"A este ritmo, podrías terminar el mes gastando aproximadamente ${projected_total:.2f}. ¡Cuidado!")
    else:
        advice.append("Tus finanzas se ven saludables y bajo control.")
        
    # Income advice
    if total_incomes > 0:
      advice.append(f"Has generado ${total_incomes:.2f} en ingresos. ¡Excelente trabajo!")

    return {
        "total_amount": total_expenses,
        "total_incomes": total_incomes,
        "average_expense": avg_expense,
        "top_category": top_category,
        "category_breakdown": category_breakdown,
        "projected_end_of_month": float(projected_total),
        "anomalies": anomalies,
        "summary": f"Resumen: ${total_expenses:.2f} gastados hasta hoy.",
        "advice": " ".join(advice)
    }

@app.post("/ask")
async def ask_question(request: AskRequest):
    if not request.expenses:
        return {"answer": "No hay gastos registrados. ¡Empieza registrando tus gastos para poder ayudarte!"}

    df = pd.DataFrame([e.dict() for e in request.expenses])
    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = df['amount'].astype(float)
    df['type'] = df['type'].fillna('gasto')

    question_lower = request.question.lower()
    answer = ""

    total_gastos = df[df['type'] != 'ingreso']['amount'].sum()
    total_ingresos = df[df['type'] == 'ingreso']['amount'].sum()
    balance = total_ingresos - total_gastos

    category_totals = df[df['type'] != 'ingreso'].groupby('category')['amount'].sum().sort_values(ascending=False)

    if any(word in question_lower for word in ['gasté', 'gaste', 'gastos totales', 'total']):
        answer = f"Has gastado un total de ${total_gastos:,.2f} ARS."
        if not category_totals.empty:
            answer += f" Tu categoría con más gastos es '{category_totals.index[0]}' con ${category_totals.iloc[0]:,.2f}."

    elif any(word in question_lower for word in ['ingres', 'sueldo', 'gané', 'gane']):
        answer = f"Tus ingresos totales son ${total_ingresos:,.2f} ARS."
        if balance >= 0:
            answer += f" Tu balance es positivo: ${balance:,.2f} ARS."
        else:
            answer += f" Tu balance es negativo: ${abs(balance):,.2f} ARS."

    elif any(word in question_lower for word in ['categoría', 'categoria', 'más gast', 'mayor']):
        if not category_totals.empty:
            top3 = category_totals.head(3)
            answer = "Tus categorías con más gastos son:\n"
            for cat, amount in top3.items():
                answer += f"• {cat}: ${amount:,.2f} ARS\n"
        else:
            answer = "No hay gastos registrados por categoría."

    elif any(word in question_lower for word in ['reducir', 'ahorrar', 'consejo', 'tips', 'sugeren']):
        if not category_totals.empty:
            top = category_totals.index[0]
            avg = category_totals.mean()
            if category_totals.iloc[0] > avg * 1.5:
                answer = f"Te recomiendo reducir gastos en '{top}'. Es tu categoría más alta y supera el promedio por un margen considerable."
            else:
                answer = "Tus gastos están bastante equilibrados. Sigue así y considera crear un fondo de emergencia."
        else:
            answer = "Registra más gastos para darte consejos personalizados."

    elif any(word in question_lower for word in ['balance', 'sobra', 'queda', 'restante']):
        answer = f"Tu balance actual es ${balance:,.2f} ARS."
        if balance < 0:
            answer += " Cuidado, estás gastando más de lo que ganas."
        else:
            answer += " ¡Bien! Estás ahorrando."

    elif any(word in question_lower for word in ['semana', 'semanal']):
        df['week'] = df['date'].dt.isocalendar().week
        week_avg = df[df['type'] != 'ingreso'].groupby('week')['amount'].sum().mean()
        answer = f"Tu promedio de gastos semanales es aproximadamente ${week_avg:,.2f} ARS."

    elif any(word in question_lower for word in ['mes', 'mensual']):
        days_in_month = 30
        days_recorded = (df['date'].max() - df['date'].min()).days + 1 if len(df) > 1 else 1
        daily_avg = total_gastos / days_recorded
        projected = daily_avg * days_in_month
        answer = f"A este ritmo, proyectarías aproximadamente ${projected:,.2f} ARS en gastos al mes."

    else:
        answer = f"Tengo {len(df)} gastos registrados. Puedo ayudarte con preguntas sobre: gastos totales, categorías, balance, consejos para ahorrar, proyección mensual y más. ¿Qué te gustaría saber?"

    return {"question": request.question, "answer": answer}

class PredictionRequest(BaseModel):
    description: str

@app.post("/predict-category")
def predict(data: PredictionRequest):
    try:
        category = ai_model.predict_category(data.description)
        
        # Determine if it's an income or expense by querying the database or using a simple check
        import psycopg2
        import os
        from dotenv import load_dotenv
        load_dotenv()
        
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "gastos_db"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "admin123"),
            port=os.getenv("DB_PORT", "5432")
        )
        cur = conn.cursor()
        cur.execute("SELECT type FROM categories WHERE name = %s", (category,))
        row = cur.fetchone()
        cat_type = row[0] if row else "gasto"
        conn.close()
        
        return {
            "description": data.description,
            "predicted_category": category,
            "predicted_type": cat_type
        }
    except Exception as e:
        return {"error": str(e), "description": data.description, "predicted_category": "Otros", "predicted_type": "gasto"}

@app.post("/retrain")
def retrain():
    try:
        ai_model.model, ai_model.vectorizer = train_model()
        return {"message": "model retrained"}
    except Exception as e:
        return {"error": str(e), "message": "retraining failed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
