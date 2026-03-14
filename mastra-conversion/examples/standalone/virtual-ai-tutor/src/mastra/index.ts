import { Mastra } from '@mastra/core/mastra'
import { tutorAgent } from './agents/tutor-agent'

export const mastra = new Mastra({
  agents: {
    tutorAgent,
  },
})
