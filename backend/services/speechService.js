const DEEPGRAM_BASE_URL = 'https://api.deepgram.com/v1/listen';

const parseWords = (words = []) => {
  if (!Array.isArray(words)) return [];

  return words.map((word) => ({
    word: word.word || '',
    start: Number.isFinite(word.start) ? word.start : null,
    end: Number.isFinite(word.end) ? word.end : null,
    confidence: Number.isFinite(word.confidence) ? word.confidence : null,
    speaker: Number.isFinite(word.speaker) ? word.speaker : null
  }));
};

const buildSpeakerSegments = (words = []) => {
  if (!Array.isArray(words) || words.length === 0) return [];

  const segments = [];
  for (const token of words) {
    const speaker = Number.isFinite(token.speaker) ? token.speaker : 0;

    if (!segments.length || segments[segments.length - 1].speaker !== speaker) {
      segments.push({
        speaker,
        start: Number.isFinite(token.start) ? token.start : null,
        end: Number.isFinite(token.end) ? token.end : null,
        text: token.word || ''
      });
      continue;
    }

    const last = segments[segments.length - 1];
    last.end = Number.isFinite(token.end) ? token.end : last.end;
    last.text = `${last.text} ${token.word || ''}`.trim();
  }

  return segments;
};

const resolveMimeType = (file = {}) => {
  if (file.mimetype && file.mimetype !== 'application/octet-stream') {
    return file.mimetype;
  }

  const extension = (file.originalname || '').toLowerCase().split('.').pop();
  if (extension === 'webm') return 'audio/webm';
  if (extension === 'wav') return 'audio/wav';
  if (extension === 'mp3') return 'audio/mpeg';
  if (extension === 'mp4' || extension === 'm4a') return 'audio/mp4';
  if (extension === 'ogg') return 'audio/ogg';

  return 'audio/webm';
};

export const transcribeAudioBuffer = async (file, options = {}) => {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramApiKey) {
    throw new Error('Speech service is not configured. Missing DEEPGRAM_API_KEY.');
  }

  if (!file?.buffer || !file.buffer.length) {
    throw new Error('Audio file is empty or invalid.');
  }

  const model = options.model || process.env.DEEPGRAM_MODEL || 'nova-2';
  const language = options.language || process.env.DEEPGRAM_LANGUAGE || 'en-US';
  const diarize = options.diarize !== false;
  const punctuate = options.punctuate !== false;
  const smartFormat = options.smartFormat !== false;
  const detectLanguage = options.detectLanguage === true;
  const includeUtterances = options.utterances !== false;

  const query = new URLSearchParams({
    model,
    punctuate: String(punctuate),
    smart_format: String(smartFormat),
    diarize: String(diarize),
    utterances: String(includeUtterances)
  });

  if (detectLanguage) {
    query.set('detect_language', 'true');
  } else {
    query.set('language', language);
  }

  const deepgramResponse = await fetch(`${DEEPGRAM_BASE_URL}?${query.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${deepgramApiKey}`,
      'Content-Type': resolveMimeType(file)
    },
    body: file.buffer,
    signal: AbortSignal.timeout(25000)
  });

  const raw = await deepgramResponse.json().catch(() => ({}));
  if (!deepgramResponse.ok) {
    const message = raw?.err_msg || raw?.error || `Deepgram request failed with status ${deepgramResponse.status}`;
    throw new Error(message);
  }

  const channel = raw?.results?.channels?.[0];
  const bestAlternative = channel?.alternatives?.[0] || {};
  const words = parseWords(bestAlternative.words || []);
  const utterances = Array.isArray(raw?.results?.utterances)
    ? raw.results.utterances.map((item) => ({
        speaker: Number.isFinite(item.speaker) ? item.speaker : null,
        start: Number.isFinite(item.start) ? item.start : null,
        end: Number.isFinite(item.end) ? item.end : null,
        confidence: Number.isFinite(item.confidence) ? item.confidence : null,
        transcript: item.transcript || ''
      }))
    : [];

  const utteranceTranscript = utterances
    .map((item) => item.transcript)
    .filter(Boolean)
    .join(' ')
    .trim();

  const wordTranscript = words
    .map((item) => item.word)
    .filter(Boolean)
    .join(' ')
    .trim();

  const transcript = (bestAlternative.transcript || '').trim() || utteranceTranscript || wordTranscript;

  return {
    transcript,
    confidence: Number.isFinite(bestAlternative.confidence) ? bestAlternative.confidence : null,
    detectedLanguage: channel?.detected_language || null,
    duration: Number.isFinite(raw?.metadata?.duration) ? raw.metadata.duration : null,
    words,
    speakerSegments: buildSpeakerSegments(words),
    utterances
  };
};
