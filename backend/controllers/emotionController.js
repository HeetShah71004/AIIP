import * as aiService from '../services/aiService.js';

export async function analyzeEmotion(req, res) {
  try {
    const { audio } = req.body;
    if (!audio) {
      return res.status(400).json({ message: 'Audio data is required' });
    }

    const confidenceScore = await aiService.getEmotionConfidence(audio);
    res.json({ confidenceScore });
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
