import { Mastra } from '@mastra/core/mastra'
import { stockResearchAgent, financialReportAgent } from './agents/stock-analyst'
import { analysisWorkflow } from './workflows/analysis-workflow'

export const mastra = new Mastra({
  agents: {
    stockResearchAgent,
    financialReportAgent,
  },
  workflows: {
    analysisWorkflow,
  },
})
