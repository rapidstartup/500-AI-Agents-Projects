import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'

export const destinationResearcher = new Agent({
  id: 'destination-researcher',
  name: 'Destination Researcher',
  description: 'Researches travel destinations',
  instructions: `Research destinations and provide:
- Top attractions and activities
- Best time to visit
- Average costs
- Weather considerations
- Hidden gems
- Local customs to know`,
  model: 'openai/gpt-4o',
})

export const itineraryPlanner = new Agent({
  id: 'itinerary-planner',
  name: 'Itinerary Planner',
  description: 'Creates detailed travel itineraries',
  instructions: `Create detailed day-by-day itineraries including:
- Morning, afternoon, evening activities
- Restaurant recommendations
- Buffer time for exploration
- Local transportation
- Emergency contacts
- Packing suggestions`,
  model: 'openai/gpt-4o',
})

export const bookingCoordinator = new Agent({
  id: 'booking-coordinator',
  name: 'Booking Coordinator',
  description: 'Coordinates bookings and logistics',
  instructions: `Help coordinate bookings:
- Flight options and recommendations
- Hotel suggestions by budget
- Car rental vs transportation
- Activity booking tips
- Travel insurance recommendations
- Budget breakdown`,
  model: 'openai/gpt-4o',
})

export const surpriseTripSupervisor = new Agent({
  id: 'surprise-trip-supervisor',
  name: 'Surprise Trip Supervisor',
  description: 'Plans surprise trips with research, planning, and booking coordination',
  instructions: `You plan surprise trips. Your team includes:
- destinationResearcher: Finds perfect destinations
- itineraryPlanner: Creates detailed day-by-day plans
- bookingCoordinator: Helps with logistics

Process:
1. Ask for preferences (budget, dates, interests, group size)
2. Delegate to researcher for destination options
3. Delegate to planner for detailed itinerary
4. Delegate to coordinator for booking guidance

Keep the "surprise" element in mind - frame information appropriately.
Deliver a complete surprise trip plan.`,
  model: 'openai/gpt-4o',
  agents: { destinationResearcher, itineraryPlanner, bookingCoordinator },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'trip-planner-storage',
      url: 'file:mastra.db',
    }),
  }),
})

export const mastra = new Mastra({
  agents: { destinationResearcher, itineraryPlanner, bookingCoordinator, surpriseTripSupervisor },
})
