import { Mastra } from "@mastra/core";
import { recipeAgent } from "./agents/recipe-agent.js";

export const mastra = new Mastra({
  agents: { recipeAgent },
});

export { recipeAgent, createRecipe, recipeSchema, type Recipe } from "./agents/recipe-agent.js";
export { searchRecipes, getNutritionalInfo } from "./tools/recipe-tools.js";
