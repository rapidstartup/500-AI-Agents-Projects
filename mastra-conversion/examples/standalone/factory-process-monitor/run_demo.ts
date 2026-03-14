import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('processMonitor')
  
  const response = await agent.generate(
    `Analyze the current sensor data for equipment assembly-line-01 and provide status report.`
  )
  
  console.log('Process Monitor Report:')
  console.log(response.text)
}

main()
