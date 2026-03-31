from train_model import train_model, clean_text

model, vectorizer = train_model()

def predict_category(description: str):
    cleaned = clean_text(description)
    X_test = vectorizer.transform([cleaned])

    prediction = model.predict(X_test)

    return prediction[0]

