import { Mastra } from '@mastra/core/mastra'
import { gameCompanionAgent } from './agents/game-companion'

export const mastra = new Mastra({
  agents: {
    gameCompanionAgent,
  },
})
