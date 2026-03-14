import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

/**
 * In-memory mock database for demo purposes.
 * In production, replace with real DB/API calls.
 */
const MOCK_ORDERS: Record<string, { orderId: string; customerId: string; status: string; total: number; items: string[]; createdAt: string }> = {
  'ORD-001': { orderId: 'ORD-001', customerId: 'CUST-001', status: 'delivered', total: 99.99, items: ['Widget A', 'Widget B'], createdAt: '2025-02-01' },
  'ORD-002': { orderId: 'ORD-002', customerId: 'CUST-002', status: 'shipped', total: 149.50, items: ['Gadget X'], createdAt: '2025-03-10' },
  'ORD-003': { orderId: 'ORD-003', customerId: 'CUST-001', status: 'processing', total: 45.00, items: ['Accessory'], createdAt: '2025-03-14' },
}

const MOCK_CUSTOMERS: Record<string, { customerId: string; name: string; email: string; tier: string }> = {
  'CUST-001': { customerId: 'CUST-001', name: 'Alice Smith', email: 'alice@example.com', tier: 'premium' },
  'CUST-002': { customerId: 'CUST-002', name: 'Bob Jones', email: 'bob@example.com', tier: 'standard' },
}

/**
 * Look up order by ID.
 * MASTRA conversion of LangGraph customer support - database lookup tool.
 */
export const lookupOrder = createTool({
  id: 'lookup-order',
  description:
    'Look up an order by its order ID. Use when the customer asks about order status, tracking, or order details.',
  inputSchema: z.object({
    orderId: z.string().describe('The order ID to look up (e.g., ORD-001)'),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    found: z.boolean(),
    status: z.string().nullable(),
    total: z.number().nullable(),
    items: z.array(z.string()).nullable(),
    customerId: z.string().nullable(),
    createdAt: z.string().nullable(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { orderId } = inputData
    const order = MOCK_ORDERS[orderId]
    if (!order) {
      return {
        orderId,
        found: false,
        status: null,
        total: null,
        items: null,
        customerId: null,
        createdAt: null,
      }
    }
    return {
      orderId,
      found: true,
      status: order.status,
      total: order.total,
      items: order.items,
      customerId: order.customerId,
      createdAt: order.createdAt,
    }
  },
})

/**
 * Look up customer info by customer ID.
 * MASTRA conversion of LangGraph customer support - database lookup tool.
 */
export const lookupCustomer = createTool({
  id: 'lookup-customer',
  description:
    'Look up customer information by customer ID. Use when you need customer name, email, or tier.',
  inputSchema: z.object({
    customerId: z.string().describe('The customer ID to look up (e.g., CUST-001)'),
  }),
  outputSchema: z.object({
    customerId: z.string(),
    found: z.boolean(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    tier: z.string().nullable(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { customerId } = inputData
    const customer = MOCK_CUSTOMERS[customerId]
    if (!customer) {
      return {
        customerId,
        found: false,
        name: null,
        email: null,
        tier: null,
      }
    }
    return {
      customerId,
      found: true,
      name: customer.name,
      email: customer.email,
      tier: customer.tier,
    }
  },
})

/**
 * Check if an order is eligible for refund.
 * MASTRA conversion of LangGraph customer support - refund eligibility check.
 */
export const checkRefundEligibility = createTool({
  id: 'check-refund-eligibility',
  description:
    'Check if an order is eligible for a refund. Use before processing a refund request.',
  inputSchema: z.object({
    orderId: z.string().describe('The order ID to check refund eligibility for'),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    eligible: z.boolean(),
    reason: z.string(),
    daysSinceOrder: z.number().nullable(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { orderId } = inputData
    const order = MOCK_ORDERS[orderId]
    if (!order) {
      return {
        orderId,
        eligible: false,
        reason: 'Order not found',
        daysSinceOrder: null,
      }
    }
    const orderDate = new Date(order.createdAt)
    const daysSince = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
    const eligible = daysSince <= 30 && (order.status === 'delivered' || order.status === 'shipped')
    return {
      orderId,
      eligible,
      reason: eligible
        ? 'Order is within 30-day refund window and has been shipped/delivered'
        : daysSince > 30
          ? 'Refund window (30 days) has expired'
          : 'Order must be shipped or delivered to be eligible',
      daysSinceOrder: daysSince,
    }
  },
})

/**
 * Process a refund for an order.
 * MASTRA conversion of LangGraph customer support - refund processing tool.
 */
export const processRefund = createTool({
  id: 'process-refund',
  description:
    'Process a refund for an order. Use only after confirming refund eligibility. Returns a refund confirmation.',
  inputSchema: z.object({
    orderId: z.string().describe('The order ID to process refund for'),
    reason: z.string().optional().describe('Optional reason for the refund'),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    success: z.boolean(),
    refundId: z.string().nullable(),
    amount: z.number().nullable(),
    message: z.string(),
    error: z.string().optional(),
  }),
  execute: async (inputData) => {
    const { orderId } = inputData
    const order = MOCK_ORDERS[orderId]
    if (!order) {
      return {
        orderId,
        success: false,
        refundId: null,
        amount: null,
        message: 'Order not found',
      }
    }
    const refundId = `REF-${orderId}-${Date.now().toString(36)}`
    return {
      orderId,
      success: true,
      refundId,
      amount: order.total,
      message: `Refund of $${order.total.toFixed(2)} has been processed. Refund ID: ${refundId}. Funds will appear in 5-10 business days.`,
    }
  },
})
