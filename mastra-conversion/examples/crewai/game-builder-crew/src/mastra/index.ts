import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'

export const gameDesigner = new Agent({
  id: 'game-designer',
  name: 'Game Designer',
  description: 'Creates game concepts, mechanics, and design documents',
  instructions: `You are a creative game designer. Create detailed game design documents including:
- Game concept and premise
- Core mechanics
- Player progression
- Level design outline
- Art style direction
- Technical requirements`,
  model: 'openai/gpt-4o',
})

export const codeGenerator = new Agent({
  id: 'code-generator',
  name: 'Code Generator',
  description: 'Generates game code based on design documents',
  instructions: `You generate game code. Given a design document:
- Write clean, working code
- Use appropriate game frameworks
- Include comments explaining logic
- Handle edge cases
- Follow best practices`,
  model: 'openai/gpt-4o',
})

export const qaTester = new Agent({
  id: 'qa-tester',
  name: 'QA Tester',
  description: 'Tests and reviews game implementations',
  instructions: `You test game implementations. Review code for:
- Bugs and errors
- Logic issues
- Performance problems
- Missing features from design
- Code quality issues
Provide detailed feedback.`,
  model: 'openai/gpt-4o',
})

export const gameBuilderSupervisor = new Agent({
  id: 'game-builder-supervisor',
  name: 'Game Builder Supervisor',
  description: 'Coordinates game building process with designer, coder, and tester',
  instructions: `You coordinate a game development team. Your workflow:

1. **Design Phase**: Delegate to gameDesigner to create a game concept
2. **Implementation Phase**: Delegate to codeGenerator to write the code
3. **Review Phase**: Delegate to qaTester to review and provide feedback
4. **Iterate**: Based on feedback, may need additional implementation passes

After each delegation, synthesize the results and decide next steps.
The goal is to deliver a complete, working game based on the user's request.

Coordinate efficiently - not every request needs all three agents.
Simple games may just need design + code.`,
  model: 'openai/gpt-4o',
  agents: { gameDesigner, codeGenerator, qaTester },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'game-builder-storage',
      url: 'file:mastra.db',
    }),
  }),
})

export const mastra = new Mastra({
  agents: { gameDesigner, codeGenerator, qaTester, gameBuilderSupervisor },
})
