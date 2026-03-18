# AIIP (AI-Integrated Interview Platform)

AIIP is a modern, full-stack application designed to streamline the recruitment process. It features automated resume parsing, interactive dashboards, and secure authentication, helping both recruiters and candidates manage interview workflows efficiently.

---

## 🚀 Teck Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Routing:** [React Router Dom](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Auth:** [Google OAuth](https://developers.google.com/identity/gsi/web/guides/overview)
- **Styling:** Vanilla CSS (Custom UI Components)
- **State Management:** React Hooks & Context API

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Storage:** [Cloudinary](https://cloudinary.com/) (File Hosting)
- **File Parsing:** `pdf-parse` & `mammoth` (DOCX)
- **Auth:** [JSON Web Tokens (JWT)](https://jwt.io/) & `bcryptjs`

---

## 🗺️ MVP Roadmap (V1.0)
_Weeks 1–2 | 15 tasks_

| # | FRONTEND | BACKEND |
| :--- | :--- | :--- |
| **01** | **Login & Signup UI**<br>Email/password forms, validation states, redirect on auth, skeleton loading. Responsive layout, error banners.<br>`UI` `Auth` | **Express Server & MongoDB**<br>Modular route structure, Mongoose schemas (User, Session, Question), dotenv config, error-handling middleware.<br>`DB` |
| **02** | **Protected Routes**<br>JWT-aware route guards with React Router. Redirect unauthenticated users; persist session via localStorage + refresh token.<br>`Auth` | **JWT Authentication**<br>Register/login endpoints, bcrypt password hashing, access + refresh token pair, token blacklist on logout.<br>`Auth` `API` |
| **03** | **Dashboard UI**<br>Overview cards: sessions completed, avg score, streak. Quick-start interview button. Recent activity feed.<br>`UI` | **Resume Upload API + Multer**<br>Multer disk/S3 storage, file-type whitelist (PDF/DOCX), 5 MB limit, signed URL response for frontend preview.<br>`API` |
| **04** | **Resume Upload Page UI**<br>Drag-and-drop zone, file type/size validation, upload progress bar, parsed preview panel on success.<br>`UI` | **Resume Text Extraction**<br>pdf-parse + mammoth for DOCX. Strip boilerplate, return structured JSON: skills[], experience[], education[].<br>`AI API` |
| **05** | **Mock Interview UI**<br>Chat-style Q&A; flow, question counter, timer display, submit answer action, loading indicator between AI turns.<br>`UI` `AI` | **Question Bank APIs**<br>CRUD for questions; filter by category, difficulty, company tag. Pagination + search. Seed script for 200+ starter questions.<br>`API DB` |
| **06** | **AI Feedback Display**<br>Score cards per answer (clarity, depth, relevance), inline highlighted strengths/weaknesses, overall session score.<br>`UI` `AI` | **Interview Session APIs**<br>Create/end session, record answers array, calculate duration, link to resume and question set.<br>`API DB` |
| **07** | **Basic Analytics UI**<br>Bar chart of scores per session, performance trend line, category breakdown table.<br>`UI` | **AI Evaluation Integration**<br>OpenAI/Claude call per answer: score 1-10 + feedback string. Retry with exponential backoff. Cache identical answers.<br>`AI API` |
| **08** | | **Basic Analytics APIs**<br>Aggregate score history by user, per-category average, session frequency. Exposed as /analytics/summary endpoint.<br>`API DB` |

---

## 📂 Project Structure

```text
AIIP/
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # Reusable UI Blocks
│   │   ├── pages/          # View Components
│   │   └── assets/         # Static Media (Logos, Icons)
│   └── vite.config.js
└── backend/                # Node.js Server
    ├── controllers/        # Request Handlers
    ├── models/             # Mongoose Schemas
    ├── routes/             # API Endpoints
    ├── services/           # Business Logic (Text Extraction)
    ├── middleware/         # Auth & Error Handling
    └── server.js           # Entry Point
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or Local Instance
- Cloudinary Account (for resume storage)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AIIP
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file for VITE_API_URL
   npm run dev
   ```

---

## 📄 License
This project is licensed under the ISC License.
