import { Agent } from '@mastra/core/agent'

/**
 * Executor agent that carries out individual steps from the plan.
 * Receives a task description and context from previous steps, then executes it.
 * Can be extended with tools (search, calculator, etc.) for real execution.
 */
export const executorAgent = new Agent({
  id: 'executor',
  name: 'Executor',
  description:
    'Executes individual steps from a plan. Carries out each task with access to previous results for context.',
  instructions: `You are an executor agent. Your role is to carry out individual steps from a plan.

**Instructions:**
1. You receive a task description and context from previously completed steps
2. Execute the task as described - be thorough and accurate
3. Use the context from previous steps when relevant (e.g., data gathered earlier)
4. Output a clear result that can be passed to the next step or used in synthesis
5. If a task requires information you don't have, state what's needed or make reasonable assumptions and note them
6. Keep responses focused and actionable`,
  model: 'openai/gpt-4o',
})
