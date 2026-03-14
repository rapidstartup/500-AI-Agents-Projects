import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('contentPersonalization')
  const response = await agent.generate('I love sci-fi movies like Blade Runner and The Matrix. I also enjoy thrillers. What should I watch next?')
  console.log(response.text)
}

main().catch(console.error)
