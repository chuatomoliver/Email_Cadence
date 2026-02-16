export type CadenceStep = 
  | {
      id: string;
      type: 'SEND_EMAIL';
      subject: string;
      body: string;
    }
  | {
      id: string;
      type: 'WAIT';
      seconds: number;
    };

export interface Cadence {
  id: string;
  name: string;
  steps: CadenceStep[];
}

export interface WorkflowState {
  currentStepIndex: number;
  stepsVersion: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  steps: CadenceStep[];
}

export const TASK_QUEUE = 'email-cadence-task-queue';
