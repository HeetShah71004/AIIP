import https from 'node:https';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('No GEMINI_API_KEY found in .env');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Available models:');
      if (json.models) {
        json.models.forEach(m => console.log(`- ${m.name}`));
      } else {
        console.log('No models or unexpected response:', data);
      }
    } catch (e) {
      console.error('JSON Parse Error:', data);
    }
  });
}).on('error', (err) => {
  console.error('HTTPS Error:', err.message);
});
