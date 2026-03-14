import { Mastra } from '@mastra/core/mastra'
import { markdownValidatorAgent } from './agents/validator-agent'

export const mastra = new Mastra({
  agents: {
    markdownValidatorAgent,
  },
})
