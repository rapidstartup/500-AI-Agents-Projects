# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Curation/Collection Repository Pattern

This repository is not a monolithic application but rather a curated collection of 500+ AI agent use cases across industries. It aggregates external projects, templates, and demos rather than containing its own application code.

**Key Characteristics:**
- No unified application architecture - each contributed project operates independently
- Documentation-driven with metadata requirements for each contributed project
- GitHub Pages deployment via Jekyll for static site generation
- Course materials in dedicated subdirectory

## Layers

**Not applicable for this repository type.** This is not a layered application but a collection repository.

**However, conceptual organization exists:**

**Documentation Layer:**
- Purpose: Guide users and contributors
- Location: Root directory (`README.md`, `CONTRIBUTION.md`, `AGENTS.md`)
- Contains: Usage instructions, contribution guidelines, development standards

**Course Materials Layer:**
- Purpose: Educational content for CrewAI with MCP integration
- Location: `crewai_mcp_course/`
- Contains: Lesson scripts, requirements, course structure

**CI/CD Layer:**
- Purpose: Automated deployment and quality checks
- Location: `.github/workflows/`
- Contains: Jekyll deployment workflow for GitHub Pages

**Assets Layer:**
- Purpose: Visual assets for documentation
- Location: `images/`
- Contains: Industry use case images

## Data Flow

**No application data flow.** This is a static documentation repository.

**For contributed projects:**
1. Contributor creates project folder following metadata schema
2. Project includes: README.md, LICENSE, requirements.txt, run_demo.py, tests/, metadata.yaml
3. CI pipeline runs Jekyll to build static site from markdown files

**State Management:**
- Not applicable - static documentation only
- Git controls version history

## Key Abstractions

**Contributed Agent Project:**
- Purpose: Reusable AI agent implementation
- Examples: None currently in repository (collection of references)
- Pattern: Per AGENTS.md metadata schema

**Course Module:**
- Purpose: Educational lesson for CrewAI/MCP integration
- Examples: `crewai_mcp_course/`
- Pattern: Sequential lessons with runnable Python scripts

## Entry Points

**Documentation Entry:**
- Location: `README.md` - Project catalog and use cases
- Triggers: Repository landing page
- Responsibilities: Overview of available agents, quick start

**Guidelines Entry:**
- Location: `AGENTS.md` - Development guidelines and conventions
- Triggers: Developers adding new projects
- Responsibilities: Code style, testing, naming conventions

**Contribution Entry:**
- Location: `CONTRIBUTION.md` - Contribution process
- Triggers: New contributors
- Responsibilities: How to submit new agent projects

**Course Entry:**
- Location: `crewai_mcp_course/README.md` - Course overview
- Triggers: Learning CrewAI integration
- Responsibilities: Step-by-step tutorials

## Error Handling

**Strategy:** Not applicable - static documentation

**Patterns:**
- No runtime error handling needed
- Jekyll build errors captured by GitHub Actions
- Invalid project metadata rejected during contribution review

## Cross-Cutting Concerns

**Documentation:** All markdown files follow consistent structure
**Validation:** AGENTS.md provides project validation criteria
**Security:** Secrets excluded via git patterns (documented in AGENTS.md)

---

*Architecture analysis: 2026-03-15*