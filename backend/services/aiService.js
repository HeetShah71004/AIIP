import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to extract and repair JSON from AI response
const extractJson = (text) => {
  try {
    // 1. Strip markdown backticks
    let cleaned = text.replace(/```json|```/g, '').trim();

    // 2. Find the first '{'
    const start = cleaned.indexOf('{');
    if (start === -1) return JSON.parse(cleaned);

    cleaned = cleaned.substring(start);

    // 3. Try standard parse first
    try {
      const end = cleaned.lastIndexOf('}');
      if (end !== -1) {
        return JSON.parse(cleaned.substring(0, end + 1));
      }
    } catch (e) { }

    // 4. Advanced Repair: Brute-force balance braces and brackets for truncated responses
    let repairAttempt = cleaned.trim();
    // Remove any trailing fragments like a partial key or value
    repairAttempt = repairAttempt.replace(/,[^,]*$/, "").replace(/"[^"]*$/, "").trim();

    const maxRetries = 10;
    let currentSuffix = "";

    // Attempting to close open structures
    const tryRepair = (str) => {
      let openBraces = (str.match(/{/g) || []).length - (str.match(/}/g) || []).length;
      let openBrackets = (str.match(/\[/g) || []).length - (str.match(/\]/g) || []).length;

      let suffix = "";
      for (let i = 0; i < openBrackets; i++) suffix += "]";
      for (let i = 0; i < openBraces; i++) suffix += "}";

      try { return JSON.parse(str + suffix); } catch (e) { return null; }
    };

    // Try various cleanup levels before balancing
    const results = [
      tryRepair(repairAttempt),
      tryRepair(repairAttempt.replace(/,\s*$/, "")),
      tryRepair(repairAttempt.replace(/"[^"]*$/, "").replace(/:\s*$/, "").replace(/,\s*$/, "")),
      tryRepair(repairAttempt.replace(/\{[^{]*$/, "")) // Go back one level
    ];

    const valid = results.find(r => r !== null);
    if (valid) return valid;

    return JSON.parse(text.trim()); // Final fallback to trigger error with full text
  } catch (error) {
    console.error('JSON Extraction/Repair Failed. Raw text sample:', text.substring(0, 500));
    throw new Error('Failed to parse AI response as JSON');
  }
};

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
    You are a strict technical interviewer. Evaluate the candidate's answer for the following question.
    
    TIPS FOR EVALUATION:
    - Be professional and direct.
    - If the answer is strong, explain why it's good but keep it brief.
    - If there are gaps, provide highly specific technical suggestions.
    - CRITICAL: If the answer is completely irrelevant, nonsensical, gibberish (e.g., 'asdasd', '12345'), or a placeholder (e.g., 'test', 'skip', 'idk'), YOU MUST GIVE A SCORE OF 0. Do not give partial credit for "trying".

    FEW-SHOT EXAMPLES:
    Example 1 (Partial Credit):
    Question: "What is a closure in JavaScript?"
    User Answer: "It's a function inside a function."
    Evaluation: {
      "score": 4,
      "clarity": 5,
      "depth": 3,
      "relevance": 8,
      "analysis": "While technically correct that it involves nested functions, it lacks the crucial concept of 'lexical environment' and scope persistence.",
      "strengths": ["Basic structural understanding"],
      "weaknesses": ["Missing core definition of lexical scope"],
      "suggestions": ["Explain how closures 'remember' variables from outer scopes."]
    }

    Example 2 (Nonsense - MUST SCORE 0):
    Question: "How do you handle scaling in a production environment?"
    User Answer: "hvghvx 2656+ bwhxjbhxjb"
    Evaluation: {
      "score": 0,
      "clarity": 0,
      "depth": 0,
      "relevance": 0,
      "analysis": "The answer provided is nonsensical gibberish and does not address the question.",
      "strengths": [],
      "weaknesses": ["Completely irrelevant input"],
      "suggestions": ["Please provide a professional technical response."]
    }

    YOUR TARGET:
    Question: "${question}"
    User Answer: "${answer}"
    
    Provide a detailed evaluation in JSON format with exactly the following fields:
    - score (number, 0-10)
    - clarity (number, 0-10)
    - depth (number, 0-10)
    - relevance (number, 0-10)
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
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return extractJson(text);
    } catch (error) {
      console.error('Gemini Evaluation Error:', error.message);
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
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI Evaluation Error:', error);
    }
  }

  // 3. Fallback to mock
  return await mockEvaluate(question, answer);
};

export const generateFollowUpQuestion = async (previousQuestion, previousAnswer, evaluation) => {
  const prompt = `
    You are an expert technical interviewer. Based on the candidate's last answer and your evaluation, generate a single, context-aware follow-up question.
    
    CONTEXT:
    Previous Question: "${previousQuestion}"
    Candidate Answer: "${previousAnswer}"
    Weaknesses Identified: ${evaluation.weaknesses.join(', ')}
    Suggestions: ${evaluation.suggestions.join(', ')}
    
    GOAL:
    - If the answer was weak (score < 6), ask a question that helps them clarify or dive into the missing pieces.
    - If the answer was strong (score >= 8), ask a more advanced or challenging question related to the same topic.
    - Keep the question concise and professional.
    
    FEW-SHOT EXAMPLE:
    Evaluation Weakness: "Missing the core definition of closures"
    Follow-up: "Can you elaborate on how closures interact with the lexical scope and memory in JavaScript?"
    
    Provide the result in JSON format with exactly the following field:
    - question (string)
    
    IMPORTANT: Return ONLY the JSON object, no other text.
  `;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: { maxOutputTokens: 2000, temperature: 0.8 }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return extractJson(text).question;
    } catch (error) {
      console.error('Gemini Follow-up Generation Error:', error.message);
    }
  }

  return "Building on that, can you explain how you would handle this in a large-scale production environment?";
};

export const generateQuestionsFromResume = async (resumeData, totalQuestions = 5) => {
  const prompt = `
    Based on the following resume/profile data, generate ${totalQuestions} technical and behavioral interview questions.
    
    Resume Data:
    ${JSON.stringify(resumeData, null, 2)}
    
    Provide the result in JSON format with exactly the following field:
    - questions (array of strings)
    
    IMPORTANT: Return ONLY the JSON object, no other text.
  `;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: { maxOutputTokens: 2000 }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return extractJson(text).questions;
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
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: { maxOutputTokens: 4000 }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return extractJson(text);
    } catch (error) {
      console.error('Gemini Resume Parsing Error:', error.message);
      throw error; // Let controller handle fallback
    }
  }

  throw new Error('AI Service Unavailable');
};

export const generateTargetedQuestions = async (company, roleLevel, interviewRound, totalQuestions = 5) => {
  const prompt = `
    Generate ${totalQuestions} advanced interview questions.
    Target Company: ${company || 'General Tech Company'}
    Role Level: ${roleLevel || 'Mid-Level'}
    Interview Round: ${interviewRound || 'Technical'}
    
    FEW-SHOT EXAMPLE:
    Round: "System Design"
    Question: "How would you design a rate-limiter for a public API that handles 100k requests per second?"
    
    Provide the result in JSON format with exactly the following field:
    - questions (array of strings)
    
    IMPORTANT: Return ONLY the JSON object, no other text.
  `;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: { maxOutputTokens: 2000 }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return extractJson(text).questions;
    } catch (error) {
      console.error('Gemini Targeted Generation Error:', error.message);
    }
  }

  // Fallback to generic questions if AI fails
  return [
    `Tell me about your experience related to a ${roleLevel || 'Mid'} level role.`,
    `How would you design a highly scalable system for ${company || 'this company'}?`,
    "What is the most difficult technical challenge you have faced and how did you resolve it?",
    "How do you handle disagreements with stakeholders or team members?",
    "Explain an algorithm to traverse a binary tree and find the lowest common ancestor."
  ].slice(0, totalQuestions);
};

