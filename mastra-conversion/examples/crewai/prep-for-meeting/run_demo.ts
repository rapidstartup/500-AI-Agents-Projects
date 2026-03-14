import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('prepForMeeting')
  const response = await agent.generate('Prepare for a quarterly review meeting with the engineering team')
  console.log(response.text)
}

main().catch(console.error)
