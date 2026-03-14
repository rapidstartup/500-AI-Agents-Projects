import { Agent } from '@mastra/core/agent'
import { codeExecutionTool } from '../tools/code-execution'

/**
 * Coding assistant agent that generates code, executes it via the code-execution tool,
 * and debugs based on execution errors.
 *
 * MASTRA conversion of AutoGen "Automated Task Solving with Code Generation,
 * Execution & Debugging":
 *
 * Original AutoGen structure:
 * - AssistantAgent: generates code
 * - UserProxyAgent: executes code (code_execution_config, work_dir) and returns results
 * - Assistant debugs based on execution errors in a loop
 *
 * MASTRA Single Agent + Tools pattern:
 * - coderAgent: generates code, calls codeExecutionTool to run it, iterates on errors
 * - maxSteps enables multi-step iteration (generate -> execute -> debug -> regenerate)
 */
export const coderAgent = new Agent({
  id: 'coder',
  name: 'Coding Assistant',
  instructions: `You are a coding assistant that solves tasks by generating code, executing it, and debugging until it works.

Workflow:
1. **Generate**: Write code (JavaScript/Node.js or Python) to solve the user's task.
2. **Execute**: Use the code-execution tool to run your code and capture stdout/stderr.
3. **Debug**: If execution fails (non-zero exit, stderr, or wrong output), analyze the error, fix the code, and run again.
4. **Complete**: When execution succeeds and the output is correct, summarize the result for the user.

Guidelines:
- Prefer JavaScript/Node.js unless the user explicitly asks for Python.
- Keep code focused and minimal. Use console.log/print for output.
- When you get an error, read stderr and the error message carefully before fixing.
- You may run the tool multiple times (up to maxSteps) to iterate until correct.
- If the task requires file I/O, the tool runs in a temporary directory; paths are ephemeral.
- Always call the code-execution tool to verify your code works before declaring success.`,
  model: 'openai/gpt-4o',
  tools: { codeExecutionTool },
  defaultOptions: {
    maxSteps: 10,
  },
})
