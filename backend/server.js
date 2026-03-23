import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';


// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
import auth from './routes/auth.js';
import resume from './routes/resume.js';
import questions from './routes/questionRoutes.js';
import sessions from './routes/sessionRoutes.js';
import analytics from './routes/analyticsRoutes.js';
import code from './routes/codeRoutes.js';

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/resume', resume);
app.use('/api/v1/questions', questions);
app.use('/api/v1/sessions', sessions);
app.use('/api/v1/analytics', analytics);
app.use('/api/v1/code', code);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  if (err.stack) console.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});
