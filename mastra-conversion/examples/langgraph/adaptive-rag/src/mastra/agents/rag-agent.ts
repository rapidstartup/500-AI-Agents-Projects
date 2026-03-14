import { Agent } from '@mastra/core/agent'
import type { createRetrievalTools } from '../tools/retrieval-tools.js'

/**
 * Router agent: classifies query to vectorstore vs web_search.
 * No tools - used only for the route step in the adaptive workflow.
 */
export const routerAgent = new Agent({
  id: 'router-agent',
  name: 'Router',
  description: 'Classifies user queries to route to vector search or web search.',
  instructions: `You classify user queries. Respond with JSON only: { "route": "vectorstore" | "web_search" }
- vectorstore: internal docs, knowledge base, stored content
- web_search: current events, real-time data, external information`,
  model: 'openai/gpt-4o',
})

/**
 * RAG agent that uses retrieval and grading tools.
 * MASTRA conversion of LangGraph Adaptive RAG - the agent that retrieves,
 * grades documents, and generates answers from context.
 *
 * Tools: vectorSearch, webSearch, gradeDocument
 */
export function createRagAgent(tools: ReturnType<typeof createRetrievalTools>) {
  return new Agent({
    id: 'rag-agent',
    name: 'RAG Agent',
    description:
      'An agent that answers questions using vector search, document grading, and web search fallback.',
    instructions: `You are a RAG (Retrieval-Augmented Generation) agent. Your job is to answer user questions accurately using available tools.

Workflow:
1. For internal/knowledge-base questions: use vector-search to find relevant documents.
2. Use grade-document to check if each retrieved document is relevant to the query.
3. If documents are relevant: synthesize an answer from them. Cite sources.
4. If no relevant documents: use web-search as fallback for real-time or external information.
5. Always ground your answer in the retrieved context. Do not hallucinate.

Guidelines:
- Prefer vector search for questions about internal docs or known knowledge.
- Use web search for current events, recent data, or when vector search returns nothing relevant.
- When grading documents, be strict: only use docs that directly address the query.
- Format responses in Markdown. Cite sources when possible.`,
    model: 'openai/gpt-4o',
    tools: {
      vectorSearch: tools.vectorSearchTool,
      webSearch: tools.webSearchTool,
      gradeDocument: tools.gradeDocumentTool,
    },
  })
}
