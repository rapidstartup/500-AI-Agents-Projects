# Technology Stack

**Analysis Date:** 2026-03-15

## Repository Type

**Category:** Documentation Catalog (Not a monolithic codebase)
- This repository is a curated collection of 500+ AI agent use cases
- It aggregates external projects, templates, and demos rather than containing its own source code
- Each agent project is a separate external GitHub repository linked from the README

## Languages

**Primary:**
- Markdown - Documentation files and README (this repository contains only documentation)

**Referenced Agent Projects (External):**
- Python - Primary language for all linked agent implementations
- Jupyter Notebooks - Common format for examples and tutorials

## Runtime

**Environment:**
- Not applicable - No runtime in this documentation repository

**For Linked Agent Projects:**
- Python 3.9+ recommended (per AGENTS.md guidelines)

## Documentation Stack

**Static Site Generation:**
- Jekyll - For GitHub Pages deployment
- Version: Configured via GitHub Actions workflow

**Deployment Platform:**
- GitHub Pages - Hosted at `https://ashishpatel26.github.io/500-AI-Agents-Projects/`

## Frameworks (Referenced in Linked Projects)

**Agent Frameworks:**
- CrewAI - Multi-agent framework for building collaborative AI agents
- AutoGen (Microsoft) - Framework for building multi-agent applications
- LangGraph - Framework for building stateful multi-agent workflows
- Agno - AI agent framework

**LLM Integration:**
- OpenAI API (GPT-4, GPT-4V, GPT-3.5)
- Anthropic (Claude)
- NVIDIA Models
- Local models (Llama, etc.)

**Supporting Libraries:**
- LangChain - For RAG and LLM tool integration
- Qdrant - Vector database for retrieval
- Various web scraping libraries (Apify, Spider API)

## Key Dependencies (For Contributing Agents)

**For Individual Projects (per AGENTS.md):**
- pytest - Testing framework
- black - Code formatting (line length: 88)
- isort - Import sorting
- flake8 - Linting
- mypy - Type checking

## Configuration

**Environment:**
- No environment variables in this repository
- Linked projects may require API keys (OpenAI, Anthropic, etc.)

**Build Configuration:**
- `.github/workflows/jekyll-gh-pages.yml` - CI/CD for GitHub Pages

## Platform Requirements

**Development:**
- Git - For repository management
- Markdown editor - For documentation contributions

**Production:**
- GitHub Pages - Static site hosting

---

*Stack analysis: 2026-03-15*
