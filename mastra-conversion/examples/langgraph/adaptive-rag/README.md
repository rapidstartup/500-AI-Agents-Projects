# MASTRA Adaptive RAG

MASTRA conversion of the LangGraph "Adaptive RAG" agent—a conditional RAG workflow that routes queries between vector search and web search.

## Overview

- **Route**: Classify query (vectorstore vs web_search)
- **Branch**: Vector path (retrieve → grade → fallback to web if needed) or web path
- **Generate**: Final answer from context

## Quick Start

```bash
npm install
```

Set `OPENAI_API_KEY` in `.env`. Optionally set `DATABASE_URL` for PgVector (default: `postgresql://localhost:5432/mastra`).

```bash
npx tsx run_demo.ts
```

## Structure

- `src/mastra/tools/retrieval-tools.ts` - vectorSearch, webSearch, gradeDocument
- `src/mastra/agents/rag-agent.ts` - RAG agent with retrieval and grading tools
- `src/mastra/workflows/adaptive-rag-workflow.ts` - Adaptive workflow with branching
- `src/mastra/index.ts` - Mastra instance

## Vector Store

The workflow uses PgVector with index `adaptive_rag_docs`. If the index is empty or missing, the workflow falls back to web search. To populate:

1. Create the index with the same dimension as your embedding model (e.g. 1536 for text-embedding-3-small)
2. Upsert documents with metadata containing `content`

## Original LangGraph Pattern

- Router node: vectorstore vs web search
- Retrieve node: vector search
- Grade documents: evaluate relevance
- Conditional edges: relevant → generate, not relevant → web search fallback
- Generate node: final answer
