import { Mastra } from '@mastra/core/mastra'
import { agendaAgent, researchAgent, summaryAgent } from './agents/meeting-agents'
import { meetingAssistantWorkflow } from './workflows/meeting-workflow'

export const mastra = new Mastra({
  agents: { agendaAgent, researchAgent, summaryAgent },
  workflows: { meetingAssistantWorkflow },
})
