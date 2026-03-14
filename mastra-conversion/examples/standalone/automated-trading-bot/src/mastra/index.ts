import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const marketDataTool = createTool({
  id: 'get-market-data',
  description: 'Fetches current market data for a given symbol',
  inputSchema: z.object({
    symbol: z.string().describe('Stock or crypto symbol'),
  }),
  outputSchema: z.object({
    price: z.number(),
    change: z.number(),
    volume: z.number(),
    timestamp: z.string(),
  }),
  execute: async ({ inputData }) => {
    return {
      price: 150.25,
      change: 2.5,
      volume: 1000000,
      timestamp: new Date().toISOString(),
    }
  },
})

export const tradingBot = new Agent({
  id: 'trading-bot',
  name: 'Automated Trading Bot',
  description: 'Executes automated trading strategies based on market analysis',
  instructions: `You are an automated trading bot. Your responsibilities:

1. **Market Analysis**
   - Analyze current market data
   - Identify trends and patterns
   - Monitor news and sentiment

2. **Signal Generation**
   - Generate buy/sell signals
   - Calculate position sizes
   - Set stop-loss levels

3. **Risk Management**
   - Enforce max position size (5% per trade)
   - Enforce daily loss limit (3%)
   - Diversify across sectors

4. **Trade Execution**
   - Execute trades at optimal prices
   - Minimize slippage
   - Log all transactions

Always prioritize capital preservation over profits.
Never risk more than 2% of portfolio on a single trade.`,
  model: 'openai/gpt-4o',
  tools: { marketDataTool },
})

export const mastra = new Mastra({
  agents: { tradingBot },
})
