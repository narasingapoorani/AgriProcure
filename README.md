# 🌾 AgriProcure AI — Autonomous Full-Stack Procurement Platform (SIH)

An enterprise-grade, full-stack AI web application designed for the **Smart India Hackathon (SIH)**. This platform unifies **React 19 + Vite**, **Flask REST API**, **PostgreSQL / SQLite**, **Razorpay Payment Gateway**, and **WhatsApp Cloud & Click-to-Chat**, fully powered by **6 pre-trained Machine Learning models**.

---

## 🏛️ System Architecture

```
                                  [ Farmers & Officers ]
                                            │
                                            ▼
                          ┌───────────────────────────────────┐
                          │     React 19 + Vite Frontend      │
                          │   (Tailwind CSS, Recharts, Lucide)│
                          │        http://localhost:5173      │
                          └─────────────────┬─────────────────┘
                                            │ Reverse Proxy / API calls
                                            ▼
                          ┌───────────────────────────────────┐
                          │         Flask REST API            │
                          │      http://127.0.0.1:5000/api    │
                          └───────┬───────────────────┬───────┘
                                  │                   │
         ┌────────────────────────┴───────┐   ┌───────┴────────────────────────┐
         │     6 Trained ML Models        │   │    External Integrations       │
         │  • centre_recommendation       │   │  • Razorpay Orders & Checkout  │
         │  • smart_slot_allocation       │   │  • Direct DBT MSP Payouts      │
         │  • eta_prediction (Explainable)│   │  • WhatsApp Cloud / wa.me link │
         │  • overload_prediction         │   │  • Base64 QR Code Generator    │
         │  • demand_forecasting          │   │  • Real-time SMS Engine        │
         │  • officer_decision_intel      │   └────────────────────────────────┘
         └────────────────────────────────┘
                                  │
                                  ▼
                          ┌───────────────────────────────────┐
                          │   Database (SQLAlchemy ORM)       │
                          │   • SQLite (Zero-config default)  │
                          │   • PostgreSQL (Production ready) │
                          └───────────────────────────────────┘
```

---

## ⚡ One-Click Startup

### Option A: Double-Click Batch File (Windows)
Simply double click:
```
start_app.bat
```
*Automatically launches the Flask API on port 5000, Vite React on port 5173, and opens `http://localhost:5173` in your default browser.*

---

### Option B: Manual Command Line

**Terminal 1 — Backend API:**
```bash
cd backend
"C:\Users\raksh\AppData\Local\Programs\Python\Python311\python.exe" run.py
```
*(Or `python run.py` if Python 3.11 is your default)*

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🔑 Demo Credentials

| Role | Username | Password | Details |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer1` | `farmer123` | Ramesh Patil (Active Token: `A-123`, 4.0 Quintals Wheat) |
| **Officer** | `officer1` | `officer123` | Dr. Arvind Sharma (Coimbatore Central APMC & Agricultural Complex) |

*Note: You can also register a new Farmer or Officer account with live Aadhaar / Officer ID verification!*

---

## 🧠 Integrated Machine Learning Models (6 Models)

| # | Model Artifact | Algorithm | Capability & Role in Workflow |
| :-: | :--- | :--- | :--- |
| **1** | `centre_recommendation_model.joblib` | Multi-Objective Scoring Pipeline | Recommends top 3 APMC centres considering proximity, waiting time, congestion, and capacity. |
| **2** | `smart_slot_allocation_model.joblib` | Slot Optimization | Allocates the optimal arrival hour (08:00–09:00, etc.) to smooth queue peaks. |
| **3** | `eta_prediction_model.joblib` | Wait Time Regressor | Computes real-time estimated waiting time with **Explainable AI factors** (12 farmers ahead, inspection duration, counter availability, 91% confidence). |
| **4** | `overload_prediction_model.joblib` | Risk Classifier | Classifies congestion into `LOW`, `MODERATE`, `HIGH` with exact probability outputs. |
| **5** | `demand_forecasting_model.joblib` | Forward Arrival Forecaster | Predicts daily and weekly crop arrivals for 14 forward days (`This Week` & `Next Week`). |
| **6** | `officer_decision_intelligence_model.joblib` | Operational Decision Engine | Prescribes actionable commands: `PROCEED`, `OPEN_EXTRA_COUNTER`, `EXPEDITE_INSPECTION`, or `SHIFT_FARMERS`. |

---

## 💳 Razorpay & WhatsApp Integrations

### 1. Razorpay Payment Gateway
- **Slot Verification Fee (₹50)**: Interactive simulated and live Razorpay checkout supporting UPI (Google Pay, PhonePe, Paytm), RuPay / Visa Cards, and NetBanking.
- **MSP Direct Benefit Transfer (DBT)**: Automatic mock payout generation (`pout_...`) with government bank UTR tracking for crop procurement settlement.
- **Auto-advancement**: Payment completion advances procurement booking to `Payment Initiated`.

### 2. WhatsApp Messaging & Click-to-Chat
- **Direct `wa.me` Click-to-Chat Links**: Pre-formatted WhatsApp links with token details, procurement centre location, slot times, and directions.
- **Meta Cloud API Ready**: Configure `META_WHATSAPP_TOKEN` and `META_PHONE_NUMBER_ID` in `backend/.env` for real-time automated template messages.

---

## 📱 Complete End-to-End Workflow

1. **Language & Onboarding**: Choose from 9 Indian languages (English, Tamil, Hindi, Marathi, etc.) with dynamic translation.
2. **Crop Declaration**: Enter crop (Wheat, Paddy, Cotton, etc.), acreage, and expected tonnage.
3. **AI Recommendation**: View top 3 recommended centres with AI suitability score, distance, and optimal time slot.
4. **Slot Confirmation & QR Code**: Book slot to generate a verified token (`B-161`) with a Base64 QR code and instant SMS/WhatsApp confirmation.
5. **Gate Check-In & Scanner**: Scan QR code at centre gate to check in.
6. **Live Queue & Explainable AI**: Monitor real-time queue position with transparent explanation breakdown.
7. **7-Stage Procurement Timeline**:
   `Booked` ➔ `Arrived` ➔ `Moisture Tested` ➔ `Quality Grading` ➔ `Weighed` ➔ `Payment Generated` ➔ `Payment Initiated`.
8. **Officer Command Centre**:
   - **Live Queue Monitoring**: Real-time counter metrics.
   - **Demand Forecasting**: Interactive chart comparing weekly capacity against AI predicted demand.
   - **Digital Twin**: Run what-if simulations for ±counters, heavy rain, and +50 farmer surges.
   - **Dynamic Load Balancing**: Shift farmers to nearby under-utilized centres with automated SMS rerouting alerts.

---

## 🧪 Verification & Automated Testing

Run the full integration test suite covering all 18 end-to-end endpoints and integrations:
```bash
"C:\Users\raksh\AppData\Local\Programs\Python\Python311\python.exe" scratch/test_api.py
```
Run the dedicated Razorpay & WhatsApp test suite:
```bash
"C:\Users\raksh\AppData\Local\Programs\Python\Python311\python.exe" scratch/test_razorpay_whatsapp.py
```
*(All 18 automated integration tests pass with 100% success)*
