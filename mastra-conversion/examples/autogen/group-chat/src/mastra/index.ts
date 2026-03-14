import { Mastra } from '@mastra/core/mastra'
import { researcherAgent } from './agents/researcher'
import { analystAgent } from './agents/analyst'
import { supervisorAgent } from './agents/supervisor'

/**
 * MASTRA conversion of AutoGen "Automated Task Solving by Group Chat (3 agents + 1 manager)".
 *
 * Original AutoGen structure:
 * - GroupChat with User_proxy, Coder, Product_manager
 * - GroupChatManager coordinating turns
 * - max_round=12
 *
 * MASTRA Supervisor pattern:
 * - researcherAgent: Gathers information (ArXiv papers, research data)
 * - analystAgent: Processes and analyzes data (applications, insights)
 * - supervisorAgent: Coordinates researcher and analyst with delegation hooks
 */
export const mastra = new Mastra({
  agents: {
    researcherAgent,
    analystAgent,
    supervisorAgent,
  },
})
