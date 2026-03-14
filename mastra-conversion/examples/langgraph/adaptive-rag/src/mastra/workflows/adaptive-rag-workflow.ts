import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { INDEX_NAME } from '../tools/retrieval-tools.js'

// --- Schemas ---

const routeSchema = z.object({
  query: z.string(),
  route: z.enum(['vectorstore', 'web_search']),
})

const contextSchema = z.object({
  query: z.string(),
  context: z.string(),
  source: z.enum(['vector', 'web']),
})

// --- Steps ---

/**
 * Route step: classify query to decide vector search vs web search.
 */
const routeStep = createStep({
  id: 'route',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: routeSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('routerAgent')
    const response = await agent.generate(
      `Classify this user query. Respond with JSON only: { "route": "vectorstore" | "web_search" }
- Use "vectorstore" for questions about internal docs, knowledge base, or stored content.
- Use "web_search" for current events, real-time data, or external information.

Query: ${inputData.query}

JSON:`,
      {
        structuredOutput: { schema: routeSchema },
      }
    )
    const out = (response?.object ?? response) as { route?: string }
    const route =
      out?.route === 'web_search' ? 'web_search' : 'vectorstore'
    return { query: inputData.query, route }
  },
})

/**
 * Vector path: retrieve from PgVector, grade relevance, optionally fallback to web.
 */
const vectorRetrieveAndGradeStep = createStep({
  id: 'vector-retrieve-grade',
  inputSchema: routeSchema,
  outputSchema: contextSchema,
  execute: async ({ inputData, mastra }) => {
    const { query } = inputData
    const vectorStore = mastra.getVector('pg-vector')
    const { embed } = await import('ai')
    const { ModelRouterEmbeddingModel } = await import('@mastra/core/llm')

    const result = await embed({
      model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
      value: query,
    })
    const embedding =
      (result as { embedding?: number[] }).embedding ??
      (Array.isArray(result) ? result : [])

    let results: { id: string; score: number; metadata?: Record<string, unknown> }[]
    try {
      results = await vectorStore.query({
        indexName: INDEX_NAME,
        queryVector: embedding,
        topK: 5,
      })
    } catch {
      results = []
    }

    const documents = results.map((r) => ({
      id: r.id,
      content: (r.metadata?.content as string) ?? JSON.stringify(r.metadata),
      score: r.score,
    }))

    if (documents.length === 0) {
      const { search } = await import('duck-duck-scrape')
      const webResults = await search(query, { safeSearch: 0 })
      const snippets = (webResults.results ?? [])
        .slice(0, 5)
        .map(
          (r: { title?: string; description?: string }) =>
            `${r.title ?? ''}: ${r.description ?? ''}`
        )
        .join('\n\n')
      return {
        query,
        context: snippets || 'No results found.',
        source: 'web' as const,
      }
    }

    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean)
    const relevantDocs = documents.filter((d) => {
      const docLower = d.content.toLowerCase()
      const matchCount = queryTerms.filter((t) => docLower.includes(t)).length
      const ratio = matchCount / Math.max(1, queryTerms.length)
      return ratio >= 0.3 || d.content.length > 50
    })

    if (relevantDocs.length > 0) {
      const context = relevantDocs.map((d) => d.content).join('\n\n---\n\n')
      return { query, context, source: 'vector' as const }
    }

    const { search } = await import('duck-duck-scrape')
    const webResults = await search(query, { safeSearch: 0 })
    const snippets = (webResults.results ?? [])
      .slice(0, 5)
      .map(
        (r: { title?: string; description?: string }) =>
          `${r.title ?? ''}: ${r.description ?? ''}`
      )
      .join('\n\n')
    return {
      query,
      context: snippets || 'No results found.',
      source: 'web' as const,
    }
  },
})

/**
 * Web path: search the web for context.
 */
const webSearchStep = createStep({
  id: 'web-search',
  inputSchema: routeSchema,
  outputSchema: contextSchema,
  execute: async ({ inputData }) => {
    const { query } = inputData
    const { search } = await import('duck-duck-scrape')
    const webResults = await search(query, { safeSearch: 0 })
    const snippets = (webResults.results ?? [])
      .slice(0, 5)
      .map(
        (r: { title?: string; description?: string }) =>
          `${r.title ?? ''}: ${r.description ?? ''}`
      )
      .join('\n\n')
    return {
      query,
      context: snippets || 'No results found.',
      source: 'web' as const,
    }
  },
})

/**
 * Generate final answer from context.
 */
const generateStep = createStep({
  id: 'generate',
  inputSchema: contextSchema,
  outputSchema: z.object({ query: z.string(), answer: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('ragAgent')
    const response = await agent.generate(
      `Answer the user's question using ONLY the provided context. Be concise and accurate. Cite sources when possible.

Context (source: ${inputData.source}):
${inputData.context}

Question: ${inputData.query}

Answer:`,
    )
    return {
      query: inputData.query,
      answer: response.text,
    }
  },
})

/**
 * Adaptive RAG workflow: route -> branch (vector | web) -> generate.
 * Converts LangGraph Adaptive RAG conditional RAG pattern to MASTRA.
 */
export const adaptiveRagWorkflow = createWorkflow({
  id: 'adaptive-rag-workflow',
  description:
    'Adaptive RAG: route query, branch to vector search or web search, grade docs, fallback to web if needed, generate answer',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ query: z.string(), answer: z.string() }),
})
  .then(routeStep)
  .branch([
    [
      (ctx) => Promise.resolve(ctx.inputData.route === 'vectorstore'),
      vectorRetrieveAndGradeStep,
    ],
    [
      (ctx) => Promise.resolve(ctx.inputData.route === 'web_search'),
      webSearchStep,
    ],
    [(ctx) => Promise.resolve(true), webSearchStep],
  ])
  .then(generateStep)
  .commit()
