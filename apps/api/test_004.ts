import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const keysRaw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const apiKeys = keysRaw.split(',').map((k: string) => k.trim()).filter(Boolean);
  const genAI = new GoogleGenerativeAI(apiKeys[1]); // Use valid AIza key

  const models = ['text-embedding-004', 'gemini-embedding-001', 'gemini-embedding-2'];

  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.embedContent({
        content: { role: 'user', parts: [{ text: 'hello world' }] },
        // Some libraries use outputDimensionality or taskType
        // Let's pass parameters directly or inside taskType?
        // Actually, the API might not support it directly in embedContent
      });
      // Try to pass outputDimensionality if possible?
      // Unfortunately, the JS SDK v0.14+ doesn't expose outputDimensionality directly on embedContent in some versions, but let's try.
      console.log(`${m} succeeded. Dimension:`, result.embedding.values.length);
    } catch (e: any) {
      console.error(`${m} failed:`, e.message);
    }
  }
}

main().catch(console.error);
