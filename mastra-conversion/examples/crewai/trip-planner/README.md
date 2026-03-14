# MASTRA Trip Planner

MASTRA conversion of the CrewAI Trip Planner. Uses the **Supervisor pattern** where a parent agent coordinates specialized research and writing agents, plus a **workflow alternative** for deterministic sequential execution.

## Architecture

| Component | Role |
|-----------|------|
| **tripSupervisor** | Parent agent that delegates to researcher and writer; uses memory for conversation context |
| **researcherAgent** | City Research Expert – researches destinations via web search |
| **writerAgent** | Travel Itinerary Planner – creates day-by-day itineraries from research |
| **tripWorkflow** | Sequential workflow: research → write (alternative to supervisor) |

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and add your API key
cp .env.example .env
# Edit .env: set OPENAI_API_KEY=sk-...

# Run workflow (deterministic)
npm run demo:workflow

# Run supervisor (conversational delegation)
npm run demo:supervisor
```

## Inputs

- **origin**: Departure city
- **destination**: City to visit
- **dateRange**: Travel dates (e.g., "June 15-22, 2025")
- **interests**: Hobbies/interests (e.g., "art, food, history")

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o |
| `SERPER_API_KEY` | No | Serper API key for better web search (falls back to DuckDuckGo) |
| `LIBSQL_URL` | No | LibSQL URL for memory (default: `file:./mastra.db`) |

## Project Structure

```
src/mastra/
├── agents/
│   ├── researcher.ts   # City Research Expert (search tools)
│   └── writer.ts       # Travel Itinerary Planner
├── tools/
│   └── search-tool.ts  # Web search (Serper API or DuckDuckGo)
├── workflows/
│   └── trip-workflow.ts # Research → Write workflow
└── index.ts            # Mastra instance + supervisor
```

## Usage

### Supervisor (conversational)

```typescript
import { mastra } from './src/mastra/index'

const supervisor = mastra.getAgent('tripSupervisor')
const response = await supervisor.generate(
  'Plan a trip: Paris, June 15-22, 2025, interests: art, food',
  { maxSteps: 15 }
)
console.log(response.text)
```

### Workflow (deterministic)

```typescript
import { mastra } from './src/mastra/index'

const workflow = mastra.getWorkflow('tripWorkflow')
const run = await workflow.createRun()
const result = await run.start({
  inputData: {
    origin: 'New York',
    destination: 'Paris',
    dateRange: 'June 15-22, 2025',
    interests: 'art museums, French cuisine',
  },
})
console.log(result.output.itinerary)
```

## Source

Converted from [CrewAI Trip Planner](https://github.com/crewAIInc/crewAI-examples/tree/main/crews/trip_planner).
