import { Mastra } from "@mastra/core/mastra";
import { healthAgent } from "./agents/health-agent";

export const mastra = new Mastra({
  agents: { healthAgent },
});
