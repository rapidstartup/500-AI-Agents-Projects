import { Agent } from '@mastra/core/agent'
import { z } from 'zod'

const validationResult = z.object({
  isValid: z.boolean(),
  errors: z.array(z.object({
    line: z.number(),
    column: z.number(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
  })),
  suggestions: z.array(z.string()),
  summary: z.string(),
})

export const markdownValidatorAgent = new Agent({
  id: 'markdown-validator',
  name: 'Markdown Validator',
  description: 'Validates markdown files for syntax and style issues',
  instructions: `You are a Markdown validation expert. Your task is to analyze and validate markdown content.

Validation checks to perform:
1. **Syntax**: Proper markdown syntax (headers, lists, links, code blocks)
2. **Formatting**: Consistent indentation, spacing, line breaks
3. **Links**: Valid URLs, proper link syntax
4. **Code blocks**: Proper language tags, closed fences
5. **Images**: Valid image syntax, alt text
6. **Style**: Consistent heading hierarchy, readable line lengths

When validating:
- Provide line and column numbers for issues
- Categorize by severity (error, warning, info)
- Suggest specific fixes
- Summarize overall quality

If the user provides markdown content, validate it and provide a detailed report.
If the markdown is valid, confirm that and provide any helpful suggestions.`,
  model: 'openai/gpt-4o',
})
