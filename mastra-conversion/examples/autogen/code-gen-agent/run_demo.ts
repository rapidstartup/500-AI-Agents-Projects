/**
 * Demo runner for the MASTRA AutoGen Code Gen Agent conversion.
 * Single agent + code-execution tool: generates code, executes, debugs.
 *
 * Usage: npx tsx run_demo.ts [prompt]
 *
 * Example: npx tsx run_demo.ts "Write a function that computes the first 10 Fibonacci numbers and print them"
 *
 * Requires: OPENAI_API_KEY in .env
 */

import { mastra } from './src/mastra/index'

const PROMPT =
  process.argv[2] ??
  'Write a JavaScript function that computes the first 10 Fibonacci numbers and prints them.'

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required. Add it to .env')
    process.exit(1)
  }

  console.log('\n## AutoGen Code Gen Agent (MASTRA Single Agent + Tools)\n')
  console.log('Prompt:', PROMPT)
  console.log('\n--- Response ---\n')

  const coder = mastra.getAgent('coderAgent')
  const response = await coder.generate(PROMPT, { maxSteps: 10 })

  console.log(response.text)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
