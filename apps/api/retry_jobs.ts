import { Queue } from 'bullmq';

async function main() {
  const connection = { host: 'localhost', port: 6379 };
  const embedQueue = new Queue('embeddings', { connection });

  console.log('Fetching failed jobs...');
  const failedJobs = await embedQueue.getFailed();
  
  if (failedJobs.length === 0) {
    console.log('No failed jobs found.');
  }

  for (const job of failedJobs) {
    console.log(`Retrying job ${job.id}...`);
    await job.retry();
    console.log(`Job ${job.id} retried successfully.`);
  }

  process.exit(0);
}

main().catch(console.error);
