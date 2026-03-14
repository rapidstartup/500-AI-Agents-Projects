import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('threatDetector')
  
  const response = await agent.generate(
    `Analyze the following security event log and identify any threats:
    [2026-03-15 10:23:45] Failed login attempt - user: admin - IP: 192.168.1.105
    [2026-03-15 10:23:47] Failed login attempt - user: admin - IP: 192.168.1.105
    [2026-03-15 10:23:52] Failed login attempt - user: admin - IP: 192.168.1.105
    [2026-03-15 10:24:01] Successful login - user: admin - IP: 203.0.113.45 (new device)`
  )
  
  console.log('Threat Analysis:')
  console.log(response.text)
}

main()
