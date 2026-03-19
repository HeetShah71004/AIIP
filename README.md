# AIIP (AI-Integrated Interview Platform)

AIIP is a modern, full-stack application designed to streamline the recruitment process. It features automated resume parsing, interactive mock interviews driven by AI, comprehensive analytics dashboards, and secure authentication, helping both recruiters and candidates manage interview workflows efficiently.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) (v18) with [Vite](https://vitejs.dev/)
- **Routing:** [React Router Dom](https://reactrouter.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Auth:** [Google OAuth](https://developers.google.com/identity/gsi/web/guides/overview) (`@react-oauth/google`)
- **Charts:** [Recharts](https://recharts.org/)
- **State Management & Notifications:** React Hooks, Context API & React Hot Toast

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Storage:** [Cloudinary](https://cloudinary.com/) (File Hosting) via `multer`
- **File Parsing:** `pdf-parse` & `mammoth` (DOCX extraction)
- **AI Integration:** [Google Generative AI](https://ai.google.dev/) (Gemini) & [OpenAI](https://openai.com/)
- **Auth:** [JSON Web Tokens (JWT)](https://jwt.io/) & `bcryptjs`
- **Security & Config:** CORS, Dotenv

---

## 🌟 Key Features

### Authentication & User Profiling
- **Login & Signup:** Secure email/password authentication and Google OAuth integration with a premium glassmorphic UI.
- **Protected Routes:** JWT-aware route guards using React Router to ensure secure access to dashboard elements.
- **Profile Management:** View and edit personal information, keeping track of your session history.

### Resume Parsing & Management
- **Intuitive Upload Portal:** Drag-and-drop zone seamlessly integrated with Cloudinary for fast and reliable storage.
- **Smart Data Extraction:** Automatically parses text from uploaded PDF and DOCX formats into structured skills, experience, and educational background data.

### Interactive Mock Interviews
- **AI-Driven Q&A:** Chat-style mock interview simulations powered dynamically by Google Gemini or OpenAI.
- **Adaptive Questioning:** Interview context is tailored dynamically based on the candidate's resume and selected difficulty.
- **Real-Time Feedback:** Granular scorecards assess clarity, depth, and relevance of answers on a per-question basis.

### Analytics Dashboard
- **Performance Overview:** Detailed cards displaying completed sessions, average scores, and interview streaks.
- **Visual Insights:** Activity feeds paired with rich visual charts (via Recharts) for tracking performance trends over time.

---

## 📂 Project Structure

```text
AIIP/
├── frontend/               # React Client (Vite, Tailwind CSS, Shadcn)
│   ├── src/
│   │   ├── components/     # UI Building Blocks (Navbar, Route Guards)
│   │   ├── context/        # Global States (AuthContext)
│   │   ├── pages/          # Primary Views (Dashboard, MockInterview, Analytics, Login/Signup)
│   │   └── index.css       # Core Styling & Tailwind Directives
│   └── vite.config.js      # Build Configuration
└── backend/                # Node.js + Express API Server
    ├── config/             # Database Setup & Configuration
    ├── controllers/        # Request Handlers & Core App Logic
    ├── middleware/         # Custom Middleware (Auth & Error Handling)
    ├── models/             # Mongoose Data Schemas (User, Session, Question, Resume)
    ├── routes/             # RESTful API Endpoints (`/api/v1/...`)
    ├── services/           # External Service integrations (AI, parsing)
    └── server.js           # Server Entry Point
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- Local MongoDB Instance or [MongoDB Atlas](https://www.mongodb.com/atlas/database)
- [Cloudinary Account](https://cloudinary.com/) (for candidate resume storage)
- Google & OpenAI API Keys (for OAuth capability and Interview AI integrations)

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
   # Create a .env file containing your MongoDB URI, Cloudinary info, JWT Secrets, and API Keys
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file providing your VITE_API_URL and VITE_GOOGLE_CLIENT_ID
   npm run dev
   ```

---

## 📄 License
This project is licensed under the ISC License.
