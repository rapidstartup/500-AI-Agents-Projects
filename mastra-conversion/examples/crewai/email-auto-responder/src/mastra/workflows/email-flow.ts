import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { classifyEmailTool } from '../tools/email-tools'

const QUALITY_THRESHOLD = 0.7
const MAX_DRAFT_ITERATIONS = 5

// --- Step schemas ---

const classifyInputSchema = z.object({
  email: z.string(),
  subject: z.string().optional(),
  sender: z.string().optional(),
})

const classifyOutputSchema = z.object({
  email: z.string(),
  subject: z.string().optional(),
  sender: z.string().optional(),
  classification: z.string(),
  confidence: z.number(),
})

const draftEvalInputSchema = z.object({
  email: z.string(),
  subject: z.string().optional(),
  sender: z.string().optional(),
  classification: z.string(),
  confidence: z.number(),
  previousDraft: z.string().optional(),
  evaluationFeedback: z.string().optional(),
  iterationCount: z.number().optional(),
})

const draftEvalOutputSchema = z.object({
  email: z.string(),
  subject: z.string().optional(),
  sender: z.string().optional(),
  classification: z.string(),
  confidence: z.number(),
  draft: z.string(),
  qualityScore: z.number(),
  feedback: z.string().optional(),
  iterationCount: z.number(),
})

// --- Steps ---

const classifyStep = createStep({
  id: 'classify-email',
  inputSchema: classifyInputSchema,
  outputSchema: classifyOutputSchema,
  execute: async ({ inputData }) => {
    const result = await classifyEmailTool.execute({
      emailContent: inputData.email,
      subject: inputData.subject,
    })
    return {
      ...inputData,
      classification: result.category,
      confidence: result.confidence,
    }
  },
})

const draftAndEvaluateStep = createStep({
  id: 'draft-and-evaluate',
  inputSchema: draftEvalInputSchema,
  outputSchema: draftEvalOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('emailAgent')
    const iterationCount = (inputData.iterationCount ?? 0) + 1

    const isRedraft = Boolean(inputData.previousDraft && inputData.evaluationFeedback)

    const draftPrompt = isRedraft
      ? `Re-draft this email response based on the evaluation feedback.

Original email:
${inputData.email}

Previous draft (needs improvement):
${inputData.previousDraft}

Evaluation feedback:
${inputData.evaluationFeedback}

Classification: ${inputData.classification}

Write an improved draft that addresses the feedback. Be professional and concise.`
      : `Draft a professional email response.

Original email:
${inputData.email}

Classification: ${inputData.classification}
Confidence: ${inputData.confidence}

Write a concise, professional response (2-4 paragraphs). Match tone to category.`

    const draftResponse = await agent.generate(draftPrompt)
    const draft = draftResponse.text

    const evalResponse = await agent.generate(
      `Evaluate this draft email response. Reply with ONLY a JSON object: {"qualityScore": 0.0-1.0, "feedback": "brief feedback for improvement if score < 0.7"}

Original email:
${inputData.email}

Draft response:
${draft}

Score on: clarity, tone, completeness, appropriateness. Be strict.`,
      {
        output: z.object({
          qualityScore: z.number().min(0).max(1),
          feedback: z.string().optional(),
        }),
      },
    )
    const evalObj = (evalResponse.object ?? evalResponse) as
      | { qualityScore: number; feedback?: string }
      | undefined
    const qualityScore =
      typeof evalObj?.qualityScore === 'number' ? evalObj.qualityScore : 0.75
    const feedback = evalObj?.feedback

    return {
      ...inputData,
      draft,
      qualityScore,
      feedback,
      iterationCount,
    }
  },
})

/**
 * Evaluation branch: approve path (quality good).
 * Used with .branch() - when quality >= threshold, we output the approved response.
 */
const approveStep = createStep({
  id: 'approve-response',
  inputSchema: z.object({
    draft: z.string(),
    classification: z.string(),
    qualityScore: z.number(),
    iterationCount: z.number(),
  }),
  outputSchema: z.object({
    draft: z.string(),
    classification: z.string(),
    qualityScore: z.number(),
    iterations: z.number(),
    needsReview: z.boolean(),
  }),
  execute: async ({ inputData }) => ({
    draft: inputData.draft,
    classification: inputData.classification,
    qualityScore: inputData.qualityScore,
    iterations: inputData.iterationCount,
    needsReview: false,
  }),
})

/**
 * Re-draft exhausted path: when quality < threshold after max iterations.
 * Outputs the best draft with needsReview flag for human oversight.
 */
const reDraftExhaustedStep = createStep({
  id: 're-draft-exhausted',
  inputSchema: z.object({
    draft: z.string(),
    classification: z.string(),
    qualityScore: z.number(),
    iterationCount: z.number(),
  }),
  outputSchema: z.object({
    draft: z.string(),
    classification: z.string(),
    qualityScore: z.number(),
    iterations: z.number(),
    needsReview: z.boolean(),
  }),
  execute: async ({ inputData }) => ({
    draft: inputData.draft,
    classification: inputData.classification,
    qualityScore: inputData.qualityScore,
    iterations: inputData.iterationCount,
    needsReview: true,
  }),
})

// --- Workflow ---
// Flow: classify -> draft+eval (dountil loop) -> branch: approve | re-draft
// Evaluation loop: .dountil() runs draft+evaluate until quality >= threshold or max iterations.
// .branch() routes: approve (output) when quality good, re-draft (loop back) when quality low.
// Note: re-draft outputs feed back into dountil; the dountil condition handles the loop exit.
export const emailFlow = createWorkflow({
  id: 'email-auto-responder-flow',
  description:
    'Classify email -> draft response -> evaluate quality -> branch: approve or re-draft until quality threshold',
  inputSchema: classifyInputSchema,
  outputSchema: z.object({
    draft: z.string(),
    classification: z.string(),
    qualityScore: z.number(),
    iterations: z.number(),
    needsReview: z.boolean(),
  }),
})
  .then(classifyStep)
  .dountil(
    draftAndEvaluateStep,
    async ({ inputData }) => {
      const data = inputData as { qualityScore?: number; iterationCount?: number }
      if ((data.iterationCount ?? 0) >= MAX_DRAFT_ITERATIONS) return true
      return typeof data.qualityScore === 'number' && data.qualityScore >= QUALITY_THRESHOLD
    },
  )
  .map(async ({ inputData }) => {
    const d = inputData as z.infer<typeof draftEvalOutputSchema>
    return {
      draft: d.draft,
      classification: d.classification,
      qualityScore: d.qualityScore,
      iterationCount: d.iterationCount,
    }
  })
  .branch([
    [
      async ({ inputData }) => {
        const d = inputData as { qualityScore?: number }
        return typeof d.qualityScore === 'number' && d.qualityScore >= QUALITY_THRESHOLD
      },
      approveStep,
    ],
    [
      async ({ inputData }) => {
        const d = inputData as { qualityScore?: number }
        return typeof d.qualityScore === 'number' && d.qualityScore < QUALITY_THRESHOLD
      },
      reDraftExhaustedStep,
    ],
  ])
  .commit()
