import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const keysRaw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const apiKeys = keysRaw.split(',').map((k: string) => k.trim()).filter(Boolean);
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    console.log(`\nChecking key ${i}...`);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      if (data.models) {
        const embeddingModels = data.models.filter((m: any) => m.name.includes('embedding'));
        console.log('Available embedding models:');
        embeddingModels.forEach((m: any) => console.log(m.name));
      } else {
        console.error('Failed to list models:', data.error?.message || data);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

main().catch(console.error);
