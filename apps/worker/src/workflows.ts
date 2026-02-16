import {
  proxyActivities,
  defineQuery,
  defineSignal,
  setHandler,
  sleep,
  condition,
} from '@temporalio/workflow';
import type { CadenceStep, WorkflowState } from '@apps/shared';
import type * as activities from './activities';

const { sendEmailActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const getStateQuery = defineQuery<WorkflowState>('getState');
export const updateCadenceSignal = defineSignal<[CadenceStep[]]>('updateCadence');

export async function cadenceWorkflow(initialSteps: CadenceStep[]): Promise<void> {
  let steps = initialSteps;
  let currentStepIndex = 0;
  let stepsVersion = 1;

  setHandler(getStateQuery, () => ({
    currentStepIndex,
    stepsVersion,
    status: currentStepIndex >= steps.length ? 'COMPLETED' : 'RUNNING',
    steps,
  }));

  setHandler(updateCadenceSignal, (newSteps) => {
    steps = newSteps;
    stepsVersion++;
    // The requirement says: Already completed steps remain completed.
    // Keep currentStepIndex.
    // If new steps length <= currentStepIndex, the loop will naturally terminate.
  });

  while (currentStepIndex < steps.length) {
    const step = steps[currentStepIndex];

    if (step.type === 'SEND_EMAIL') {
      await sendEmailActivity(step.subject, step.body);
      currentStepIndex++;
    } else if (step.type === 'WAIT') {
      const versionBeforeWait = stepsVersion;
      
      // Wait for specified seconds OR until steps are updated
      await condition(
        () => stepsVersion !== versionBeforeWait,
        step.seconds * 1000
      );
      
      // If version hasn't changed, it means the condition timed out naturally.
      // Move to next step.
      if (stepsVersion === versionBeforeWait) {
        currentStepIndex++;
      }
      // If version CHANGED, condition returned true. 
      // We don't increment currentStepIndex, so the loop re-runs with the same index and new steps.
    }
  }
}
