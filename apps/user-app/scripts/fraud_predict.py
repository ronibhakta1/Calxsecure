
import joblib
import sys
import json

# Load model
model = joblib.load("public/fraud-model.pkl")

# Read input
data = json.load(sys.stdin)
features = data["features"]

# Predict
score = float(model.predict_proba([features])[0][1])

print(json.dumps({"score": score}))