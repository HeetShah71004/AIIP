import mongoose from 'mongoose';
import 'dotenv/config';
import QuestionBank from './models/QuestionBank.js';
import connectDB from './config/db.js';

const questions = [
  // Frontend
  { text: "What is the virtual DOM in React and why is it used?", category: "Frontend", difficulty: "Medium", companyTags: ["Facebook", "Uber"] },
  { text: "Explain the difference between `let`, `const`, and `var`.", category: "Frontend", difficulty: "Easy", companyTags: ["Google", "Amazon"] },
  { text: "How does CSS specificity work?", category: "Frontend", difficulty: "Easy", companyTags: ["Microsoft"] },
  { text: "Describe the event loop in JavaScript.", category: "Frontend", difficulty: "Hard", companyTags: ["Netflix", "LinkedIn"] },
  { text: "What are React Hooks and why were they introduced?", category: "Frontend", difficulty: "Medium", companyTags: ["Meta"] },
  
  // Backend
  { text: "What is a RESTful API and what are its key constraints?", category: "Backend", difficulty: "Medium", companyTags: ["Amazon", "Salesforce"] },
  { text: "Explain the difference between SQL and NoSQL databases.", category: "Backend", difficulty: "Medium", companyTags: ["Oracle", "MongoDB"] },
  { text: "How does Node.js handle concurrency despite being single-threaded?", category: "Backend", difficulty: "Hard", companyTags: ["PayPal", "LinkedIn"] },
  { text: "What is middleware in Express.js?", category: "Backend", difficulty: "Easy", companyTags: ["Airbnb"] },
  { text: "Describe how to handle authentication using JWT.", category: "Backend", difficulty: "Medium", companyTags: ["Okta", "Auth0"] },

  // Mobile
  { text: "What is the difference between Hot Reload and Hot Restart in Flutter?", category: "Mobile", difficulty: "Medium", companyTags: ["Google"] },
  { text: "Explain the React Native bridge architecture.", category: "Mobile", difficulty: "Hard", companyTags: ["Meta"] },
  { text: "How do you manage state in a large-scale mobile application?", category: "Mobile", difficulty: "Hard", companyTags: ["Uber", "Lyft"] },

  // DevOps
  { text: "What is CI/CD and why is it important in modern software development?", category: "DevOps", difficulty: "Medium", companyTags: ["Atlassian", "GitLab"] },
  { text: "Explain the concept of 'Infrastructure as Code' (IaC).", category: "DevOps", difficulty: "Medium", companyTags: ["HashiCorp", "AWS"] },
  { text: "What are Docker containers and how do they differ from Virtual Machines?", category: "DevOps", difficulty: "Easy", companyTags: ["Docker"] },

  // Behavioral
  { text: "Describe a time you had a conflict with a teammate. How did you resolve it?", category: "Behavioral", difficulty: "Medium", companyTags: ["General"] },
  { text: "What is your biggest professional achievement so far?", category: "Behavioral", difficulty: "Easy", companyTags: ["General"] },
  { text: "Where do you see yourself in five years?", category: "Behavioral", difficulty: "Easy", companyTags: ["General"] }
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing questions (optional)
    // await QuestionBank.deleteMany();
    
    await QuestionBank.insertMany(questions);
    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
