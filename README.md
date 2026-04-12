# Interv AI - AI-Powered Mock Interview Platform 🚀

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-success)]()

**Interv AI** is a comprehensive, AI-powered mock interview platform engineered to help software engineers, data scientists, and technical professionals master interview preparation. By leveraging advanced Large Language Models (LLMs), real-time execution engines, and adaptive difficulty algorithms, Interv AI delivers a professional, interactive, and hyper-personalized preparation experience that simulates real interview scenarios.

---

## 🎯 Vision & Purpose

The platform addresses a critical gap in interview preparation: most candidates practice in isolation without realistic feedback. Interv AI democratizes access to expert-level interview preparation by providing:

- **AI-Driven Interviews**: Realistic conversational interviews powered by Google Gemini and OpenAI
- **Personalized Feedback**: Real-time scoring, gap analysis, and improvement recommendations
- **Resume Integration**: Targeted question generation based on actual candidate experience
- **Peer Collaboration**: Live peer-to-peer interview matching for behavioral practice
- **Progress Analytics**: Comprehensive dashboards tracking performance across 20+ competencies

---

## ✨ Core Features

### 🎙️ AI-Powered Mock Interviews
- **Conversational Interface**: Natural voice or text-based conversations with AI interviewers
- **Real-Time Streaming**: Fluid, low-latency interactions powered by **Server-Sent Events (SSE)** for instant AI feedback
- **Adaptive Questioning**: Follow-up questions adjust based on candidate responses and performance level
- **Multi-Round Interviews**: Technical, coding, system design, and behavioral rounds
- **Peer-to-Peer Matching**: Connect with other candidates for live mock sessions to improve behavioral skills
- **Company Question Bank**: Access to real questions from 50+ leading tech companies (Google, Amazon, Meta, etc.)

### 📄 Intelligent Resume Processing
- **Automated Resume Parsing**: Strategic analysis of PDF/DOCX resumes using GPT-based extraction
- **Skill Gap Analysis**: AI identifies areas for improvement based on candidate resume vs. target job descriptions
- **Question Tailoring**: Generates targeted technical and behavioral questions specific to candidate experience
- **Experience Alignment**: Prioritizes questions matching candidate's primary tech stack and expertise areas
- **Profile Preview Modal**: High-fidelity modal on Profile page for resume viewing, recruiter validation, and PDF export

### 🧩 Advanced Resume Builder
- **6 Professional Templates**: Classic, Modern, Professional, Creative, Elegant, and Midnight designs
- **Real-Time Preview**: Instant WYSIWYG preview with adjustable zoom levels
- **AI Content Enhancement**: One-click "Improve with AI" for bullet points and descriptions
- **Multi-Section Support**: Skills, projects, education, experience, achievements, certifications
- **Theme Synchronization**: Automatic sync with platform theme settings (dark/light mode)
- **Export Capabilities**: Download as PDF or JSON, send to recruiters directly

### 💻 Professional Code Playground (IDE)
- **Monaco Editor Integration**: Industry-standard code editing with syntax highlighting
- **Resizable Layout**: 3-panel adaptive layout (Problem → Editor → AI Discussion)
- **Multi-Language Support**: Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, etc.
- **Real-Time Execution**: Powered by Judge0 API with instant output and error handling
- **AI Discussion Panel**: Live feedback and explanations as you code
- **Problem Context**: Clear problem statements, examples, and constraints

### 📊 Advanced Performance Analytics
- **Comprehensive Dashboard**: Real-time performance metrics and trends
- **Skill Progress Radar**: Visual representation of competency development across 20+ dimensions
- **Interview History**: Complete session tracking with filters by difficulty, topic, date
- **Score Distribution**: Performance breakdowns by round type, question category, and time period
- **Improvement Recommendations**: AI-generated next steps based on weak areas
- **Comparison Analytics**: Benchmark performance against platform averages
- **Session Replay**: Review recorded interviews with transcripts

### 🔐 Advanced Authentication & Authorization
- **JWT-Based Security**: Stateless authentication with token refresh mechanisms
- **Google OAuth 2.0**: One-click sign-up/login with Google accounts
- **Role-Based Access Control**: Three-tier system (Candidate, Recruiter, Admin)
- **Session Management**: Secure session handling with automatic expiration
- **Password Security**: Bcrypt hashing with salt rounds, secure reset flow

### 📧 Integrated Communication System
- **Direct Support Form**: Functional contact form with validation
- **Email Integration**: Nodemailer backend with HTML templates
- **Recruiter Invitations**: Send platform invites with custom messages
- **Session Notifications**: Email alerts for interview completions and performance updates
- **Auto-Reply System**: Confirmation emails with session links and next steps

### 🎮 Gamification & Engagement
- **Achievement Badges**: Unlock badges for milestones (First Interview, 5-Star Review, etc.)
- **Ranking System**: Leaderboard showing top performers by score and consistency
- **Progress Streaks**: Track consecutive days of platform usage
- **Difficulty Progression**: Visual progression from Beginner → Intermediate → Advanced → Expert
- **Performance Tiers**: Tier-based access to premium features

### 📱 Advanced User Management
- **Profile Customization**: Bio, profile picture, GitHub/LinkedIn integration
- **Preference Settings**: Theme, language, notification preferences, interview style
- **Analytics Export**: Download performance reports as PDF or CSV
- **Account Security**: Two-factor authentication, device management, login history

---

## 📂 Project Architecture

```
AIIP/
├── backend/                          # Node.js/Express REST API
│   ├── config/
│   │   └── db.js                    # MongoDB connection config
│   ├── controllers/
│   │   ├── authController.js        # Auth logic (signup, login, OAuth)
│   │   ├── interviewController.js   # Interview CRUD operations
│   │   ├── resumeController.js      # Resume upload & parsing
│   │   ├── analyticsController.js   # Performance metrics & dashboard
│   │   ├── codeController.js        # Code execution endpoint
│   │   ├── questionController.js    # Question generation & bank
│   │   ├── sessionController.js     # Session management
│   │   ├── speechController.js      # Voice transcription integration
│   │   ├── emotionController.js     # Emotion detection (optional)
│   │   ├── performanceController.js # Performance tracking
│   │   └── contactController.js     # Contact form handling
│   ├── models/
│   │   ├── User.js                  # User schema (auth, profile, stats)
│   │   ├── Session.js               # Interview session schema
│   │   ├── Question.js              # Individual question schema
│   │   ├── QuestionBank.js          # Company question bank
│   │   └── Resume.js                # Resume data schema
│   ├── routes/
│   │   ├── auth.js                  # Auth endpoints
│   │   ├── sessionRoutes.js         # Session API
│   │   ├── resumeRoutes.js          # Resume endpoints
│   │   ├── questionRoutes.js        # Question endpoints
│   │   ├── codeRoutes.js            # Code execution
│   │   ├── analyticsRoutes.js       # Analytics endpoints
│   │   ├── speechRoutes.js          # Speech processing
│   │   ├── contactRoutes.js         # Contact form
│   │   └── performanceRoutes.js     # Performance tracking
│   ├── services/
│   │   ├── aiService.js             # Gemini/OpenAI integration
│   │   ├── resumeService.js         # Resume parsing (pdfjs, docx)
│   │   ├── speechService.js         # Deepgram transcription API
│   │   ├── emailService.js          # Nodemailer templates
│   │   ├── adaptiveDifficultyService.js  # Difficulty algorithm
│   │   └── themeCatalogService.js   # Theme management
│   ├── middleware/
│   │   ├── auth.js                  # JWT middleware
│   │   └── error.js                 # Global error handler
│   ├── data/
│   │   └── theme-catalog-cache.json # Cached theme configurations
│   ├── server.js                    # Express app initialization
│   ├── package.json
│   ├── .env.example
│   └── render.yaml                  # Render deployment config
│
├── frontend/                         # React 18 SPA (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js            # Axios instance with interceptors
│   │   │   ├── interviewApi.js      # Interview endpoints
│   │   │   └── resumeApi.js         # Resume endpoints
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── SignupForm.jsx
│   │   │   ├── Navbar.jsx           # Global navigation
│   │   │   ├── ProtectedRoute.jsx   # Auth guard
│   │   │   ├── LoadingSpinner.jsx   # Loading states
│   │   │   ├── InterviewTimer.jsx   # Interview countdown
│   │   │   ├── DifficultyBadge.jsx  # Difficulty indicator
│   │   │   ├── ThemeToggle.jsx      # Dark/light mode
│   │   │   ├── ATSScoreCard.jsx     # Resume score display
│   │   │   ├── landing/             # Landing page components
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── Features.jsx
│   │   │   │   ├── HowItWorks.jsx
│   │   │   │   ├── Testimonials.jsx
│   │   │   │   ├── ContactUs.jsx
│   │   │   │   └── CTA.jsx
│   │   │   ├── resume-templates/    # 6 resume design templates
│   │   │   │   ├── ClassicTemplate.jsx
│   │   │   │   ├── ModernTemplate.jsx
│   │   │   │   ├── ProfessionalTemplate.jsx
│   │   │   │   ├── CreativeTemplate.jsx
│   │   │   │   ├── ElegantTemplate.jsx
│   │   │   │   └── MidnightTemplate.jsx
│   │   │   └── ui/                  # shadcn/ui components
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── badge.jsx
│   │   │       ├── progress.jsx
│   │   │       └── ... (other UI components)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Global auth state
│   │   │   └── ThemeContext.jsx     # Theme management
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Public homepage
│   │   │   ├── Dashboard.jsx        # User dashboard
│   │   │   ├── MockInterview.jsx    # Main interview page
│   │   │   ├── ConversationalInterview.jsx  # Text/voice chat interview
│   │   │   ├── CodePlayground.jsx   # IDE for coding interviews
│   │   │   ├── ResumeBuilder.jsx    # Resume editor
│   │   │   ├── ResumeUpload.jsx     # Resume upload
│   │   │   ├── Profile.jsx          # User profile
│   │   │   ├── Analytics.jsx        # Performance analytics
│   │   │   ├── InterviewFeedback.jsx # Post-interview summary
│   │   │   ├── PeerInterview.jsx    # Peer matching
│   │   │   ├── CompanySelection.jsx # Company picker
│   │   │   ├── LearningRoadmap.jsx  # Skill progression
│   │   │   ├── RecruiterDashboard.jsx # Recruiter view (role-based)
│   │   │   ├── Gamification.jsx     # Badges & leaderboards
│   │   │   └── Settings.jsx         # User preferences
│   │   ├── lib/
│   │   │   └── utils.js             # Helper functions
│   │   ├── styles/
│   │   │   ├── global.css           # Global styles
│   │   │   └── animations.css       # Keyframes
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # React entry
│   │   └── index.css                # Tailwind imports
│   ├── index.html
│   ├── tailwind.config.js           # Tailwind customization
│   ├── vite.config.js               # Vite build config
│   ├── jsconfig.json
│   ├── postcss.config.js
│   ├── vercel.json                  # Vercel deployment
│   ├── package.json
│   └── components.json              # shadcn/ui registry
│
└── README.md
```

---

## 🛠️ Technology Stack

### **Frontend Architecture**
| Technology | Purpose | Version |
|---|---|---|
| **React** | UI framework with hooks & context API | 18+ |
| **Vite** | Lightning-fast build tool & dev server | 5.0+ |
| **Tailwind CSS** | Utility-first styling & theming | 3.4+ |
| **shadcn/ui** | Pre-built composable UI components | Latest |
| **Monaco Editor** | Code editor with syntax highlighting | Latest |
| **Recharts** | Interactive data visualizations | Latest |
| **Chart.js** | Advanced chart library | Latest |
| **Lucide React** | Icon library (300+ SVG icons) | 2.0+ |
| **React Router v6** | Client-side routing | 6.0+ |
| **Axios** | HTTP client with interceptors | 1.4+ |
| **React Hot Toast** | Notification system | Latest |

### **Backend Architecture**
| Technology | Purpose | Version |
|---|---|---|
| **Node.js** | JavaScript runtime | 18+ |
| **Express.js** | Web framework & routing | 4.18+ |
| **MongoDB** | NoSQL database (Atlas Cloud) | 6.0+ |
| **Mongoose** | MongoDB ODM with schema validation | 8.0+ |
| **JWT** | Stateless authentication & authorization | jsonwebtoken 9.0+ |
| **Bcrypt** | Password hashing & security | 5.1+ |
| **Google Gemini API** | Primary AI model for interviews | Latest |
| **OpenAI API** | Fallback AI model | gpt-3.5-turbo |
| **Judge0 API** | Code execution engine (multi-language) | Latest |
| **Deepgram API** | Speech-to-text transcription | Latest |
| **Nodemailer** | Email delivery system | 6.9+ |
| **pdf-parse** | PDF parsing & text extraction | 1.1+ |
| **mammoth** | DOCX parsing library | 1.5+ |
| **dotenv** | Environment variable management | 16.0+ |
| **CORS** | Cross-origin resource sharing | 2.8+ |

### **Infrastructure & Deployment**
- **Frontend Hosting**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend Hosting**: Render, Railway, or AWS EC2
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: AWS S3 or local uploaded directory
- **CI/CD**: GitHub Actions for automated testing & deployment

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18.0.0 or higher)  
  [Download](https://nodejs.org/)

- **npm** or **yarn** (comes with Node.js)  
  Verify: `npm --version`

- **MongoDB** (Local or Atlas Cloud instance)  
  [Sign up for MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

- **Git**  
  [Download](https://git-scm.com/)

### Required API Keys

Create accounts and obtain API keys for:

1. **Google Gemini API**  
   - Sign up at [Google AI Studio](https://ai.google.dev/)
   - Create a new API key  
   - Keep `GEMINI_API_KEY` ready

2. **OpenAI API** (Fallback)  
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Generate API key in Account Settings  
   - Keep `OPENAI_API_KEY` ready

3. **Judge0 API** (Code Execution)  
   - Sign up at [Judge0](https://judge0.com/)
   - Get your `JUDGE0_API_KEY` and `JUDGE0_HOST_URL`

4. **Deepgram API** (Speech-to-Text)  
   - Sign up at [Deepgram](https://deeply.ai/)
   - Generate API key in Console  
   - Keep `DEEPGRAM_API_KEY` ready

5. **Google OAuth** (Optional)  
   - Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)
   - Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Installation Steps

#### Step 1: Clone Repository

```bash
# Clone via HTTPS
git clone https://github.com/HeetShah71004/AIIP.git
cd AIIP

# Or clone via SSH
git clone git@github.com:HeetShah71004/AIIP.git
cd AIIP
```

#### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your API keys and configuration
nano .env  # (or use your preferred editor)
```

**Backend .env Template:**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aiip

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Code Execution
JUDGE0_API_KEY=your_judge0_key
JUDGE0_HOST_URL=https://judge0-ce.p.rapidapi.com

# Speech Processing
DEEPGRAM_API_KEY=your_deepgram_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Step 3: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Frontend .env Template:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Interv AI
```

### Running the Application

#### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
# Backend runs at http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

Access the application at: **http://localhost:5173**

#### Production Build

```bash
# Build frontend
cd frontend
npm run build
# Output: dist/

# Build backend (if needed)
cd ../backend
npm run build
```

---

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login with JWT
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh JWT token

### Interview Endpoints
- `POST /api/interview/start` - Start new interview session
- `GET /api/interview/:id` - Get interview details
- `POST /api/interview/:id/submit` - Submit answer
- `GET /api/interview/history` - Get user interview history
- `DELETE /api/interview/:id` - Delete session

### Resume Endpoints
- `POST /api/resume/upload` - Upload & parse resume
- `GET /api/resume/:id` - Get resume data
- `PUT /api/resume/:id` - Update resume
- `POST /api/resume/generate-questions` - Generate questions from resume

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/performance` - Performance breakdown
- `GET /api/analytics/skills` - Skill progression
- `GET /api/analytics/export` - Export report (PDF/CSV)

### Code Execution
- `POST /api/code/execute` - Execute code snippet

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Generate coverage reports
npm test -- --coverage
```

---

## 🔒 Security Considerations

1. **Authentication**: JWT tokens with 24-hour expiration
2. **Password Security**: Bcrypt hashing with 12 salt rounds
3. **CORS**: Configured to accept only frontend domain
4. **HTTPS**: Enforced in production
5. **Rate Limiting**: Max 100 requests per minute per IP
6. **Input Validation**: Sanitized all user inputs
7. **Environment Variables**: No secrets in code
8. **API Keys**: Rotated monthly, never logged

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and commit: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📊 Performance Metrics

- **Interview Generation**: < 3 seconds (AI response)
- **Resume Parsing**: < 2 seconds (file upload)
- **Code Execution**: < 5 seconds (Judge0)
- **Page Load Time**: < 1.5 seconds (Vite optimized)
- **API Response Time**: < 500ms (average)
- **Database Query**: < 100ms (indexed)

---

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team & Credits

**Original Authors:**
- Heet Shah [@HeetShah71004](https://github.com/HeetShah71004)

**Special Thanks To:**
- Google Gemini AI team for LLM capabilities
- Judge0 for code execution infrastructure
- MongoDB for database services
- Deepgram for speech processing

---

## 📞 Support & Contact

For support, feature requests, or bug reports:

- **Email**: intervaiplatform@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/HeetShah71004/AIIP/issues)
- **Discord Community**: [Join our server](#) (coming soon)

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB University](https://university.mongodb.com/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Judge0 API Reference](https://rapidapi.com/judge0-official/api/judge0-ce)

---

## 📈 Roadmap

### Phase 1 (Current) ✅
- ✅ Core interview platform
- ✅ Resume parsing & tailored questions
- ✅ AI feedback system
- ✅ Performance analytics

### Phase 2 (Q2 2024)
- 🔄 Peer interview matching
- 🔄 Video recording & playback
- 🔄 Advanced skill radar

### Phase 3 (Q3 2024)
- 🔄 Gamification system
- 🔄 Mobile app (React Native)
- 🔄 AI tutor chatbot

### Phase 4 (Q4 2024)
- 🔄 Recruiter dashboard
- 🔄 Multi-language support
- 🔄 Advanced AR features

---

**Last Updated**: April 2024  
**Version**: 2.0.0  
**Maintained By**: Heet Shah

---

Developed with ❤️ for the future of interview preparation.
