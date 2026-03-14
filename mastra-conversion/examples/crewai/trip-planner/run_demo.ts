/**
 * Demo runner for the MASTRA Trip Planner.
 * Demonstrates both execution paths: supervisor agent and workflow.
 *
 * Usage:
 *   npx tsx run_demo.ts supervisor   # Use supervisor (conversational, delegates dynamically)
 *   npx tsx run_demo.ts workflow     # Use workflow (deterministic research -> write)
 *
 * Requires: OPENAI_API_KEY in .env
 * Optional: SERPER_API_KEY for better web search results
 */

import { mastra } from './src/mastra/index'

const MODE = process.argv[2] ?? 'workflow'

async function runSupervisor() {
  console.log('\n## Trip Planner (Supervisor Mode)\n')
  const supervisor = mastra.getAgent('tripSupervisor')

  const prompt = `Plan a trip for me:
- Origin: New York
- Destination: Paris
- Date range: June 15-22, 2025
- Interests: art museums, French cuisine, walking tours`

  console.log('Prompt:', prompt)
  console.log('\n--- Response ---\n')

  const response = await supervisor.generate(prompt, { maxSteps: 15 })
  console.log(response.text)
}

async function runWorkflow() {
  console.log('\n## Trip Planner (Workflow Mode)\n')
  const workflow = mastra.getWorkflow('tripWorkflow')

  const run = await workflow.createRun()
  const result = await run.start({
    inputData: {
      origin: 'New York',
      destination: 'Paris',
      dateRange: 'June 15-22, 2025',
      interests: 'art museums, French cuisine, walking tours',
    },
  })

  console.log('--- Itinerary ---\n')
  const output = result?.result ?? result?.output ?? result
  const itinerary =
    typeof output === 'object' && output && 'itinerary' in output
      ? (output as { itinerary: string }).itinerary
      : String(output ?? '')
  console.log(itinerary)
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required. Add it to .env')
    process.exit(1)
  }

  try {
    if (MODE === 'supervisor') {
      await runSupervisor()
    } else {
      await runWorkflow()
    }
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

main()
