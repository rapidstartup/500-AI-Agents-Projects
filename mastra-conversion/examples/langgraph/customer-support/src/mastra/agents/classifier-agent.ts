import { Agent } from '@mastra/core/agent'
import { z } from 'zod'

/**
 * Intent classification schema for routing customer support requests.
 */
export const IntentSchema = z.object({
  intent: z.enum(['order_inquiry', 'refund_request', 'general']).describe('The classified intent'),
  message: z.string().describe('The original customer message'),
  orderId: z.string().optional().describe('Extracted order ID if mentioned (e.g., ORD-001)'),
  customerId: z.string().optional().describe('Extracted customer ID if mentioned (e.g., CUST-001)'),
})

export type IntentOutput = z.infer<typeof IntentSchema>

/**
 * Classifier agent that determines customer intent for routing.
 * No tools - pure classification for workflow branching.
 */
export const classifierAgent = new Agent({
  id: 'classifier-agent',
  name: 'Intent Classifier',
  description: 'Classifies customer support messages into order_inquiry, refund_request, or general.',
  instructions: `You are an intent classifier for customer support. Classify the customer's message into exactly one of:
- order_inquiry: Questions about order status, tracking, delivery, or order details
- refund_request: Requests for refunds, returns, or cancellations
- general: All other questions (greetings, product info, policies, etc.)

Extract order IDs (e.g., ORD-001, ORD-002) and customer IDs (e.g., CUST-001) if mentioned in the message.
Return the classification as structured JSON.`,
  model: 'openai/gpt-4o',
})
