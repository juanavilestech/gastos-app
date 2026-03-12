from fastapi import FastAPI
from pydantic import BaseModel
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
