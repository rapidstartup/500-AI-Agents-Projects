# Email Auto Responder Flow (MASTRA)

MASTRA conversion of the CrewAI [Email Auto Responder Flow](https://github.com/crewAIInc/crewAI-examples/tree/main/flows/email_auto_responder_flow).

## Overview

This workflow automates email response drafting with an evaluation loop:

1. **Classify** – Categorize the incoming email (support, sales, general, urgent, feedback, complaint)
2. **Draft** – Generate a professional response based on classification
3. **Evaluate** – Score the draft on clarity, tone, completeness, and appropriateness
4. **Branch** – If quality ≥ threshold (0.7), approve; otherwise re-draft (up to 5 iterations)

## Project Structure

```
src/mastra/
├── agents/email-agent.ts    # Email processing agent with tools
├── tools/email-tools.ts    # classifyEmail, sendEmailResponse
├── workflows/email-flow.ts # Classify → Draft+Eval (dountil) → Branch
└── index.ts               # Mastra instance
```

## Setup

```bash
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env
```

## Run Demo

```bash
npm run demo
```

## Key Patterns

- **Evaluation loop**: `.dountil()` runs draft+evaluate until quality ≥ threshold or max iterations
- **Branching**: `.branch()` routes to approve (output) or re-draft-exhausted (needs human review)
- **Tools**: `classifyEmailTool` (keyword-based; replace with LLM for production), `sendEmailResponseTool` (mock; integrate SMTP/SendGrid for production)

## Environment Variables

| Variable        | Required | Description        |
|----------------|----------|--------------------|
| `OPENAI_API_KEY` | Yes      | OpenAI API key for LLM calls |
