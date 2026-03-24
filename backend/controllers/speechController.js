import { transcribeAudioBuffer } from '../services/speechService.js';

export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an audio file.'
      });
    }

    const transcription = await transcribeAudioBuffer(req.file, {
      language: req.body?.language,
      model: req.body?.model,
      detectLanguage: req.body?.detectLanguage === 'true' || req.body?.detectLanguage === true,
      diarize: req.body?.diarize !== 'false' && req.body?.diarize !== false,
      punctuate: req.body?.punctuate !== 'false' && req.body?.punctuate !== false,
      smartFormat: req.body?.smartFormat !== 'false' && req.body?.smartFormat !== false,
      utterances: req.body?.utterances !== 'false' && req.body?.utterances !== false
    });

    return res.status(200).json({
      success: true,
      data: transcription
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to transcribe audio.'
    });
  }
};
