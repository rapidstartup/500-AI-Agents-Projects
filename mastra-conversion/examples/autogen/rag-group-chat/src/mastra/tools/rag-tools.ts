import { createTool } from '@mastra/core/tools'
import { MDocument } from '@mastra/rag'
import { PgVector } from '@mastra/pg'
import { embedMany } from 'ai'
import { ModelRouterEmbeddingModel } from '@mastra/core/llm'
import { z } from 'zod'

const EMBEDDING_DIMENSION = 1536
const INDEX_NAME = 'rag_embeddings'

const pgVector = new PgVector({
  id: 'rag-pg-vector',
  connectionString:
    process.env.POSTGRES_CONNECTION_STRING ?? 'postgresql://localhost:5432/mastra_rag',
})

const embeddingModel = new ModelRouterEmbeddingModel('openai/text-embedding-3-small')

const indexOutputSchema = z.object({
  success: z.boolean(),
  chunkCount: z.number(),
  message: z.string(),
})

const queryOutputSchema = z.object({
  chunks: z.array(
    z.object({
      text: z.string(),
      score: z.number().optional(),
    })
  ),
  totalCount: z.number(),
})

/**
 * Index documents into the vector store.
 * Pipeline: MDocument.fromText() -> chunk() -> embedMany() -> pgVector.upsert()
 */
export const indexDocumentsTool = createTool({
  id: 'index-documents',
  description:
    'Index documents into the vector store for retrieval. Chunks text, generates embeddings, and stores them. Use this to add new documents to the knowledge base before querying.',
  inputSchema: z.object({
    text: z.string().describe('The document text to index'),
    docId: z
      .string()
      .optional()
      .describe('Optional document ID for metadata tracking'),
    maxChunkSize: z.number().min(100).max(2000).optional().default(512),
    overlap: z.number().min(0).max(100).optional().default(50),
  }),
  outputSchema: indexOutputSchema,
  execute: async (inputData) => {
    const { text, docId, maxChunkSize, overlap } = inputData

    try {
      const doc = MDocument.fromText(text, docId ? { docId } : undefined)
      const chunks = await doc.chunk({
        strategy: 'recursive',
        maxSize: maxChunkSize,
        overlap,
        separators: ['\n\n', '\n', ' '],
      })

      if (chunks.length === 0) {
        return {
          success: false,
          chunkCount: 0,
          message: 'No chunks produced from document',
        }
      }

      const texts = chunks.map((c) => c.text)
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: texts,
      })

      try {
        await pgVector.createIndex({
          indexName: INDEX_NAME,
          dimension: EMBEDDING_DIMENSION,
        })
      } catch {
        // Index may already exist
      }

      const metadata = chunks.map((c, i) => ({
        text: c.text,
        docId: docId ?? `doc_${Date.now()}`,
        chunkIndex: i,
        ...c.metadata,
      }))

      await pgVector.upsert({
        indexName: INDEX_NAME,
        vectors: embeddings,
        metadata,
      })

      return {
        success: true,
        chunkCount: chunks.length,
        message: `Indexed ${chunks.length} chunks successfully`,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        success: false,
        chunkCount: 0,
        message: `Indexing failed: ${message}`,
      }
    }
  },
})

/**
 * Query the vector store for relevant chunks.
 * Pipeline: embedMany() on query -> pgVector.query() for retrieval
 */
export const queryDocumentsTool = createTool({
  id: 'query-documents',
  description:
    'Search the document collection for relevant chunks. Use this to retrieve context before answering questions. Returns the most relevant text chunks with similarity scores.',
  inputSchema: z.object({
    query: z.string().describe('The search query or question'),
    topK: z.number().min(1).max(20).optional().default(5),
  }),
  outputSchema: queryOutputSchema,
  execute: async (inputData) => {
    const { query, topK } = inputData

    try {
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: [query],
      })
      const queryVector = embeddings[0]

      const results = await pgVector.query({
        indexName: INDEX_NAME,
        queryVector,
        topK,
        includeVector: false,
      })

      const chunks = (results ?? []).map((r: { metadata?: { text?: string }; score?: number }) => ({
        text: r.metadata?.text ?? '',
        score: typeof r.score === 'number' ? r.score : undefined,
      }))

      return {
        chunks,
        totalCount: chunks.length,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        chunks: [{ text: `Query failed: ${message}`, score: 0 }],
        totalCount: 0,
      }
    }
  },
})
