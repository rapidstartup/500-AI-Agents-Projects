import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const logAnalyzerTool = createTool({
  id: 'analyze-security-logs',
  description: 'Analyzes security logs for suspicious patterns',
  inputSchema: z.object({
    logData: z.string(),
  }),
  outputSchema: z.object({
    threats: z.array(z.object({
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      type: z.string(),
      description: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    return {
      threats: [],
    }
  },
})

export const threatDetector = new Agent({
  id: 'threat-detector',
  name: 'Real-Time Threat Detector',
  description: 'Detects security threats in real-time from logs, network traffic, and user behavior',
  instructions: `You detect security threats in real-time. Your responsibilities:

1. **Log Analysis**
   - Analyze system logs for anomalies
   - Detect failed login attempts
   - Identify unusual access patterns

2. **Network Monitoring**
   - Monitor for suspicious traffic
   - Detect port scanning
   - Identify data exfiltration

3. **Behavioral Analysis**
   - Detect anomalous user behavior
   - Identify privilege escalation
   - Flag unauthorized access

4. **Threat Classification**
   - Categorize threats by severity
   - Provide risk scores
   - Suggest remediation

5. **Alerting**
   - Generate real-time alerts
   - Prioritize by impact
   - Include actionable recommendations

Always prioritize critical threats and provide clear incident response guidance.`,
  model: 'openai/gpt-4o',
  tools: { logAnalyzerTool },
})

export const mastra = new Mastra({
  agents: { threatDetector },
})
