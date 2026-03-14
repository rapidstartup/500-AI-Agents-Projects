import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('instagramPostGenerator')

  const topic = process.argv[2] || 'coffee shop promotion'

  console.log('=== Instagram Post Generator Demo ===\n')
  console.log(`Generating post for: ${topic}\n`)

  const response = await agent.generate(
    `Create an engaging Instagram post for: ${topic}. Include caption, hashtags, and engagement tips.`
  )

  console.log('=== Generated Post ===\n')
  console.log(response.text)
}

main().catch(console.error)
