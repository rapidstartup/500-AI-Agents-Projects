import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const screenerAgent = new Agent({
  id: 'screener-agent',
  name: 'Resume Screener',
  description: 'Screens resumes against job requirements',
  instructions: `You screen resumes against job requirements. Evaluate:
- Skills match
- Experience level
- Cultural fit
- Provide a score (1-10) and brief notes.`,
  model: 'openai/gpt-4o',
})

const interviewerAgent = new Agent({
  id: 'interviewer-agent',
  name: 'Interview Question Generator',
  description: 'Generates relevant interview questions',
  instructions: `Generate tailored interview questions based on:
- Job requirements
- Resume highlights
- Skills to probe
Create behavioral and technical questions.`,
  model: 'openai/gpt-4o',
})

const evaluatorAgent = new Agent({
  id: 'evaluator-agent',
  name: 'Candidate Evaluator',
  description: 'Evaluates candidates and makes recommendations',
  instructions: `Evaluate candidates holistically:
- Interview performance
- Resume strength
- Cultural fit
- Provide hire/no-hire recommendation with reasoning.`,
  model: 'openai/gpt-4o',
})

const screenResumes = createStep({
  id: 'screen-resumes',
  inputSchema: z.object({
    jobDescription: z.string(),
    resumes: z.array(z.string()),
  }),
  outputSchema: z.object({
    screenedCandidates: z.array(z.object({
      name: z.string(),
      score: z.number(),
      notes: z.string(),
    })),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('screenerAgent')
    const response = await agent.generate(
      `Screen these resumes for: ${inputData.jobDescription}\n\nResumes:\n${inputData.resumes.join('\n\n---')}`
    )
    return {
      screenedCandidates: [
        { name: 'Candidate 1', score: 8, notes: 'Strong match' },
        { name: 'Candidate 2', score: 6, notes: 'Partial match' },
      ]
    }
  },
})

const generateQuestions = createStep({
  id: 'generate-questions',
  inputSchema: z.object({
    jobDescription: z.string(),
    candidate: z.object({ name: z.string(), score: z.number(), notes: z.string() }),
  }),
  outputSchema: z.object({
    questions: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('interviewerAgent')
    const response = await agent.generate(
      `Generate interview questions for ${inputData.candidate.name} for role: ${inputData.jobDescription}`
    )
    return { questions: ['Tell me about your experience...', 'Describe a challenging project...'] }
  },
})

const evaluateCandidate = createStep({
  id: 'evaluate-candidate',
  inputSchema: z.object({
    candidate: z.object({ name: z.string(), score: z.number(), notes: z.string() }),
    interviewNotes: z.string(),
  }),
  outputSchema: z.object({
    recommendation: z.string(),
    reasoning: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('evaluatorAgent')
    const response = await agent.generate(
      `Evaluate ${inputData.candidate.name}: ${inputData.interviewNotes}`
    )
    return { recommendation: 'Hire', reasoning: 'Strong candidate' }
  },
})

export const recruitmentWorkflow = createWorkflow({
  id: 'recruitment-workflow',
  inputSchema: z.object({
    jobDescription: z.string(),
    resumes: z.array(z.string()),
  }),
  outputSchema: z.object({
    recommendations: z.array(z.object({
      name: z.string(),
      recommendation: z.string(),
      reasoning: z.string(),
    })),
  }),
})
  .then(screenResumes)
  .then(generateQuestions)
  .then(evaluateCandidate)
  .commit()

export const mastra = new Mastra({
  agents: { screenerAgent, interviewerAgent, evaluatorAgent },
  workflows: { recruitmentWorkflow },
})
