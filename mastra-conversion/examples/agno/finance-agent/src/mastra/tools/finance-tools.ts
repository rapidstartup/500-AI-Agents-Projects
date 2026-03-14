import { createTool } from "@mastra/core/tools";
import YahooFinance from "yahoo-finance2";
import { z } from "zod";

const yahooFinance = new YahooFinance();

export const getStockPrice = createTool({
  id: "get-stock-price",
  description:
    "Get the current stock price, daily change, and trading volume for a ticker symbol. Use when the user asks about price, quote, or market data.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("Stock ticker symbol (e.g., NVDA, AAPL, GOOGL)"),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    price: z.number().nullable(),
    currency: z.string().nullable(),
    change: z.number().nullable(),
    changePercent: z.number().nullable(),
    volume: z.number().nullable(),
    marketState: z.string().nullable(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { symbol } = inputData;
    try {
      const [quote] = await yahooFinance.quote([symbol.toUpperCase()]);
      if (!quote) throw new Error("No quote data returned");
      return {
        symbol: quote.symbol ?? symbol,
        price: quote.regularMarketPrice ?? null,
        currency: quote.currency ?? null,
        change: quote.regularMarketChange ?? null,
        changePercent: quote.regularMarketChangePercent ?? null,
        volume: quote.regularMarketVolume ?? null,
        marketState: quote.marketState ?? null,
      };
    } catch (err) {
      return {
        symbol,
        price: null,
        currency: null,
        change: null,
        changePercent: null,
        volume: null,
        marketState: null,
        error: err instanceof Error ? err.message : "Failed to fetch quote",
      };
    }
  },
});

export const getCompanyProfile = createTool({
  id: "get-company-profile",
  description:
    "Get company profile including sector, industry, and business description. Use when the user asks about the company, what it does, or its sector/industry.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("Stock ticker symbol (e.g., NVDA, AAPL, GOOGL)"),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    name: z.string().nullable(),
    sector: z.string().nullable(),
    industry: z.string().nullable(),
    description: z.string().nullable(),
    website: z.string().nullable(),
    employees: z.number().nullable(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { symbol } = inputData;
    try {
      const result = await yahooFinance.quoteSummary(symbol.toUpperCase(), {
        modules: ["assetProfile", "quoteType"],
      });
      const profile = result.assetProfile;
      const name =
        result.quoteType?.longName ??
        result.quoteType?.shortName ??
        result.price?.shortName ??
        symbol;
      return {
        symbol,
        name: name || null,
        sector: profile?.sector ?? profile?.sectorDisp ?? null,
        industry: profile?.industry ?? profile?.industryDisp ?? null,
        description: profile?.longBusinessSummary ?? null,
        website: profile?.website ?? null,
        employees: profile?.fullTimeEmployees ?? null,
      };
    } catch (err) {
      return {
        symbol,
        name: null,
        sector: null,
        industry: null,
        description: null,
        website: null,
        employees: null,
        error: err instanceof Error ? err.message : "Failed to fetch profile",
      };
    }
  },
});

export const getAnalystRatings = createTool({
  id: "get-analyst-ratings",
  description:
    "Get analyst buy/hold/sell recommendations and recommendation trend. Use when the user asks about analyst ratings, recommendations, or Wall Street consensus.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("Stock ticker symbol (e.g., NVDA, AAPL, GOOGL)"),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    strongBuy: z.number().nullable(),
    buy: z.number().nullable(),
    hold: z.number().nullable(),
    sell: z.number().nullable(),
    strongSell: z.number().nullable(),
    recommendation: z.string().nullable(),
    targetPrice: z.number().nullable(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { symbol } = inputData;
    try {
      const [summary, insights] = await Promise.all([
        yahooFinance.quoteSummary(symbol.toUpperCase(), {
          modules: ["recommendationTrend"],
        }),
        yahooFinance.insights(symbol.toUpperCase()).catch(() => null),
      ]);
      const trend = summary.recommendationTrend;
      const rec = trend?.trend?.[0];
      return {
        symbol,
        strongBuy: rec?.strongBuy ?? null,
        buy: rec?.buy ?? null,
        hold: rec?.hold ?? null,
        sell: rec?.sell ?? null,
        strongSell: rec?.strongSell ?? null,
        recommendation: insights?.recommendation?.rating ?? null,
        targetPrice: insights?.recommendation?.targetPrice ?? null,
      };
    } catch (err) {
      return {
        symbol,
        strongBuy: null,
        buy: null,
        hold: null,
        sell: null,
        strongSell: null,
        recommendation: null,
        targetPrice: null,
        error: err instanceof Error ? err.message : "Failed to fetch ratings",
      };
    }
  },
});

export const getStockNews = createTool({
  id: "get-stock-news",
  description:
    "Get recent news headlines and significant developments for a stock. Use when the user asks about news, headlines, or recent developments.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe("Stock ticker symbol (e.g., NVDA, AAPL, GOOGL)"),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    headlines: z.array(
      z.object({
        headline: z.string(),
        date: z.string().nullable(),
      })
    ),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { symbol } = inputData;
    try {
      const insights = await yahooFinance.insights(symbol.toUpperCase());
      const sigDevs = insights.sigDevs ?? [];
      const headlines = sigDevs.slice(0, 10).map((dev) => ({
        headline: dev.headline ?? "",
        date: dev.date ? new Date(dev.date).toISOString() : null,
      }));
      return {
        symbol,
        headlines,
      };
    } catch (err) {
      return {
        symbol,
        headlines: [],
        error: err instanceof Error ? err.message : "Failed to fetch news",
      };
    }
  },
});
