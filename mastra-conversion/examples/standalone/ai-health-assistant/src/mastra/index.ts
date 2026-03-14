import { Mastra } from '@mastra/core/mastra'
import { healthAssistantAgent } from './agents/health-assistant'

export const mastra = new Mastra({
  agents: {
    healthAssistantAgent,
  },
})
