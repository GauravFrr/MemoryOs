import { PrismaClient } from '@prisma/client';
import { AiService } from './src/ai/ai.service';
import { PrismaService } from './src/prisma/prisma.service';
import { SearchService } from './src/search/search.service';
import { InjectService } from './src/inject/inject.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const prismaService = new PrismaService();
  const aiService = new AiService(prismaService);
  const searchService = new SearchService(prismaService);
  const injectService = new InjectService(aiService, searchService, prismaService);

  // Get a user and project from the DB
  const users: any[] = await prismaService.$queryRawUnsafe(`SELECT DISTINCT user_id FROM memories LIMIT 1`);
  const userId = users[0]?.user_id;

  if (!userId) {
    console.log('No users found with memories.');
    process.exit(0);
  }

  // Find a project ID associated with this user, or just pass null
  const projects: any[] = await prismaService.$queryRawUnsafe(`SELECT DISTINCT project_id FROM memories WHERE user_id = $1::uuid AND project_id IS NOT NULL LIMIT 1`, userId);
  const projectId = projects[0]?.project_id;

  console.log(`Testing with user: ${userId}, project: ${projectId}`);

  // Test 1: With Topic
  console.log('\n--- TEST 1: WITH TOPIC ---');
  const result1 = await injectService.buildContext(userId, {
    platform: 'chatgpt',
    project_id: projectId,
    topic: 'dark mode preferences',
    max_tokens: 1000
  });
  console.log('Context String:\n', result1.context_string);
  console.log('Memories Used:', result1.memories_used);
  console.log('Token Estimate:', result1.token_estimate);

  // Test 2: Without Topic
  console.log('\n--- TEST 2: WITHOUT TOPIC ---');
  const result2 = await injectService.buildContext(userId, {
    platform: 'claude',
    project_id: projectId,
    max_tokens: 1000
  });
  console.log('Context String:\n', result2.context_string);
  console.log('Memories Used:', result2.memories_used);
  console.log('Token Estimate:', result2.token_estimate);

  process.exit(0);
}

main().catch(console.error);
