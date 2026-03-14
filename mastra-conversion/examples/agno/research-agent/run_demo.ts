/**
 * Demo runner for the MASTRA Agno Research Agent conversion.
 * Uses the research agent to write an article on a topic.
 *
 * Usage: npx tsx run_demo.ts [topic]
 *
 * Example: npx tsx run_demo.ts "Write an article on the latest AI agent frameworks"
 *
 * Requires: OPENAI_API_KEY
 */

import { mastra } from './src/mastra/index'

const DEFAULT_TOPIC = 'Write an article on the latest AI agent frameworks'

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required. Add it to .env')
    process.exit(1)
  }

  const topic = process.argv[2] ?? DEFAULT_TOPIC

  console.log('\n## Agno Research Agent (MASTRA Single Agent + Tools)\n')
  console.log('Topic:', topic)
  console.log('\n--- Response ---\n')

  const agent = mastra.getAgent('researchAgent')
  const response = await agent.generate(topic, { maxSteps: 15 })

  console.log(response.text)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
