import { Agent } from '@mastra/core/agent'
import { z } from 'zod'
import type { createRecommendationTools } from '../tools/recommendation-tools.js'

/**
 * Structured output schema for product recommendations.
 * MASTRA conversion of microsoft/RecAI - personalized product suggestions.
 */
export const recommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      productId: z.string().describe('Product identifier'),
      productName: z.string().describe('Product name'),
      reason: z.string().describe('Why this product was recommended'),
      relevanceScore: z.number().min(0).max(1).optional().describe('Relevance to user'),
    })
  ),
  summary: z.string().describe('Brief personalized summary of the recommendations'),
})

export type Recommendation = z.infer<typeof recommendationSchema>

/**
 * Product Recommendation Agent - RAG pattern.
 * Uses vector similarity search for products and synthesizes personalized recommendations
 * based on user preferences and history.
 *
 * Tools: searchProducts (vector search), getUserHistory, scoreRelevance
 */
export function createRecommenderAgent(
  tools: ReturnType<typeof createRecommendationTools>
) {
  return new Agent({
    id: 'recommender-agent',
    name: 'Product Recommender',
    description:
      'Recommends products based on user preferences and purchase history using RAG and vector similarity.',
    instructions: `You are a product recommendation agent. Your job is to suggest products that match user preferences and interests.

Workflow:
1. Use getUserHistory to retrieve the user's past purchases/browsing when a userId is provided. This helps personalize.
2. Use searchProducts with the user's preferences (e.g., "wireless headphones", "cozy winter sweaters") to find semantically similar products via vector search.
3. Use scoreRelevance to rank products when you need to filter or prioritize results.
4. Synthesize personalized recommendations. Explain why each product fits the user.

Guidelines:
- Always use searchProducts for the main product discovery - it uses embeddings for semantic similarity.
- Incorporate user history when available to avoid recommending items they already own.
- Provide a mix of products when the user's preferences are broad.
- Format prices clearly. Be concise but helpful.
- When using structured output, include 3-5 top recommendations with clear reasons.`,
    model: 'openai/gpt-4o',
    tools: {
      searchProducts: tools.searchProductsTool,
      getUserHistory: tools.getUserHistoryTool,
      scoreRelevance: tools.scoreRelevanceTool,
    },
  })
}
