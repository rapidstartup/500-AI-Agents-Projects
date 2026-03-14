import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

/**
 * Email classification categories for auto-responder routing.
 */
export const EMAIL_CATEGORIES = [
  'support',
  'sales',
  'general',
  'urgent',
  'feedback',
  'complaint',
] as const

export type EmailCategory = (typeof EMAIL_CATEGORIES)[number]

const classificationOutputSchema = z.object({
  category: z.enum(EMAIL_CATEGORIES),
  confidence: z.number().min(0).max(1),
  summary: z.string().optional(),
})

/**
 * Classifies an email into a category for routing and response drafting.
 * Uses keyword heuristics; in production, replace with LLM-based classification.
 */
export const classifyEmailTool = createTool({
  id: 'classify-email',
  description:
    'Classify an email into a category (support, sales, general, urgent, feedback, complaint) for routing and response generation.',
  inputSchema: z.object({
    emailContent: z.string().describe('The full email content including subject and body'),
    subject: z.string().optional().describe('The email subject line'),
  }),
  outputSchema: classificationOutputSchema,
  execute: async (inputData) => {
    const { emailContent, subject } = inputData
    const text = `${subject ?? ''} ${emailContent}`.toLowerCase()

    // Keyword-based classification (production: use LLM with structured output)
    const keywords: Record<EmailCategory, string[]> = {
      support: ['help', 'support', 'issue', 'problem', 'not working', 'error', 'bug'],
      sales: ['buy', 'purchase', 'price', 'quote', 'discount', 'order', 'pricing'],
      urgent: ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'as soon as'],
      complaint: ['complaint', 'unhappy', 'refund', 'cancel', 'dissatisfied', 'terrible'],
      feedback: ['feedback', 'suggestion', 'improve', 'recommendation', 'idea'],
      general: [],
    }

    let bestCategory: EmailCategory = 'general'
    let bestScore = 0

    for (const [category, words] of Object.entries(keywords) as [EmailCategory, string[]][]) {
      if (category === 'general') continue
      const score = words.filter((w) => text.includes(w)).length
      if (score > bestScore) {
        bestScore = score
        bestCategory = category
      }
    }

    const confidence = bestScore > 0 ? Math.min(0.95, 0.5 + bestScore * 0.15) : 0.6

    return {
      category: bestCategory,
      confidence,
      summary: `Classified as ${bestCategory} (confidence: ${(confidence * 100).toFixed(0)}%)`,
    }
  },
})

/**
 * Sends an email response. In production, integrate with SMTP, SendGrid, etc.
 */
export const sendEmailResponseTool = createTool({
  id: 'send-email-response',
  description:
    'Send an email response to a recipient. Use after the draft has been approved.',
  inputSchema: z.object({
    recipient: z.string().email().describe('The recipient email address'),
    subject: z.string().describe('The email subject line'),
    body: z.string().describe('The email body content'),
    replyToId: z.string().optional().describe('Original email ID for threading'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { recipient, subject, body, replyToId } = inputData

    try {
      // In production: integrate with your email provider (SendGrid, Resend, SMTP, etc.)
      // For demo: simulate successful send
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

      console.log('[sendEmailResponse] Simulated send:', {
        recipient,
        subject: subject.slice(0, 50),
        replyToId,
        messageId,
      })

      return {
        success: true,
        messageId,
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      return {
        success: false,
        error,
      }
    }
  },
})
