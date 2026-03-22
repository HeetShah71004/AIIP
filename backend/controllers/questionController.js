import QuestionBank from '../models/QuestionBank.js';

// Get all questions from the bank with filtering and pagination
export const getQuestions = async (req, res) => {
  try {
    const { category, difficulty, company, roleLevel, interviewRound, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (company) query.companyTags = { $in: [company] };
    if (roleLevel) query.roleLevel = roleLevel;
    if (interviewRound) query.interviewRound = interviewRound;
    if (search) query.text = { $regex: search, $options: 'i' };

    const total = await QuestionBank.countDocuments(query);
    const questions = await QuestionBank.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.status(200).json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalQuestions: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await QuestionBank.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new question in the bank (Admin only potentially)
export const createQuestion = async (req, res) => {
  const { text, category, difficulty, companyTags } = req.body;
  const newQuestion = new QuestionBank({ text, category, difficulty, companyTags });

  try {
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Seed the question bank (Internal use)
export const seedQuestions = async (req, res) => {
  const { questions } = req.body;
  try {
    await QuestionBank.insertMany(questions);
    res.status(201).json({ message: `${questions.length} questions seeded successfully` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
