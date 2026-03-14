import { Agent } from '@mastra/core/agent'

export const prepMeetingAgent = new Agent({
  id: 'prep-for-meeting',
  name: 'Prep for Meeting',
  description: 'Prepares meeting agendas and materials before meetings',
  instructions: `You help prepare for meetings by creating agendas, gathering relevant materials, and suggesting discussion points.

Create:
- Meeting agenda with timing
- Key topics to discuss
- Background information needed
- Questions to answer
- Action items to assign`,
  model: 'openai/gpt-4o',
})

import { Mastra } from '@mastra/core/mastra'
export const mastra = new Mastra({ agents: { prepMeetingAgent } })
