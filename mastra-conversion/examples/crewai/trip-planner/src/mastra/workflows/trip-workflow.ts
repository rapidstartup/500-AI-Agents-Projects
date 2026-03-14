import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const tripInputSchema = z.object({
  origin: z.string().describe('City or location the traveler is departing from'),
  destination: z.string().describe('City or destination to visit'),
  dateRange: z.string().describe('Travel date range (e.g., "March 20-27, 2025")'),
  interests: z
    .string()
    .describe('Traveler interests and hobbies (e.g., "art, food, history, hiking")'),
})

const researchOutputSchema = z.object({
  research: z.string().describe('Comprehensive destination research'),
  origin: z.string(),
  destination: z.string(),
  dateRange: z.string(),
  interests: z.string(),
})

const itineraryOutputSchema = z.object({
  itinerary: z.string().describe('Complete travel itinerary with day-by-day plan'),
})

const researchStep = createStep({
  id: 'research-destination',
  inputSchema: tripInputSchema,
  outputSchema: researchOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('researcherAgent')
    const prompt = `Research the following destination for a trip:

- Origin: ${inputData.origin}
- Destination: ${inputData.destination}
- Date range: ${inputData.dateRange}
- Interests: ${inputData.interests}

Use the web search tool to gather current information about:
1. Top attractions and must-see sights
2. Hotel/accommodation recommendations with price ranges
3. Restaurant and dining suggestions
4. Weather and what to pack
5. Practical tips (transportation, safety, local customs)
6. Estimated daily budget

Provide comprehensive research in clear sections.`
    const response = await agent.generate(prompt)
    return {
      research: response.text,
      origin: inputData.origin,
      destination: inputData.destination,
      dateRange: inputData.dateRange,
      interests: inputData.interests,
    }
  },
})

const writeStep = createStep({
  id: 'write-itinerary',
  inputSchema: researchOutputSchema,
  outputSchema: itineraryOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('writerAgent')
    const prompt = `Create a detailed travel itinerary based on this research:

## Trip Details
- Origin: ${inputData.origin}
- Destination: ${inputData.destination}
- Date range: ${inputData.dateRange}
- Interests: ${inputData.interests}

## Research (from City Research Expert)
${inputData.research}

---

Synthesize the research above into a complete day-by-day itinerary. Include:
- Morning, afternoon, evening activities for each day
- Specific hotel and restaurant recommendations
- Budget breakdown (accommodation, food, activities, transport)
- Practical booking tips and advance reservation advice
- Optional/backup activities

Format in clear markdown.`
    const response = await agent.generate(prompt)
    return { itinerary: response.text }
  },
})

/**
 * Trip planning workflow: research destination, then write itinerary.
 * Alternative to the supervisor pattern - deterministic sequential flow.
 */
export const tripWorkflow = createWorkflow({
  id: 'trip-workflow',
  description:
    'Plans a trip by first researching the destination, then creating a detailed itinerary',
  inputSchema: tripInputSchema,
  outputSchema: itineraryOutputSchema,
})
  .then(researchStep)
  .then(writeStep)
  .commit()
