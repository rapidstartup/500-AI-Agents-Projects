import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('marketingStrategyAgent')
  
  const response = await agent.generate(
    `Create a marketing strategy for a B2B SaaS company selling project management software to mid-market companies. Budget is $50,000/month. Primary goal is to increase demo requests by 30%.`
  )
  
  console.log('Marketing Strategy:')
  console.log(response.text)
}

main()
