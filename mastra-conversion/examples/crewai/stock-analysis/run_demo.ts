/**
 * Run the stock analysis workflow.
 * Usage: npx tsx run_demo.ts [TICKER]
 * Example: npx tsx run_demo.ts AAPL
 */
import 'dotenv/config'
import { mastra } from './src/mastra/index'

async function main() {
  const ticker = process.argv[2] ?? 'AAPL'
  console.log(`\n📊 Running stock analysis for ${ticker}...\n`)

  const workflow = mastra.getWorkflow('analysisWorkflow')
  const run = workflow.createRun()
  const runResult = await run.start({
    inputData: { ticker },
  })

  const output =
    runResult && typeof runResult === 'object' && 'result' in runResult
      ? (runResult as { result?: { report?: string } }).result?.report
      : typeof runResult === 'object' && runResult && 'report' in runResult
        ? (runResult as { report: string }).report
        : String(runResult ?? 'No output')

  console.log('\n--- Stock Analysis Report ---\n')
  console.log(output)
  console.log('\n--- End Report ---\n')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
