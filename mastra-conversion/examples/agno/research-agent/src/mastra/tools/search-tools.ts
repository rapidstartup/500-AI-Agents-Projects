import { createTool } from '@mastra/core/tools'
import { search } from 'duck-duck-scrape'
import { z } from 'zod'

/**
 * Extract readable text from HTML by stripping tags and normalizing whitespace.
 */
function extractTextFromHtml(html: string): string {
  const withoutScripts = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  const withoutStyles = withoutScripts.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  const text = withoutStyles.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
  const decoded = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  return decoded.replace(/\s+/g, ' ').trim()
}

/**
 * Web search tool using DuckDuckGo.
 * MASTRA conversion of Agno DuckDuckGoTools - returns search results with URLs.
 */
export const webSearchTool = createTool({
  id: 'web-search',
  description:
    'Search the web using DuckDuckGo. Returns a list of results with title, URL, and snippet. Use this to find relevant articles and sources for research.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    maxResults: z.number().min(1).max(10).optional().default(5),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string().optional(),
      })
    ),
    noResults: z.boolean(),
  }),
  execute: async (inputData) => {
    const { query, maxResults } = inputData
    try {
      const searchResults = await search(query, { safeSearch: 0 })
      const results = (searchResults.results ?? [])
        .slice(0, maxResults)
        .map((r: { title?: string; url?: string; description?: string }) => ({
          title: r.title ?? '',
          url: r.url ?? '',
          snippet: r.description,
        }))
      return {
        results,
        noResults: searchResults.noResults ?? results.length === 0,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        results: [],
        noResults: true,
      }
    }
  },
})

/**
 * Read and extract article text from a web page URL.
 * MASTRA conversion of Agno NewspaperTools - fetches and extracts main content.
 */
export const readWebPageTool = createTool({
  id: 'read-web-page',
  description:
    'Fetch a URL and extract the main text content. Use this to read article content from URLs returned by web search.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to fetch and extract text from'),
  }),
  outputSchema: z.object({
    url: z.string(),
    title: z.string().optional(),
    text: z.string(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { url } = inputData
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; ResearchAgent/1.0; +https://github.com/mastra-ai)',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        return {
          url,
          text: '',
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }
      const html = await response.text()
      const text = extractTextFromHtml(html)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const title = titleMatch ? titleMatch[1].trim() : undefined
      return {
        url,
        title,
        text: text.slice(0, 50000),
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        url,
        text: '',
        error: message,
      }
    }
  },
})
