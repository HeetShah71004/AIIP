
// API mapping
const LANGUAGE_CONFIG = {
  javascript: 'js',
  python: 'py',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
  csharp: 'cs'
};

const JUDGE0_LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  go: 60,
  csharp: 51
};

const PISTON_INSTANCES = [
  'https://piston.codes/api/v2/execute',
  'https://piston.p-node.com/api/v2/execute',
  'https://emkc.org/api/v2/piston/execute'
];

const JUDGE0_PUBLIC_ENDPOINTS = [
  'https://ce.judge0.com',
  'https://extra-ce.judge0.com'
];

export const executeCode = async (req, res) => {
  try {
    const { language, code, input = "" } = req.body;

    const normalizedLanguage = String(language || '').toLowerCase();
    const langCode = LANGUAGE_CONFIG[normalizedLanguage];
    if (!langCode) {
      return res.status(400).json({ success: false, message: `Language ${language} not supported for real execution.` });
    }

    // Pre-process code (Java fix)
    let processedCode = code;
    if (normalizedLanguage === 'java') {
      // Improved Java class replacement: handles newlines and different spacing
      processedCode = code.replace(/public\s+class\s+([a-zA-Z_$][a-zA-Z\d_$]*)/, 'public class Main');
    }

    // 0. Try Judge0 (New Primary)
    const judge0Host = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
    const judge0Key = process.env.JUDGE0_KEY;

    if (judge0Key) {
      try {
        console.log('Trying Judge0...');
        const judge0Res = await fetch(`https://${judge0Host}/submissions?base64_encoded=false&wait=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': judge0Host,
            'x-rapidapi-key': judge0Key
          },
          body: JSON.stringify({
            source_code: processedCode,
            language_id: JUDGE0_LANGUAGE_IDS[normalizedLanguage],
            stdin: input
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (!judge0Res.ok) {
          throw new Error(`Judge0 HTTP ${judge0Res.status}`);
        }

        const data = await judge0Res.json();
        if (data && data.status && data.status.id <= 3) { // 3 means "Accepted"
          return res.status(200).json({
            success: true,
            data: {
              stdout: data.stdout || "",
              stderr: data.stderr || data.compile_output || "",
              output: data.stdout || data.stderr || data.compile_output || (data.status.id === 3 ? "Process finished successfully" : ""),
              code: data.status.id === 3 ? 0 : 1
            }
          });
        }

        if (data && data.status) {
          // If execution happened but errored (Runtime Error, TLE, etc.)
          return res.status(200).json({
            success: true,
            data: {
              stdout: data.stdout || "",
              stderr: data.stderr || data.compile_output || data.status.description,
              output: data.status.description + (data.stderr ? "\n" + data.stderr : ""),
              code: 1
            }
          });
        }
      } catch (e) {
        console.log('Judge0 failed/blocked:', e.message || e);
      }
    }

    // 0.1 Try public Judge0 endpoints (no API key)
    for (const endpoint of JUDGE0_PUBLIC_ENDPOINTS) {
      try {
        console.log(`Trying public Judge0: ${endpoint}...`);
        const judge0Res = await fetch(`${endpoint}/submissions?base64_encoded=false&wait=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source_code: processedCode,
            language_id: JUDGE0_LANGUAGE_IDS[normalizedLanguage],
            stdin: input
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (!judge0Res.ok) {
          throw new Error(`Judge0 public HTTP ${judge0Res.status}`);
        }

        const data = await judge0Res.json();
        if (data && data.status && data.status.id <= 3) {
          return res.status(200).json({
            success: true,
            data: {
              stdout: data.stdout || "",
              stderr: data.stderr || data.compile_output || "",
              output: data.stdout || data.stderr || data.compile_output || (data.status.id === 3 ? "Process finished successfully" : ""),
              code: data.status.id === 3 ? 0 : 1
            }
          });
        }

        if (data && data.status) {
          return res.status(200).json({
            success: true,
            data: {
              stdout: data.stdout || "",
              stderr: data.stderr || data.compile_output || data.status.description,
              output: data.status.description + (data.stderr ? "\n" + data.stderr : ""),
              code: 1
            }
          });
        }
      } catch (e) {
        console.log(`Public Judge0 ${endpoint} failed/blocked:`, e.message || e);
      }
    }

    // 1. Try CodeX first
    try {
      console.log('Trying CodeX...');
      const codexRes = await fetch('https://api.codex.jaagrav.in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: langCode, code: processedCode, input }),
        signal: AbortSignal.timeout(5000)
      });

      if (!codexRes.ok) {
        throw new Error(`CodeX HTTP ${codexRes.status}`);
      }
      
      const data = await codexRes.json();
      if (data && (data.output || data.error)) {
        return res.status(200).json({
          success: true,
          data: {
            stdout: data.output || "",
            stderr: data.error || "",
            output: data.output || data.error || "",
            code: data.error ? 1 : 0
          }
        });
      }
    } catch (e) {
      console.log('CodeX failed/blocked:', e.message || e);
    }

    // 2. Try Piston Instances in sequence
    for (const instance of PISTON_INSTANCES) {
      try {
        console.log(`Trying Piston Instance: ${instance}...`);
        const pistonPayload = {
          language: language.toLowerCase() === 'javascript' ? 'javascript' : language.toLowerCase(),
          version: '*',
          files: [{ content: processedCode }],
          stdin: input
        };

        const pistonRes = await fetch(instance, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pistonPayload),
          signal: AbortSignal.timeout(6000)
        });

        if (!pistonRes.ok) {
          throw new Error(`Piston HTTP ${pistonRes.status}`);
        }

        const pistonData = await pistonRes.json();
        if (pistonData && pistonData.run) {
          return res.status(200).json({
            success: true,
            data: {
              stdout: pistonData.run.stdout,
              stderr: pistonData.run.stderr,
              output: pistonData.run.output,
              code: pistonData.run.code
            }
          });
        }
      } catch (e) {
        console.log(`Piston ${instance} failed/blocked:`, e.message || e);
      }
    }

    // 3. Try Glot.io (Last mirror attempt)
    try {
      console.log('Trying Glot.io...');
      const glotRes = await fetch(`https://glot.io/api/run/${normalizedLanguage === 'java' ? 'java' : normalizedLanguage}/latest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [{ name: normalizedLanguage === 'java' ? 'Main.java' : 'main', content: processedCode }], stdin: input }),
        signal: AbortSignal.timeout(6000)
      });

      if (!glotRes.ok) {
        throw new Error(`Glot HTTP ${glotRes.status}`);
      }

      const glotData = await glotRes.json();
      if (glotData && (glotData.stdout || glotData.stderr)) {
        return res.status(200).json({
          success: true,
          data: {
            stdout: glotData.stdout || "",
            stderr: glotData.stderr || "",
            output: glotData.stdout || glotData.stderr || "",
            code: glotData.stderr ? 1 : 0
          }
        });
      }
    } catch (e) {
      console.log('Glot.io failed/blocked:', e.message || e);
    }

    return res.status(503).json({
      success: false,
      message: 'Execution service is temporarily unavailable. Please try again in a moment.'
    });

  } catch (error) {
    console.error('Code Execution Controller Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during code execution' });
  }
};
