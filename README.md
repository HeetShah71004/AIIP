# Interv AI 🚀

**Interv AI** is a premium, AI-powered mock interview platform designed to help candidates crush technical and behavioral interviews. By leveraging advanced Large Language Models (LLMs) and real-time execution engines, Interv AI provides a professional, interactive, and hyper-personalized preparation experience.

---

## ✨ Key Features

### 🎙️ AI-Powered Mock Interviews
- **Real-Time Streaming**: Experience fluid, low-latency interactions powered by **Server-Sent Events (SSE)** for instant AI feedback and question generation.
- **Infinite Social Proof Marquee**: A sleek, auto-scrolling display of top companies utilizing high-fidelity fade masks and interactive hover states.
- **Role-Specific Scenarios**: Tailored prep for Software Engineer (Frontend, Backend, Full Stack), Data Scientist, and Product Manager roles.
- **Company-Specific Tracks**: Get curated questions based on the interview patterns of tech giants like Google, Amazon, Meta, and Netflix.
- **Hybrid Transcription**: High-accuracy speech-to-text using **Deepgram Nova-2** with intelligent browser-based fallbacks.

### 📄 Intelligent Resume Alignment
- **Resume Parsing**: Strategic analysis of PDF/DOCX resumes to generate questions that probe your specific experience and projects.
- **Skill Gap Analysis**: AI identifies areas for improvement based on your resume versus target job descriptions.

### 🧩 Smart Resume Builder
- **Multi-Template Resume Engine**: Build and preview resumes with Classic, Modern, Professional, Creative, Elegant, and Midnight templates.
- **Interactive Section Sequencing**: Control preview section order from the modal using checkbox-based sequence selection while keeping core identity blocks stable.
- **Draft Persistence**: Save and restore both selected template and preview section order across sessions.
- **ATS + Editing Workspace**: Scroll-friendly right sidebar with section navigator and ATS analysis for long-form resume editing.
- **Import Feedback UX**: Imported resume filename is displayed with clear visual feedback after each upload.

### 💻 Professional Code Playground (IDE)
- **Edge-to-Edge IDE**: A distraction-free, 0-100% **resizable three-panel layout** featuring Problem Descriptions, Monaco Editor, and AI Discussion.
- **Multi-Language Support**: Robust execution for Python, JavaScript, Java, C++, and more.
- **Real-Time Execution**: Instantly run code and view outputs via the integrated **Judge0 API**.
- **Thematic Precision**: Beautifully styled code environment with active line highlighting and theme-aware aesthetics.

### 📊 Advanced Performance Analytics
- **Smart History Sorting**: Toggle between **"Latest"** and **"Top Scores"** globally to track your evolution or reflect on your best-of performances.
- **Expandable Response Viewer**: implemented with smart overflow detection, gradient-fade transitions, and a clean "Show More/Less" toggle for long user answers.
- **Expandable Performance Cards**: Deep-dive into each response with a sleek, one-at-a-time expandable UI for detailed communication and technical scoring.
- **Synchronized Global Timer**: An accurate, session-wide timer that manages interview pacing and handles time penalties dynamically.
- **Progress Visualization**: Track your preparation journey with interactive Radar and Line charts on your personalized dashboard.

### 🌓 Premium User Experience
- **Dismissible Feature Carousels**: High-fidelity, floating ad systems for new features with session-based persistence and glassmorphic icons.
- **Distraction-Free Mode**: Global Navbar auto-hiding for deep interview focus and immersive full-screen sessions.
- **Modern UI Suite**: Built with **Tailwind CSS**, **Radix UI**, and **Lucide React** for a sleek, high-performance interface.
- **Glassmorphic Design**: Subtle micro-animations, smooth transitions, and a premium dark/light mode experience.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) (Vite)
- **State Management**: React Context API
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI & Tailwind CSS)
- **IDE Engine**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Layout**: [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Logic**: Custom Web Audio API wrappers with Deepgram integration

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/) & [OpenAI](https://openai.com/)
- **Streaming**: Server-Sent Events (SSE) for real-time evaluation
- **Authentication**: JWT (Stateless) & Google OAuth 2.0
- **Transcription**: [Deepgram API](https://deepgram.com/)
- **Execution**: [Judge0 API](https://judge0.com/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** instance (Local or Atlas)
- **API Keys**:
  - `GEMINI_API_KEY` (Google AI)
  - `DEEPGRAM_API_KEY` (Transcription)
  - `JUDGE0_KEY` (RapidAPI - Code Execution)
  - `GOOGLE_CLIENT_ID` (OAuth)

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/HeetShah71004/AIIP.git
   cd AIIP
   ```

2. **Install dependencies:**
   ```bash
   # Root
   npm install
   # Backend
   cd backend && npm install
   # Frontend
   cd ../frontend && npm install
   ```

### Execution

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

The app will launch at `http://localhost:5173`.

---

## 📄 License
Licensed under the [ISC License](LICENSE).

Developed with ❤️ by the Interv AI Team.
