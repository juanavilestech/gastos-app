from fastapi import FastAPI
from pydantic import BaseModel
<<<<<<< HEAD
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for the frontend/backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Expense(BaseModel):
    amount: float
    category: str
    description: str
    date: str

class AnalysisRequest(BaseModel):
    expenses: List[Expense]

@app.get("/")
def read_root():
    return {"status": "online", "message": "AI Analysis Service is live"}

@app.post("/analyze")
async def analyze_expenses(request: AnalysisRequest):
    # Mock analysis logic
    if not request.expenses:
        return {"summary": "No hay gastos registrados", "advice": "¡Empieza registrando un gasto!"}

    total = sum(e.amount for e in request.expenses)
    categories: dict[str, float] = {}
    for e in request.expenses:
        categories[e.category] = categories.get(e.category, 0.0) + e.amount
    
    # Simple advice logic
    top_category = max(categories, key=lambda k: categories[k]) if categories else "N/A"
    
    if total > 1000:
        advice = f"Tus gastos totales (${total:.2f}) son elevados. Tu mayor gasto es en '{top_category}'. ¿Podrías reducirlo?"
    elif total > 0:
        advice = "Tus finanzas se ven saludables. Mantén el registro para obtener mejores proyecciones."
    else:
        advice = "Aún no tienes gastos para analizar."
        
    return {
        "total_amount": total,
        "top_category": top_category,
        "summary": f"Resumen: ${total:.2f} gastados en total.",
        "advice": advice
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
=======
import pandas as pd
import model as ai_model
from train_model import train_model

app = FastAPI()

class Expense(BaseModel):
    amount: float
    category: str
    description: str | None = None
    date: str

@app.get("/")
def root():
    return {"message": "AI service running"}

@app.post("/analyze")
def analyze(expenses: list[Expense]):

    data = [e.dict() for e in expenses]

    df = pd.DataFrame(data)

    total_spent = df["amount"].sum()

    avg_expense = df["amount"].mean()

    category_breakdown = df.groupby("category")["amount"].sum()

    top_category = category_breakdown.idxmax()

    biggest_expense = df.loc[df["amount"].idxmax()]

    return {
        "total_spent": float(total_spent),
        "average_expense": float(avg_expense),
        "top_category": top_category,
        "category_breakdown": category_breakdown.to_dict(),
        "biggest_expense": biggest_expense.to_dict()
    }

class PredictionRequest(BaseModel):
    description: str

@app.post("/predict-category")
def predict(data: PredictionRequest):

    category = ai_model.predict_category(data.description)

    return {
        "description": data.description,
        "predicted_category": category
    }

@app.post("/retrain")
def retrain():

    ai_model.model, ai_model.vectorizer = train_model()

    return {"message": "model retrained"}
>>>>>>> 9e02315212045fcec4d7b25fdf083c440be46067
