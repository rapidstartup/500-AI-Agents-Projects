/**
 * Demo runner for the MASTRA Email Auto Responder Flow.
 *
 * Usage:
 *   npx tsx run_demo.ts
 *
 * Requires: OPENAI_API_KEY in .env
 */

import { mastra } from './src/mastra/index'

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required. Add it to .env')
    process.exit(1)
  }

  const workflow = mastra.getWorkflow('emailFlow')

  const sampleEmail = `Subject: Urgent - Cannot access my account

Hi support team,

I've been trying to log in to my account for the past 2 hours but keep getting an error message. 
This is critical as I need to complete a purchase before the end of the day.

Please help as soon as possible.

Thanks,
John`
  const inputData = {
    email: sampleEmail,
    subject: 'Urgent - Cannot access my account',
    sender: 'john@example.com',
  }

  console.log('\n## Email Auto Responder Flow\n')
  console.log('Input email:', inputData.subject)
  console.log('\n--- Processing (classify -> draft -> evaluate loop) ---\n')

  const run = await workflow.createRun()
  const result = await run.start({ inputData })

  const raw = result?.result ?? result?.output ?? result
  // Branch output is keyed by step id (approve-response | re-draft-exhausted)
  const output =
    raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)['approve-response'] ??
        (raw as Record<string, unknown>)['re-draft-exhausted'] ??
        raw
      : raw
  if (output && typeof output === 'object' && 'draft' in output) {
    const out = output as {
      draft: string
      classification: string
      qualityScore: number
      iterations: number
      needsReview?: boolean
    }
    console.log('Classification:', out.classification)
    console.log('Quality score:', out.qualityScore.toFixed(2))
    console.log('Iterations:', out.iterations)
    if (out.needsReview) console.log('Needs human review: yes')
    console.log('\n--- Draft Response ---\n')
    console.log(out.draft)
  } else {
    console.log('Result:', JSON.stringify(output, null, 2))
  }
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
