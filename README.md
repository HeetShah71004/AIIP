# Interv AI 🚀

**Interv AI** is a premium, AI-powered mock interview platform designed to help candidates crush technical and behavioral interviews. By leveraging advanced Large Language Models (LLMs) and real-time execution engines, Interv AI provides a professional, interactive, and hyper-personalized preparation experience.

---

## ✨ Key Features

### 🎙️ AI-Powered Mock Interviews
- **Real-Time Streaming**: Experience fluid, low-latency interactions powered by **Server-Sent Events (SSE)** for instant AI feedback.
- **Peer-to-Peer Interview Matching**: Connect with other candidates for live mock sessions to improve behavioral skills.
- **Infinite Social Proof Marquee**: A sleek, auto-scrolling display of top companies with interactive hover states.

### 📄 Intelligent Resume Alignment
- **Resume Parsing**: Strategic analysis of PDF/DOCX resumes to generate targeted questions.
- **Skill Gap Analysis**: AI identifies areas for improvement based on your resume versus target job descriptions.
- **Instant Preview Modal**: High-fidelity modal on the **Profile page** for effortless draft viewing, role-based controls for recruiters, and direct PDF downloads.

### 🧩 Smart Resume Builder
- **Multi-Template Engine**: Build and preview resumes with Classic, Modern, Professional, Creative, Elegant, and Midnight templates.
- **Interactive Section Sequencing**: Control preview section order directly from the modal.
- **Sync with System**: Fully integrated with the high-performance **Settings page** for real-time theme and interface updates.

### 💻 Professional Code Playground (IDE)
- **Edge-to-Edge IDE**: A distraction-free, resizable three-panel layout featuring Problem Descriptions, Monaco Editor, and AI Discussion.
- **Multi-Language Support**: Robust execution for Python, JavaScript, Java, C++, and more via the **Judge0 API**.

### 📊 Advanced Performance Analytics
- **Smart History Sorting**: Toggle between **"Latest"** and **"Top Scores"** globally.
- **Expandable Response Viewer**: implemented with gradient-fade transitions and overflow detection.
- **Progress Visualization**: Track your journey with interactive charts on your personalized dashboard.

### 📧 Integrated Contact System
- **Direct Support Connect**: Functional contact form linked to `intervaiplatform@gmail.com`.
- **Nodemailer Backend**: Robust email delivery system with custom HTML templates and Reply-To support.
- **Micro-Animated UI**: Interactive "Send Message" button with smart hover states and loading transitions.

---

## 📂 Project Structure

```text
.
├── backend/                # Node.js / Express.js Server
│   ├── config/             # Database connection & Auth configuration
│   ├── controllers/        # Request handling logic (Auth, Resume, Analytics, etc.)
│   ├── models/             # Mongoose schemas (User, Resume, Interview Session)
│   ├── routes/             # API endpoint definitions
│   ├── services/           # AI integrations (Gemini, Judge0) & external APIs
│   ├── middleware/         # Auth guards & error handling
│   ├── uploads/            # Temporary directory for file processing
│   └── server.js           # Server initialization
├── frontend/               # React SPA (Vite)
│   ├── src/
│   │   ├── api/            # Axios client & global API abstraction
│   │   ├── components/     # UI components & resume layout templates
│   │   ├── context/        # Global state (Auth, Theme, Navigation)
│   │   ├── pages/          # Full-page views (Dashboard, Profile, Builder, etc.)
│   │   ├── hooks/          # Custom React hooks (Intersection observers, timers)
│   │   ├── lib/            # Internal utilities & helper functions
│   │   └── App.jsx         # Routing & application entry
│   ├── tailwind.config.js  # Styling & design system tokens
│   └── package.json        # Frontend dependencies
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **IDE Engine**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Visualizations**: [Recharts](https://recharts.org/), [Chart.js](https://www.chartjs.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/) & [OpenAI](https://openai.com/)
- **Authentication**: JWT & Google OAuth 2.0
- **Transcription**: [Deepgram API](https://deepgram.com/)
- **Email Delivery**: [Nodemailer](https://nodemailer.com/)
- **Execution**: [Judge0 API](https://judge0.com/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** instance (Local or Atlas)
- **API Keys**: `GEMINI_API_KEY`, `DEEPGRAM_API_KEY`, `JUDGE0_KEY`, `GOOGLE_CLIENT_ID`
- **SMTP Setup**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (for Contact Form)

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/HeetShah71004/AIIP.git
   cd AIIP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the `backend` directory based on `.env.example`.

### Execution

1. **Start Backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend && npm run dev
   ```

The app will launch at `http://localhost:5173`.

---

## 📄 License
Licensed under the [ISC License](LICENSE).

Developed with ❤️ by the Interv AI Team.
