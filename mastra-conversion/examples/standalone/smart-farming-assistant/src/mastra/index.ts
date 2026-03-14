import { Mastra } from '@mastra/core/mastra'
import { farmingAgent } from './agents/farming-agent'

export const mastra = new Mastra({
  agents: {
    farmingAgent,
  },
})
