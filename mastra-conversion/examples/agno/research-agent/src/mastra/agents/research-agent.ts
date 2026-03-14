import { Agent } from '@mastra/core/agent'
import { webSearchTool, readWebPageTool } from '../tools/search-tools.js'

/**
 * Research agent with web search and page reading tools.
 * MASTRA conversion of Agno Research Agent (research_agent.py).
 *
 * Original Agno structure:
 * - Agent with DuckDuckGoTools and NewspaperTools
 * - Senior NYT researcher persona
 * - Search top 5 links, read each URL, compose NYT-worthy article
 *
 * MASTRA Single Agent + Tools pattern:
 * - webSearch: DuckDuckGo search for sources
 * - readWebPage: Fetch and extract article text from URLs
 */
export const researchAgent = new Agent({
  id: 'research-agent',
  name: 'Research Agent',
  description:
    'A senior NYT researcher that investigates topics by searching the web, reading articles, and composing journalistic pieces.',
  instructions: `You are a senior NYT researcher writing an article on a topic.

For a given topic:
1. Use web-search to find the top 5 most relevant links.
2. Use read-web-page to fetch and extract the article text from each URL.
3. Synthesize the information and compose a NYT-worthy article.

Guidelines:
- Ground your article in the sources you read - cite and reference them.
- Use a journalistic tone: clear, factual, well-structured.
- Include an engaging headline and coherent paragraphs.
- If a URL fails to load, note it and proceed with available sources.
- Format your response in Markdown.`,
  model: 'openai/gpt-4o',
  tools: {
    webSearch: webSearchTool,
    readWebPage: readWebPageTool,
  },
})
