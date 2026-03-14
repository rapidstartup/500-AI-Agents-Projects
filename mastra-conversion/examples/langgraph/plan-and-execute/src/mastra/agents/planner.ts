import { Agent } from '@mastra/core/agent'
import { z } from 'zod'

/**
 * Task schema for structured plan output.
 * Each task has an id, description, and optional dependencies.
 */
export const taskSchema = z.object({
  id: z.number().describe('Unique step identifier (1-based index)'),
  description: z.string().describe('Clear, actionable description of the step'),
})

export const planSchema = z.object({
  tasks: z
    .array(taskSchema)
    .describe('Ordered list of sub-steps to accomplish the objective'),
})

export type Task = z.infer<typeof taskSchema>
export type Plan = z.infer<typeof planSchema>

/**
 * Planner agent that breaks complex objectives into ordered sub-steps.
 * Uses structured output (Zod) to return a list of tasks for the executor.
 */
export const plannerAgent = new Agent({
  id: 'planner',
  name: 'Planner',
  description:
    'Breaks down complex objectives into ordered, actionable sub-steps. Outputs a structured plan for the executor agent.',
  instructions: `You are a strategic planner. Your role is to analyze complex objectives and break them into clear, ordered sub-steps.

**Instructions:**
1. Given a user objective, decompose it into 2-8 discrete, actionable steps
2. Each step should be self-contained and executable by an agent with tools
3. Order steps logically (e.g., gather data before analyzing, research before writing)
4. Keep step descriptions clear and specific - avoid vague language
5. If the objective is simple, 1-2 steps may suffice
6. Number steps starting from 1

**Output format:** Return a JSON object with a "tasks" array. Each task has:
- id: step number (1, 2, 3, ...)
- description: clear description of what to do`,
  model: 'openai/gpt-4o',
})
