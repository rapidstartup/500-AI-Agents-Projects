# MASTRA RAG Group Chat

MASTRA conversion of AutoGen "RAG Group Chat with Retrieval Augmented Generation". Combines Supervisor + RAG patterns.

## Original AutoGen

- **RetrieveUserProxyAgent** with retrieval augmented generation
- **GroupChat** with retrieval capability
- Agents could search a document collection and use results in conversation

## MASTRA Architecture

- **retrieverAgent**: Has `query-documents` tool, searches the vector store for relevant chunks
- **supervisorAgent**: Coordinates the retriever, synthesizes answers using retrieved context
- **RAG tools**: `index-documents` (chunk + embed + store) and `query-documents` (embed + similarity search)

## Quick Start

```bash
# Install
npm install

# Run demo (indexes sample docs, then queries via supervisor)
npx tsx run_demo.ts "What are the key features of the product?"
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o and embeddings |
| `POSTGRES_CONNECTION_STRING` | Yes* | PostgreSQL + pgvector connection URL |
| `LIBSQL_URL` | No | LibSQL URL for memory (default: `file:./mastra.db`) |

\* Defaults to `postgresql://localhost:5432/mastra_rag` if not set.

## RAG Pipeline

**Indexing** (`index-documents` tool):
1. `MDocument.fromText()` → create document
2. `doc.chunk()` → recursive chunking (configurable size/overlap)
3. `embedMany()` → OpenAI text-embedding-3-small
4. `pgVector.upsert()` → store in PostgreSQL

**Query** (`query-documents` tool):
1. `embedMany()` on query string
2. `pgVector.query()` → similarity search
3. Return top-K chunks with metadata

## Project Structure

```
src/mastra/
├── agents/
│   ├── retriever.ts   # Retrieval agent with query tool
│   └── supervisor.ts  # Supervisor + synthesizer
├── tools/
│   └── rag-tools.ts   # index-documents, query-documents
└── index.ts           # Mastra instance
```
