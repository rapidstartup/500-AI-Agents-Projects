import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const paperSchema = z.object({
  title: z.string(),
  summary: z.string(),
  authors: z.array(z.string()),
  published: z.string(),
  link: z.string(),
})

const outputSchema = z.object({
  papers: z.array(paperSchema),
  totalCount: z.number(),
})

/**
 * ArXiv search tool for finding academic papers.
 * Queries the ArXiv API for papers matching a given topic.
 */
export const arxivSearchTool = createTool({
  id: 'arxiv-search',
  description:
    'Search ArXiv for academic papers on a given topic. Use this to find latest research papers, their summaries, and metadata. Returns title, summary, authors, publication date, and link.',
  inputSchema: z.object({
    query: z
      .string()
      .describe('Search query (e.g., "gpt-4", "large language models", "automated theorem proving")'),
    maxResults: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .default(5)
      .describe('Maximum number of papers to return (1-20)'),
  }),
  outputSchema,
  execute: async (inputData) => {
    const { query, maxResults } = inputData
    const searchQuery = `all:${encodeURIComponent(query)}`
    const url = `https://export.arxiv.org/api/query?search_query=${searchQuery}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`ArXiv API error: ${response.status} ${response.statusText}`)
      }

      const xml = await response.text()
      const papers = parseArxivXml(xml)

      return {
        papers,
        totalCount: papers.length,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown ArXiv error'
      return {
        papers: [
          {
            title: 'Search failed',
            summary: `ArXiv search failed: ${message}`,
            authors: [],
            published: '',
            link: '',
          },
        ],
        totalCount: 0,
      }
    }
  },
})

function parseArxivXml(
  xml: string
): Array<{ title: string; summary: string; authors: string[]; published: string; link: string }> {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []
  return entries.map((entry) => {
    const title =
      entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim() ?? ''
    const summary =
      entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, ' ').trim() ?? ''
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? ''
    const link = entry.match(/<id>([^<]+)<\/id>/)?.[1] ?? ''
    const authors = [...entry.matchAll(/<name>([^<]+)<\/name>/g)].map((m) => m[1])

    return {
      title,
      summary,
      authors,
      published,
      link,
    }
  })
}
