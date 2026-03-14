import { Mastra } from '@mastra/core/mastra'
import { emailAgent } from './agents/email-agent'
import { emailFlow } from './workflows/email-flow'

export const mastra = new Mastra({
  agents: {
    emailAgent,
  },
  workflows: {
    emailFlow,
  },
})
