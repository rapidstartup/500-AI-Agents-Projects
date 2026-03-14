import { Mastra } from '@mastra/core/mastra'
import { coderAgent } from './agents/coder'

/**
 * MASTRA conversion of AutoGen "Automated Task Solving with Code Generation,
 * Execution & Debugging".
 *
 * Original AutoGen structure:
 * - AssistantAgent that generates code
 * - UserProxyAgent that executes code and returns results
 * - Assistant debugs based on execution errors
 * - Uses code_execution_config with a work directory
 *
 * MASTRA Single Agent + Tools pattern:
 * - coderAgent: generates code, calls codeExecutionTool to execute, iterates on errors
 * - UserProxyAgent is replaced by the code-execution tool
 * - maxSteps enables the generate -> execute -> debug loop
 */
export const mastra = new Mastra({
  agents: {
    coderAgent,
  },
})
