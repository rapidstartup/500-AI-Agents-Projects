import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('chatbot247')
  
  const response = await agent.generate(
    `Customer message: "Hi, I'm interested in your pricing for enterprise customers. Can you help?"`
  )
  
  console.log('Chatbot Response:')
  console.log(response.text)
}

main()
