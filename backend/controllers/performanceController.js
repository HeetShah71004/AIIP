import * as aiService from '../services/aiService.js';

export async function predictPerformance(req, res) {
  try {
    const { scoreHistory, skillGaps } = req.body;
    if (!scoreHistory || !skillGaps) {
      return res.status(400).json({ message: 'Score history and skill gaps are required' });
    }

    const prediction = await aiService.predictPerformance(scoreHistory, skillGaps);
    res.json(prediction);
  } catch (error) {
    console.error('Error predicting performance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
