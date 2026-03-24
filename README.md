# Interv AI 🚀

**Interv AI** is a cutting-edge, AI-powered mock interview platform designed to help candidates prepare for technical and behavioral interviews with confidence. By leveraging advanced Large Language Models (LLMs) like Google Gemini and OpenAI, Interv AI provides a realistic, interactive, and personalized preparation experience.

---

## ✨ Key Features

### 🎙️ AI-Powered Mock Interviews
- **Realistic Conversations**: Engage in natural, context-aware dialogue with an AI interviewer.
- **Company-Specific Prep**: Choose from top-tier companies (e.g., Google, Amazon, Meta, Netflix) to get tailored interview questions and scenarios.
- **Role-Based Scenarios**: Prepare for specific roles such as Software Engineer, Frontend Developer, Backend Developer, or Full Stack Engineer.

### 📄 Resume-Driven Customization
- **Intelligent Parsing**: Upload your resume (PDF or DOCX), and our AI will analyze your experience, skills, and projects to generate hyper-personalized interview questions.
- **Skill Alignment**: Ensure your preparation matches the roles you're applying for by aligning interview topics with your actual background.

### 💻 Integrated Code Playground (IDE)
- **Multi-Language Support**: Write and test code in Python, JavaScript, Java, C++, and more.
- **Monaco Editor**: A professional-grade coding experience powered by the same engine behind VS Code.
- **Real-Time Execution**: Instantly run your code and see outputs using the integrated Judge0 API.
- **Resizable Interface**: A 0-100% resizable three-panel layout (Code Editor, Terminal/Output, and Voice/Chat) for a distraction-free environment.

### 📊 Advanced Analytics & Instant Feedback
- **Detailed Scoring**: Receive immediate feedback on your performance, including scoring for communication, technical accuracy, and problem-solving.
- **Progress Tracking**: Visualize your growth over time with rich charts and statistics on your personal dashboard.
- **Session History**: Revisit past interviews, review feedback, and track your improvement journey.

### 🌓 Premium User Experience
- **Seamless Authentication**: Secure login and signup with Google OAuth and JWT-based session management.
- **Thematic Consistency**: Fully responsive design with beautiful Dark and Light modes.
- **Modern UI**: Built with Tailwind CSS and Radix UI for a sleek, accessible, and high-performance interface.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **IDE Engine**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Visualizations**: [Recharts](https://recharts.org/) & [Chart.js](https://www.chartjs.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **State Management**: React Context API
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **AI Integration**: [Google Gemini AI API](https://ai.google.dev/) & [OpenAI API](https://openai.com/api/)
- **Authentication**: JWT (JSON Web Tokens) & [Bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)
- **Storage & Assets**: [Cloudinary](https://cloudinary.com/) & [Multer](https://github.com/expressjs/multer)
- **Parsing**: `mammoth` (DOCX) & `pdf-parse` (PDF)
- **Code Execution**: [Judge0 API](https://judge0.com/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas)
- **API Keys**:
  - Google Gemini API Key
  - Cloudinary Credentials
  - Judge0 RapidAPI Key (Optional, for code execution)
  - Google Client ID (For Google OAuth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aip.git
   cd aip
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

Create a `.env` file in the `backend` directory and add the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Judge0 (RapidAPI)
JUDGE0_HOST=judge0-ce.p.rapidapi.com
JUDGE0_KEY=your_rapidapi_key
```

### Running Locally

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Development Server:**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).

---

Developed with ❤️ by the Interv AI Team.
