import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { execSync } from 'child_process'
import { writeFileSync, mkdtempSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

/**
 * Code execution tool for the coder agent.
 *
 * SAFETY NOTES (demo only - NOT production-ready):
 * - Uses child_process.execSync: runs in the SAME process context as the host.
 * - NOT truly sandboxed: code has full access to filesystem, network, env vars.
 * - For production: use Docker, VM, or a dedicated sandbox service (e.g. E2B, Modal).
 * - Timeout and output limits mitigate runaway execution but do not prevent malicious code.
 */

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_MAX_OUTPUT_LENGTH = 10_000

export const codeExecutionTool = createTool({
  id: 'code-execution',
  description:
    'Execute code and return stdout/stderr. Use this to run generated code, verify it works, and capture output or errors for debugging. Supports JavaScript/Node.js and Python.',
  inputSchema: z.object({
    code: z.string().describe('The code to execute (JavaScript/Node.js or Python)'),
    language: z
      .enum(['javascript', 'python'])
      .optional()
      .default('javascript')
      .describe('Language: "javascript" (Node.js) or "python"'),
    timeoutMs: z
      .number()
      .min(1000)
      .max(60_000)
      .optional()
      .default(DEFAULT_TIMEOUT_MS)
      .describe('Execution timeout in milliseconds'),
  }),
  outputSchema: z.object({
    stdout: z.string().describe('Standard output from execution'),
    stderr: z.string().describe('Standard error from execution'),
    exitCode: z.number().describe('Process exit code (0 = success)'),
    success: z.boolean().describe('Whether execution completed without error'),
    error: z.string().optional().describe('Error message if execution failed'),
  }),
  execute: async (inputData) => {
    const { code, language, timeoutMs } = inputData
    const workDir = mkdtempSync(join(tmpdir(), 'mastra-code-exec-'))

    try {
      const ext = language === 'python' ? 'py' : 'js'
      const filePath = join(workDir, `script.${ext}`)
      writeFileSync(filePath, code, 'utf-8')

      const cmd = language === 'python' ? `python "${filePath}"` : `node "${filePath}"`
      const maxOutput = DEFAULT_MAX_OUTPUT_LENGTH

      const result = execSync(cmd, {
        cwd: workDir,
        encoding: 'utf-8',
        timeout: timeoutMs,
        maxBuffer: maxOutput,
      })

      const stdout = (result ?? '').toString().slice(0, maxOutput)
      return {
        stdout,
        stderr: '',
        exitCode: 0,
        success: true,
      }
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; status?: number; message?: string }
      const stdout = (execErr.stdout ?? '').toString().slice(0, DEFAULT_MAX_OUTPUT_LENGTH)
      const stderr = (execErr.stderr ?? '').toString().slice(0, DEFAULT_MAX_OUTPUT_LENGTH)
      const exitCode = execErr.status ?? (execErr as NodeJS.ErrnoException).code ?? 1
      const errorMsg = execErr.message ?? String(err)

      return {
        stdout,
        stderr: stderr || errorMsg,
        exitCode: typeof exitCode === 'number' ? exitCode : 1,
        success: false,
        error: errorMsg,
      }
    } finally {
      rmSync(workDir, { recursive: true, force: true })
    }
  },
})
