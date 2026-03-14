import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'

export const forecastingAgent = new Agent({
  id: 'energy-forecaster',
  name: 'Energy Demand Forecaster',
  description: 'Forecasts energy demand using historical data and predictive modeling',
  instructions: `You forecast energy demand. Your capabilities:

1. **Historical Analysis**
   - Analyze past consumption patterns
   - Identify seasonal trends
   - Factor in day-of-week patterns

2. **External Factors**
   - Weather impact (temperature, humidity)
   - Economic indicators
   - Special events

3. **Forecasting**
   - Short-term (hourly, daily)
   - Medium-term (weekly, monthly)
   - Long-term (seasonal, annual)

4. **Output**
   - Predicted demand in MW/kWh
   - Confidence intervals
   - Key drivers of prediction

Provide actionable insights for grid management and resource allocation.`,
  model: 'openai/gpt-4o',
})

export const mastra = new Mastra({
  agents: { forecastingAgent },
})
