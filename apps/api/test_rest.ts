import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const keysRaw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const apiKeys = keysRaw.split(',').map((k: string) => k.trim()).filter(Boolean);
  const apiKey = apiKeys[1]; // Valid key

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text: 'hello world' }] },
      outputDimensionality: 768
    })
  });

  const data = await response.json();
  if (data.embedding) {
    console.log('Dimension with outputDimensionality: 768 =>', data.embedding.values.length);
  } else {
    console.error('Error:', data);
  }
}

main().catch(console.error);
