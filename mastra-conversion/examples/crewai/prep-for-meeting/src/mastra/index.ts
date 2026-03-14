import { Mastra } from '@mastra/core/mastra'
import { prepMeetingAgent } from './agents/prep-agent'

export const mastra = new Mastra({
  agents: {
    prepMeetingAgent,
  },
})
