import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('landingPageGenerator')

  console.log('=== Landing Page Generator Demo ===\n')

  const response = await agent.generate(
    `Create a landing page for a SaaS project management tool called TaskFlow. It helps teams organize projects, track tasks, and collaborate in real-time.`
  )

  console.log('=== Generated Page ===\n')
  console.log(response.text)
}

main().catch(console.error)
