import { Mastra } from '@mastra/core/mastra'
import { travelAgent, travelWorkflow } from './agents/travel-agent'

export const mastra = new Mastra({
  agents: {
    travelAgent,
  },
  workflows: {
    travelWorkflow,
  },
})
