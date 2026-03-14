import { mastra } from './src/mastra'

async function main() {
  const agent = mastra.getAgent('tradingBot')
  
  const response = await agent.generate(
    `Analyze market conditions and provide trading signals for:
    - AAPL (Apple)
    - GOOGL (Google)
    - BTC-USD (Bitcoin)
    
    Consider current market data and generate buy/sell/hold signals with position sizes.`
  )
  
  console.log('Trading Signals:')
  console.log(response.text)
}

main()
