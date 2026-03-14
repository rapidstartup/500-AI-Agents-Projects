import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('virtualAiTutor')

  console.log('=== Virtual AI Tutor Demo ===\n')

  const response = await agent.generate(
    `Can you explain the concept of photosynthesis to me? I'm a beginner.`
  )

  console.log('=== Response ===\n')
  console.log(response.text)
}

main().catch(console.error)
