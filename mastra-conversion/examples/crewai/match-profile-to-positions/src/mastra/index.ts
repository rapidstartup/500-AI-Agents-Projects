import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'

export const profileMatcher = new Agent({
  id: 'profile-matcher',
  name: 'Profile to Position Matcher',
  description: 'Matches candidate profiles to suitable job positions',
  instructions: `You match candidate profiles to suitable job positions. For each candidate:
1. Analyze their skills, experience, and preferences
2. Compare against available positions
3. Rank matches by fit score (1-10)
4. Explain why each position is a good match
5. Suggest any skill gaps to address

Present results in a clear table with:
- Position Title
- Company
- Match Score (%)
- Key Reasons
- Skill Gaps`,
  model: 'openai/gpt-4o',
})

export const mastra = new Mastra({
  agents: { profileMatcher },
})
