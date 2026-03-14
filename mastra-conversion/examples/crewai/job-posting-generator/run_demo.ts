import { mastra } from './src/mastra/index.js'

async function main() {
  const agent = mastra.getAgent('jobPostingGenerator')

  const jobDescription = process.argv[2] || 'software engineer'

  console.log('=== Job Posting Generator Demo ===\n')
  console.log(`Generating job posting for: ${jobDescription}\n`)

  const response = await agent.generate(
    `Create a job posting for a ${jobDescription} position at a mid-sized tech startup. Include requirements, responsibilities, and benefits.`
  )

  console.log('=== Generated Job Posting ===\n')
  console.log(response.text)
}

main().catch(console.error)
