import { Mastra } from '@mastra/core/mastra'
import { PgVector } from '@mastra/pg'
import { createRetrievalTools } from './tools/retrieval-tools.js'
import { routerAgent, createRagAgent } from './agents/rag-agent.js'
import { adaptiveRagWorkflow } from './workflows/adaptive-rag-workflow.js'

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://localhost:5432/mastra'

const pgVector = new PgVector({
  id: 'pg-vector',
  connectionString,
})

const retrievalTools = createRetrievalTools({
  vectorStore: pgVector,
  embeddingModel: 'openai/text-embedding-3-small',
})

const ragAgent = createRagAgent(retrievalTools)

/**
 * MASTRA conversion of LangGraph "Adaptive RAG" agent.
 *
 * Conditional RAG workflow:
 * - Route: classify query (vectorstore vs web_search)
 * - Branch: vector path (retrieve -> grade -> fallback to web if needed) or web path
 * - Generate: final answer from context
 */
export const mastra = new Mastra({
  agents: {
    routerAgent,
    ragAgent,
  },
  workflows: {
    adaptiveRagWorkflow,
  },
  vectors: {
    'pg-vector': pgVector,
  },
})
