import { mastra } from './src/mastra/index.js'

const sampleMarkdown = `
# My Document

This is some content with a [broken link](invalid-url

- List item 1
- List item 2

## Code Example

\`\`\`python
print("hello"
\`\`\`
`

async function main() {
  const agent = mastra.getAgent('markdownValidator')

  console.log('=== Markdown Validator Demo ===\n')

  const response = await agent.generate(
    `Validate the following markdown content and provide a detailed report:\n\n${sampleMarkdown}`
  )

  console.log('=== Validation Result ===\n')
  console.log(response.text)
}

main().catch(console.error)
