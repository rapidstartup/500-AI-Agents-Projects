import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { researcherAgent } from './agents/researcher'
import { writerAgent } from './agents/writer'
import { tripWorkflow } from './workflows/trip-workflow'

/**
 * Supervisor agent that coordinates research and writing agents.
 * Uses memory for conversation context when delegating across multiple turns.
 */
export const tripSupervisor = new Agent({
  id: 'trip-supervisor',
  name: 'Trip Planning Supervisor',
  instructions: `You are a Trip Planning Supervisor coordinating a team of travel specialists.

Your team:
1. **City Research Expert (researcherAgent)**: Researches destinations, attractions, hotels, restaurants, weather, and travel tips using web search. Delegate to this agent FIRST to gather information.
2. **Travel Itinerary Planner (writerAgent)**: Creates detailed day-by-day itineraries, budget estimates, and booking advice. Delegate to this agent AFTER research is complete.

Workflow:
1. When the user provides trip details (origin, destination, date range, interests), first delegate to the City Research Expert to research the destination.
2. Once you have research results, delegate to the Travel Itinerary Planner to create the itinerary.
3. Synthesize the final output and present it to the user.

If the user's request is vague, ask for: origin, destination, date range, and interests before proceeding.
Always ensure research happens before itinerary creation.`,
  model: 'openai/gpt-4o',
  agents: {
    researcherAgent,
    writerAgent,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'trip-planner-storage',
      url: process.env.LIBSQL_URL ?? 'file:./mastra.db',
    }),
  }),
})

export const mastra = new Mastra({
  agents: {
    researcherAgent,
    writerAgent,
    tripSupervisor,
  },
  workflows: {
    tripWorkflow,
  },
})
