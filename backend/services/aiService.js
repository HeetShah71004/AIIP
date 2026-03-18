import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mock AI evaluation for development if API key is missing
const mockEvaluate = async (question, answer) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
  
  const score = Math.floor(Math.random() * 4) + 6; // Score between 6-10
  return {
    score,
    clarity: score - 1,
    depth: score - 2,
    relevance: score,
    analysis: "This is a mock analysis of your answer. To get real AI feedback, please add an OpenAI_API_KEY or GEMINI_API_KEY to your .env file.",
    strengths: ["Clear communication", "Good technical understanding"],
    weaknesses: ["Could be more detailed", "Minor inaccuracies"],
    suggestions: ["Try to include more real-world examples", "Explain the 'why' behind the technical concepts"]
  };
};

export const evaluateAnswer = async (question, answer) => {
  const prompt = `
    Evaluate the following interview answer for the given question.
    Question: "${question}"
    User Answer: "${answer}"
    
    Provide a detailed evaluation in JSON format with exactly the following fields:
    - score (number, 1-10)
    - clarity (number, 1-10)
    - depth (number, 1-10)
    - relevance (number, 1-10)
    - analysis (string)
    - strengths (array of strings)
    - weaknesses (array of strings)
    - suggestions (array of strings)
    
    IMPORTANT: Return ONLY the JSON object, no other text.
  `;

  // 1. Try Gemini first if key exists
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Confirmed working model for this key
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Gemini Evaluation Error:', error.message);
      // Fall through to OpenAI or Mock
    }
  }

  // 2. Try OpenAI if key exists
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI Evaluation Error:', error);
      // Fall through to Mock
    }
  }

  // 3. Fallback to mock
  return await mockEvaluate(question, answer);
};

export const generateQuestionsFromResume = async (resumeData, totalQuestions = 5) => {
  const prompt = `
    Based on the following resume/profile data, generate ${totalQuestions} technical and behavioral interview questions tailored to the candidate's experience, skills, and projects.
    
    Resume Data:
    ${JSON.stringify(resumeData, null, 2)}
    
    Provide the result in JSON format with exactly the following field:
    - questions (array of strings)
    
    IMPORTANT: Return ONLY the JSON object, no other text.
  `;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedJson).questions;
    } catch (error) {
      console.error('Gemini Question Generation Error:', error.message);
    }
  }

  // Fallback to generic questions if AI fails
  return [
    "Tell me about your most challenging project.",
    "How do you stay updated with the latest technologies?",
    "Describe a time you had to work with a difficult team member.",
    "What are your strengths and weaknesses?",
    "Where do you see yourself in five years?"
  ].slice(0, totalQuestions);
};

export const extractStructuredDataFromResume = async (text) => {
  const prompt = `
    Extract structured information from the following resume text. 
    Analyze the text carefully to identify the candidate's professional title, primary technical stack, all technical skills, key projects, and education history.

    Resume Text:
    "${text}"

    Provide the result in JSON format with exactly the following fields:
    - developerTitle (string, e.g., "Full Stack Developer")
    - primaryStack (string, e.g., "MERN Stack")
    - skills (array of strings, e.g., ["JavaScript", "React", "Node.js"])
    - projects (array of objects with "name" and "languages" array, e.g., [{"name": "E-commerce App", "languages": ["React", "Firebase"]}])
    - education (array of objects with "degree" and "school", e.g., [{"degree": "B.Tech in CS", "school": "University of Tech"}])

    IMPORTANT: Return ONLY the JSON object, no other text.
  `;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text();
      
      const cleanedJson = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Gemini Resume Parsing Error:', error.message);
      throw error; // Let controller handle fallback
    }
  }

  throw new Error('AI Service Unavailable');
};
