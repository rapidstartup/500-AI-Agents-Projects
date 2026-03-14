import { Mastra } from '@mastra/core/mastra'
import { plannerAgent } from './agents/planner.js'
import { executorAgent } from './agents/executor.js'
import { planExecuteWorkflow } from './workflows/plan-execute-workflow.js'

export const mastra = new Mastra({
  agents: {
    plannerAgent,
    executorAgent,
  },
  workflows: {
    planExecuteWorkflow,
  },
})
