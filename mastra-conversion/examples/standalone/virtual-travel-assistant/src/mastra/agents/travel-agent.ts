import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const searchFlights = createTool({
  id: 'search-flights',
  description: 'Search for available flights',
  inputSchema: z.object({
    from: z.string(),
    to: z.string(),
    date: z.string(),
  }),
  outputSchema: z.object({
    flights: z.array(z.object({
      airline: z.string(),
      price: z.number(),
      duration: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    return {
      flights: [
        { airline: 'Airline A', price: 350, duration: '4h 30m' },
        { airline: 'Airline B', price: 420, duration: '5h 15m' },
      ],
    }
  },
})

const searchHotels = createTool({
  id: 'search-hotels',
  description: 'Search for hotel accommodations',
  inputSchema: z.object({
    city: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
  }),
  outputSchema: z.object({
    hotels: z.array(z.object({
      name: z.string(),
      pricePerNight: z.number(),
      rating: z.number(),
    })),
  }),
  execute: async ({ inputData }) => {
    return {
      hotels: [
        { name: 'Grand Hotel', pricePerNight: 150, rating: 4.5 },
        { name: 'City Inn', pricePerNight: 89, rating: 4.0 },
      ],
    }
  },
})

const searchAttractions = createTool({
  id: 'search-attractions',
  description: 'Find popular attractions at destination',
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    attractions: z.array(z.object({
      name: z.string(),
      description: z.string(),
      ticketPrice: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    return {
      attractions: [
        { name: 'City Museum', description: 'Local history', ticketPrice: '$15' },
        { name: 'Central Park', description: 'Beautiful green space', ticketPrice: 'Free' },
      ],
    }
  },
})

const researchStep = createStep({
  id: 'research-destination',
  inputSchema: z.object({ destination: z.string() }),
  outputSchema: z.object({ attractions: z.any(), hotels: z.any() }),
  execute: async ({ inputData }) => {
    const attractions = await searchAttractions.execute({ city: inputData.destination })
    const hotels = await searchHotels.execute({ city: inputData.destination, checkIn: '', checkOut: '' })
    return { attractions, hotels }
  },
})

const flightStep = createStep({
  id: 'search-flights',
  inputSchema: z.object({ from: z.string(), to: z.string(), date: z.string() }),
  outputSchema: z.object({ flights: z.any() }),
  execute: async ({ inputData }) => {
    const flights = await searchFlights.execute(inputData)
    return { flights }
  },
})

export const travelWorkflow = createWorkflow({
  id: 'travel-planning',
  inputSchema: z.object({
    from: z.string(),
    to: z.string(),
    date: z.string(),
    interests: z.string(),
  }),
  outputSchema: z.object({
    flights: z.any(),
    hotels: z.any(),
    attractions: z.any(),
    itinerary: z.string(),
  }),
})
  .then(researchStep)
  .then(flightStep)
  .commit()

export const travelAgent = new Agent({
  id: 'virtual-travel-assistant',
  name: 'Virtual Travel Assistant',
  description: 'Plans travel itineraries with flights, hotels, and attractions',
  instructions: `You are a Virtual Travel Assistant helping users plan their trips.

Your workflow:
1. Research the destination for attractions and hotels
2. Search for available flights
3. Compile a complete travel itinerary

Provide:
- Flight options with prices and durations
- Hotel recommendations
- Top attractions based on interests
- Day-by-day itinerary suggestions
- Local tips and recommendations

Be thorough and provide practical advice for travelers.`,
  model: 'openai/gpt-4o',
  tools: { searchFlights, searchHotels, searchAttractions },
})
