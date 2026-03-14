import { Mastra } from '@mastra/core/mastra'
import { landingPageAgent } from './agents/landing-page-agent'

export const mastra = new Mastra({
  agents: {
    landingPageAgent,
  },
})
