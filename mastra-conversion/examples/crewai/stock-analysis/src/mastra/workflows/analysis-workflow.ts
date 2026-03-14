import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const researchInputSchema = z.object({
  ticker: z.string().describe('Stock ticker symbol (e.g., AAPL, MSFT)'),
})

const researchOutputSchema = z.object({
  ticker: z.string(),
  researchSummary: z.string(),
})

const reportInputSchema = z.object({
  ticker: z.string(),
  researchSummary: z.string(),
})

const reportOutputSchema = z.object({
  ticker: z.string(),
  report: z.string(),
})

const researchStep = createStep({
  id: 'research-stock',
  inputSchema: researchInputSchema,
  outputSchema: researchOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('stockResearchAgent')
    const ticker = inputData.ticker.toUpperCase().trim()
    const response = await agent.generate(
      `Research the stock with ticker symbol: ${ticker}. Use all available tools to gather complete data: current price and metrics, company profile, and analyst recommendations. Synthesize into a structured research summary.`
    )
    return {
      ticker,
      researchSummary: response.text,
    }
  },
})

const reportStep = createStep({
  id: 'write-report',
  inputSchema: reportInputSchema,
  outputSchema: reportOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('financialReportAgent')
    const response = await agent.generate(
      `Write a professional stock analysis report for ${inputData.ticker} based on the following research data:\n\n${inputData.researchSummary}`
    )
    return {
      ticker: inputData.ticker,
      report: response.text,
    }
  },
})

export const analysisWorkflow = createWorkflow({
  id: 'stock-analysis-workflow',
  description:
    'Sequential workflow: research agent gathers stock data, then report agent produces analysis.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol to analyze'),
  }),
  outputSchema: z.object({
    ticker: z.string(),
    report: z.string(),
  }),
})
  .then(researchStep)
  .then(reportStep)
  .commit()
