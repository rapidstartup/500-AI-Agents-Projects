import { Mastra } from "@mastra/core/mastra";
import { financeAgent } from "./agents/finance-agent";

export const mastra = new Mastra({
  agents: { financeAgent },
});

/**
 * Demo: Run the finance agent with a sample query.
 * Equivalent to: agent.print_response("Summarize analyst recommendations and share the latest news for NVDA")
 */
async function main() {
  const agent = mastra.getAgent("financeAgent");
  const response = await agent.generate(
    "Summarize analyst recommendations and share the latest news for NVDA"
  );
  console.log(response.text ?? response);
}

main().catch(console.error);
