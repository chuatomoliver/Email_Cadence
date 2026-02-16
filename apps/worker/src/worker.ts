import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';
import { TASK_QUEUE } from '@apps/shared';

async function run() {
  const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  let connection;

  while (true) {
    try {
      connection = await NativeConnection.connect({
        address: address,
      });
      break;
    } catch (err) {
      console.log(`[WAITING] Could not connect to Temporal at ${address}. Retrying in 5s...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  try {
    const worker = await Worker.create({
      workflowsPath: require.resolve('./workflows'),
      activities,
      taskQueue: TASK_QUEUE,
      connection,
    });

    console.log(`Worker started, connected to Temporal at ${address}`);
    await worker.run();
  } catch (err) {
    console.error('Worker failed:', err);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
