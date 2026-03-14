import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const bmiCalculator = createTool({
  id: 'bmi-calculator',
  description: 'Calculate Body Mass Index (BMI) from height and weight',
  inputSchema: z.object({
    weightKg: z.number().positive(),
    heightCm: z.number().positive(),
  }),
  outputSchema: z.object({
    bmi: z.number(),
    category: z.string(),
    healthyRange: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { weightKg, heightCm } = inputData
    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)
    
    let category: string
    if (bmi < 18.5) category = 'Underweight'
    else if (bmi < 25) category = 'Normal weight'
    else if (bmi < 30) category = 'Overweight'
    else category = 'Obese'
    
    return {
      bmi: Math.round(bmi * 10) / 10,
      category,
      healthyRange: '18.5 - 24.9',
    }
  },
})

const healthInfoTool = createTool({
  id: 'health-information',
  description: 'Get general health information and wellness tips',
  inputSchema: z.object({
    topic: z.string(),
  }),
  outputSchema: z.object({
    information: z.string(),
    sources: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    return {
      information: `General information about ${inputData.topic}. This is a demonstration of the health information tool. For actual medical advice, consult healthcare professionals.`,
      sources: ['WHO Guidelines', 'CDC', 'Mayo Clinic'],
    }
  },
})

export const healthAssistantAgent = new Agent({
  id: 'ai-health-assistant',
  name: 'AI Health Assistant',
  description: 'Provides health information, BMI calculations, and wellness guidance',
  instructions: `You are an AI Health Assistant focused on preventive health and wellness.

Your capabilities:
- Calculate BMI and provide health category feedback
- Provide general health information and wellness tips
- Explain health metrics in simple terms
- Suggest lifestyle improvements

Important guidelines:
- Always clarify that you provide general information, not medical diagnosis
- Recommend consulting healthcare professionals for medical concerns
- Never prescribe medications or diagnose conditions
- Focus on preventive health and healthy lifestyle

When a user asks about health:
1. Provide helpful, accurate general information
2. Use the BMI calculator if they provide height/weight
3. Suggest practical lifestyle improvements
4. Always include disclaimer about consulting professionals`,
  model: 'openai/gpt-4o',
  tools: { bmiCalculator, healthInfoTool },
})
