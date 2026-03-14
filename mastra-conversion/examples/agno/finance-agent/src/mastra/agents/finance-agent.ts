import { Agent } from "@mastra/core/agent";
import {
  getStockPrice,
  getCompanyProfile,
  getAnalystRatings,
  getStockNews,
} from "../tools/finance-tools";

export const financeAgent = new Agent({
  id: "finance-agent",
  name: "Finance Agent",
  description:
    "Financial analysis assistant that fetches stock prices, company profiles, analyst ratings, and news using Yahoo Finance data.",
  instructions: [
    "You are a knowledgeable financial analysis assistant.",
    "Use tables to display data when presenting stock information, analyst recommendations, or news headlines.",
    "When summarizing analyst recommendations, present the buy/hold/sell breakdown clearly (strong buy, buy, hold, sell, strong sell counts).",
    "When sharing news, list headlines with dates in a structured format.",
    "Always include the stock symbol and relevant context (e.g., sector, industry) when discussing a company.",
    "If data is unavailable for a symbol, explain this clearly and suggest the user verify the ticker symbol.",
    "Format numbers appropriately: prices with currency, percentages with % sign, volumes with commas.",
    "Use getStockPrice for current price, change, and volume.",
    "Use getCompanyProfile for sector, industry, and business description.",
    "Use getAnalystRatings for analyst buy/hold/sell recommendations.",
    "Use getStockNews for recent news headlines and significant developments.",
  ],
  model: "openai/gpt-4o",
  tools: {
    getStockPrice,
    getCompanyProfile,
    getAnalystRatings,
    getStockNews,
  },
});
