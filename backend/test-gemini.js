import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const testGemini = async () => {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing with key:', key ? key.substring(0, 5) + '...' : 'undefined');
  
  if (!key) {
    console.error('No GEMINI_API_KEY found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(key);
  const models = ['models/gemini-2.0-flash', 'models/gemini-2.5-flash'];
  
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, are you there?");
      const response = await result.response;
      console.log(`Success with ${modelName}:`, response.text().substring(0, 50));
      return;
    } catch (error) {
      console.error(`Error with ${modelName}:`, error.message);
    }
  }
};

testGemini();
