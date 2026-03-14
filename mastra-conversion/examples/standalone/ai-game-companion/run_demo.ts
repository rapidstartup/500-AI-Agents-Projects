import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('aiGameCompanion')

  console.log('=== AI Game Companion Demo ===\n')

  const response = await agent.generate(
    `I'm playing Minecraft and I just spawned in a desert biome. What should I do first to survive?`
  )

  console.log('=== Response ===\n')
  console.log(response.text)
}

main().catch(console.error)
