from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# Load the trained model and label encoder
model = joblib.load("./model/model.pkl")
label_encoder = joblib.load("./model/encoder.pkl")

# Initialize FastAPI app
app = FastAPI()

# Request body structure
class StudentScores(BaseModel):
    quant: float
    verbal: float
    logic: float

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome"}

# Prediction endpoint
@app.post("/predict")
def predict_cluster(scores: StudentScores):
    # Create DataFrame for prediction
    input_data = pd.DataFrame([[scores.quant, scores.verbal, scores.logic]], columns=["quant", "verbal", "logic"])
    
    # Predict and decode the label
    prediction = model.predict(input_data)
    predicted_label = label_encoder.inverse_transform(prediction)[0]
    print(predicted_label)
    
    return {
        "prediction": predicted_label
    }

# Run with: uvicorn filename:app --reload
