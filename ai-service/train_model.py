import psycopg2
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import os
import re
from dotenv import load_dotenv

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Convert to lowercase
    text = text.lower()
    # Remove accents
    text = re.sub(r'[áàäâ]', 'a', text)
    text = re.sub(r'[éèëê]', 'e', text)
    text = re.sub(r'[íìïî]', 'i', text)
    text = re.sub(r'[óòöô]', 'o', text)
    text = re.sub(r'[úùüû]', 'u', text)
    # Remove special characters and numbers (keep only letters and spaces)
    text = re.sub(r'[^a-z\s]', '', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def train_model():
    load_dotenv()

    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "gastos_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "admin123"),
        port=os.getenv("DB_PORT", "5432")
    )

    query = """
        SELECT description, category
        FROM expenses
        WHERE description IS NOT NULL
        AND category IS NOT NULL
    """

    df = pd.read_sql(query, conn)
    conn.close()

    if df.empty:
        # Fallback if no data
        return MultinomialNB(), TfidfVectorizer()

    # Apply text cleaning
    texts = df["description"].apply(clean_text)
    labels = df["category"]

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(texts)

    model = MultinomialNB()
    model.fit(X, labels)

    return model, vectorizer
