/**
 * Seed the product catalog for vector similarity search.
 * Run: npx tsx src/seed-products.ts
 */
import { PgVector } from '@mastra/pg'
import { embedMany } from 'ai'
import { ModelRouterEmbeddingModel } from '@mastra/core/llm'
import { PRODUCT_INDEX_NAME } from './mastra/tools/recommendation-tools.js'

const EMBEDDING_DIMENSION = 1536

const products = [
  {
    id: 'p1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Noise-cancelling over-ear headphones with 30hr battery',
    category: 'Electronics',
    price: 149.99,
    brand: 'SoundMax',
  },
  {
    id: 'p2',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with cherry MX switches',
    category: 'Electronics',
    price: 129.99,
  },
  {
    id: 'p3',
    name: 'Organic Coffee Beans',
    description: 'Single-origin Ethiopian coffee, medium roast',
    category: 'Food & Beverage',
    price: 24.99,
  },
  {
    id: 'p4',
    name: 'Wireless Earbuds',
    description: 'Compact true wireless earbuds with active noise cancellation',
    category: 'Electronics',
    price: 89.99,
    brand: 'SoundMax',
  },
  {
    id: 'p5',
    name: 'Cozy Wool Sweater',
    description: 'Soft merino wool sweater for winter',
    category: 'Apparel',
    price: 79.99,
  },
  {
    id: 'p6',
    name: 'Running Shoes',
    description: 'Lightweight running shoes with cushioned sole',
    category: 'Footwear',
    price: 119.99,
  },
  {
    id: 'p7',
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor',
    category: 'Electronics',
    price: 199.99,
  },
  {
    id: 'p8',
    name: 'Herbal Tea Collection',
    description: 'Assorted chamomile, peppermint, and green tea',
    category: 'Food & Beverage',
    price: 18.99,
  },
]

async function seed() {
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://localhost:5432/mastra'
  const pgVector = new PgVector({ id: 'pg-vector', connectionString })
  const embeddingModel = new ModelRouterEmbeddingModel(
    'openai/text-embedding-3-small'
  )

  const texts = products.map(
    (p) => `${p.name} ${p.description} ${p.category} ${p.brand ?? ''}`
  )
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  })

  await pgVector.createIndex({
    indexName: PRODUCT_INDEX_NAME,
    dimension: EMBEDDING_DIMENSION,
  }).catch(() => {})

  await pgVector.upsert({
    indexName: PRODUCT_INDEX_NAME,
    vectors: embeddings,
    metadata: products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      brand: p.brand,
    })),
  })

  console.log(`Seeded ${products.length} products into ${PRODUCT_INDEX_NAME}`)
}

seed().catch(console.error)
