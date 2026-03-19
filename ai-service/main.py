from fastapi import FastAPI
from pydantic import BaseModel
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
    categories = {}
    for e in request.expenses:
        categories[e.category] = categories.get(e.category, 0) + e.amount
    
    # Simple advice logic
    top_category = max(categories, key=categories.get)
    
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
