import { mastra } from './src/mastra'

async function main() {
  const workflow = mastra.getWorkflow('meetingAssistantWorkflow')
  
  const run = workflow.createRun()
  const result = await run.start({
    inputData: {
      topic: 'Q1 Product Review',
      duration: 60,
      participants: ['Alice', 'Bob', 'Charlie'],
    },
  })
  
  console.log('Meeting Summary:')
  console.log(result.result.data)
}

main()
