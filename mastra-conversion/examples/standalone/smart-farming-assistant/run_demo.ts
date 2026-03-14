import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('smartFarmingAssistant')

  console.log('=== Smart Farming Assistant Demo ===\n')

  const response = await agent.generate(
    `I have clay soil in a subtropical climate. What crops should I plant this spring?`
  )

  console.log('=== Response ===\n')
  console.log(response.text)
}

main().catch(console.error)
