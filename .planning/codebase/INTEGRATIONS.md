# External Integrations

**Analysis Date:** 2026-03-15

## Repository Type Note

This is a **documentation catalog repository** that aggregates links to external AI agent projects. It does not contain a working codebase with its own integrations. The integrations below are those **commonly referenced** across the 500+ linked agent projects.

---

## APIs & External Services (Referenced in Linked Projects)

**LLM Providers:**
- OpenAI API - GPT-4, GPT-4V, GPT-3.5 models
- Anthropic API - Claude models
- NVIDIA AI Models - GPU-accelerated AI inference

**Data & Media APIs:**
- YouTube Data API - Video analysis agents
- Yahoo Finance - Stock market data and analysis
- Exa - Web search and content retrieval
- Apify - Web scraping and automation
- Spider API - Web crawling

**Vector Databases:**
- Qdrant - Retrieval-augmented generation (RAG)

**Communication:**
- Discord API - Bot development (AutoAnny example)

---

## Authentication & Identity

**API Key Management:**
- Environment variables required for:
  - `OPENAI_API_KEY` - OpenAI access
  - `ANTHROPIC_API_KEY` - Claude access
  - Various service-specific API keys

---

## Frameworks Used by Linked Projects

**Agent Orchestration:**
- CrewAI - Multi-agent collaboration
- AutoGen - Multi-agent conversation framework
- LangGraph - Graph-based workflow orchestration
- Agno - Agent framework

**LLM Abstraction:**
- LangChain - LLM tool integration and RAG

---

## CI/CD & Deployment

**Hosting:**
- GitHub Pages - Static documentation site
- GitHub Actions - Automated Jekyll build/deploy

**CI Pipeline:**
- GitHub Actions workflow: `.github/workflows/jekyll-gh-pages.yml`
- Trigger: Push to main branch
- Deployment: Automatic to GitHub Pages

---

## Environment Configuration

**For Contributing Projects:**

Required env vars (typical for agent projects):
- `OPENAI_API_KEY` - OpenAI API token
- `ANTHROPIC_API_KEY` - Anthropic API token (if using Claude)
- Service-specific keys based on integrations

**Secrets Location:**
- Environment variables (not committed to repository)
- `.gitignore` excludes sensitive files

---

## Webhooks & Callbacks

**Incoming:**
- Not applicable to this documentation repository
- Individual agent projects may implement webhooks

**Outgoing:**
- Not applicable to this documentation repository

---

## Common Integration Patterns in Linked Agents

1. **RAG (Retrieval-Augmented Generation)**
   - Vector store: Qdrant, Chroma, Pinecone
   - Embeddings: OpenAI, HuggingFace

2. **Multi-Agent Systems**
   - Sequential chats
   - Group chat collaboration
   - Hierarchical agent teams

3. **Tool-Using Agents**
   - Web search (Exa, Tavily)
   - API calls (finance, weather, etc.)
   - Code execution

4. **Multimodal Agents**
   - DALL-E for image generation
   - GPT-4V for vision
   - Whisper for speech-to-text

---

*Integration audit: 2026-03-15*
