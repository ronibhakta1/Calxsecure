import pandas as pd
import xgboost as xgb
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import numpy as np
import os

# Generate 50K realistic transactions
np.random.seed(42)
n = 50000

df = pd.DataFrame({
    'amount': np.random.exponential(300, n) * 100,
    'hour': np.random.randint(0, 24, n),
    'day_of_week': np.random.randint(0, 7, n),
    'velocity_1h': np.random.poisson(1.5, n),
    'velocity_24h': np.random.poisson(8, n),
    'is_new_device': np.random.choice([0, 1], n, p=[0.85, 0.15]),
    'distance_km': np.random.exponential(50, n),
    'is_night': np.random.choice([0, 1], n, p=[0.75, 0.25]),
    'is_weekend': np.random.choice([0, 1], n, p=[0.7, 0.3]),
    'avg_txn_last_7d': np.random.exponential(400, n) * 100,
    'payment_method_upi': np.random.choice([0, 1], n, p=[0.9, 0.1]),
})

# High-risk patterns = fraud
fraud = (
    (df['amount'] > 500000) |
    (df['velocity_1h'] > 8) |
    (df['is_new_device'] == 1) & (df['amount'] > 200000) |
    (df['distance_km'] > 500) |
    (df['is_night'] == 1) & (df['amount'] > 300000)
)
df['isFraud'] = fraud.astype(int)

X = df.drop('isFraud', axis=1)
y = df['isFraud']

# Handle imbalance
smote = SMOTE(random_state=42)
X_res, y_res = smote.fit_resample(X, y)

X_train, X_test, y_train, y_test = train_test_split(X_res, y_res, test_size=0.2, stratify=y_res)

model = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=8,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=1,
    eval_metric='auc'
)

model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=100)

print("AUC:", roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))
print(classification_report(y_test, model.predict(X_test)))

output_path = 'public/models/fraud-model-v2.pkl'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
joblib.dump(model, output_path)
print("MODEL SAVED")