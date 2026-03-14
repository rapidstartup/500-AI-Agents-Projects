import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const intentClassifier = createTool({
  id: 'classify-intent',
  description: 'Classifies user intent from message',
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    intent: z.enum(['product_info', 'support', 'billing', 'sales', 'general']),
    confidence: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { message } = inputData.toLowerCase()
    if (message.includes('price') || message.includes('cost')) {
      return { intent: 'product_info', confidence: 0.9 }
    }
    if (message.includes('help') || message.includes('problem')) {
      return { intent: 'support', confidence: 0.85 }
    }
    return { intent: 'general', confidence: 0.7 }
  },
})

export const chatbotAgent = new Agent({
  id: 'chatbot-24-7',
  name: '24/7 AI Chatbot',
  description: 'Round-the-clock chatbot with intent recognition and flow handling',
  instructions: `You are a 24/7 AI customer service chatbot. Your capabilities:

1. **Intent Recognition**
   - Classify user messages into: product_info, support, billing, sales, general
   - Use the intent classifier tool when unclear

2. **Response Generation**
   - Provide accurate, helpful responses
   - Match tone to customer sentiment
   - Keep responses concise but complete

3. **Escalation**
   - Detect when issues cannot be resolved
   - Summarize context for human agent
   - Provide clear next steps

4. **Context**
   - Remember conversation history within session
   - Reference previous interactions when relevant

5. **Boundaries**
   - Don't make commitments beyond your capabilities
   - Be transparent about limitations
   - Always offer human fallback`,
  model: 'openai/gpt-4o',
  tools: { intentClassifier },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'chatbot-storage',
      url: 'file:mastra.db',
    }),
  }),
})

export const mastra = new Mastra({
  agents: { chatbotAgent },
})
