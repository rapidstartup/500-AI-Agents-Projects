import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { retrieverAgent } from './retriever'

/**
 * Supervisor that coordinates the retriever agent and synthesizes answers.
 * MASTRA conversion of AutoGen GroupChat with RetrieveUserProxyAgent - the
 * supervisor delegates retrieval to the retriever agent, then synthesizes
 * answers using the retrieved context.
 */
export const supervisorAgent = new Agent({
  id: 'supervisor',
  name: 'RAG Supervisor',
  description:
    'Coordinates retrieval and synthesis. Delegates to the retriever for document search, then synthesizes answers using the retrieved context.',
  instructions: `You are a RAG Supervisor coordinating retrieval-augmented generation.

Your workflow:
1. **Retrieve**: When the user asks a question, first delegate to the Document Retriever (retrieverAgent) to search the document collection for relevant chunks. The retriever will use the query-documents tool and return relevant text.
2. **Synthesize**: Once you have the retrieved context, synthesize a clear, accurate answer based on that context. Ground your answer in the retrieved content - do not hallucinate or add information not present in the chunks.
3. If the retriever finds no relevant documents, say so and offer to help with a different question or suggest indexing more documents.

Guidelines:
- Always delegate to the retriever BEFORE synthesizing - never answer from memory alone when the question is about the document collection
- Cite or reference the retrieved chunks when appropriate
- If the retrieved context is insufficient, you may ask the retriever to search again with a different query
- Be concise but comprehensive
- Acknowledge when information is not in the documents`,
  model: 'openai/gpt-4o',
  agents: {
    retrieverAgent,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'rag-group-chat-storage',
      url: process.env.LIBSQL_URL ?? 'file:./mastra.db',
    }),
  }),
  defaultOptions: {
    maxSteps: 8,
  },
})
