import { Mastra } from '@mastra/core/mastra'
import { shopperAgent } from './agents/shopper-agent'

export const mastra = new Mastra({
  agents: { shopperAgent },
})
