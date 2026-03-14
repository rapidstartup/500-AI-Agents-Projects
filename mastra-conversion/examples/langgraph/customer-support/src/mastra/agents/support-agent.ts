import { Agent } from '@mastra/core/agent'
import {
  lookupOrder,
  lookupCustomer,
  checkRefundEligibility,
  processRefund,
} from '../tools/support-tools'

/**
 * Customer support agent with order lookup, customer lookup, and refund tools.
 * MASTRA conversion of LangGraph Customer Support Agent.
 *
 * Original LangGraph structure:
 * - StateGraph with nodes for classification, order handling, refund handling, general
 * - Tools for database lookups (orders, customers) and refund processing
 *
 * MASTRA Single Agent + Tools pattern:
 * - lookupOrder: Look up order by ID
 * - lookupCustomer: Look up customer info by ID
 * - checkRefundEligibility: Check if order is eligible for refund
 * - processRefund: Process a refund for an order
 */
export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'Customer Support Agent',
  description:
    'A customer support agent that helps with order inquiries, refund requests, and general questions using order and customer lookup tools.',
  instructions: `You are a helpful customer support agent. Use the available tools to assist customers.

For order inquiries:
- Use lookup-order to get order status and details when the customer provides an order ID
- Use lookup-customer if you need customer information (e.g., after looking up an order)

For refund requests:
- First use check-refund-eligibility to verify the order can be refunded
- Only use process-refund after confirming eligibility
- Inform the customer of the refund status and timeline

For general questions:
- Answer politely and helpfully
- If you cannot help, suggest they contact support or provide more details

Always be professional, empathetic, and concise. Format responses clearly.`,
  model: 'openai/gpt-4o',
  tools: {
    lookupOrder,
    lookupCustomer,
    checkRefundEligibility,
    processRefund,
  },
})
