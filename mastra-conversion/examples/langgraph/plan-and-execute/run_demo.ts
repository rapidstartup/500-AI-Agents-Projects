/**
 * Demo runner for the MASTRA Plan-and-Execute workflow.
 *
 * Usage: npx tsx run_demo.ts
 *
 * Requires: OPENAI_API_KEY in .env
 */

import { mastra } from './src/mastra/index.js'

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required. Add it to .env')
    process.exit(1)
  }

  console.log('\n## Plan-and-Execute Workflow\n')

  const workflow = mastra.getWorkflow('planExecuteWorkflow')
  const run = await workflow.createRun()
  const result = await run.start({
    inputData: {
      objective:
        'Compare the top 3 programming languages for web development in 2025. List pros and cons for each.',
    },
  })

  if (result.status !== 'success') {
    if (result.status === 'failed') throw result.error
    throw new Error(`Workflow ended with status: ${result.status}`)
  }

  const output = result.result
  const finalAnswer =
    typeof output === 'object' && output && 'finalAnswer' in output
      ? (output as { finalAnswer: string }).finalAnswer
      : String(output ?? '')

  console.log('--- Final Answer ---\n')
  console.log(finalAnswer)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
