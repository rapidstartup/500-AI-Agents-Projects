# Stock Analysis Tool (MASTRA)

MASTRA conversion of the CrewAI Stock Analysis Tool. A sequential workflow where a research agent gathers stock data, then an analysis agent produces a report.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your OpenAI API key:
   ```bash
   cp .env.example .env
   # Edit .env and add OPENAI_API_KEY=sk-your-key
   ```

3. Run the workflow:
   ```bash
   npm run demo
   # Or with a specific ticker:
   npx tsx run_demo.ts MSFT
   ```

## Structure

- **Tools** (`src/mastra/tools/stock-tools.ts`): Yahoo Finance tools for price, company info, analyst recommendations
- **Agents** (`src/mastra/agents/stock-analyst.ts`): Senior Stock Analyst (research) and Financial Report Writer
- **Workflow** (`src/mastra/workflows/analysis-workflow.ts`): Sequential research → report pipeline
- **Mastra** (`src/mastra/index.ts`): Instance registration

## Expected Output

The workflow produces a markdown report with:
- Executive Summary
- Current Market Position
- Company Overview
- Analyst Sentiment
- Key Insights
- Considerations

## Ethical Considerations

This tool is for educational and research purposes. Stock data and AI-generated analysis are not financial advice. Always conduct your own research and consult licensed professionals before making investment decisions.
