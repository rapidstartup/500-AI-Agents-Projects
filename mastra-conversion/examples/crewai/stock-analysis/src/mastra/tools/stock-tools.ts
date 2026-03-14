import { createTool } from '@mastra/core/tools'
import YahooFinance from 'yahoo-finance2'
import { z } from 'zod'

const yahooFinance = new YahooFinance()

export const getStockPrice = createTool({
  id: 'get-stock-price',
  description:
    'Get the current stock price and key trading metrics for a given ticker symbol (e.g., AAPL, MSFT, GOOGL).',
  inputSchema: z.object({
    symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, MSFT)'),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    price: z.number(),
    currency: z.string().optional(),
    change: z.number().optional(),
    changePercent: z.number().optional(),
    marketCap: z.number().optional(),
    volume: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    try {
      const quote = await yahooFinance.quote(inputData.symbol) as {
        symbol?: string
        regularMarketPrice?: number
        currency?: string
        regularMarketChange?: number
        regularMarketChangePercent?: number
        marketCap?: number
        regularMarketVolume?: number
      }
      return {
        symbol: quote.symbol ?? inputData.symbol,
        price: quote.regularMarketPrice ?? 0,
        currency: quote.currency,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        marketCap: quote.marketCap,
        volume: quote.regularMarketVolume,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        symbol: inputData.symbol,
        price: 0,
        error: `Failed to fetch quote: ${message}`,
      }
    }
  },
})

export const getCompanyInfo = createTool({
  id: 'get-company-info',
  description:
    'Get company profile and summary information for a stock ticker (sector, industry, description, employees).',
  inputSchema: z.object({
    symbol: z.string().describe('Stock ticker symbol'),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    longName: z.string().optional(),
    sector: z.string().optional(),
    industry: z.string().optional(),
    fullTimeEmployees: z.number().optional(),
    summary: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    try {
      const summary = await yahooFinance.quoteSummary(inputData.symbol, {
        modules: ['assetProfile', 'summaryProfile', 'quoteType'],
      })
      const assetProfile = summary.assetProfile ?? summary.summaryProfile
      const quoteType = summary.quoteType
      const longName =
        quoteType?.longName ?? assetProfile?.longName ?? inputData.symbol
      return {
        symbol: inputData.symbol,
        longName,
        sector: assetProfile?.sector,
        industry: assetProfile?.industry,
        fullTimeEmployees: assetProfile?.fullTimeEmployees,
        summary:
          assetProfile?.longBusinessSummary ??
          (assetProfile
            ? `${assetProfile.sector ?? ''} - ${assetProfile.industry ?? ''}`
            : undefined),
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        symbol: inputData.symbol,
        error: `Failed to fetch company info: ${message}`,
      }
    }
  },
})

export const getAnalystRecommendations = createTool({
  id: 'get-analyst-recommendations',
  description:
    'Get analyst recommendation trends (buy/hold/sell counts) and similar stock recommendations for a ticker.',
  inputSchema: z.object({
    symbol: z.string().describe('Stock ticker symbol'),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    recommendationTrend: z
      .object({
        strongBuy: z.number().optional(),
        buy: z.number().optional(),
        hold: z.number().optional(),
        sell: z.number().optional(),
        strongSell: z.number().optional(),
      })
      .optional(),
    similarStocks: z
      .array(
        z.object({
          symbol: z.string(),
          score: z.number(),
        })
      )
      .optional(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    try {
      const [summary, recsBySymbol] = await Promise.all([
        yahooFinance.quoteSummary(inputData.symbol, {
          modules: ['recommendationTrend'],
        }),
        yahooFinance.recommendationsBySymbol(inputData.symbol),
      ])

      const trend = summary.recommendationTrend
      const recommendationTrend = trend
        ? {
            strongBuy: trend.strongBuy,
            buy: trend.buy,
            hold: trend.hold,
            sell: trend.sell,
            strongSell: trend.strongSell,
          }
        : undefined

      const similarStocks =
        Array.isArray(recsBySymbol) && recsBySymbol.length > 0
          ? recsBySymbol[0].recommendedSymbols?.slice(0, 10).map((r: { symbol: string; score?: number }) => ({
              symbol: r.symbol,
              score: r.score ?? 0,
            }))
          : !Array.isArray(recsBySymbol) && recsBySymbol?.recommendedSymbols
            ? recsBySymbol.recommendedSymbols.slice(0, 10).map((r: { symbol: string; score?: number }) => ({
                symbol: r.symbol,
                score: r.score ?? 0,
              }))
            : undefined

      return {
        symbol: inputData.symbol,
        recommendationTrend,
        similarStocks,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        symbol: inputData.symbol,
        error: `Failed to fetch analyst recommendations: ${message}`,
      }
    }
  },
})
