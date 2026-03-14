# AutoGen Group Chat - MASTRA Conversion

MASTRA conversion of the AutoGen "Automated Task Solving by Group Chat (3 agents + 1 manager)" example.

## Original AutoGen Structure

- **GroupChat** with User_proxy, Coder, Product_manager
- **GroupChatManager** coordinating speaker selection via LLM
- **max_round** = 12 limiting conversation rounds

## MASTRA Supervisor Pattern

| AutoGen       | MASTRA              |
|---------------|---------------------|
| Coder         | researcherAgent     |
| Product_manager | analystAgent      |
| GroupChatManager | supervisorAgent  |
| max_round     | maxSteps: 12        |

### Agents

1. **Researcher** – Gathers information via ArXiv search (papers, summaries, metadata)
2. **Analyst** – Processes research and identifies potential applications in software
3. **Supervisor** – Coordinates researcher and analyst with delegation hooks for monitoring

## Quick Start

```bash
# Install dependencies
npm install

# Run demo (requires OPENAI_API_KEY in .env)
npm run demo

# Custom prompt
npx tsx run_demo.ts "Find papers about reinforcement learning and their applications"
```

## Expected Output

For the default prompt ("Find a latest paper about gpt-4 on arxiv and find its potential applications in software"):

1. Supervisor delegates to Researcher → searches ArXiv for GPT-4 papers
2. Supervisor delegates to Analyst → analyzes applications in software
3. Supervisor synthesizes and presents the final result

Delegation hooks log each delegation start/complete for monitoring.

## Environment

- `OPENAI_API_KEY` – Required for LLM calls
- `LIBSQL_URL` – Optional; defaults to `file:./mastra.db` for memory storage
