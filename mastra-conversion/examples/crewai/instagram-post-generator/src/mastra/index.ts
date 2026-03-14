import { Mastra } from '@mastra/core/mastra'
import { instagramAgent } from './agents/instagram-agent'

export const mastra = new Mastra({
  agents: {
    instagramAgent,
  },
})
