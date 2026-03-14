import { Mastra } from '@mastra/core/mastra'
import { recruitmentAgent } from './agents/recruitment-agent'

export const mastra = new Mastra({
  agents: {
    recruitmentAgent,
  },
})
