import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

/**
 * Common clause types in legal documents.
 */
const CLAUSE_PATTERNS: Record<string, RegExp> = {
  indemnification: /\b(indemnif(y|ies|ication)|hold\s+harmless|defend\s+and\s+indemnif)\b/gi,
  limitation_of_liability:
    /\b(limitation\s+of\s+liability|limit\s+liability|liability\s+cap|capped?\s+at|maximum\s+liability)\b/gi,
  termination: /\b(termination|terminate|expiration|expire|cancel)\b/gi,
  confidentiality: /\b(confidential|confidentiality|non[- ]?disclosure|nda|proprietary)\b/gi,
  dispute_resolution:
    /\b(dispute\s+resolution|arbitration|mediation|governing\s+law|jurisdiction|venue)\b/gi,
  warranty: /\b(warranty|warranties|representations?\s+and\s+warranties)\b/gi,
  force_majeure: /\b(force\s+majeure|act\s+of\s+god|unforeseeable)\b/gi,
  assignment: /\b(assignment|assign|assignability)\b/gi,
  entire_agreement: /\b(entire\s+agreement|integration|supersede)\b/gi,
  amendment: /\b(amendment|amend|modification|modify)\b/gi,
  notices: /\b(notice|notices|notify|notification)\b/gi,
  definitions: /\b(definitions?|defined\s+terms?)\b/gi,
  term: /\b(term\s+of|term\s+and\s+conditions?|duration)\b/gi,
  governing_law: /\b(governing\s+law|choice\s+of\s+law|applicable\s+law)\b/gi,
}

/**
 * Risk-focused patterns for high-stakes clauses.
 */
const RISK_PATTERNS: Array<{ type: string; pattern: RegExp; severity: 'high' | 'medium' }> = [
  {
    type: 'indemnification',
    pattern: /\b(indemnif(y|ies|ication)|hold\s+harmless)\b/gi,
    severity: 'high',
  },
  {
    type: 'limitation_of_liability',
    pattern: /\b(limitation\s+of\s+liability|liability\s+cap|capped?\s+at)\b/gi,
    severity: 'high',
  },
  {
    type: 'liquidated_damages',
    pattern: /\b(liquidated\s+damages|penalty\s+clause)\b/gi,
    severity: 'high',
  },
  {
    type: 'warranty_disclaimer',
    pattern: /\b(as\s+is|disclaimer|no\s+warranty|without\s+warranty)\b/gi,
    severity: 'medium',
  },
  {
    type: 'consequential_damages',
    pattern: /\b(consequential|incidental|indirect\s+damages)\b/gi,
    severity: 'high',
  },
  {
    type: 'exclusive_remedy',
    pattern: /\b(exclusive\s+remedy|sole\s+remedy)\b/gi,
    severity: 'medium',
  },
]

/**
 * Standard template clauses expected in typical commercial agreements.
 */
const STANDARD_TEMPLATE_CLAUSES = [
  'definitions',
  'term',
  'termination',
  'confidentiality',
  'limitation_of_liability',
  'indemnification',
  'warranty',
  'dispute_resolution',
  'governing_law',
  'entire_agreement',
  'amendment',
  'assignment',
  'force_majeure',
  'notices',
]

/**
 * Parse document text into sections based on common legal document structure.
 */
function parseDocumentSections(documentText: string): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = []
  const text = documentText.trim()

  // Match common section headers: "1. Title", "ARTICLE I", "Section 1.1", etc.
  const sectionRegex =
    /(?:^|\n)\s*(?:(?:ARTICLE\s+[IVXLCDM]+|[0-9]+\.|[0-9]+\.[0-9]+)\s*[-.:]?\s*)([^\n]+)/gi

  let lastIndex = 0
  let match: RegExpExecArray | null

  const headerMatches: Array<{ index: number; fullMatch: string; title: string }> = []
  while ((match = sectionRegex.exec(text)) !== null) {
    headerMatches.push({
      index: match.index,
      fullMatch: match[0],
      title: match[1].trim(),
    })
  }

  for (let i = 0; i < headerMatches.length; i++) {
    const start = headerMatches[i].index
    const end = i + 1 < headerMatches.length ? headerMatches[i + 1].index : text.length
    const content = text.slice(start, end).trim()
    sections.push({
      title: headerMatches[i].title,
      content,
    })
  }

  // If no structured sections found, treat whole document as one section
  if (sections.length === 0 && text.length > 0) {
    sections.push({ title: 'Document', content: text })
  }

  return sections
}

/**
 * Extract plain text from document (handles basic HTML/markdown stripping).
 */
function extractPlainText(documentText: string): string {
  return documentText
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * parseDocument - Extract text and sections from a legal document.
 */
export const parseDocumentTool = createTool({
  id: 'parse-document',
  description:
    'Extract text and sections from a legal document. Use when you need to analyze document structure, identify sections, or get an overview of the document layout. Input raw document text.',
  inputSchema: z.object({
    documentText: z.string().describe('The raw text content of the legal document'),
  }),
  outputSchema: z.object({
    plainText: z.string().describe('Extracted plain text without markup'),
    sections: z.array(
      z.object({
        title: z.string().describe('Section header or title'),
        content: z.string().describe('Section content'),
      })
    ),
    sectionCount: z.number().describe('Number of sections found'),
  }),
  execute: async (inputData) => {
    const { documentText } = inputData
    const plainText = extractPlainText(documentText)
    const sections = parseDocumentSections(documentText)

    return {
      plainText,
      sections,
      sectionCount: sections.length,
    }
  },
})

/**
 * searchClauses - Search for specific clause types in document text.
 */
export const searchClausesTool = createTool({
  id: 'search-clauses',
  description:
    'Search for specific clause types in a legal document (e.g., indemnification, limitation of liability, termination). Use when the user asks about particular provisions or clause types.',
  inputSchema: z.object({
    documentText: z.string().describe('The document text to search'),
    clauseTypes: z
      .array(z.string())
      .optional()
      .describe(
        'Clause types to search for. Omit to search all known types. Options: indemnification, limitation_of_liability, termination, confidentiality, dispute_resolution, warranty, force_majeure, assignment, entire_agreement, amendment'
      ),
  }),
  outputSchema: z.object({
    findings: z.array(
      z.object({
        clauseType: z.string(),
        matches: z.array(
          z.object({
            excerpt: z.string().describe('Relevant text excerpt'),
            position: z.number().describe('Approximate character position'),
          })
        ),
        count: z.number(),
      })
    ),
  }),
  execute: async (inputData) => {
    const { documentText, clauseTypes } = inputData
    const typesToSearch = clauseTypes ?? Object.keys(CLAUSE_PATTERNS)
    const findings: Array<{
      clauseType: string
      matches: Array<{ excerpt: string; position: number }>
      count: number
    }> = []

    for (const clauseType of typesToSearch) {
      const pattern = CLAUSE_PATTERNS[clauseType]
      if (!pattern) continue

      const matches: Array<{ excerpt: string; position: number }> = []
      let m: RegExpExecArray | null
      const re = new RegExp(pattern.source, pattern.flags)

      while ((m = re.exec(documentText)) !== null) {
        const start = Math.max(0, m.index - 50)
        const end = Math.min(documentText.length, m.index + m[0].length + 80)
        const excerpt = documentText.slice(start, end).replace(/\s+/g, ' ').trim()
        matches.push({ excerpt, position: m.index })
      }

      if (matches.length > 0) {
        findings.push({
          clauseType,
          matches: matches.slice(0, 5),
          count: matches.length,
        })
      }
    }

    return { findings }
  },
})

/**
 * compareToTemplate - Compare document against a standard template for missing clauses.
 */
export const compareToTemplateTool = createTool({
  id: 'compare-to-template',
  description:
    'Compare a legal document against a standard commercial agreement template to identify missing clauses. Use when checking completeness or compliance with expected structure.',
  inputSchema: z.object({
    documentText: z.string().describe('The document text to compare'),
    templateClauses: z
      .array(z.string())
      .optional()
      .describe(
        'Optional list of expected clause names. Defaults to standard commercial agreement clauses.'
      ),
  }),
  outputSchema: z.object({
    present: z.array(z.string()).describe('Clause types found in the document'),
    missing: z.array(z.string()).describe('Clause types expected but not found'),
    coverage: z.number().min(0).max(1).describe('Fraction of template clauses present (0-1)'),
  }),
  execute: async (inputData) => {
    const { documentText, templateClauses = STANDARD_TEMPLATE_CLAUSES } = inputData
    const textLower = documentText.toLowerCase()
    const present: string[] = []
    const missing: string[] = []

    for (const clause of templateClauses) {
      const knownPattern = CLAUSE_PATTERNS[clause]
      const found =
        (knownPattern && knownPattern.test(documentText)) ||
        textLower.includes(clause.replace(/_/g, ' '))
      if (found) {
        present.push(clause)
      } else {
        missing.push(clause)
      }
    }

    const coverage = present.length / Math.max(1, templateClauses.length)
    return {
      present,
      missing,
      coverage,
    }
  },
})

/**
 * highlightRisks - Identify risky clauses (liability limitations, indemnification, etc.).
 */
export const highlightRisksTool = createTool({
  id: 'highlight-risks',
  description:
    'Identify risky or high-stakes clauses in a legal document such as liability limitations, indemnification, warranty disclaimers, and consequential damage exclusions. Use when assessing risk exposure.',
  inputSchema: z.object({
    documentText: z.string().describe('The document text to analyze for risks'),
  }),
  outputSchema: z.object({
    risks: z.array(
      z.object({
        type: z.string().describe('Type of risk clause'),
        severity: z.enum(['high', 'medium']),
        excerpts: z.array(z.string()).describe('Relevant text excerpts'),
        count: z.number(),
      })
    ),
    summary: z.string().describe('Brief summary of risk exposure'),
  }),
  execute: async (inputData) => {
    const { documentText } = inputData
    const risks: Array<{
      type: string
      severity: 'high' | 'medium'
      excerpts: string[]
      count: number
    }> = []

    for (const { type, pattern, severity } of RISK_PATTERNS) {
      const excerpts: string[] = []
      let m: RegExpExecArray | null
      const re = new RegExp(pattern.source, pattern.flags)

      while ((m = re.exec(documentText)) !== null) {
        const start = Math.max(0, m.index - 40)
        const end = Math.min(documentText.length, m.index + m[0].length + 100)
        excerpts.push(documentText.slice(start, end).replace(/\s+/g, ' ').trim())
      }

      if (excerpts.length > 0) {
        risks.push({
          type,
          severity,
          excerpts: [...new Set(excerpts)].slice(0, 3),
          count: excerpts.length,
        })
      }
    }

    const highCount = risks.filter((r) => r.severity === 'high').length
    const summary =
      risks.length === 0
        ? 'No high-risk clauses identified in the document.'
        : `Found ${risks.length} risk clause type(s) (${highCount} high severity). Review indemnification, limitation of liability, and damage exclusions carefully.`

    return {
      risks,
      summary,
    }
  },
})
