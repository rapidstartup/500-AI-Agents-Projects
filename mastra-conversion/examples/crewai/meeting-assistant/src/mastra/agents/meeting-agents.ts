import { Agent } from '@mastra/core/agent'

export const agendaAgent = new Agent({
  id: 'agenda-agent',
  name: 'Agenda Agent',
  description: 'Creates meeting agendas',
  instructions: `You are a meeting agenda expert. Create clear, well-structured agendas that:
- Include clear time allocations for each topic
- Balance content appropriately for the meeting duration
- Consider all participants' interests
- Include appropriate intro and wrap-up time`,
  model: 'openai/gpt-4o',
})

export const researchAgent = new Agent({
  id: 'research-agent',
  name: 'Research Agent',
  description: 'Researches meeting participants',
  instructions: `You research meeting participants to help prepare others. Find relevant:
- Background and expertise
- Previous positions or projects
- Any publicly available information relevant to the meeting topic`,
  model: 'openai/gpt-4o',
})

export const summaryAgent = new Agent({
  id: 'summary-agent',
  name: 'Summary Agent',
  description: 'Creates meeting summaries and action items',
  instructions: `You create comprehensive meeting summaries with:
- Key discussion points
- Decisions made
- Action items with owners
- Follow-up requirements
Format output clearly with headers.`,
  model: 'openai/gpt-4o',
})
