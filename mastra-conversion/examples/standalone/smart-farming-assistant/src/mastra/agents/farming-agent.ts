import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const getWeatherData = createTool({
  id: 'weather-data',
  description: 'Get weather data for crop planning',
  inputSchema: z.object({
    location: z.string(),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    humidity: z.number(),
    rainfall: z.number(),
    forecast: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    return {
      temperature: 72,
      humidity: 65,
      rainfall: 0.5,
      forecast: ['Sunny', 'Partly cloudy', 'Rain expected'],
    }
  },
})

const cropRecommendation = createTool({
  id: 'crop-recommendation',
  description: 'Recommend crops based on soil and climate',
  inputSchema: z.object({
    soilType: z.string(),
    climate: z.string(),
    season: z.string(),
  }),
  outputSchema: z.object({
    recommendedCrops: z.array(z.object({
      name: z.string(),
      successRate: z.string(),
      waterNeeds: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    return {
      recommendedCrops: [
        { name: 'Tomatoes', successRate: 'High', waterNeeds: 'Medium' },
        { name: 'Peppers', successRate: 'High', waterNeeds: 'Low-Medium' },
        { name: 'Lettuce', successRate: 'Medium-High', waterNeeds: 'Medium' },
      ],
    }
  },
})

export const farmingAgent = new Agent({
  id: 'smart-farming-assistant',
  name: 'Smart Farming Assistant',
  description: 'Provides crop recommendations and farming insights',
  instructions: `You are a Smart Farming Assistant helping farmers maximize yield.

Your capabilities:
- Weather-based planning recommendations
- Crop selection based on soil and climate
- Irrigation scheduling advice
- Pest management tips
- Seasonal planting guidance

When helping:
1. Consider current weather conditions
2. Factor in soil type and local climate
3. Provide actionable recommendations
4. Suggest best practices for crop success

Focus on sustainable farming and maximizing yield while conserving resources.`,
  model: 'openai/gpt-4o',
  tools: { getWeatherData, cropRecommendation },
})
