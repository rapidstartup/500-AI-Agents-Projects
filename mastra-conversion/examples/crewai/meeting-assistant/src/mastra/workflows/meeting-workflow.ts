import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const generateAgenda = createStep({
  id: 'generate-agenda',
  inputSchema: z.object({
    topic: z.string(),
    duration: z.number(),
    participants: z.array(z.string()),
  }),
  outputSchema: z.object({
    agenda: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('agendaAgent')
    const response = await agent.generate(
      `Create a meeting agenda for "${inputData.topic}" lasting ${inputData.duration} minutes with ${inputData.participants.length} participants. Include time allocations.`
    )
    return { agenda: response.text }
  },
})

const researchParticipants = createStep({
  id: 'research-participants',
  inputSchema: z.object({
    participants: z.array(z.string()),
    topic: z.string(),
  }),
  outputSchema: z.object({
    research: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('researchAgent')
    const response = await agent.generate(
      `Research background on these participants regarding "${inputData.topic}": ${inputData.participants.join(', ')}`
    )
    return { research: response.text }
  },
})

const createSummary = createStep({
  id: 'create-summary',
  inputSchema: z.object({
    agenda: z.string(),
    research: z.string(),
    topic: z.string(),
  }),
  outputSchema: z.object({
    summary: z.string(),
    actionItems: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('summaryAgent')
    const response = await agent.generate(
      `Based on agenda and research, create a meeting summary and action items.\n\nAgenda: ${inputData.agenda}\n\nResearch: ${inputData.research}`
    )
    return { 
      summary: response.text,
      actionItems: ['Follow up with participants', 'Schedule follow-up meeting']
    }
  },
})

export const meetingAssistantWorkflow = createWorkflow({
  id: 'meeting-assistant',
  inputSchema: z.object({
    topic: z.string(),
    duration: z.number(),
    participants: z.array(z.string()),
  }),
  outputSchema: z.object({
    summary: z.string(),
    actionItems: z.array(z.string()),
  }),
})
  .then(generateAgenda)
  .then(researchParticipants)
  .then(createSummary)
  .commit()
