import { Agent } from '@mastra/core/agent'
import { queryDocumentsTool } from '../tools/rag-tools'

/**
 * Retrieval agent with RAG query tool.
 * MASTRA conversion of AutoGen RetrieveUserProxyAgent - searches the document
 * collection and returns relevant chunks for use in conversation.
 */
export const retrieverAgent = new Agent({
  id: 'retriever',
  name: 'Document Retriever',
  description:
    'Searches the indexed document collection for relevant chunks. Delegate to this agent when you need to retrieve context from the knowledge base before answering.',
  instructions: `You are a Document Retrieval Specialist. Your role is to search the indexed document collection and return relevant chunks.

When given a query or question:
1. Use the query-documents tool to search for relevant content
2. You may run multiple queries with different phrasings if the first results are insufficient
3. Return the retrieved chunks in a clear, structured format so they can be used for synthesis

Always use the query-documents tool - do not make up or guess content. If no results are found, say so clearly.
Format your response with the retrieved chunks and their relevance so the supervisor can synthesize an answer.`,
  model: 'openai/gpt-4o',
  tools: {
    queryDocuments: queryDocumentsTool,
  },
})
