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

| Phase | Frontend | Backend |
| :--- | :--- | :--- |
| **01** | **Login & Signup UI**<br>Email/password forms, validation, skeleton loading, responsive layouts. | **Express Server & MongoDB**<br>Modular routes, Mongoose schemas (User, Session, Question), middleware. |
| **02** | **Protected Routes**<br>Route guards with React Router. Persistent sessions via localStorage & refresh tokens. | **JWT Authentication**<br>Auth endpoints, bcrypt hashing, access/refresh token pair, logout blacklist. |
| **03** | **Dashboard UI**<br>Overview cards (sessions, scores), quick-start button, activity feed. | **Resume Upload API**<br>Multer storage (Disk/S3), file-type whitelist (PDF/DOCX), 5MB limit. |
| **04** | **Resume Upload Page UI**<br>Drag-and-drop zone, upload progress bar, parsed preview panel. | **Resume Text Extraction**<br>pdf-parse + mammoth. Strip boilerplate, return structured skill/edu data. |

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
