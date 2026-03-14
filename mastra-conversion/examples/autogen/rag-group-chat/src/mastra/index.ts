import { Mastra } from '@mastra/core/mastra'
import { retrieverAgent } from './agents/retriever'
import { supervisorAgent } from './agents/supervisor'

/**
 * MASTRA conversion of AutoGen "RAG Group Chat with Retrieval Augmented Generation".
 *
 * Original AutoGen structure:
 * - RetrieveUserProxyAgent with retrieval augmented generation
 * - GroupChat with retrieval capability
 * - Agents could search a document collection and use results in conversation
 *
 * MASTRA Supervisor + RAG pattern:
 * - retrieverAgent: Has query-documents tool, searches the vector store
 * - supervisorAgent: Coordinates retriever, synthesizes answers using retrieved context
 * - RAG pipeline: index (chunk + embed + store) and query (embed + similarity search)
 */
export const mastra = new Mastra({
  agents: {
    retrieverAgent,
    supervisorAgent,
  },
})
