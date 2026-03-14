import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const sensorDataTool = createTool({
  id: 'get-sensor-data',
  description: 'Fetches current sensor readings from factory equipment',
  inputSchema: z.object({
    equipmentId: z.string(),
    metrics: z.array(z.string()),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    pressure: z.number(),
    vibration: z.number(),
    efficiency: z.number(),
    timestamp: z.string(),
  }),
  execute: async () => {
    return {
      temperature: 75.5,
      pressure: 120.3,
      vibration: 0.02,
      efficiency: 94.5,
      timestamp: new Date().toISOString(),
    }
  },
})

export const processMonitor = new Agent({
  id: 'process-monitor',
  name: 'Factory Process Monitor',
  description: 'Monitors factory equipment and detects anomalies in real-time',
  instructions: `You monitor factory processes and equipment. Your responsibilities:

1. **Data Analysis**
   - Analyze sensor readings in real-time
   - Compare against normal operating ranges
   - Identify trends and patterns

2. **Anomaly Detection**
   - Flag readings outside normal ranges
   - Detect unusual patterns that may indicate problems
   - Predict potential failures before they occur

3. **Alert Generation**
   - Generate alerts for critical issues
   - Prioritize by severity
   - Provide actionable recommendations

4. **Reporting**
   - Create daily/weekly efficiency reports
   - Identify improvement opportunities
   - Track key performance indicators

Normal ranges:
- Temperature: 60-90°C
- Pressure: 100-150 PSI
- Vibration: 0-0.05
- Efficiency: >85%`,
  model: 'openai/gpt-4o',
  tools: { sensorDataTool },
})

export const mastra = new Mastra({
  agents: { processMonitor },
})
