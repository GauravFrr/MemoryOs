import { Queue } from 'bullmq';

async function main() {
  const connection = { host: 'localhost', port: 6379 };
  const extractQueue = new Queue('memory-extraction', { connection });
  const embedQueue = new Queue('embeddings', { connection });

  console.log('Extract Queue Jobs:');
  const extractJobs = await extractQueue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
  for (const job of extractJobs) {
    console.log(`Job ${job.id} [${await job.getState()}]: ${job.failedReason || 'Success'}`);
  }

  console.log('Embed Queue Jobs:');
  const embedJobs = await embedQueue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
  for (const job of embedJobs) {
    console.log(`Job ${job.id} [${await job.getState()}]: ${job.failedReason || 'Success'}`);
  }

  process.exit(0);
}

main().catch(console.error);
