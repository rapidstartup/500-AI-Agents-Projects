import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('energyForecaster')
  
  const response = await agent.generate(
    `Forecast energy demand for next week in a metropolitan area. 
    Consider:
    - Historical patterns
    - Weather forecast (hot week expected)
    - Weekday vs weekend patterns
    - Local events`
  )
  
  console.log('Energy Demand Forecast:')
  console.log(response.text)
}

main()
