import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Connection, Client } from '@temporalio/client';
import { TASK_QUEUE, CadenceStep } from '@apps/shared';
import { CadenceService } from './cadence.service';

@Injectable()
export class EnrollmentService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private connection: Connection;

  constructor(private readonly cadenceService: CadenceService) {}

  async onModuleInit() {
    this.ensureConnection();
  }

  private async ensureConnection() {
    const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    while (true) {
      try {
        this.connection = await Connection.connect({ address });
        this.client = new Client({ connection: this.connection });
        console.log(`Connected to Temporal at ${address}`);
        return;
      } catch (err) {
        console.log(`[WAITING] API could not connect to Temporal at ${address}. Retrying in 5s...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async onModuleDestroy() {
    await this.connection?.close();
  }

  async enroll(cadenceId: string, contactEmail: string) {
    if (!this.client) throw new Error('Temporal client not ready');
    
    const cadence = this.cadenceService.findOne(cadenceId);
    const workflowId = `enrollment-${cadenceId}-${contactEmail}`;

    await this.client.workflow.start('cadenceWorkflow', {
      args: [cadence.steps],
      taskQueue: TASK_QUEUE,
      workflowId,
    });

    return { enrollmentId: workflowId, status: 'STARTED' };
  }

  async getStatus(enrollmentId: string) {
    if (!this.client) return { status: 'ERROR', error: 'Temporal client not ready' };
    
    const handle = this.client.workflow.getHandle(enrollmentId);
    try {
      return await handle.query('getState');
    } catch (err) {
      // If query fails, check if workflow is completed
      try {
        const desc = await handle.describe();
        if (desc.status.name === 'COMPLETED') return { status: 'COMPLETED' };
      } catch (e) {}
      return { status: 'UNKNOWN', error: err.message };
    }
  }

  async updateCadence(enrollmentId: string, steps: CadenceStep[]) {
    if (!this.client) throw new Error('Temporal client not ready');
    const handle = this.client.workflow.getHandle(enrollmentId);
    await handle.signal('updateCadence', steps);
    return { success: true };
  }
}
