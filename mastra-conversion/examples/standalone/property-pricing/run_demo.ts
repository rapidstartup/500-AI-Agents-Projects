import { mastra } from './src/mastra/index.js'

const property = `
Property Details:
- Location: Austin, TX
- Type: Single Family Home
- Size: 2,500 sq ft
- Bedrooms: 4
- Bathrooms: 3
- Year Built: 2018
- Features: Pool, Updated Kitchen, Hardwood Floors
- Condition: Excellent
`

async function main() {
  const agent = mastra.getAgent('propertyPricing')

  console.log('=== Property Pricing Agent Demo ===\n')

  const response = await agent.generate(
    `Provide a property valuation for:\n${property}`
  )

  console.log('=== Valuation ===\n')
  console.log(response.text)
}

main().catch(console.error)
