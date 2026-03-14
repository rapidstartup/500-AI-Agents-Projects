import { Agent } from '@mastra/core/agent'

export const personalizationAgent = new Agent({
  id: 'content-personalization',
  name: 'Content Personalization Agent',
  description: 'Recommends personalized media content based on user preferences',
  instructions: `You recommend personalized movies, shows, books, and other media based on user preferences.

Analyze:
- Past preferences and viewing history
- Genre interests
- Mood and tone preferences
- Similar titles enjoyed

Provide:
- Tailored recommendations with reasons
- Similar titles they might like
- New releases in preferred genres`,
  model: 'openai/gpt-4o',
})

import { Mastra } from '@mastra/core/mastra'
export const mastra = new Mastra({ agents: { personalizationAgent } })
