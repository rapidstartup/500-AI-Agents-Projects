import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('gameBuilderSupervisor')
  
  const stream = await agent.stream(
    `Create a simple browser-based snake game with:
    - Classic snake gameplay
    - Score tracking
    - Increasing difficulty`
  )
  
  console.log('Game Builder Output:')
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk)
  }
}

main()
