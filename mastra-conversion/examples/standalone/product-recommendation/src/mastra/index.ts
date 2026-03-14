import { Mastra } from '@mastra/core/mastra'
import { PgVector } from '@mastra/pg'
import { createRecommendationTools } from './tools/recommendation-tools.js'
import { createRecommenderAgent, recommendationSchema, type Recommendation } from './agents/recommender.js'

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://localhost:5432/mastra'

const pgVector = new PgVector({
  id: 'pg-vector',
  connectionString,
})

const recommendationTools = createRecommendationTools({
  vectorStore: pgVector,
  embeddingModel: 'openai/text-embedding-3-small',
})

const recommenderAgent = createRecommenderAgent(recommendationTools)

/**
 * MASTRA conversion of microsoft/RecAI - Product Recommendation Agent.
 *
 * RAG Agent pattern:
 * - Vector similarity search for products matching user preferences
 * - User history for personalization
 * - Relevance scoring for ranking
 * - Structured output for recommendation results
 */
export const mastra = new Mastra({
  agents: {
    recommenderAgent,
  },
  vectors: {
    'pg-vector': pgVector,
  },
})

export { recommenderAgent, recommendationSchema, type Recommendation }
export {
  createRecommendationTools,
  PRODUCT_INDEX_NAME,
} from './tools/recommendation-tools.js'

/**
 * Generate personalized product recommendations with structured output.
 */
export async function getRecommendations(
  prompt: string,
  options?: { structuredOutput?: { model?: string } }
): Promise<Recommendation> {
  const response = await recommenderAgent.generate(prompt, {
    structuredOutput: {
      schema: recommendationSchema,
      ...options?.structuredOutput,
    },
  })

  if (!response.object) {
    throw new Error('Failed to generate structured recommendation output')
  }

  return response.object as Recommendation
}
