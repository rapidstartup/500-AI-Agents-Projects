import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('leadScoringAgent')
  
  const response = await agent.generate(
    `Score this lead:
    - Company: TechCorp (500 employees)
    - Industry: Enterprise Software
    - Email engagement: Opens 80% of emails
    - Website: Visits pricing page weekly
    - Response time: Same day
    - Meeting attendance: Attended 2/3 product demos`
  )
  
  console.log('Lead Score Result:')
  console.log(response.text)
}

main()
