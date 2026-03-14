import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { classifierAgent, IntentSchema } from '../agents/classifier-agent'

/**
 * Schema for classification step output (matches IntentSchema).
 */
const ClassificationOutputSchema = z.object({
  intent: z.enum(['order_inquiry', 'refund_request', 'general']),
  message: z.string(),
  orderId: z.string().optional(),
  customerId: z.string().optional(),
})

/**
 * Schema for handler step output - all branches produce the same shape.
 */
const HandlerOutputSchema = z.object({
  response: z.string(),
})

/**
 * Prepare step: maps workflow input { message } to agent input { prompt }.
 */
const prepareStep = createStep({
  id: 'prepare',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ prompt: z.string() }),
  execute: async ({ inputData }) => ({ prompt: inputData.message }),
})

/**
 * Classification step: uses classifier agent with structured output.
 * Custom step to avoid schema compatibility issues with createStep(agent, structuredOutput).
 */
const classifyStep = createStep({
  id: 'classify',
  inputSchema: z.object({ prompt: z.string() }),
  outputSchema: ClassificationOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('classifierAgent')
    if (!agent) {
      return {
        intent: 'general' as const,
        message: inputData.prompt,
      }
    }
    const result = (await agent.generate(inputData.prompt, {
      structuredOutput: { schema: IntentSchema },
    })) as { object?: z.infer<typeof IntentSchema>; text?: string }
    const obj = result?.object
    if (obj && typeof obj === 'object' && 'intent' in obj && 'message' in obj) {
      return obj as z.infer<typeof ClassificationOutputSchema>
    }
    const parsed = IntentSchema.safeParse(
      result?.text ? JSON.parse(result.text || '{}') : {},
    )
    if (parsed.success) return parsed.data
    return {
      intent: 'general' as const,
      message: inputData.prompt,
    }
  },
})

/**
 * Build a context-aware prompt for the support agent based on classification.
 */
function buildSupportPrompt(classification: z.infer<typeof ClassificationOutputSchema>): string {
  const parts = [classification.message]
  if (classification.orderId) parts.push(`(Order ID: ${classification.orderId})`)
  if (classification.customerId) parts.push(`(Customer ID: ${classification.customerId})`)
  return parts.join(' ')
}

/**
 * Order inquiry handler: uses support agent to look up order and respond.
 */
const handleOrderInquiryStep = createStep({
  id: 'handle-order-inquiry',
  inputSchema: ClassificationOutputSchema,
  outputSchema: HandlerOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('supportAgent')
    if (!agent) {
      return {
        response: 'Support agent is not available. Please try again later.',
      }
    }
    const prompt = buildSupportPrompt(inputData)
    const result = await agent.generate(prompt)
    const text = typeof result === 'object' && result && 'text' in result ? result.text : String(result)
    return { response: text ?? 'I could not process your order inquiry.' }
  },
})

/**
 * Refund request handler: uses support agent to check eligibility and process refund.
 */
const handleRefundRequestStep = createStep({
  id: 'handle-refund-request',
  inputSchema: ClassificationOutputSchema,
  outputSchema: HandlerOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('supportAgent')
    if (!agent) {
      return {
        response: 'Support agent is not available. Please try again later.',
      }
    }
    const prompt = buildSupportPrompt(inputData)
    const result = await agent.generate(prompt)
    const text = typeof result === 'object' && result && 'text' in result ? result.text : String(result)
    return { response: text ?? 'I could not process your refund request.' }
  },
})

/**
 * General question handler: uses support agent for general assistance.
 */
const handleGeneralStep = createStep({
  id: 'handle-general',
  inputSchema: ClassificationOutputSchema,
  outputSchema: HandlerOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('supportAgent')
    if (!agent) {
      return {
        response: 'Support agent is not available. Please try again later.',
      }
    }
    const prompt = buildSupportPrompt(inputData)
    const result = await agent.generate(prompt)
    const text = typeof result === 'object' && result && 'text' in result ? result.text : String(result)
    return { response: text ?? 'I could not process your question.' }
  },
})

/**
 * Support workflow: classify intent -> branch -> handle each branch -> produce response.
 *
 * MASTRA conversion of LangGraph Customer Support Agent.
 *
 * Original LangGraph structure:
 * - StateGraph with nodes: classification, order handling, refund handling, general response
 * - Conditional edges routing based on classified intent
 * - Tools for database lookups (orders, customers) and refund processing
 *
 * MASTRA workflow structure:
 * - prepare: map message to prompt
 * - classify: classifier agent with structured output (intent, message, orderId?, customerId?)
 * - branch: condition checks intent, routes to order_inquiry | refund_request | general handler
 * - Each handler uses support agent with tools to produce response
 */
export const supportWorkflow = createWorkflow({
  id: 'support-workflow',
  inputSchema: z.object({
    message: z.string().describe('The customer support message'),
  }),
  outputSchema: z.object({
    response: z.string().describe('The support response'),
  }),
})
  .then(prepareStep)
  .then(classifyStep)
  .branch([
    [
      async ({ inputData }) => (inputData as { intent: string }).intent === 'order_inquiry',
      handleOrderInquiryStep,
    ],
    [
      async ({ inputData }) => (inputData as { intent: string }).intent === 'refund_request',
      handleRefundRequestStep,
    ],
    [
      async ({ inputData }) => (inputData as { intent: string }).intent === 'general',
      handleGeneralStep,
    ],
  ])
  .commit()
