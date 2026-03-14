import { Mastra } from '@mastra/core/mastra'
import { researchAgent } from './agents/research-agent.js'

/**
 * MASTRA conversion of Agno "Research Agent" (research_agent.py).
 *
 * Single Agent + Tools pattern with web search:
 * - researchAgent: NYT-style researcher with webSearch and readWebPage tools
 */
export const mastra = new Mastra({
  agents: {
    researchAgent,
  },
})
