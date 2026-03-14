import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import type {
  DelegationStartContext,
  DelegationStartResult,
  DelegationCompleteContext,
  DelegationCompleteResult,
} from '@mastra/core/agent'
import { researcherAgent } from './researcher'
import { analystAgent } from './analyst'

/**
 * Supervisor agent that coordinates researcher and analyst.
 * MASTRA conversion of AutoGen GroupChatManager - replaces the manager that
 * selected speakers and coordinated turns. Uses delegation hooks for monitoring.
 *
 * max_round (12) maps to maxSteps: 12 in defaultOptions.
 */
export const supervisorAgent = new Agent({
  id: 'supervisor',
  name: 'Task Solving Supervisor',
  description:
    'Coordinates research and analysis tasks. Delegates to researcher for information gathering, then to analyst for processing.',
  instructions: `You are a Task Solving Supervisor coordinating a team of specialists for automated task solving.

Your team:
1. **Researcher (researcherAgent)**: Searches ArXiv and gathers academic papers, research summaries, and factual data. Delegate to this agent FIRST to find papers and information.
2. **Analyst (analystAgent)**: Processes research data and identifies potential applications, insights, and software product ideas. Delegate to this agent AFTER research is complete.

Workflow:
1. When the user asks to find papers or research (e.g., "Find a latest paper about GPT-4 on arxiv"), first delegate to the Researcher to search and gather papers.
2. Once you have research results, delegate to the Analyst to identify potential applications in software.
3. Synthesize the final output and present it to the user.

If the user's request is vague, ask for clarification before proceeding.
Always ensure research happens before analysis. Coordinate multiple rounds if needed until the task is complete.`,
  model: 'openai/gpt-4o',
  agents: {
    researcherAgent,
    analystAgent,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'group-chat-storage',
      url: process.env.LIBSQL_URL ?? 'file:./mastra.db',
    }),
  }),
  defaultOptions: {
    maxSteps: 12,
    delegation: {
      onDelegationStart: (context: DelegationStartContext): DelegationStartResult => {
        const { primitiveId, primitiveType, prompt, iteration } = context
        console.log(
          `[Delegation Start] iteration=${iteration} -> ${primitiveType} "${primitiveId}"`
        )
        console.log(`[Delegation Start] prompt: ${prompt.slice(0, 80)}...`)
        return {}
      },
      onDelegationComplete: (context: DelegationCompleteContext): DelegationCompleteResult => {
        const { primitiveId, primitiveType, result, duration, success, iteration } = context
        console.log(
          `[Delegation Complete] iteration=${iteration} ${primitiveType} "${primitiveId}" ` +
            `success=${success} duration=${duration}ms`
        )
        console.log(`[Delegation Complete] result preview: ${result.text.slice(0, 100)}...`)
        return {}
      },
    },
  },
})
