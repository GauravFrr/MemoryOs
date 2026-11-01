import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { extractionPrompt } from './prompts/extraction.prompt';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private apiKeys: string[];

  constructor(private prisma: PrismaService) {
    const keysRaw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    this.apiKeys = keysRaw.split(',').map(k => k.trim()).filter(Boolean);
    if (this.apiKeys.length === 0) {
      this.logger.error('No Gemini API keys provided in environment variables.');
    }
  }

  private async logUsage(userId: string, action: string, tokens: number) {
    await this.prisma.usageLog.create({
      data: {
        userId,
        action,
        tokens,
        provider: 'gemini',
      },
    });
  }

  /**
   * Executes a text generation prompt with retries and model fallbacks.
   */
  private async executeWithFallback(prompt: string, isJson: boolean = false) {
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const generationConfig = isJson ? { responseMimeType: 'application/json' } : undefined;
        
        // Retry loop: try all available keys in sequence
        const attemptsCount = Math.max(3, this.apiKeys.length);
        for (let attempt = 1; attempt <= attemptsCount; attempt++) {
          try {
            const apiKey = this.apiKeys[(attempt - 1) % this.apiKeys.length];
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
            const result = await model.generateContent(prompt);
            return result;
          } catch (e: any) {
            this.logger.warn(`Attempt ${attempt} failed for ${modelName} using key index ${(attempt - 1) % this.apiKeys.length}: ${e.message}`);
            if (attempt === attemptsCount) throw e;
            await new Promise(resolve => setTimeout(resolve, 500 * attempt)); // Backoff
          }
        }
      } catch (error) {
        this.logger.warn(`Model ${modelName} exhausted retries. Falling back to next model...`);
        lastError = error;
      }
    }
    
    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }

  private async executeEmbeddingWithFallback(text: string) {
    let lastError = null;
    
    // Try all available keys in sequence for embedding
    const attemptsCount = Math.max(3, this.apiKeys.length);
    for (let attempt = 1; attempt <= attemptsCount; attempt++) {
      try {
        const apiKey = this.apiKeys[(attempt - 1) % this.apiKeys.length];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { parts: [{ text }] },
            outputDimensionality: 768
          })
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        return { embedding: { values: data.embedding.values } };
      } catch (e: any) {
        this.logger.warn(`Attempt ${attempt} failed for embedding gemini-embedding-2 using key index ${(attempt - 1) % this.apiKeys.length}: ${e.message}`);
        lastError = e;
        if (attempt === attemptsCount) throw e;
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
    
    throw new Error(`All embedding attempts failed. Last error: ${lastError?.message}`);
  }

  async extract(userId: string, messages: any[]) {
    try {
      const promptText = extractionPrompt(messages);
      const result = await this.executeWithFallback(promptText, true);
      const response = await result.response;
      const text = response.text();

      const parsed = JSON.parse(text);

      const usageMetadata = response.usageMetadata;
      const totalTokens = usageMetadata?.totalTokenCount || 0;

      await this.logUsage(userId, 'memory_extracted', totalTokens);

      return parsed;
    } catch (error) {
      this.logger.error(`Failed to extract memory: ${error.message}`);
      throw error;
    }
  }

  async embed(userId: string, text: string): Promise<number[]> {
    try {
      const result = await this.executeEmbeddingWithFallback(text);
      const embedding = result.embedding.values;

      await this.logUsage(userId, 'embedding_generated', 0);

      return embedding;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`);
      throw error;
    }
  }

  async summarize(userId: string, messages: any[]): Promise<string> {
    try {
      const promptText = `Summarize the following conversation in one short paragraph:\n\n${JSON.stringify(messages)}`;
      const result = await this.executeWithFallback(promptText, false);
      const response = await result.response;

      const usageMetadata = response.usageMetadata;
      const totalTokens = usageMetadata?.totalTokenCount || 0;

      await this.logUsage(userId, 'summary_generated', totalTokens);

      return response.text();
    } catch (error) {
      this.logger.error(`Failed to generate summary: ${error.message}`);
      throw error;
    }
  }
}
