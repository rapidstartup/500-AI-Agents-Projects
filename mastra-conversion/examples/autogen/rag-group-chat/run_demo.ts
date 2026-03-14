/**
 * Demo runner for the MASTRA AutoGen RAG Group Chat conversion.
 * Indexes sample documents, then queries via supervisor + retriever.
 *
 * Usage: npx tsx run_demo.ts [question]
 *
 * Example: npx tsx run_demo.ts "What are the key features of the product?"
 *
 * Requires: OPENAI_API_KEY, POSTGRES_CONNECTION_STRING (or defaults to localhost)
 * Optional: LIBSQL_URL for memory (defaults to file:./mastra.db)
 */

import { mastra } from './src/mastra/index'
import { indexDocumentsTool } from './src/mastra/tools/rag-tools'

const SAMPLE_DOCS = `
# Product Overview

Our product is an AI-powered document assistant. Key features include:
- Natural language search across your documents
- Automatic summarization and extraction
- Multi-format support (PDF, Markdown, HTML)
- Secure cloud storage with encryption at rest

# Pricing Tiers

We offer three tiers:
1. Free: 100 documents, basic search
2. Pro: 10,000 documents, advanced search, API access
3. Enterprise: Unlimited documents, SSO, dedicated support

# API Documentation

The REST API uses JSON. Base URL: https://api.example.com/v1
Endpoints: /documents, /search, /summarize
Authentication: Bearer token in Authorization header.
`

const DEFAULT_QUESTION =
  'What are the key features of the product and what pricing tiers are available?'

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required. Add it to .env')
    process.exit(1)
  }

  const question = process.argv[2] ?? DEFAULT_QUESTION

  console.log('\n## AutoGen RAG Group Chat (MASTRA Supervisor + RAG)\n')

  // 1. Index sample documents
  console.log('Indexing sample documents...')
  const indexResult = await indexDocumentsTool.execute({
    text: SAMPLE_DOCS,
    docId: 'sample-product-docs',
  })
  console.log(indexResult.message, `(${indexResult.chunkCount} chunks)\n`)

  // 2. Query via supervisor (delegates to retriever, then synthesizes)
  console.log('Question:', question)
  console.log('\n--- Response ---\n')

  const supervisor = mastra.getAgent('supervisorAgent')
  const response = await supervisor.generate(question, { maxSteps: 8 })

  console.log(response.text)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
