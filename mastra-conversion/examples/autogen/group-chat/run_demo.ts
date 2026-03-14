/**
 * Demo runner for the MASTRA AutoGen Group Chat conversion.
 * Supervisor coordinates researcher and analyst to solve tasks.
 *
 * Usage: npx tsx run_demo.ts
 *
 * Example prompt (from original AutoGen):
 * "Find a latest paper about gpt-4 on arxiv and find its potential applications in software."
 *
 * Requires: OPENAI_API_KEY in .env
 */

import { mastra } from './src/mastra/index'

const PROMPT =
  process.argv[2] ??
  'Find a latest paper about gpt-4 on arxiv and find its potential applications in software.'

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required. Add it to .env')
    process.exit(1)
  }

  console.log('\n## AutoGen Group Chat (MASTRA Supervisor)\n')
  console.log('Prompt:', PROMPT)
  console.log('\n--- Response ---\n')

  const supervisor = mastra.getAgent('supervisorAgent')
  const response = await supervisor.generate(PROMPT, { maxSteps: 12 })

  console.log(response.text)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
