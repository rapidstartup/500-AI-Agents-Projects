import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('aiHealthAssistant')

  console.log('=== AI Health Assistant Demo ===\n')

  const response = await agent.generate(
    `I'm 175cm tall and weigh 70kg. Can you check my BMI and give me some health tips?`
  )

  console.log('=== Response ===\n')
  console.log(response.text)
}

main().catch(console.error)
