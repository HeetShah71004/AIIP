/**
 * Adaptive Difficulty Service
 * Implements Elo-style difficulty adjustment for interview questions
 */

const DIFFICULTY_LEVELS = {
  'Easy': 0,
  'Medium': 1,
  'Hard': 2
};

const REVERSE_DIFFICULTY = {
  0: 'Easy',
  1: 'Medium',
  2: 'Hard'
};

const ELO_CONFIG = {
  K_FACTOR: 32, // Controls rating change magnitude
  BASE_RATING: 1400,
  DIFFICULTY_DELTAS: {
    'Easy': -200,
    'Medium': 0,
    'Hard': 200
  }
};

/**
 * Calculate expected score based on Elo ratings
 * @param {number} userRating - User's Elo rating
 * @param {number} questionDifficulty - Question difficulty level (0=Easy, 1=Medium, 2=Hard)
 * @returns {number} Expected score (0-1)
 */
const calculateExpectedScore = (userRating, questionDifficulty) => {
  const questionRating = ELO_CONFIG.BASE_RATING + ELO_CONFIG.DIFFICULTY_DELTAS[REVERSE_DIFFICULTY[questionDifficulty]];
  return 1 / (1 + Math.pow(10, (questionRating - userRating) / 400));
};

/**
 * Update user Elo rating based on answer performance
 * @param {number} userRating - Current user Elo rating
 * @param {number} score - Answer score (0-10)
 * @param {number} questionDifficulty - Question difficulty (0=Easy, 1=Medium, 2=Hard)
 * @returns {number} New user rating
 */
const updateEloRating = (userRating, score, questionDifficulty) => {
  const normalizedScore = score / 10; // Convert to 0-1 scale
  const expectedScore = calculateExpectedScore(userRating, questionDifficulty);
  const ratingChange = ELO_CONFIG.K_FACTOR * (normalizedScore - expectedScore);
  return Math.round(userRating + ratingChange);
};

/**
 * Calculate next question difficulty based on performance
 * Uses Elo rating to determine appropriate difficulty
 */
const calculateNextDifficulty = (newEloRating) => {
  // Map Elo rating to difficulty level
  // Easy: < 1350, Medium: 1350-1500, Hard: > 1500
  if (newEloRating < 1350) {
    return 'Easy';
  } else if (newEloRating < 1500) {
    return 'Medium';
  } else {
    return 'Hard';
  }
};

/**
 * Apply difficulty ceiling and floor constraints
 */
const clampDifficulty = (difficulty, config) => {
  const ceilingLevel = DIFFICULTY_LEVELS[config.ceiling];
  const floorLevel = DIFFICULTY_LEVELS[config.floor];
  const difficultyLevel = DIFFICULTY_LEVELS[difficulty];

  if (difficultyLevel > ceilingLevel) {
    return config.ceiling;
  }
  if (difficultyLevel < floorLevel) {
    return config.floor;
  }
  return difficulty;
};

/**
 * Process answer submission and calculate next difficulty
 * @param {Object} session - Session document
 * @param {number} score - Answer score (0-10)
 * @param {number} questionDifficulty - Current question difficulty
 * @returns {Object} { newRating, nextDifficulty }
 */
export const processAnswerDifficulty = (session, score, questionDifficulty) => {
  const questionDifficultyLevel = DIFFICULTY_LEVELS[questionDifficulty];
  
  // Update Elo rating
  const newRating = updateEloRating(
    session.difficultyRating,
    score,
    questionDifficultyLevel
  );

  // Calculate next difficulty
  let nextDifficulty = calculateNextDifficulty(newRating);

  // Apply ceiling and floor constraints
  nextDifficulty = clampDifficulty(
    nextDifficulty,
    session.difficultyConfig
  );

  return {
    newRating,
    nextDifficulty,
    scoreCategory: score >= 7 ? 'strong' : score >= 4 ? 'moderate' : 'weak'
  };
};

/**
 * Select a random question of given difficulty
 * Queries question bank for appropriate difficulty
 */
export const selectQuestionByDifficulty = async (
  difficulty,
  filters = {}
) => {
  const QuestionBank = (await import('../models/QuestionBank.js')).default;

  const query = { difficulty, ...filters };
  
  const question = await QuestionBank.findOne(query)
    .lean()
    .exec();

  return question;
};

export default {
  processAnswerDifficulty,
  selectQuestionByDifficulty,
  updateEloRating,
  calculateExpectedScore,
  calculateNextDifficulty,
  clampDifficulty
};
