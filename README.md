<div align="center">

# 🛡️ SafetyNet.ai

**AI-Powered Emergency Fund & Financial Risk Analyser**  
*Built for India — LLaMA-3.3-70b · XGBoost · React 19 · Express 5*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BFF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## ✨ Features

### 🔬 AI + ML Analysis Engine
- **14-factor financial risk scoring** (income, EMI, savings, job type, city tier, dependents, age, life stage, insurance, rent/own)
- **LLaMA-3.3-70b via Groq** — personalised AI insights, 5 action steps, and emergency fund tier strategy
- **XGBoost ML model** (R² = 0.949, Accuracy = 85.3%) — independent risk prediction with AI/ML agreement indicator
- **3-tier emergency fund** plan: Liquid savings → Liquid MF → FD

### 💬 AI Financial Chatbot
- Floating chatbot accessible from every page
- **Voice input** — continuous speech-to-text (Web Speech API, `en-IN`)
- **Voice output (TTS)** — auto-speaks every AI response, per-bubble play/stop
- Analysis context injection — chatbot knows your risk score, target fund, income, EMI
- Animated sound-wave while speaking, thinking indicator with rotating labels
- Message reactions (👍/👎), copy, minimize, export chat as `.txt`
- Ctrl+K keyboard shortcut to open/close

### 📊 Dashboard
- 5 tabs: Overview · AI Insights · Projection · Stress Test · ML Analysis
- Recharts area & pie charts, 12-month projection slider
- Stress test: income drop + expense spike simulation
- **Smart Suggestions** banner — auto-generated action cards after every analysis
- PDF export, clipboard copy, save to history

### 🔐 Authentication
- Register / Login with bcryptjs + JWT (7-day expiry)
- Welcome email on registration (Nodemailer + Gmail SMTP)
- Admin panel — user management, usage stats, system health

### 🎨 UI/UX
- Dark / Light theme toggle with full CSS variable system
- Framer Motion animations throughout
- Responsive — works on mobile and desktop
- Multi-step form with review step, tooltips, keyboard navigation

---

## 🗂️ Project Structure

```
SafetyNet.ai/
├── client/                  # React 19 + Vite 8 frontend
│   ├── src/
│   │   ├── App.jsx           # Root — routing, theme, auth state
│   │   ├── index.css         # Tailwind v4 + design tokens + light theme overrides
│   │   └── components/
│   │       ├── Landing.jsx       # Home page
│   │       ├── AuthPage.jsx      # Sign in / Register
│   │       ├── PortalPage.jsx    # Logged-in dashboard portal
│   │       ├── CalculatorForm.jsx # 6-step analysis form
│   │       ├── AnalysisPage.jsx  # Boot sequence + analysis trigger
│   │       ├── Dashboard.jsx     # 5-tab results dashboard
│   │       ├── HistoryPanel.jsx  # Saved analyses
│   │       ├── ChatBot.jsx       # Floating AI chatbot (voice I/O)
│   │       └── AdminPage.jsx     # Admin panel
│   └── package.json
│
├── server/                  # Express 5 + Node.js backend
│   ├── index.js              # App entry point
│   ├── config/
│   │   ├── db.js             # MongoDB / file fallback
│   │   └── logger.js         # Structured logging
│   ├── controllers/
│   │   ├── analyzeController.js  # POST /api/analyze
│   │   ├── authController.js     # Register / Login / Me
│   │   ├── historyController.js  # Save / Get history
│   │   ├── adminController.js    # Admin stats & management
│   │   └── chatController.js     # POST /api/chat (Groq)
│   ├── services/
│   │   ├── calculationService.js # Financial engine (14 factors)
│   │   ├── aiService.js          # Groq LLaMA integration
│   │   └── emailService.js       # Nodemailer welcome email
│   ├── middleware/
│   │   └── auth.js           # JWT verify + admin guard
│   ├── routes/               # Express routers
│   ├── models/               # Mongoose UserData schema
│   ├── seed.js               # Demo user seeder
│   └── .env.example          # Required environment variables
│
└── ml/                      # XGBoost Python microservice
    ├── serve.py              # Flask API on port 5002
    ├── train_model.py        # Model training script
    └── model/                # Trained model artefacts (gitignored)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.9 (for ML service, optional)
- A free [Groq API key](https://console.groq.com)

### 1 — Clone & install

```bash
git clone https://github.com/ANANTYASH11/SafetyNet.ai.git
cd SafetyNet.ai

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2 — Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5001
NODE_ENV=development

# Required — get free key at https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Optional — MongoDB (falls back to local data.json if not set)
MONGO_URI=mongodb://localhost:27017/safetynet

# Optional — JWT secret (has a default, change in production)
JWT_SECRET=your-secret-here

# Optional — Gmail SMTP for welcome emails
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### 3 — Start the server

```bash
cd server
node index.js
# → API running on http://localhost:5001
```

### 4 — Start the client

```bash
cd client
npm run dev
# → App running on http://localhost:5173
```

### 5 — (Optional) Start the ML service

```bash
cd ml
pip install flask scikit-learn xgboost numpy pandas
python serve.py
# → Flask ML API on http://localhost:5002
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/analyze` | Full AI + ML analysis (14 factors) | Public |
| `POST` | `/api/calculate` | Calculation only, no AI | Public |
| `POST` | `/api/save` | Save result to history | Public |
| `GET` | `/api/history` | Get saved analyses | Public |
| `POST` | `/api/auth/register` | Create account | Public |
| `POST` | `/api/auth/login` | Login → JWT | Public |
| `GET` | `/api/auth/me` | Verify token | Bearer JWT |
| `POST` | `/api/chat` | AI chatbot (Groq) | Public |
| `GET` | `/api/admin/stats` | Admin statistics | Admin JWT |
| `GET` | `/api/health` | Service health check | Public |

### Example — Analyse request

```bash
curl -X POST http://localhost:5001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyIncome": 60000,
    "monthlyExpenses": 35000,
    "emi": 8000,
    "savings": 100000,
    "jobType": "corporate",
    "dependents": 1,
    "cityTier": "1",
    "age": 28,
    "lifeStage": "mid_career",
    "hasHealthInsurance": "no",
    "rentOrOwn": "rent"
  }'
```

---

## 🤖 ML Model

The XGBoost model is trained on synthetic financial data covering Indian income profiles.

| Metric | Value |
|--------|-------|
| R² Score | 0.949 |
| Accuracy | 85.3% |
| Features | 14 |
| Classes | Low / Medium / High / Critical |

To retrain:
```bash
cd ml
python train_model.py
```

The model runs as a separate Flask service on port 5002. The main server calls it automatically and falls back gracefully if it's not running.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Animation | Framer Motion v12 |
| Charts | Recharts v3 |
| Icons | Lucide React |
| Backend | Express 5, Node.js 18+ |
| AI | Groq API — LLaMA-3.3-70b-Versatile |
| ML | XGBoost, scikit-learn, Flask |
| Auth | bcryptjs, jsonwebtoken |
| Email | Nodemailer, Gmail SMTP |
| DB | MongoDB (Mongoose) with file fallback |

---

## 🔒 Security

- JWT authentication with 7-day expiry
- bcryptjs password hashing (10 rounds)
- CORS restricted to client origin
- JSON body size limited to 10 KB
- Input validation on all API endpoints
- Environment variables for all secrets (never hardcoded)
- Admin routes protected by role-based middleware

---

## 📸 Screenshots

> Landing page, analysis form, dashboard with AI insights, chatbot with voice — all in dark and light themes.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 👤 Author

**Yash Anant**  
GitHub: [@ANANTYASH11](https://github.com/ANANTYASH11)

---

<div align="center">
  <sub>Built with ❤️ for INT 428 Project · SafetyNet.ai v3.0</sub>
</div>
