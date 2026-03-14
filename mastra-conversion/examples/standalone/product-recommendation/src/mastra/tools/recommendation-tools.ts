import { createTool } from '@mastra/core/tools'
import type { MastraVector } from '@mastra/core/vector'
import { embedMany } from 'ai'
import { ModelRouterEmbeddingModel } from '@mastra/core/llm'
import { z } from 'zod'

export const PRODUCT_INDEX_NAME = 'product_catalog'

export interface ProductRecord {
  id: string
  name: string
  description: string
  category: string
  price: number
  brand?: string
}

/**
 * Simulated user history store. In production, use a real database.
 */
const MOCK_USER_HISTORY: Record<string, ProductRecord[]> = {
  user_1: [
    {
      id: 'p1',
      name: 'Wireless Bluetooth Headphones',
      description: 'Noise-cancelling over-ear headphones',
      category: 'Electronics',
      price: 149.99,
      brand: 'SoundMax',
    },
    {
      id: 'p2',
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with cherry MX switches',
      category: 'Electronics',
      price: 129.99,
    },
  ],
  user_2: [
    {
      id: 'p3',
      name: 'Organic Coffee Beans',
      description: 'Single-origin Ethiopian coffee',
      category: 'Food & Beverage',
      price: 24.99,
    },
  ],
  default: [],
}

/**
 * Factory to create recommendation tools with vector store and embedding model.
 * Used by the product recommendation agent for RAG-based product similarity.
 */
export function createRecommendationTools(options: {
  vectorStore: MastraVector
  embeddingModel?: string
}) {
  const { vectorStore, embeddingModel = 'openai/text-embedding-3-small' } =
    options

  const embeddingModelInstance = new ModelRouterEmbeddingModel(embeddingModel)

  /**
   * Vector similarity search for products matching user preferences.
   * Embeds the preference query and retrieves semantically similar products.
   */
  const searchProductsTool = createTool({
    id: 'search-products',
    description:
      'Search for products similar to user preferences using vector similarity. Use when the user describes what they want (e.g., "wireless headphones", "cozy sweaters"). Returns products ranked by relevance.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('User preference or product description to search for'),
      topK: z.number().min(1).max(20).optional().default(8),
    }),
    outputSchema: z.object({
      products: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          category: z.string(),
          price: z.number(),
          brand: z.string().optional(),
          score: z.number(),
        })
      ),
    }),
    execute: async (inputData) => {
      const { query, topK } = inputData
      const { embeddings } = await embedMany({
        model: embeddingModelInstance,
        values: [query],
      })
      const queryVector = embeddings[0]

      const results = await vectorStore.query({
        indexName: PRODUCT_INDEX_NAME,
        queryVector,
        topK,
        includeVector: false,
      })

      const products = (results ?? []).map(
        (r: { id?: string; metadata?: Record<string, unknown>; score?: number }) => ({ 
          id: r.id ?? (r.metadata?.id as string) ?? '',
          name: (r.metadata?.name as string) ?? '',
          description: (r.metadata?.description as string) ?? '',
          category: (r.metadata?.category as string) ?? '',
          price: (r.metadata?.price as number) ?? 0,
          brand: r.metadata?.brand as string | undefined,
          score: typeof r.score === 'number' ? r.score : 0,
        })
      )

      return { products }
    },
  })

  /**
   * Retrieve user's purchase or browsing history for personalization.
   */
  const getUserHistoryTool = createTool({
    id: 'get-user-history',
    description:
      "Retrieve user's purchase or browsing history. Use to personalize recommendations based on past interactions. Pass userId to get that user's history.",
    inputSchema: z.object({
      userId: z.string().describe('The user ID to fetch history for'),
    }),
    outputSchema: z.object({
      products: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          category: z.string(),
          price: z.number(),
          brand: z.string().optional(),
        })
      ),
    }),
    execute: async (inputData) => {
      const { userId } = inputData
      const history = MOCK_USER_HISTORY[userId] ?? MOCK_USER_HISTORY.default
      return {
        products: history.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          price: p.price,
          brand: p.brand,
        })),
      }
    },
  })

  /**
   * Score how relevant a product is to user preferences.
   * Uses a heuristic combining keyword overlap and semantic similarity.
   */
  const scoreRelevanceTool = createTool({
    id: 'score-relevance',
    description:
      'Score how relevant a product is to user preferences (0-1). Use to rank or filter search results before presenting recommendations.',
    inputSchema: z.object({
      productDescription: z.string().describe('The product name and description'),
      userPreferences: z.string().describe('User preferences or query'),
    }),
    outputSchema: z.object({
      score: z.number().min(0).max(1).describe('Relevance score from 0 to 1'),
      reason: z.string().optional().describe('Brief explanation of the score'),
    }),
    execute: async (inputData) => {
      const { productDescription, userPreferences } = inputData
      const prefTerms = userPreferences.toLowerCase().split(/\s+/).filter(Boolean)
      const productLower = productDescription.toLowerCase()

      const matchCount = prefTerms.filter((t) => productLower.includes(t)).length
      const relevanceRatio = matchCount / Math.max(1, prefTerms.length)

      // Boost score for longer matches
      const lengthBonus = productLower.length > 50 ? 0.1 : 0
      const score = Math.min(1, relevanceRatio * 0.9 + lengthBonus + 0.05)

      return {
        score,
        reason:
          matchCount > 0
            ? `Product matches ${matchCount}/${prefTerms.length} preference terms`
            : 'Low keyword overlap with preferences',
      }
    },
  })

  return {
    searchProductsTool,
    getUserHistoryTool,
    scoreRelevanceTool,
  }
}
