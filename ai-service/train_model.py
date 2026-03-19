import psycopg2
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

def train_model():

    conn = psycopg2.connect(
        host="localhost",
        database="gastos_db",
        user="postgres",
        password="admin123",
        port="5432"
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
