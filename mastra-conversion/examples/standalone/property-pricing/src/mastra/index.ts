import { Mastra } from '@mastra/core/mastra'
import { propertyPricingAgent } from './agents/property-agent'

export const mastra = new Mastra({
  agents: {
    propertyPricingAgent,
  },
})
