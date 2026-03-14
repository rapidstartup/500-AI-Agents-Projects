import { Mastra } from '@mastra/core/mastra'
import { PgVector } from '@mastra/pg'
import { legalAgent } from './agents/legal-agent.js'

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_CONNECTION_STRING ?? 'postgresql://localhost:5432/mastra'

const pgVector = new PgVector({
  id: 'pg-vector',
  connectionString,
})

/**
 * MASTRA conversion of firica/legalai - Legal Document Review Assistant.
 *
 * Single Agent + RAG pattern:
 * - Document analysis tools: parse, search clauses, compare to template, highlight risks
 * - RAG: Vector search over legal precedents for case law and standards
 * - Model: openai/gpt-4o
 */
export const mastra = new Mastra({
  agents: {
    legalAgent,
  },
  vectors: {
    'pg-vector': pgVector,
  },
})

export { legalAgent } from './agents/legal-agent.js'
export {
  parseDocumentTool,
  searchClausesTool,
  compareToTemplateTool,
  highlightRisksTool,
} from './tools/document-tools.js'
