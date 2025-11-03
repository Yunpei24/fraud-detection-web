# SHAP Explanation Flow - Complete Data Flow Documentation

## Overview

This document explains the complete data flow for SHAP (SHapley Additive exPlanations) feature explanations in the fraud detection investigation page.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Investigation Page                            │
│                       (Investigation.js)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 1. Load transactions
                             ↓
                    fraudAPI.getRecent(50)
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     Backend Node.js (port 3001)                      │
│                   GET /api/frauds/recent                             │
│                   (fraud.js)                                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 2. SQL Query with V1-V28 features
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                              │
│   SELECT transaction_id, customer_id, merchant_id, amount, time,    │
│          v1, v2, v3, ..., v28, fraud_score, ...                     │
│   FROM transactions t                                                │
│   INNER JOIN predictions p ON t.transaction_id = p.transaction_id   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 3. Returns transaction with features
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    PendingReviewList.js                              │
│   • Displays transactions in a list                                 │
│   • "View SHAP Explanation" button for each transaction             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 4. User clicks "Explain" button
                             │    onExplainClick(transaction)
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   ShapExplanationModal.js                            │
│   • extractFeatures(transaction) → [Time, V1-V28, Amount]           │
│   • POST /api/v1/explain/shap with features array                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 5. Request SHAP explanation
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                Backend Node.js - Proxy (explain.js)                  │
│                POST /api/v1/explain/shap                             │
│   • Forwards request to FastAPI with JWT token                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 6. Proxy to FastAPI
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    FastAPI (port 8000)                               │
│                POST /api/v1/explain/shap                             │
│                (explain.py route)                                    │
│   • Validates JWT token (analyst or admin role)                     │
│   • Validates ExplanationRequest schema                             │
│   • Calls PredictionService.get_shap_explanation()                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 7. Generate SHAP values
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   PredictionService                                  │
│   • Loads trained model (XGBoost, Neural Net, etc.)                 │
│   • Uses SHAP library to compute feature contributions              │
│   • Returns SHAPExplanationResponse                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ 8. Response flows back through chain
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   ShapExplanationModal.js                            │
│   • Displays feature contributions as bars                          │
│   • Color-coded: Red (increases fraud), Green (decreases fraud)     │
│   • Shows base value, prediction score, processing time             │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Details

### Step 1: Load Transactions

**Location:** `frontend/src/pages/Investigation.js`

```javascript
const fetchPendingTransactions = async () => {
  const response = await fraudAPI.getRecent(50);
  const highRisk = response.data.frauds.filter(f => f.fraud_score >= 0.7);
  setPendingTransactions(highRisk);
};
```

**Purpose:** Fetch high-risk fraud transactions for analyst review

---

### Step 2: SQL Query with Features

**Location:** `backend/routes/fraud.js`

```sql
SELECT 
  t.transaction_id,
  t.customer_id,
  t.merchant_id,
  t.amount,
  t.time,
  -- PCA Features (V1-V28) needed for SHAP explanations
  t.v1, t.v2, t.v3, t.v4, t.v5, t.v6, t.v7, t.v8, t.v9, t.v10,
  t.v11, t.v12, t.v13, t.v14, t.v15, t.v16, t.v17, t.v18, t.v19, t.v20,
  t.v21, t.v22, t.v23, t.v24, t.v25, t.v26, t.v27, t.v28,
  p.fraud_score,
  p.is_fraud_predicted,
  p.prediction_time
FROM transactions t
INNER JOIN predictions p ON t.transaction_id = p.transaction_id
WHERE p.is_fraud_predicted = true
ORDER BY p.prediction_time DESC
```

**Key Change:** Added `v1` through `v28` columns to enable SHAP explanations

**Response Structure:**
```javascript
{
  transaction_id: "TXN-12345",
  customer_id: "CUST-001",
  merchant_id: "MERCH-500",
  amount: 149.62,
  time: "2025-11-03T10:30:00Z",
  v1: -1.359807,
  v2: -0.072781,
  v3: 2.536347,
  // ... v4 through v27 ...
  v28: 0.133558,
  fraud_score: 0.87,
  is_fraud_predicted: true,
  prediction_time: "2025-11-03T10:30:05Z"
}
```

---

### Step 3: Display in Investigation Page

**Location:** `frontend/src/components/Investigation/PendingReviewList.js`

```javascript
<button
  onClick={(e) => {
    e.stopPropagation();
    onExplainClick(transaction); // Pass full transaction object
  }}
  className="mt-3 flex items-center space-x-2 text-sm text-blue-600"
>
  <Brain size={16} />
  <span>View SHAP Explanation</span>
</button>
```

**Purpose:** Provide a button to request SHAP explanation for any transaction

---

### Step 4: Extract Features

**Location:** `frontend/src/components/Investigation/ShapExplanationModal.js`

```javascript
const extractFeatures = (transaction) => {
  // If transaction already has features array, use it
  if (Array.isArray(transaction.features) && transaction.features.length === 30) {
    return transaction.features;
  }

  // Otherwise, construct from transaction fields
  // Format: [Time, V1-V28, Amount]
  const features = [];
  
  // Time (index 0) - Convert ISO timestamp to seconds
  features.push(parseFloat(transaction.time || 0));
  
  // V1-V28 (indices 1-28)
  for (let i = 1; i <= 28; i++) {
    const key = `v${i}`;
    const value = transaction[key] || transaction[`V${i}`] || 0;
    features.push(parseFloat(value));
  }
  
  // Amount (index 29)
  features.push(parseFloat(transaction.amount || 0));
  
  return features;
};
```

**Input:** Transaction object from database  
**Output:** Array of 30 floats `[time, v1, v2, ..., v28, amount]`

**Example:**
```javascript
Input: { time: 0, v1: -1.36, v2: -0.07, ..., v28: 0.13, amount: 149.62 }
Output: [0.0, -1.36, -0.07, ..., 0.13, 149.62]
```

---

### Step 5: API Request to Backend

**Location:** `frontend/src/services/api.js`

```javascript
export const explainAPI = {
  getShapExplanation: (transactionId, features, modelType = 'ensemble', metadata = {}) =>
    api.post('/api/v1/explain/shap', {
      transaction_id: transactionId,
      features: features,  // Array of 30 floats
      model_type: modelType,
      metadata: metadata
    }),
};
```

**Request Body:**
```json
{
  "transaction_id": "TXN-12345",
  "features": [0.0, -1.359807, -0.072781, ..., 0.133558, 149.62],
  "model_type": "ensemble",
  "metadata": {
    "source": "investigation_page"
  }
}
```

---

### Step 6: Backend Proxy to FastAPI

**Location:** `backend/routes/explain.js`

```javascript
router.post('/shap', async (req, res) => {
  const response = await axios.post(
    `${FASTAPI_URL}/api/v1/explain/shap`,
    req.body,
    {
      headers: {
        'Authorization': req.token,
        'Content-Type': 'application/json',
      },
    }
  );
  res.json(response.data);
});
```

**Purpose:** 
- Forward request to FastAPI
- Include JWT token for authentication
- Handle errors and return response

---

### Step 7: FastAPI SHAP Computation

**Location:** `fraud-detection-ml/api/src/api/routes/explain.py`

```python
@router.post("/shap")
async def get_shap_explanation(
    request: ExplanationRequest,
    prediction_service: PredictionService = Depends()
):
    # Validate request
    # request.features must be List[float] with 30 elements
    
    # Compute SHAP values
    shap_result = prediction_service.get_shap_explanation(
        transaction_id=request.transaction_id,
        features=request.features,
        model_type=request.model_type
    )
    
    return SHAPExplanationResponse(
        transaction_id=request.transaction_id,
        model_type=request.model_type,
        shap_values=shap_result.shap_values,
        base_value=shap_result.base_value,
        feature_names=["Time", "V1", ..., "V28", "Amount"],
        feature_values=request.features,
        prediction_score=shap_result.prediction_score,
        explanation=shap_result.explanation
    )
```

**Pydantic Schema (ExplanationRequest):**
```python
class ExplanationRequest(BaseModel):
    transaction_id: str = Field(..., description="Unique transaction identifier")
    features: List[float] = Field(..., description="30 feature values [Time, V1-V28, Amount]")
    model_type: Optional[str] = Field("ensemble", description="Model type")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('features')
    def validate_features(cls, v):
        if len(v) != 30:
            raise ValueError('Features must contain exactly 30 values')
        return v
```

---

### Step 8: Display SHAP Visualization

**Location:** `frontend/src/components/Investigation/ShapExplanationModal.js`

**Response Structure:**
```json
{
  "transaction_id": "TXN-12345",
  "model_type": "ensemble",
  "shap_values": [-0.0234, 0.1456, -0.0789, ..., 0.0234],
  "base_value": 0.15,
  "feature_names": ["Time", "V1", "V2", ..., "V28", "Amount"],
  "feature_values": [0.0, -1.359807, -0.072781, ..., 0.133558, 149.62],
  "prediction_score": 0.87,
  "explanation": "Transaction flagged as high risk due to...",
  "processing_time": 0.234,
  "timestamp": 1698756000
}
```

**Visualization:**
```
┌─────────────────────────────────────────────────────┐
│  Feature Contributions                              │
├─────────────────────────────────────────────────────┤
│  V14 = 2.54      ████████████████ +0.1456 (↑ Risk) │
│  Amount = 149.62 ████████ +0.0789 (↑ Risk)         │
│  V10 = -0.45     ████ +0.0234 (↑ Risk)             │
│  V4 = 1.23       ██ -0.0123 (↓ Risk)               │
│  V17 = -1.89     ██████ -0.0789 (↓ Risk)           │
└─────────────────────────────────────────────────────┘
```

- **Red bars:** Features that increase fraud probability
- **Green bars:** Features that decrease fraud probability
- **Length:** Proportional to impact magnitude

## Authentication Flow

```
User Login → JWT Token Stored in localStorage
    ↓
Every API Request (via axios interceptor)
    ↓
Authorization: Bearer <token>
    ↓
Backend Node.js (verifyToken middleware)
    ↓
Forward to FastAPI with same token
    ↓
FastAPI (get_current_analyst_user dependency)
    ↓
Verify JWT signature, check role (analyst or admin)
    ↓
✅ Allow access or ❌ 401 Unauthorized
```

## Error Handling

### Frontend Error States

1. **Loading State:**
   ```javascript
   {loading && <div className="spinner">Generating explanation...</div>}
   ```

2. **Error State:**
   ```javascript
   {error && (
     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
       <AlertCircle className="text-red-500" />
       <p>{error}</p>
       <button onClick={fetchShapExplanation}>Try again</button>
     </div>
   )}
   ```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | JWT token expired or invalid | User must log in again |
| `403 Forbidden` | User doesn't have analyst/admin role | Check user role in database |
| `400 Bad Request - Features must contain exactly 30 values` | Missing V1-V28 columns in SQL | Ensure SQL query includes v1-v28 |
| `404 Not Found` | FastAPI not running | Start FastAPI server on port 8000 |
| `500 Internal Server Error` | SHAP computation failed | Check model files exist, logs |

## Testing

### Manual Testing Steps

1. **Start all services:**
   ```bash
   # Terminal 1: Frontend
   cd fraud-detection-web/frontend
   npm start  # Port 3002
   
   # Terminal 2: Backend Node.js
   cd fraud-detection-web/backend
   npm run dev  # Port 3001
   
   # Terminal 3: FastAPI
   cd fraud-detection-ml/api
   uvicorn src.main:app --reload --port 8000
   ```

2. **Login as analyst:**
   - Navigate to http://localhost:3002/login
   - Username: `admin` (or any analyst user)
   - Password: `admin123`

3. **Go to Investigation page:**
   - Click "Investigation" in navigation
   - Should see list of high-risk transactions

4. **Request SHAP explanation:**
   - Click "View SHAP Explanation" button on any transaction
   - Modal should open with loading spinner
   - After ~1-2 seconds, SHAP visualization appears

5. **Verify display:**
   - ✅ Feature contributions shown as colored bars
   - ✅ Base value and prediction score displayed
   - ✅ Model type selector works
   - ✅ Regenerate button works
   - ✅ Close button works

### API Testing with curl

```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.access_token')

# 2. Get transactions with features
curl -s -X GET "http://localhost:3001/api/frauds/recent?limit=1" \
  -H "Authorization: Bearer $TOKEN" | jq '.frauds[0]'

# 3. Request SHAP explanation
curl -s -X POST http://localhost:3001/api/v1/explain/shap \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TXN-12345",
    "features": [0.0, -1.36, -0.07, 2.54, 1.38, -0.34, 0.46, 0.24, 0.10, 0.36, 
                 0.09, -0.55, -0.62, -0.99, -0.31, 1.47, -0.47, 0.21, 0.26, 0.02, 
                 0.28, 0.02, -0.25, -1.54, 0.20, -0.65, 0.07, 0.13, 149.62],
    "model_type": "ensemble"
  }' | jq

# Expected response:
# {
#   "transaction_id": "TXN-12345",
#   "model_type": "ensemble",
#   "shap_values": [-0.0234, 0.1456, ...],
#   "base_value": 0.15,
#   "feature_names": ["Time", "V1", ..., "Amount"],
#   "prediction_score": 0.87,
#   ...
# }
```

## Performance Considerations

### SHAP Computation Time

- **XGBoost:** ~0.5-1 seconds
- **Neural Network:** ~1-2 seconds  
- **Ensemble:** ~2-3 seconds (computes for all models)
- **Isolation Forest:** ~0.2-0.5 seconds

### Optimization Tips

1. **Cache SHAP explainers in PredictionService** (already implemented)
2. **Limit feature importance to top 10-15 features** for display
3. **Use approximate SHAP values** for faster computation
4. **Add loading states** to improve perceived performance

## Database Schema Reference

### transactions table

```sql
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    merchant_id VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    time TIMESTAMPTZ NOT NULL,
    -- PCA Features (V1-V28)
    v1 DECIMAL(10, 6),
    v2 DECIMAL(10, 6),
    -- ... v3 through v27 ...
    v28 DECIMAL(10, 6),
    -- Labels
    is_fraud BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### predictions table

```sql
CREATE TABLE predictions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) REFERENCES transactions(transaction_id),
    fraud_score DECIMAL(5, 4) NOT NULL,
    is_fraud_predicted BOOLEAN NOT NULL,
    model_version VARCHAR(50),
    feature_importance JSONB,
    prediction_time TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Considerations

### Role-Based Access Control

- ✅ **SHAP explanations require `analyst` or `admin` role**
- ✅ JWT token validated on every request
- ✅ FastAPI dependency: `Depends(get_current_analyst_user)`

### Data Privacy

- ⚠️ SHAP explanations reveal model internals
- ⚠️ Ensure only authorized analysts can access
- ⚠️ Log all SHAP requests for audit trail

## Related Documentation

- [Investigation Page Architecture](./frontend_docs/ARCHITECTURE.md)
- [SHAP Explainers Config](../fraud-detection-ml/api/SHAP_EXPLAINERS_CONFIG.md)
- [Admin User Management](./frontend_docs/ADMIN_USER_MANAGEMENT.md)
- [JWT Integration](./frontend_docs/JWT_INTEGRATION_SUMMARY.md)

## Troubleshooting

### Issue: "Features must contain exactly 30 values"

**Cause:** Missing V1-V28 columns in SQL query

**Solution:**
```sql
-- Ensure fraud.js query includes v1-v28:
SELECT t.v1, t.v2, ..., t.v28 FROM transactions t ...
```

### Issue: SHAP modal shows "No feature contributions available"

**Cause:** FastAPI response missing `shap_values` or `feature_names`

**Solution:** Check FastAPI logs for errors in SHAP computation

### Issue: Modal doesn't open

**Cause:** Transaction missing required fields

**Solution:** 
```javascript
console.log('Transaction:', transaction);
// Verify transaction has transaction_id, v1-v28, amount
```

---

**Created:** November 3, 2025  
**Feature:** SHAP Explanation Integration  
**Status:** ✅ Complete with V1-V28 features in SQL query
