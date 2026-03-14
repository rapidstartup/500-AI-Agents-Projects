import { mastra } from './src/mastra/index.js'

async function main() {
  const workflow = mastra.getWorkflow('travelWorkflow')

  console.log('=== Virtual Travel Assistant Demo ===\n')

  const result = await workflow.createRun().start({
    inputData: {
      from: 'New York',
      to: 'Paris',
      date: '2026-04-15',
      interests: 'art, history, food',
    },
  })

  console.log('=== Travel Plan ===\n')
  console.log(JSON.stringify(result, null, 2))
}

main().catch(console.error)
