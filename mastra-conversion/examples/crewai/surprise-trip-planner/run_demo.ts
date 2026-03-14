import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('surpriseTripSupervisor')
  
  const stream = await agent.stream(
    `Plan a surprise trip for my partner's birthday. 
    Preferences: 
    - Budget: $3000
    - Duration: 4 days
    - Interests: beaches, good food, relaxing
    - From: New York
    - Group: just the two of us`
  )
  
  console.log('Surprise Trip Plan:')
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk)
  }
}

main()
