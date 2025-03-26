import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
# from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Load dataset
data = pd.read_csv("data.csv")

# Features and target
X = data[["quant", "verbal", "logic"]]  # Features
y = data["cluster"]  # Target labels

# Encode target labels into numerical values
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)  # poor: 0, average: 1, bright: 2

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# Initialize and train the model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Predict on the test set
y_pred = model.predict(X_test)

# Decode numerical predictions back to original labels
y_pred_labels = label_encoder.inverse_transform(y_pred)

# Evaluate the model
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Classification Report:\n", classification_report(
    y_test, 
    y_pred, 
    labels=label_encoder.transform(label_encoder.classes_), 
    target_names=label_encoder.classes_
))

# Save the model and label encoder
joblib.dump(model, "model.pkl")
joblib.dump(label_encoder, "encoder.pkl")