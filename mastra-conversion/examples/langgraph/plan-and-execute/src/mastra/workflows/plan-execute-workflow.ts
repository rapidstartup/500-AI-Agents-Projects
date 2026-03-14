import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { planSchema, type Task } from '../agents/planner.js'

// --- Input / Output schemas ---

const workflowInputSchema = z.object({
  objective: z.string().describe('The user objective or task to accomplish'),
})

const planOutputSchema = z.object({
  objective: z.string(),
  tasks: z.array(
    z.object({
      id: z.number(),
      description: z.string(),
    })
  ),
})

const executeOutputSchema = z.object({
  objective: z.string(),
  tasks: z.array(
    z.object({
      id: z.number(),
      description: z.string(),
    })
  ),
  stepResults: z.array(
    z.object({
      taskId: z.number(),
      description: z.string(),
      result: z.string(),
    })
  ),
})

const synthesizeOutputSchema = z.object({
  objective: z.string(),
  finalAnswer: z.string(),
})

// --- Steps ---

const planStep = createStep({
  id: 'plan',
  inputSchema: workflowInputSchema,
  outputSchema: planOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('plannerAgent')
    const response = await agent.generate(
      `Break down this objective into ordered sub-steps. Output a JSON object with a "tasks" array. Each task has "id" (number) and "description" (string).

Objective: ${inputData.objective}

Return ONLY valid JSON matching: { "tasks": [ { "id": 1, "description": "..." }, ... ] }`
    )
    let tasks: Task[] = []
    try {
      const parsed = planSchema.safeParse(
        typeof response.object === 'object' && response.object !== null
          ? response.object
          : JSON.parse(
              String(response.text || '{}').replace(/```json\n?|\n?```/g, '').trim()
            )
      )
      tasks = parsed.success ? parsed.data.tasks : []
    } catch {
      tasks = []
    }
    return {
      objective: inputData.objective,
      tasks,
    }
  },
})

const executeStep = createStep({
  id: 'execute',
  inputSchema: planOutputSchema,
  outputSchema: executeOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('executorAgent')
    const stepResults: { taskId: number; description: string; result: string }[] =
      []

    for (const task of inputData.tasks) {
      const context =
        stepResults.length > 0
          ? `\n\n--- Context from previous steps ---\n${stepResults
              .map(
                (s) =>
                  `Step ${s.taskId} (${s.description}):\n${s.result}`
              )
              .join('\n\n')}`
          : ''

      const prompt = `Execute this step from the plan.

Objective: ${inputData.objective}

Current step (${task.id}): ${task.description}
${context}

Carry out the step and provide a clear result.`
      const response = await agent.generate(prompt)
      stepResults.push({
        taskId: task.id,
        description: task.description,
        result: response.text,
      })
    }

    return {
      objective: inputData.objective,
      tasks: inputData.tasks,
      stepResults,
    }
  },
})

const synthesizeStep = createStep({
  id: 'synthesize',
  inputSchema: executeOutputSchema,
  outputSchema: synthesizeOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('executorAgent')
    const resultsContext = inputData.stepResults
      .map(
        (s) =>
          `Step ${s.taskId} (${s.description}):\n${s.result}`
      )
      .join('\n\n---\n\n')

    const prompt = `Synthesize the following step results into a final, coherent answer for the user.

Original objective: ${inputData.objective}

Step results:
${resultsContext}

---
Provide a clear, well-structured final answer that addresses the full objective. Combine and summarize the step results as needed.`
    const response = await agent.generate(prompt)
    return {
      objective: inputData.objective,
      finalAnswer: response.text,
    }
  },
})

/**
 * Plan-and-Execute workflow: plan -> execute (each task) -> synthesize.
 * Converts LangGraph plan-execute pattern to MASTRA sequential workflow.
 */
export const planExecuteWorkflow = createWorkflow({
  id: 'plan-execute-workflow',
  description:
    'Plan-and-Execute: planner creates sub-steps, executor runs each, then synthesizes into final answer',
  inputSchema: workflowInputSchema,
  outputSchema: synthesizeOutputSchema,
})
  .then(planStep)
  .then(executeStep)
  .then(synthesizeStep)
  .commit()
