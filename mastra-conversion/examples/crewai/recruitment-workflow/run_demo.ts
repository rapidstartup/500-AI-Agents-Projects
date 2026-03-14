import { mastra } from './src/mastra'

async function main() {
  const workflow = mastra.getWorkflow('recruitmentWorkflow')
  
  const run = workflow.createRun()
  const result = await run.start({
    inputData: {
      jobDescription: 'Senior Software Engineer - Python',
      resumes: [
        'John: 5 years Python, Django, AWS experience...',
        'Jane: 3 years Python, FastAPI experience...',
      ],
    },
  })
  
  console.log('Recruitment Results:')
  console.log(result.result.data)
}

main()
