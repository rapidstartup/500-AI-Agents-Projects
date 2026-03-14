import { createTool } from '@mastra/core/tools'
import type { MastraVector } from '@mastra/core/vector'
import { embed } from 'ai'
import { ModelRouterEmbeddingModel } from '@mastra/core/llm'
import { search } from 'duck-duck-scrape'
import { z } from 'zod'

export const INDEX_NAME = 'adaptive_rag_docs'

/**
 * Factory to create retrieval tools with vector store and embedding model.
 * Used by the RAG agent and adaptive workflow.
 */
export function createRetrievalTools(options: {
  vectorStore: MastraVector
  embeddingModel?: string
}) {
  const { vectorStore, embeddingModel = 'openai/text-embedding-3-small' } =
    options

  /**
   * Query the vector store for similar documents.
   */
  const vectorSearchTool = createTool({
    id: 'vector-search',
    description:
      'Search the vector store for documents similar to the query. Use when the query is about internal/knowledge base content.',
    inputSchema: z.object({
      query: z.string().describe('The search query'),
      topK: z.number().min(1).max(20).optional().default(5),
    }),
    outputSchema: z.object({
      documents: z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          score: z.number(),
          metadata: z.record(z.unknown()).optional(),
        })
      ),
    }),
    execute: async (inputData) => {
      const { query, topK } = inputData
      const result = await embed({
        model: new ModelRouterEmbeddingModel(embeddingModel),
        value: query,
      })
      const embedding =
        (result as { embedding?: number[] }).embedding ??
        (Array.isArray(result) ? result : [])
      const results = await vectorStore.query({
        indexName: INDEX_NAME,
        queryVector: embedding,
        topK,
      })
      return {
        documents: results.map((r) => ({
          id: r.id,
          content: (r.metadata?.content as string) ?? JSON.stringify(r.metadata),
          score: r.score,
          metadata: r.metadata,
        })),
      }
    },
  })

  /**
   * Fallback web search when vector store has no relevant docs.
   */
  const webSearchTool = createTool({
    id: 'web-search',
    description:
      'Search the web for information. Use as fallback when vector store has no relevant documents or for real-time/external queries.',
    inputSchema: z.object({
      query: z.string().describe('The search query'),
      maxResults: z.number().min(1).max(10).optional().default(5),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          snippet: z.string().optional(),
        })
      ),
      noResults: z.boolean(),
    }),
    execute: async (inputData) => {
      const { query, maxResults } = inputData
      try {
        const searchResults = await search(query, { safeSearch: 0 })
        const results = (searchResults.results ?? [])
          .slice(0, maxResults)
          .map(
            (r: { title?: string; url?: string; description?: string }) => ({
              title: r.title ?? '',
              url: r.url ?? '',
              snippet: r.description,
            })
          )
        return {
          results,
          noResults: searchResults.noResults ?? results.length === 0,
        }
      } catch {
        return { results: [], noResults: true }
      }
    },
  })

  /**
   * Grade whether a retrieved document is relevant to the query.
   */
  const gradeDocumentTool = createTool({
    id: 'grade-document',
    description:
      'Check if a retrieved document is relevant to the user query. Returns true if relevant, false otherwise.',
    inputSchema: z.object({
      query: z.string().describe('The user query'),
      document: z.string().describe('The document content to grade'),
    }),
    outputSchema: z.object({
      relevant: z.boolean(),
      reason: z.string().optional(),
    }),
    execute: async (inputData) => {
      const { query, document } = inputData
      const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean)
      const docLower = document.toLowerCase()
      const matchCount = queryTerms.filter((t) => docLower.includes(t)).length
      const relevanceRatio = matchCount / Math.max(1, queryTerms.length)
      const relevant = relevanceRatio >= 0.3 || document.length > 50
      return {
        relevant,
        reason: relevant
          ? `Document contains ${matchCount}/${queryTerms.length} query terms`
          : 'Low overlap with query',
      }
    },
  })

  return {
    vectorSearchTool,
    webSearchTool,
    gradeDocumentTool,
  }
}
