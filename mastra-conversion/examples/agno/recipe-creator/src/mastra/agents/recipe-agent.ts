import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { searchRecipes, getNutritionalInfo } from "../tools/recipe-tools.js";

/**
 * Zod schema for Recipe - converted from Agno Pydantic Recipe model.
 */
export const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prep_time: z.string(),
  cook_time: z.string(),
  servings: z.number(),
});

export type Recipe = z.infer<typeof recipeSchema>;

export const recipeAgent = new Agent({
  id: "recipe-agent",
  name: "Recipe Creator",
  description: "Professional chef and recipe creator. Creates personalized recipes based on ingredients and preferences.",
  instructions: [
    "You are a professional chef and recipe creator.",
    "Create personalized recipes based on ingredients and preferences.",
    "Use searchRecipes to find inspiration when needed.",
    "Use getNutritionalInfo to estimate calories and macros for the ingredients.",
  ],
  model: "openai/gpt-4o",
  tools: { searchRecipes, getNutritionalInfo },
});

/**
 * Generate a recipe with structured output.
 * Returns response.object which is the typed Recipe.
 */
export async function createRecipe(
  prompt: string,
  options?: { structuredOutput?: { model?: string } }
): Promise<Recipe> {
  const response = await recipeAgent.generate(prompt, {
    structuredOutput: {
      schema: recipeSchema,
      ...options?.structuredOutput,
    },
  });

  if (!response.object) {
    throw new Error("Failed to generate structured recipe output");
  }

  return response.object as Recipe;
}
