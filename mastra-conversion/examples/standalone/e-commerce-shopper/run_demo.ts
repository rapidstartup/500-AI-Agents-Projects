import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('eCommerceShopper')
  const response = await agent.generate('I need a laptop for video editing and graphic design. Budget around $1500.')
  console.log(response.text)
}

main().catch(console.error)
