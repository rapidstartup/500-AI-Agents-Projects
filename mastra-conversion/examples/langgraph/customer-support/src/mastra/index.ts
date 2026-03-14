import { Mastra } from '@mastra/core/mastra'
import { classifierAgent } from './agents/classifier-agent'
import { supportAgent } from './agents/support-agent'
import { supportWorkflow } from './workflows/support-workflow'

/**
 * MASTRA conversion of LangGraph "Customer Support Agent".
 *
 * Graph-based workflow with branching:
 * - classifierAgent: Intent classifier for routing (order_inquiry | refund_request | general)
 * - supportAgent: Customer support agent with lookupOrder, lookupCustomer,
 *   checkRefundEligibility, and processRefund tools
 * - supportWorkflow: Classify intent -> branch (order_inquiry | refund_request | general)
 *   -> handle each branch with support agent -> produce response
 */
export const mastra = new Mastra({
  agents: {
    classifierAgent,
    supportAgent,
  },
  workflows: {
    supportWorkflow,
  },
})

/**
 * Demo: Run the support workflow with sample customer messages.
 */
async function main() {
  const workflow = mastra.getWorkflow('supportWorkflow')
  if (!workflow) {
    console.error('Support workflow not found')
    return
  }

  const run = await workflow.createRun()
  const result = await run.start({
    inputData: {
      message: "Hi, I'd like to check the status of my order ORD-001",
    },
  })

  console.log('--- Support Workflow Demo ---')
  console.log('Input:', "Hi, I'd like to check the status of my order ORD-001")
  const output = (result as { output?: { response?: string } } | null)?.output
  console.log('Response:', output?.response ?? result)
}

main().catch(console.error)
