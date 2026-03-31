import psycopg2
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

import os
from dotenv import load_dotenv

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

    texts = df["description"].str.lower()

    labels = df["category"]

    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(texts)

    model = MultinomialNB()
    model.fit(X, labels)

    return model, vectorizer
