import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Search for recipe inspiration by query and optional dietary preferences.
 */
export const searchRecipes = createTool({
  id: "search-recipes",
  description:
    "Search for recipe inspiration based on ingredients, cuisine type, or dietary preferences. Use this to find ideas and inspiration when creating new recipes.",
  inputSchema: z.object({
    query: z.string().describe("Search query (e.g., 'chicken pasta', 'vegan dessert')"),
    dietaryPreference: z
      .string()
      .optional()
      .describe("Optional dietary preference (e.g., 'vegetarian', 'gluten-free')"),
  }),
  outputSchema: z.object({
    recipes: z.array(
      z.object({
        title: z.string(),
        summary: z.string(),
        source: z.string(),
      })
    ),
  }),
  execute: async (inputData) => {
    const { query, dietaryPreference } = inputData;
    // Simulated search - in production, integrate with a recipe API (e.g., Spoonacular, Edamam)
    const baseRecipes = [
      {
        title: `${query} - Classic Style`,
        summary: `A traditional take on ${query} with balanced flavors.`,
        source: "Recipe Database",
      },
      {
        title: `${query} - Quick & Easy`,
        summary: `A simplified version of ${query} perfect for weeknights.`,
        source: "Recipe Database",
      },
    ];
    const recipes = dietaryPreference
      ? baseRecipes.map((r) => ({
          ...r,
          title: `${r.title} (${dietaryPreference})`,
        }))
      : baseRecipes;
    return { recipes };
  },
});

/**
 * Estimate calories and macros for a list of ingredients.
 */
export const getNutritionalInfo = createTool({
  id: "get-nutritional-info",
  description:
    "Estimate calories, protein, carbs, and fat for a list of ingredients. Use this to add nutritional information to recipes.",
  inputSchema: z.object({
    ingredients: z
      .array(z.string())
      .describe("List of ingredients with quantities (e.g., '2 cups flour', '1 lb chicken')"),
  }),
  outputSchema: z.object({
    calories: z.number().describe("Estimated total calories"),
    protein: z.number().describe("Estimated protein in grams"),
    carbs: z.number().describe("Estimated carbs in grams"),
    fat: z.number().describe("Estimated fat in grams"),
    servings: z.number().optional().describe("Number of servings this estimate is for"),
  }),
  execute: async (inputData) => {
    const { ingredients } = inputData;
    // Simulated nutritional estimation - in production, use a nutrition API
    const basePerIngredient = 150;
    const count = ingredients.length;
    return {
      calories: Math.round(basePerIngredient * count * 1.2),
      protein: Math.round(count * 12),
      carbs: Math.round(count * 18),
      fat: Math.round(count * 6),
      servings: 4,
    };
  },
});
