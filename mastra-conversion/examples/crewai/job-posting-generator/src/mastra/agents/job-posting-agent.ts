import { Agent } from '@mastra/core/agent'
import { z } from 'zod'

const jobPostingOutput = z.object({
  jobTitle: z.string().describe('The job title'),
  companyOverview: z.string().describe('Brief company overview'),
  positionSummary: z.string().describe('Summary of the role'),
  responsibilities: z.array(z.string()).describe('Key responsibilities'),
  qualifications: z.array(z.string()).describe('Required qualifications'),
  preferredQualifications: z.array(z.string()).optional().describe('Nice-to-have qualifications'),
  benefits: z.array(z.string()).describe('Company benefits'),
  salaryRange: z.string().optional().describe('Salary range if available'),
  applicationInstructions: z.string().describe('How to apply'),
})

export const jobPostingAgent = new Agent({
  id: 'job-posting-generator',
  name: 'Job Posting Generator',
  description: 'Generates professional job postings from job requirements',
  instructions: `You are a professional HR content specialist who creates compelling job postings.

Your task is to create a well-structured job posting based on the information provided by the user.

When creating a job posting:
1. Use professional, inclusive language
2. Be specific about requirements and qualifications
3. Highlight company culture and benefits
4. Make the role sound attractive to qualified candidates
5. Include clear application instructions

Structure the posting with:
- Job Title
- Company Overview (2-3 sentences)
- Position Summary
- Key Responsibilities (bullet points)
- Required Qualifications (bullet points)
- Preferred/Nice-to-Have Qualifications (if provided)
- Benefits & Perks
- Salary Range (if available)
- Application Instructions

If any required information is missing, ask the user for clarification before proceeding.`,
  model: 'openai/gpt-4o',
})
