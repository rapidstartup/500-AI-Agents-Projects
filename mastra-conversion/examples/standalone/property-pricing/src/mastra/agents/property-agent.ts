import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const marketAnalysis = createTool({
  id: 'market-analysis',
  description: 'Get current real estate market data for a location',
  inputSchema: z.object({
    location: z.string(),
    propertyType: z.string(),
  }),
  outputSchema: z.object({
    avgPricePerSqft: z.number(),
    priceTrend: z.string(),
    daysOnMarket: z.number(),
    inventoryLevel: z.string(),
  }),
  execute: async ({ inputData }) => {
    return {
      avgPricePerSqft: 450,
      priceTrend: 'increasing',
      daysOnMarket: 30,
      inventoryLevel: 'low',
    }
  },
})

export const propertyPricingAgent = new Agent({
  id: 'property-pricing',
  name: 'Property Pricing Agent',
  description: 'Analyzes property details and market data to estimate property values',
  instructions: `You are a Property Pricing Agent providing accurate property valuations.

Your process:
1. Analyze property features (size, bedrooms, bathrooms, amenities)
2. Consider location factors
3. Research comparable properties
4. Factor in market trends
5. Provide estimated value range

When assessing properties consider:
- Square footage and lot size
- Number of bedrooms/bathrooms
- Age and condition of property
- Location (neighborhood, schools, amenities)
- Recent renovations or upgrades
- Market conditions

Provide:
- Estimated property value
- Price per square foot
- Comparable property analysis
- Market trend insights
- Recommendations for pricing strategy`,
  model: 'openai/gpt-4o',
  tools: { marketAnalysis },
})
