import { Mastra } from '@mastra/core/mastra'
import { marketingStrategyAgent } from './agents/marketing-strategy-agent'

export const mastra = new Mastra({
  agents: { marketingStrategyAgent },
})
