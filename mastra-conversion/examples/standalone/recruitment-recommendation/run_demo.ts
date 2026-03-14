import { mastra } from './src/mastra/index.js'

const candidateProfile = `
Name: John Smith
Experience: 5 years in software development
Skills: JavaScript, Python, React, Node.js, AWS
Education: BS Computer Science
Location: San Francisco
Salary Expectation: $120,000
`

const jobPosition = `
Position: Senior Full Stack Developer
Requirements:
- 4+ years of full-stack development experience
- Strong JavaScript/TypeScript skills
- Experience with React and Node.js
- AWS or cloud platform experience
- BS in Computer Science or related field
Salary Range: $130,000 - $160,000
`

async function main() {
  const agent = mastra.getAgent('recruitmentRecommendation')

  console.log('=== Recruitment Recommendation Demo ===\n')

  const response = await agent.generate(
    `Analyze this candidate and job position, then provide a match recommendation:\n\nCANDIDATE:\n${candidateProfile}\n\nJOB:\n${jobPosition}`
  )

  console.log('=== Recommendation ===\n')
  console.log(response.text)
}

main().catch(console.error)
