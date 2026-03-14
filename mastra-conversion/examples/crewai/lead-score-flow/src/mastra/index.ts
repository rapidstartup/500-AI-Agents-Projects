import { Mastra } from '@mastra/core/mastra'
import { leadScoringAgent } from './agents/lead-scoring-agent'

export const mastra = new Mastra({
  agents: { leadScoringAgent },
})
