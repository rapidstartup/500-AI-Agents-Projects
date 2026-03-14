import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const searchResultSchema = z.object({
  title: z.string(),
  snippet: z.string(),
  link: z.string().optional(),
})

const outputSchema = z.object({
  results: z.array(searchResultSchema),
  totalCount: z.number(),
})

/**
 * Web search tool using a configurable search API.
 * Uses Serper API (https://serper.dev) when SERPER_API_KEY is set,
 * otherwise falls back to DuckDuckGo Instant Answer API (no key required).
 */
export const searchTool = createTool({
  id: 'web-search',
  description:
    'Search the web for information about destinations, attractions, hotels, restaurants, weather, and travel tips. Use this to research cities and gather up-to-date travel information.',
  inputSchema: z.object({
    query: z.string().describe('The search query (e.g., "best hotels in Paris 2024")'),
    numResults: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .default(5)
      .describe('Number of results to return (1-20)'),
  }),
  outputSchema,
  execute: async (inputData) => {
    const { query, numResults } = inputData
    const apiKey = process.env.SERPER_API_KEY

    try {
      if (apiKey) {
        return await searchWithSerper(query, numResults, apiKey)
      }
      return await searchWithDuckDuckGo(query, numResults)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown search error'
      return {
        results: [
          {
            title: 'Search unavailable',
            snippet: `Search failed: ${message}. Consider using SERPER_API_KEY for better results.`,
          },
        ],
        totalCount: 0,
      }
    }
  },
})

async function searchWithSerper(
  query: string,
  numResults: number,
  apiKey: string
): Promise<z.infer<typeof outputSchema>> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ q: query, num: numResults }),
  })

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as {
    organic?: Array<{ title?: string; snippet?: string; link?: string }>
  }

  const organic = data.organic ?? []
  const results = organic.slice(0, numResults).map((item) => ({
    title: item.title ?? '',
    snippet: item.snippet ?? '',
    link: item.link,
  }))

  return {
    results,
    totalCount: results.length,
  }
}

async function searchWithDuckDuckGo(
  query: string,
  numResults: number
): Promise<z.infer<typeof outputSchema>> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`DuckDuckGo API error: ${response.status}`)
  }

  const data = (await response.json()) as {
    Abstract?: string
    AbstractText?: string
    RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>
  }

  const results: Array<{ title: string; snippet: string; link?: string }> = []

  if (data.AbstractText) {
    results.push({
      title: data.Abstract ?? query,
      snippet: data.AbstractText,
      link: undefined,
    })
  }

  const related = data.RelatedTopics ?? []
  for (const topic of related) {
    if (results.length >= numResults) break
    if (topic.Text) {
      results.push({
        title: topic.Text.slice(0, 80),
        snippet: topic.Text,
        link: topic.FirstURL,
      })
    }
  }

  return {
    results,
    totalCount: results.length,
  }
}
