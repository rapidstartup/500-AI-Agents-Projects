/**
 * Demo runner for the MASTRA Adaptive RAG workflow.
 *
 * Usage: npx tsx run_demo.ts
 *
 * Requires: OPENAI_API_KEY in .env
 * Optional: DATABASE_URL for PgVector (default: postgresql://localhost:5432/mastra)
 *
 * Note: The vector store must have an index "adaptive_rag_docs" with documents.
 * If empty, the workflow will fall back to web search.
 */

import { mastra } from './src/mastra/index.js'

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required. Add it to .env')
    process.exit(1)
  }

  console.log('\n## Adaptive RAG Workflow\n')

  const workflow = mastra.getWorkflow('adaptiveRagWorkflow')
  const run = await workflow.createRun()
  const result = await run.start({
    inputData: {
      query: 'What are the latest developments in AI agents?',
    },
  })

  const output = result?.result ?? result?.output ?? result
  const answer =
    typeof output === 'object' && output && 'answer' in output
      ? (output as { answer: string }).answer
      : String(output ?? '')

  console.log('--- Answer ---\n')
  console.log(answer)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
