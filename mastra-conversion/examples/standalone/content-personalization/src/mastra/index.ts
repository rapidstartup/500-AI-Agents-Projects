import { Mastra } from '@mastra/core/mastra'
import { personalizationAgent } from './agents/personalization-agent'

export const mastra = new Mastra({ agents: { personalizationAgent } })
