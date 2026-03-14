# MASTRA Framework Conversion Mapping

> **Purpose:** This document provides a complete 1-to-1 mapping from four source AI agent frameworks (CrewAI, AutoGen, Agno, LangGraph) plus standalone Python agents into the **MASTRA** TypeScript framework. It is designed to be handed to a conversion agent that will systematically convert all 143 cataloged agent projects.

---

## Table of Contents

1. [MASTRA Architecture Reference](#1-mastra-architecture-reference)
2. [Framework-to-MASTRA Concept Mapping](#2-framework-to-mastra-concept-mapping)
3. [Reusable Conversion Templates](#3-reusable-conversion-templates)
4. [Fully Converted Examples](#4-fully-converted-examples)
5. [Complete Agent Conversion Checklist](#5-complete-agent-conversion-checklist)
6. [Instructions for the Conversion Agent](#6-instructions-for-the-conversion-agent)

---

## 1. MASTRA Architecture Reference

### 1.1 Technology Stack

| Aspect | Value |
|--------|-------|
| Language | TypeScript |
| Runtime | Node.js v22.13.0+, Bun, Deno, Cloudflare Workers |
| Package Manager | npm / pnpm / yarn / bun |
| Core Package | `@mastra/core` |
| MCP Package | `@mastra/mcp` |
| Memory Package | `@mastra/memory` |
| RAG Package | `@mastra/rag` |
| Vector DB | `@mastra/pg` (pgvector), `@mastra/pinecone`, `@mastra/qdrant` |
| Schema Validation | Zod |
| Model Router | 600+ models via `provider/model-name` format (e.g., `openai/gpt-4o`) |

### 1.2 Project Structure

Every MASTRA project follows this layout:

```
project-name/
  src/
    mastra/
      agents/          # Agent definitions
        my-agent.ts
      tools/           # Tool definitions with Zod schemas
        my-tool.ts
      workflows/       # Multi-step workflow definitions
        my-workflow.ts
      mcp/             # (Optional) MCP client/server configs
        my-mcp-client.ts
      scorers/         # (Optional) Evaluation scorers
        my-scorer.ts
      index.ts         # Mastra instance registration
  .env                 # API keys (OPENAI_API_KEY, etc.)
  package.json
  tsconfig.json
```

### 1.3 Core Imports

```typescript
// Agents
import { Agent } from '@mastra/core/agent'

// Tools
import { createTool } from '@mastra/core/tools'

// Workflows
import { createWorkflow, createStep } from '@mastra/core/workflows'

// Mastra instance
import { Mastra } from '@mastra/core/mastra'

// MCP
import { MCPClient } from '@mastra/mcp'
import { MCPServer } from '@mastra/mcp'

// Memory
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'

// RAG
import { MDocument } from '@mastra/rag'
import { PgVector } from '@mastra/pg'

// Schema validation
import { z } from 'zod'
```

### 1.4 Core Patterns

**Agent Definition:**
```typescript
export const myAgent = new Agent({
  id: 'my-agent',
  name: 'My Agent',
  description: 'What this agent does (used by supervisors for routing)',
  instructions: 'System prompt: role, personality, capabilities, constraints.',
  model: 'openai/gpt-4o',
  tools: { myTool },
})
```

**Tool Definition:**
```typescript
export const myTool = createTool({
  id: 'my-tool',
  description: 'What this tool does (used by agent for tool selection)',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ result: z.string() }),
  execute: async (inputData) => {
    const { query } = inputData
    // ... perform action
    return { result: 'done' }
  },
})
```

**Workflow Definition:**
```typescript
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ processed: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('myAgent')
    const response = await agent.generate(inputData.message)
    return { processed: response.text }
  },
})

export const myWorkflow = createWorkflow({
  id: 'my-workflow',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ result: z.string() }),
})
  .then(step1)
  .then(step2)
  .commit()
```

**Supervisor Agent (Multi-Agent):**
```typescript
export const supervisor = new Agent({
  id: 'supervisor',
  instructions: 'You coordinate research and writing agents...',
  model: 'openai/gpt-4o',
  agents: { researchAgent, writingAgent },
  memory: new Memory({
    storage: new LibSQLStore({ id: 'storage', url: 'file:mastra.db' }),
  }),
})
```

**Mastra Instance (index.ts):**
```typescript
import { Mastra } from '@mastra/core/mastra'
export const mastra = new Mastra({
  agents: { myAgent, supervisor },
  workflows: { myWorkflow },
})
```

**Execution:**
```typescript
// Agent: generate (blocking)
const response = await myAgent.generate('Hello')
console.log(response.text)

// Agent: stream (real-time)
const stream = await myAgent.stream('Hello')
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk)
}

// Workflow: run
const run = await myWorkflow.createRun()
const result = await run.start({ inputData: { message: 'Hello' } })

// Structured output
const response = await myAgent.generate('Analyze this stock', {
  output: z.object({ ticker: z.string(), recommendation: z.string() }),
})
console.log(response.object)
```

### 1.5 Model Router Format

MASTRA uses `provider/model-name` format. Common mappings from Python:

| Python Model String | MASTRA Model String |
|---------------------|---------------------|
| `gpt-4` / `gpt-4-turbo` | `openai/gpt-4o` |
| `gpt-4o` | `openai/gpt-4o` |
| `gpt-4o-mini` | `openai/gpt-4o-mini` |
| `gpt-3.5-turbo` | `openai/gpt-4o-mini` |
| `gpt-5` / `gpt-5.1` | `openai/gpt-5.1` |
| `claude-3-sonnet` | `anthropic/claude-sonnet-4-20250514` |
| `claude-3.5-sonnet` | `anthropic/claude-sonnet-4-20250514` |
| `claude-3-opus` | `anthropic/claude-opus-4-20250514` |
| `llama-3` (local) | `ollama/llama3` |
| Any NVIDIA model | `nvidia/<model-name>` |

### 1.6 Deployment

```bash
# Build for production
npx mastra build

# Deploy output is in .mastra/output/
# Deploy to any Node.js host, Vercel, Netlify, Cloudflare, etc.
```

---

## 2. Framework-to-MASTRA Concept Mapping

### 2.1 CrewAI to MASTRA

| CrewAI Concept | CrewAI Python API | MASTRA TypeScript Equivalent | Notes |
|----------------|-------------------|------------------------------|-------|
| **Agent** | `Agent(role, goal, backstory, tools, llm)` | `new Agent({ id, name, instructions, model, tools })` | Combine `role` + `goal` + `backstory` into `instructions` string |
| **Task** | `Task(description, expected_output, agent, context)` | `createStep({ id, inputSchema, outputSchema, execute })` | `expected_output` becomes `outputSchema`; `context` becomes step dependencies via `.then()` |
| **Crew (sequential)** | `Crew(agents, tasks, process=Process.sequential)` | `createWorkflow({}).then(step1).then(step2).commit()` | Sequential chaining with `.then()` |
| **Crew (hierarchical)** | `Crew(agents, tasks, process=Process.hierarchical)` | Supervisor Agent with `agents: { sub1, sub2 }` | Supervisor decides delegation order |
| **Flow** | `@start`, `@listen`, `@router` decorators | `createWorkflow()` with `.branch()` and `.then()` | Flow routing becomes workflow branching |
| **Tools** | `tools=[SerperDevTool()]` | `tools: { searchTool }` | Wrap equivalent API calls in `createTool()` |
| **MCP** | `mcps=[MCPServerStdio(...)]` | `MCPClient` + `listTools()` | See MCP section |
| **YAML Config** | `agents.yaml`, `tasks.yaml` | Inline TypeScript definitions | No YAML in MASTRA |
| **Kickoff** | `crew.kickoff(inputs={'topic': 'AI'})` | `workflow.createRun().start({ inputData: { topic: 'AI' } })` | Or `agent.generate()` for single-agent |
| **Output** | `CrewOutput.raw`, `.pydantic` | `response.text`, `response.object` | Use Zod schema for structured output |
| **Guardrails** | `guardrail=fn` on Task | `guardrails` on Agent or workflow validation steps | Built-in guardrail support |
| **Delegation** | `allow_delegation=True` | Supervisor pattern with `agents: {}` | Explicit subagent registration |
| **Memory** | `memory=True` on Crew | `memory: new Memory({ storage: new LibSQLStore({...}) })` | Explicit memory configuration |
| **Callbacks** | `callbacks=[...]` on Crew | `onStepFinish`, `onFinish`, `onIterationComplete` | Event-based callbacks |
| **max_iter** | `max_iter=20` on Agent | `maxSteps: 20` on generate/stream call | Per-call configuration |

**Conversion formula for CrewAI Agent `instructions`:**
```
instructions = `You are a ${role}.\n\nGoal: ${goal}\n\nBackground: ${backstory}`
```

### 2.2 AutoGen to MASTRA

| AutoGen Concept | AutoGen Python API | MASTRA TypeScript Equivalent | Notes |
|-----------------|-------------------|------------------------------|-------|
| **ConversableAgent** | `ConversableAgent(name, system_message, llm_config)` | `new Agent({ id, name, instructions, model })` | `system_message` becomes `instructions` |
| **AssistantAgent** | `AssistantAgent(name, system_message, llm_config)` | `new Agent({ id, instructions, model, tools })` | Same as ConversableAgent with tools |
| **UserProxyAgent** | `UserProxyAgent(name, human_input_mode, code_execution_config)` | Agent approval / `requireApproval: true` on tools | Human-in-the-loop via approval system |
| **GroupChat** | `GroupChat(agents, messages, max_round)` | Supervisor Agent with `agents: { a1, a2, a3 }` | Supervisor coordinates subagents |
| **GroupChatManager** | `GroupChatManager(groupchat, llm_config)` | Supervisor Agent with `delegation` hooks | `onDelegationStart` for speaker selection |
| **initiate_chat** | `agent.initiate_chat(other, message)` | `agent.generate([{role:'user', content: msg}])` | Direct agent invocation |
| **register_function** | `register_function(fn, caller, executor)` | `createTool({ id, inputSchema, outputSchema, execute })` | Strongly typed with Zod |
| **Sequential Chats** | `initiate_chats([{...}, {...}])` | `createWorkflow().then(step1).then(step2).commit()` | Workflow sequential steps |
| **Nested Chats** | `register_nested_chats(...)` | Nested workflow (workflow as step in parent workflow) | `createWorkflow()` used as step |
| **Code Execution** | `code_execution_config={"work_dir": ...}` | `createTool()` wrapping a code execution service | External sandboxed execution |
| **RAG / RetrieveChat** | `RetrieveUserProxyAgent`, `RetrieveAssistantAgent` | MASTRA RAG: `MDocument`, embeddings, `PgVector.query()` | Full RAG pipeline |
| **Tool Use** | `@agent.register_for_llm()` | `tools: { myTool }` on Agent | Declarative tool registration |
| **Human Feedback** | `human_input_mode="ALWAYS"` | `requireApproval: true` on sensitive tools | Per-tool approval gates |
| **Async Chats** | `a]_initiate_chats(...)` | `await agent.generate(...)` (natively async) | All MASTRA calls are async |
| **max_consecutive_auto_reply** | `max_consecutive_auto_reply=10` | `maxSteps: 10` | Limits iteration count |
| **Society of Mind** | `SocietyOfMindAgent` | Supervisor with `onIterationComplete` | Monitor and control delegation loop |
| **AgentBuilder** | `AgentBuilder(...)` | Programmatic Agent creation in a loop | Create agents dynamically |
| **Multimodal** | `MultimodalConversableAgent` | Agent with image content in messages | Pass `{ type: 'image', image: url }` |
| **Function Inception** | Dynamic function add/remove | Dynamic toolset via `listToolsets()` | Per-request tool configuration |
| **Teachability** | `Teachability` capability | Agent memory + instructions update | Store learned facts in memory |
| **AgentEval** | `CriticAgent`, `QuantifierAgent` | MASTRA scorers via `createScorer()` | Evaluation framework |

**Conversion formula for AutoGen `instructions`:**
```
instructions = system_message  // Direct 1:1 mapping
```

### 2.3 Agno to MASTRA

| Agno Concept | Agno Python API | MASTRA TypeScript Equivalent | Notes |
|--------------|----------------|------------------------------|-------|
| **Agent** | `Agent(model, tools, instructions, ...)` | `new Agent({ id, model, tools, instructions })` | Nearly 1:1 mapping |
| **Model** | `OpenAIChat(id="gpt-4o")` | `model: 'openai/gpt-4o'` | String-based model router |
| **Tools** | `tools=[YFinanceTools(), ExaTools()]` | `tools: { financeTool, searchTool }` | Wrap each in `createTool()` |
| **Structured Output** | `response_model=MyPydanticModel` | `output: myZodSchema` in generate call | Zod replaces Pydantic |
| **Knowledge** | `knowledge=...` | RAG pipeline with `MDocument` + vector store | Explicit document processing |
| **Storage** | `storage=SqlAgentStorage(...)` | `memory: new Memory({ storage: new LibSQLStore({...}) })` | Memory storage |
| **run()** | `agent.run(message)` | `agent.generate(message)` | Blocking response |
| **print_response()** | `agent.print_response(message)` | `agent.stream(message)` + iterate `textStream` | Streaming response |
| **Markdown output** | `markdown=True` | Include "Format output as markdown" in `instructions` | Instruction-level |
| **show_tool_calls** | `show_tool_calls=True` | `onStepFinish` callback to log tool calls | Callback-based |
| **description** | `description="..."` | `description: "..."` on Agent | Used by supervisor routing |
| **Team** | `Agent(team=[agent1, agent2])` | Supervisor Agent with `agents: {}` | Multi-agent coordination |

**Conversion formula for Agno `instructions`:**
```
instructions = agno_instructions  // Direct 1:1 (both use instruction strings)
```

**Common Agno tool mappings:**

| Agno Tool | MASTRA Replacement |
|-----------|-------------------|
| `YFinanceTools(stock_price=True, ...)` | `createTool()` calling Yahoo Finance REST API or `yahoo-finance2` npm |
| `ExaTools()` | `createTool()` calling Exa API or MCP server |
| `DuckDuckGoTools()` | `createTool()` calling DuckDuckGo API |
| `WikipediaTools()` | MCP via `npx -y wikipedia-mcp` |
| `ArxivTools()` | `createTool()` calling Arxiv API |
| `NewspaperTools()` | `createTool()` calling news API |
| `PubmedTools()` | `createTool()` calling PubMed API |

### 2.4 LangGraph to MASTRA

| LangGraph Concept | LangGraph Python API | MASTRA TypeScript Equivalent | Notes |
|-------------------|---------------------|------------------------------|-------|
| **StateGraph** | `StateGraph(State)` | `createWorkflow({ inputSchema, outputSchema })` | Workflow is the graph |
| **Node** | `graph.add_node("name", fn)` | `createStep({ id, inputSchema, outputSchema, execute })` | Each node is a step |
| **Edge** | `graph.add_edge("a", "b")` | `.then(stepA).then(stepB)` | Sequential chaining |
| **Conditional Edge** | `graph.add_conditional_edges("a", fn, {...})` | `.branch(conditionFn)` with named branches | Branch based on condition |
| **START** | `from langgraph.graph import START` | First `.then()` after `createWorkflow()` | Workflow entry point |
| **END** | `from langgraph.graph import END` | `.commit()` after last step | Workflow termination |
| **State** | `class State(TypedDict): ...` | `inputSchema` / `outputSchema` Zod objects + `stateSchema` | Typed state management |
| **Checkpointer** | `MemorySaver()`, `SqliteSaver()` | Workflow `suspend()` / `resume()` + state persistence | Built-in suspend/resume |
| **ToolNode** | `ToolNode(tools=[...])` | `createStep()` calling tool or tool as step via `createStep(myTool)` | Tool execution step |
| **ChatModel** | `ChatOpenAI(model="gpt-4o")` | `model: 'openai/gpt-4o'` on Agent | Model router string |
| **Retriever** | `vectorstore.as_retriever()` | `PgVector.query({ indexName, queryVector, topK })` | Vector similarity search |
| **RAG Chain** | LangChain RAG chain | Agent with RAG tools + `MDocument` chunking | Full RAG pipeline |
| **Human-in-the-loop** | `interrupt_before=["node"]` | `suspend()` in step + `resume()` | Workflow suspension |
| **Parallel Branches** | Multiple edges from one node | `.parallel([stepA, stepB])` | Parallel step execution |
| **Subgraph** | `compiled_subgraph` as node | Nested workflow (workflow as step) | Composable workflows |

**Conversion formula for LangGraph state:**
```typescript
// Python TypedDict
// class State(TypedDict):
//     messages: list[str]
//     context: str

// MASTRA equivalent
const stateSchema = z.object({
  messages: z.array(z.string()),
  context: z.string(),
})
```

### 2.5 Standalone Python to MASTRA

| Standalone Pattern | Python Implementation | MASTRA TypeScript Equivalent | Notes |
|-------------------|----------------------|------------------------------|-------|
| **Script with API calls** | `requests.get(url)`, `openai.chat.completions.create()` | Agent + `createTool()` wrapping fetch calls | Tool encapsulates API logic |
| **Data processing pipeline** | Sequential function calls | `createWorkflow()` with steps | Each processing stage is a step |
| **CLI chatbot** | `while True: input() -> llm()` | Agent with `generate()` in a loop | Or expose via Mastra server |
| **Document analyzer** | Custom parsing + LLM | Agent + RAG pipeline | `MDocument` for parsing |
| **Recommendation engine** | Embeddings + similarity | RAG: embed, store, query | Vector store for recommendations |
| **Multi-model pipeline** | Chain different LLMs | Workflow steps with different agent models | Each step can use a different model |
| **Web scraper + analyzer** | BeautifulSoup/Scrapy + LLM | `createTool()` for scraping + Agent for analysis | Tool handles data gathering |

---

## 3. Reusable Conversion Templates

### Template A: Single Agent

Use for: simple Agno agents, standalone chatbots, single-purpose assistants.

**`src/mastra/agents/{agent-name}.ts`:**
```typescript
import { Agent } from '@mastra/core/agent'
import { /* tools */ } from '../tools/{tool-file}'

export const {{agentName}} = new Agent({
  id: '{{agent-id}}',
  name: '{{Agent Display Name}}',
  description: '{{What this agent does, for supervisor routing}}',
  instructions: `{{System prompt combining role, goal, backstory, constraints.
    Mention available tools and when to use them.}}`,
  model: '{{provider/model-name}}',
  tools: { /* {{tool1}}, {{tool2}} */ },
})
```

**`src/mastra/tools/{tool-name}.ts`:**
```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const {{toolName}} = createTool({
  id: '{{tool-id}}',
  description: '{{What the tool does}}',
  inputSchema: z.object({
    {{paramName}}: z.string().describe('{{param description}}'),
  }),
  outputSchema: z.object({
    {{resultName}}: z.string(),
  }),
  execute: async (inputData) => {
    const { {{paramName}} } = inputData
    // {{implementation: API call, computation, etc.}}
    return { {{resultName}}: '{{result}}' }
  },
})
```

**`src/mastra/index.ts`:**
```typescript
import { Mastra } from '@mastra/core/mastra'
import { {{agentName}} } from './agents/{{agent-file}}'

export const mastra = new Mastra({
  agents: { {{agentName}} },
})
```

**`package.json`:**
```json
{
  "name": "{{project-name}}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "mastra dev",
    "build": "mastra build"
  },
  "dependencies": {
    "@mastra/core": "latest",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### Template B: Multi-Step Workflow

Use for: CrewAI sequential crews, LangGraph linear graphs, multi-stage pipelines.

**`src/mastra/workflows/{workflow-name}.ts`:**
```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const {{step1Name}} = createStep({
  id: '{{step-1-id}}',
  inputSchema: z.object({
    {{inputField}}: z.string(),
  }),
  outputSchema: z.object({
    {{outputField}}: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('{{agentName}}')
    const response = await agent.generate(
      `{{Prompt template using ${inputData.inputField}}}`
    )
    return { {{outputField}}: response.text }
  },
})

const {{step2Name}} = createStep({
  id: '{{step-2-id}}',
  inputSchema: z.object({
    {{inputField}}: z.string(),
  }),
  outputSchema: z.object({
    {{outputField}}: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('{{agentName2}}')
    const response = await agent.generate(
      `{{Prompt template using ${inputData.inputField}}}`
    )
    return { {{outputField}}: response.text }
  },
})

export const {{workflowName}} = createWorkflow({
  id: '{{workflow-id}}',
  description: '{{What this workflow does}}',
  inputSchema: z.object({
    {{topLevelInput}}: z.string(),
  }),
  outputSchema: z.object({
    {{topLevelOutput}}: z.string(),
  }),
})
  .then({{step1Name}})
  .then({{step2Name}})
  .commit()
```

### Template C: Multi-Agent Supervisor

Use for: AutoGen group chats, CrewAI hierarchical crews, multi-agent coordination.

**`src/mastra/agents/supervisor.ts`:**
```typescript
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { {{subAgent1}} } from './{{sub-agent-1-file}}'
import { {{subAgent2}} } from './{{sub-agent-2-file}}'

export const {{supervisorName}} = new Agent({
  id: '{{supervisor-id}}',
  name: '{{Supervisor Display Name}}',
  instructions: `{{Coordination instructions:
    - What each subagent does
    - When to delegate to each
    - How to synthesize results
    - Success criteria}}`,
  model: '{{provider/model-name}}',
  agents: {
    {{subAgent1}},
    {{subAgent2}},
  },
  memory: new Memory({
    storage: new LibSQLStore({
      id: '{{storage-id}}',
      url: 'file:mastra.db',
    }),
  }),
})
```

**`src/mastra/agents/{sub-agent}.ts`:**
```typescript
import { Agent } from '@mastra/core/agent'

export const {{subAgentName}} = new Agent({
  id: '{{sub-agent-id}}',
  name: '{{Sub Agent Name}}',
  description: '{{Clear description of what this agent does and returns}}',
  instructions: '{{Specialized instructions for this sub-agent}}',
  model: '{{provider/model-name}}',
  tools: { /* specialized tools */ },
})
```

**Execution:**
```typescript
const stream = await supervisor.stream('{{user request}}', {
  maxSteps: 10,
  delegation: {
    onDelegationStart: async (context) => {
      console.log(`Delegating to: ${context.primitiveId}`)
      return { proceed: true }
    },
  },
})

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk)
}
```

### Template D: RAG Agent

Use for: LangGraph RAG variants, retrieval-augmented agents, knowledge-base assistants.

**`src/mastra/tools/retrieval-tool.ts`:**
```typescript
import { createTool } from '@mastra/core/tools'
import { embedMany } from 'ai'
import { PgVector } from '@mastra/pg'
import { ModelRouterEmbeddingModel } from '@mastra/core/llm'
import { z } from 'zod'

const pgVector = new PgVector({
  id: 'pg-vector',
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
})

export const retrievalTool = createTool({
  id: 'retrieval-tool',
  description: 'Searches the knowledge base for relevant documents',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    topK: z.number().optional().default(5),
  }),
  outputSchema: z.object({
    documents: z.array(z.object({
      text: z.string(),
      score: z.number(),
    })),
  }),
  execute: async (inputData) => {
    const { query, topK } = inputData
    const { embeddings } = await embedMany({
      values: [query],
      model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
    })
    const results = await pgVector.query({
      indexName: 'embeddings',
      queryVector: embeddings[0],
      topK,
    })
    return {
      documents: results.map((r: any) => ({
        text: r.metadata?.text ?? '',
        score: r.score,
      })),
    }
  },
})
```

**RAG Agent:**
```typescript
export const ragAgent = new Agent({
  id: 'rag-agent',
  instructions: `You answer questions using retrieved context.
    Always use the retrieval tool before answering.
    Cite sources when possible.`,
  model: 'openai/gpt-4o',
  tools: { retrievalTool },
})
```

### Template E: MCP-Connected Agent

Use for: agents that consume external MCP servers for tools.

**`src/mastra/mcp/mcp-client.ts`:**
```typescript
import { MCPClient } from '@mastra/mcp'

export const mcpClient = new MCPClient({
  id: 'mcp-client',
  servers: {
    {{serverName}}: {
      command: 'npx',
      args: ['-y', '{{mcp-package-name}}'],
    },
    // Or remote:
    // {{remoteName}}: {
    //   url: new URL('https://{{server-url}}/mcp'),
    // },
  },
})
```

**Agent with MCP tools:**
```typescript
import { Agent } from '@mastra/core/agent'
import { mcpClient } from '../mcp/mcp-client'

export const mcpAgent = new Agent({
  id: 'mcp-agent',
  instructions: '{{instructions mentioning available MCP tools}}',
  model: 'openai/gpt-4o',
  tools: await mcpClient.listTools(),
})
```

---

## 4. Fully Converted Examples

Each example is a complete, deployable MASTRA project. Source files are in `examples/` subdirectories.

### 4.1 CrewAI Examples

| # | Example | Source | Pattern | Directory |
|---|---------|--------|---------|-----------|
| 1 | Stock Analysis Tool | CrewAI crews/stock_analysis | Workflow (Template B) | `examples/crewai/stock-analysis/` |
| 2 | Trip Planner | CrewAI crews/trip_planner | Supervisor (Template C) | `examples/crewai/trip-planner/` |
| 3 | Email Auto Responder | CrewAI flows/email_auto_responder_flow | Workflow with loop (Template B) | `examples/crewai/email-auto-responder/` |

### 4.2 AutoGen Examples

| # | Example | Source | Pattern | Directory |
|---|---------|--------|---------|-----------|
| 1 | Code Gen Agent | AutoGen agentchat_auto_feedback_from_code_execution | Single Agent + Tools (Template A) | `examples/autogen/code-gen-agent/` |
| 2 | Group Chat | AutoGen agentchat_groupchat | Supervisor (Template C) | `examples/autogen/group-chat/` |
| 3 | RAG Group Chat | AutoGen agentchat_groupchat_RAG | Supervisor + RAG (Template C+D) | `examples/autogen/rag-group-chat/` |

### 4.3 Agno Examples

| # | Example | Source | Pattern | Directory |
|---|---------|--------|---------|-----------|
| 1 | Finance Agent | Agno thinking_finance_agent.py | Single Agent + Tools (Template A) | `examples/agno/finance-agent/` |
| 2 | Research Agent | Agno research_agent.py | Single Agent + Tools (Template A) | `examples/agno/research-agent/` |
| 3 | Recipe Creator | Agno recipe_creator.py | Single Agent + Structured Output (Template A) | `examples/agno/recipe-creator/` |

### 4.4 LangGraph Examples

| # | Example | Source | Pattern | Directory |
|---|---------|--------|---------|-----------|
| 1 | Customer Support | LangGraph customer-support | Workflow with branching (Template B) | `examples/langgraph/customer-support/` |
| 2 | Plan-and-Execute | LangGraph plan-and-execute | Workflow + Agent steps (Template B) | `examples/langgraph/plan-and-execute/` |
| 3 | Adaptive RAG | LangGraph langgraph_adaptive_rag | RAG Workflow (Template B+D) | `examples/langgraph/adaptive-rag/` |

### 4.5 Standalone Examples

| # | Example | Source | Pattern | Directory |
|---|---------|--------|---------|-----------|
| 1 | Health Insights Agent | HIA (harshhh28/hia) | Single Agent + Tools (Template A) | `examples/standalone/health-insights/` |
| 2 | Legal Document Review | firica/legalai | Single Agent + RAG (Template A+D) | `examples/standalone/legal-review/` |
| 3 | Product Recommendation | microsoft/RecAI | RAG Agent (Template D) | `examples/standalone/product-recommendation/` |

---

## 5. Complete Agent Conversion Checklist

### 5.1 CrewAI Agents (22)

| # | Agent Name | Conversion Pattern | Template | Complexity | Status |
|---|-----------|-------------------|----------|------------|--------|
| 1 | Email Auto Responder Flow | Workflow | B | Medium | **EXAMPLE** |
| 2 | Meeting Assistant Flow | Workflow | B | Medium | Pending |
| 3 | Self Evaluation Loop Flow | Workflow | B | Medium | Pending |
| 4 | Lead Score Flow | Workflow | B | Medium | Pending |
| 5 | Marketing Strategy Generator | Workflow | B | Medium | Pending |
| 6 | Job Posting Generator | Single Agent | A | Low | Pending |
| 7 | Recruitment Workflow | Workflow | B | Medium | Pending |
| 8 | Match Profile to Positions | Single Agent | A | Low | Pending |
| 9 | Instagram Post Generator | Single Agent | A | Low | Pending |
| 10 | Landing Page Generator | Single Agent | A | Medium | Pending |
| 11 | Game Builder Crew | Supervisor | C | High | Pending |
| 12 | Stock Analysis Tool | Workflow | B | Medium | **EXAMPLE** |
| 13 | Trip Planner | Supervisor | C | Medium | **EXAMPLE** |
| 14 | Surprise Trip Planner | Supervisor | C | Medium | Pending |
| 15 | Write a Book with Flows | Workflow | B | High | Pending |
| 16 | Screenplay Writer | Workflow | B | Medium | Pending |
| 17 | Markdown Validator | Single Agent | A | Low | Pending |
| 18 | Meta Quest Knowledge | RAG Agent | D | Medium | Pending |
| 19 | NVIDIA Models Integration | Single Agent | A | Low | Pending |
| 20 | Prep for a Meeting | Single Agent | A | Low | Pending |
| 21 | Starter Template | Single Agent | A | Low | Pending |
| 22 | CrewAI + LangGraph Integration | Workflow | B | High | Pending |

### 5.2 AutoGen Agents (61)

| # | Agent Name | Conversion Pattern | Template | Complexity | Status |
|---|-----------|-------------------|----------|------------|--------|
| 1 | Automated Task Solving with Code Gen | Single Agent + Tools | A | Medium | **EXAMPLE** |
| 2 | Code Gen and QA with Retrieval | RAG Agent | D | Medium | Pending |
| 3 | Code Gen with Qdrant Retrieval | RAG Agent | D | Medium | Pending |
| 4 | Group Chat (3+1 manager) | Supervisor | C | Medium | **EXAMPLE** |
| 5 | Group Chat Data Visualization | Supervisor | C | Medium | Pending |
| 6 | Complex Group Chat (6+1) | Supervisor | C | High | Pending |
| 7 | Coding & Planning Agents | Supervisor | C | Medium | Pending |
| 8 | Graph Transition Paths | Workflow | B | High | Pending |
| 9 | Society of Mind Agent | Supervisor | C | High | Pending |
| 10 | Custom Speaker Selection | Supervisor | C | High | Pending |
| 11 | Sequential Multi-Task Chats | Workflow | B | Medium | Pending |
| 12 | Async Sequential Multi-Task | Workflow | B | Medium | Pending |
| 13 | Sequential Chats (Different Agents) | Workflow | B | Medium | Pending |
| 14 | Nested Chats | Workflow (nested) | B | High | Pending |
| 15 | Sequential Nested Chats | Workflow (nested) | B | High | Pending |
| 16 | OptiGuide Nested Chats | Workflow (nested) | B | High | Pending |
| 17 | Conversational Chess (Nested) | Supervisor | C | High | Pending |
| 18 | Automated Continual Learning | Single Agent | A | Medium | Pending |
| 19 | OptiGuide Supply Chain | Workflow | B | High | Pending |
| 20 | AutoAnny Discord Bot | Single Agent + MCP | E | High | Pending |
| 21 | Web Search Agent | Single Agent + Tools | A | Low | Pending |
| 22 | Function Call (Currency Calculator) | Single Agent + Tools | A | Low | Pending |
| 23 | Sync/Async Function Calling | Single Agent + Tools | A | Low | Pending |
| 24 | Langchain Tool Integration | Single Agent + Tools | A | Medium | Pending |
| 25 | RAG Group Chat | Supervisor + RAG | C+D | Medium | **EXAMPLE** |
| 26 | Function Inception | Single Agent + Tools | A | High | Pending |
| 27 | Agent Chat with Whisper | Single Agent + Tools | A | Medium | Pending |
| 28 | Constrained Responses | Single Agent | A | Low | Pending |
| 29 | Browse Web with Agents | Single Agent + MCP | E | Medium | Pending |
| 30 | SQL Agent | Single Agent + Tools | A | Medium | Pending |
| 31 | Web Scraping with Apify | Single Agent + Tools | A | Medium | Pending |
| 32 | Web Crawling with Spider | Single Agent + Tools | A | Medium | Pending |
| 33 | Software App Builder | Workflow | B | High | Pending |
| 34 | Simple ChatGPT Style | Single Agent | A | Low | Pending |
| 35 | Code Gen with Human Feedback | Single Agent | A | Medium | Pending |
| 36 | Multi-Human User Chat | Supervisor | C | High | Pending |
| 37 | Async Human Input | Single Agent | A | Medium | Pending |
| 38 | Teach New Skills | Single Agent + Memory | A | Medium | Pending |
| 39 | Teach Facts & Preferences | Single Agent + Memory | A | Medium | Pending |
| 40 | Teach via GPTAssistant | Single Agent | A | Medium | Pending |
| 41 | Agent Optimizer | Workflow | B | High | Pending |
| 42 | Hello-World OAI Assistant | Single Agent | A | Low | Pending |
| 43 | OAI Assistant Function Call | Single Agent + Tools | A | Low | Pending |
| 44 | OAI Code Interpreter | Single Agent + Tools | A | Medium | Pending |
| 45 | OAI Assistant Retrieval | RAG Agent | D | Medium | Pending |
| 46 | OAI Assistant Group Chat | Supervisor | C | Medium | Pending |
| 47 | GPTAssistant Multi-Agent Tool Use | Supervisor | C | Medium | Pending |
| 48 | Chess (Non-OpenAI Models) | Supervisor | C | Medium | Pending |
| 49 | Multimodal DALLE + GPT-4V | Single Agent + Tools | A | Medium | Pending |
| 50 | Multimodal Llava | Single Agent | A | Medium | Pending |
| 51 | Multimodal GPT-4V | Single Agent | A | Medium | Pending |
| 52 | Long Context Handling | Single Agent | A | Low | Pending |
| 53 | AgentEval | Workflow + Scorers | B | High | Pending |
| 54 | AutoBuild Basic | Workflow | B | High | Pending |
| 55 | AutoBuild Agent Library | Workflow | B | High | Pending |
| 56 | AgentOps Tracking | Single Agent | A | Low | Pending |
| 57 | API Unification | Single Agent | A | Low | Pending |
| 58 | API Config Management | Single Agent | A | Low | Pending |
| 59 | Cost Calculation | Single Agent | A | Low | Pending |
| 60 | Optimize Code Gen | Workflow | B | Medium | Pending |
| 61 | Optimize Math | Workflow | B | Medium | Pending |

### 5.3 Agno Agents (18)

| # | Agent Name | Conversion Pattern | Template | Complexity | Status |
|---|-----------|-------------------|----------|------------|--------|
| 1 | Support Agent | Single Agent + Tools | A | Low | Pending |
| 2 | YouTube Agent | Single Agent + Tools | A | Low | Pending |
| 3 | Finance Agent (Thinking) | Single Agent + Tools | A | Medium | **EXAMPLE** |
| 4 | Study Partner | Single Agent | A | Low | Pending |
| 5 | Shopping Partner | Single Agent + Tools | A | Medium | Pending |
| 6 | Research Scholar (Exa) | Single Agent + Tools | A | Medium | Pending |
| 7 | Research Agent | Single Agent + Tools | A | Medium | **EXAMPLE** |
| 8 | Recipe Creator | Single Agent + Structured | A | Medium | **EXAMPLE** |
| 9 | Finance Agent (Basic) | Single Agent + Tools | A | Low | Pending |
| 10 | Financial Reasoning Agent | Single Agent + Tools | A | Medium | Pending |
| 11 | Readme Generator | Single Agent + Tools | A | Low | Pending |
| 12 | Movie Recommendation | Single Agent + Tools | A | Medium | Pending |
| 13 | Media Trend Analysis | Single Agent + Tools | A | Medium | Pending |
| 14 | Legal Document Analysis | RAG Agent | D | High | Pending |
| 15 | DeepKnowledge | RAG Agent | D | High | Pending |
| 16 | Book Recommendation | Single Agent + Tools | A | Medium | Pending |
| 17 | MCP Airbnb Agent | MCP Agent | E | Medium | Pending |
| 18 | Assist Agent | Single Agent | A | Low | Pending |

### 5.4 LangGraph Agents (20)

| # | Agent Name | Conversion Pattern | Template | Complexity | Status |
|---|-----------|-------------------|----------|------------|--------|
| 1 | Chatbot Simulation Evaluation | Workflow + Scorers | B | High | Pending |
| 2 | Information Gathering Prompting | Single Agent | A | Low | Pending |
| 3 | Code Assistant | Workflow | B | Medium | Pending |
| 4 | Customer Support Agent | Workflow (branching) | B | Medium | **EXAMPLE** |
| 5 | Extraction with Retries | Workflow | B | Medium | Pending |
| 6 | Multi-Agent Supervisor | Supervisor | C | Medium | Pending |
| 7 | Hierarchical Agent Teams | Supervisor (nested) | C | High | Pending |
| 8 | Multi-Agent Collaboration | Supervisor | C | Medium | Pending |
| 9 | Plan-and-Execute Agent | Workflow + Agent | B | Medium | **EXAMPLE** |
| 10 | SQL Agent | Single Agent + Tools | A | Medium | Pending |
| 11 | Reflection Agent | Workflow (loop) | B | Medium | Pending |
| 12 | Reflexion Agent | Workflow (loop) | B | High | Pending |
| 13 | Adaptive RAG | RAG Workflow | B+D | High | **EXAMPLE** |
| 14 | Adaptive RAG (Local) | RAG Workflow | B+D | High | Pending |
| 15 | Agentic RAG | RAG Agent | D | Medium | Pending |
| 16 | Agentic RAG (Local) | RAG Agent | D | Medium | Pending |
| 17 | Corrective RAG (CRAG) | RAG Workflow | B+D | High | Pending |
| 18 | Corrective RAG (Local) | RAG Workflow | B+D | High | Pending |
| 19 | Self-RAG | RAG Workflow | B+D | High | Pending |
| 20 | Self-RAG (Local) | RAG Workflow | B+D | High | Pending |

### 5.5 Standalone Agents (22)

| # | Agent Name | Conversion Pattern | Template | Complexity | Status |
|---|-----------|-------------------|----------|------------|--------|
| 1 | HIA (Health Insights Agent) | Single Agent + Tools | A | Medium | **EXAMPLE** |
| 2 | AI Health Assistant | Single Agent + Tools | A | Medium | Pending |
| 3 | Automated Trading Bot | Single Agent + Tools | A | High | Pending |
| 4 | Virtual AI Tutor | Single Agent | A | Medium | Pending |
| 5 | 24/7 AI Chatbot | Workflow (branching) | B | Medium | Pending |
| 6 | Product Recommendation Agent | RAG Agent | D | Medium | **EXAMPLE** |
| 7 | Self-Driving Delivery Agent | Workflow | B | High | Pending |
| 8 | Factory Process Monitor | Single Agent + Tools | A | High | Pending |
| 9 | Property Pricing Agent | Single Agent + Tools | A | Medium | Pending |
| 10 | Smart Farming Assistant | Single Agent + Tools | A | Medium | Pending |
| 11 | Energy Demand Forecasting | Single Agent + Tools | A | High | Pending |
| 12 | Content Personalization | RAG Agent | D | Medium | Pending |
| 13 | Legal Document Review | Single Agent + RAG | A+D | Medium | **EXAMPLE** |
| 14 | Recruitment Recommendation | Single Agent + Tools | A | Medium | Pending |
| 15 | Virtual Travel Assistant | Workflow | B | Medium | Pending |
| 16 | AI Game Companion | Single Agent | A | Medium | Pending |
| 17 | Real-Time Threat Detection | Single Agent + Tools | A | High | Pending |
| 18 | E-commerce Personal Shopper | Single Agent + Tools | A | Medium | Pending |
| 19 | Logistics Optimization | Workflow | B | High | Pending |
| 20 | Vibe Hacking Agent | Supervisor | C | High | Pending |
| 21 | MediSuite-AI-Agent | Single Agent + Tools | A | Medium | Pending |
| 22 | Lina-Egyptian-Medical-Chatbot | Single Agent | A | Medium | Pending |

---

## 6. Instructions for the Conversion Agent

### 6.1 Overall Process

For each agent in the checklist (Section 5):

1. **Read the source** -- Visit the GitHub link, understand what the agent does.
2. **Identify the pattern** -- Match to the Template (A/B/C/D/E) listed in the checklist.
3. **Create the project directory** following the MASTRA project structure.
4. **Write the files** using the appropriate template from Section 3.
5. **Map the concepts** using the tables in Section 2 for the source framework.
6. **Write `package.json`** with the required dependencies.
7. **Mark status** as "Done" in the checklist.

### 6.2 Key Conversion Rules

1. **Instructions**: Always combine the source agent's role/goal/backstory/system_message into a single `instructions` string. Be specific and detailed.

2. **Model**: Use `openai/gpt-4o` as the default model unless the source specifies something different. Map using the model table in Section 1.5.

3. **Tools**: Every external API call, database query, or computation that the source agent performs should be wrapped in a `createTool()` with proper Zod schemas. Tools should be in separate files under `tools/`.

4. **Workflows vs Agents**: If the source has a clear multi-step pipeline (CrewAI sequential crew, LangGraph linear graph), use a Workflow. If it's a single agent making decisions, use an Agent. If multiple agents collaborate, use a Supervisor.

5. **Structured Output**: If the source returns structured data (Pydantic models, TypedDicts), define a Zod schema and pass it as the `output` option in `generate()`.

6. **Memory**: Only add memory (`@mastra/memory` + `LibSQLStore`) when the source agent maintains conversation history or state across interactions.

7. **RAG**: If the source uses vector search, retrieval, or document processing, use MASTRA's RAG pipeline: `MDocument` for chunking, `embedMany()` for embeddings, `PgVector` or similar for storage and query.

8. **MCP**: If the source connects to external tool servers, use `MCPClient` to connect. If it exposes tools, use `MCPServer`.

9. **Error Handling**: Wrap external API calls in try/catch within tool `execute` functions. Return meaningful error messages.

10. **Environment Variables**: All API keys go in `.env`. Reference via `process.env.KEY_NAME`. Include a `.env.example` file listing required variables.

### 6.3 File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Agent files | `kebab-case.ts` | `finance-agent.ts` |
| Tool files | `kebab-case.ts` | `stock-tools.ts` |
| Workflow files | `kebab-case.ts` | `analysis-workflow.ts` |
| Agent IDs | `kebab-case` | `'finance-agent'` |
| Agent variable names | `camelCase` | `financeAgent` |
| Tool variable names | `camelCase` | `getStockPrice` |
| Workflow variable names | `camelCase` | `analysisWorkflow` |

### 6.4 Quality Checklist

For each converted agent, verify:

- [ ] `package.json` has all required dependencies
- [ ] `src/mastra/index.ts` registers all agents and workflows
- [ ] All tools have proper `inputSchema` and `outputSchema` with Zod
- [ ] Agent `instructions` are detailed and mention available tools
- [ ] Model string follows `provider/model-name` format
- [ ] No hardcoded API keys (use `process.env`)
- [ ] `.env.example` lists all required environment variables
- [ ] Tool descriptions are clear (agents use these for tool selection)
- [ ] Workflow steps have explicit `id`, `inputSchema`, `outputSchema`
- [ ] Supervisor agents have `description` on all subagents

### 6.5 Dependency Reference

Common `package.json` dependencies by pattern:

**All projects:**
```json
{
  "@mastra/core": "latest",
  "zod": "^3.23.0"
}
```

**Supervisor agents (add):**
```json
{
  "@mastra/memory": "latest",
  "@mastra/libsql": "latest"
}
```

**RAG agents (add):**
```json
{
  "@mastra/rag": "latest",
  "@mastra/pg": "latest",
  "ai": "latest"
}
```

**MCP agents (add):**
```json
{
  "@mastra/mcp": "latest"
}
```

**Finance tools:**
```json
{
  "yahoo-finance2": "latest"
}
```
