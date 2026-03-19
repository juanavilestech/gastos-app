from train_model import train_model

model, vectorizer = train_model()

def predict_category(description: str):

    X_test = vectorizer.transform([description])

    prediction = model.predict(X_test)

    return prediction[0]
