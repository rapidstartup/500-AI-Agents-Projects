import { Mastra } from '@mastra/core/mastra'
import { jobPostingAgent } from './agents/job-posting-agent'

export const mastra = new Mastra({
  agents: {
    jobPostingAgent,
  },
})
