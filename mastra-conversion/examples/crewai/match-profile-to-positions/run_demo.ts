import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('profileMatcher')
  
  const response = await agent.generate(
    `Match this candidate to available positions:

CANDIDATE:
- Name: Sarah Chen
- Skills: JavaScript, React, Node.js, TypeScript, GraphQL
- Experience: 5 years frontend, 2 years full-stack
- Location: San Francisco (remote ok)
- Salary: $150k-180k
- Preferences: Growth startup, interesting tech stack

AVAILABLE POSITIONS:
1. Senior Frontend Engineer - TechCorp (Enterprise, $160-200k)
2. Full-Stack Developer - StartupXYZ (Series A, equity)
3. React Developer - FinTech Co (Remote, $140-170k)
4. Frontend Lead - E-commerce (Hybrid, $170-220k)`
  )
  
  console.log('Match Results:')
  console.log(response.text)
}

main()
