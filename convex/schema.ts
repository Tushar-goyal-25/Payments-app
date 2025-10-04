import { defineSchema, defineTable } from "convex/server";
import {v} from "convex/values";

export default defineSchema({
  // Existing messages table
    messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),
  //user wallet balance
  userBalances: defineTable({
    userId: v.string(),        // Clerk user ID
    walletAddress: v.string(), // User's connected wallet address
    usdBalance: v.number(),    // Virtual USD balance
  }).index("by_userId", ["userId"])
    .index("by_wallet", ["walletAddress"]),

    //Transaction history
    transactions: defineTable({
    userId: v.string(),           // Clerk user ID
    walletAddress: v.string(),    // User's wallet
    type: v.string(),             // "deposit" or "withdrawal"
    amountUSDC: v.number(),       // Amount in USDC (with decimals)
    amountUSD: v.number(),        // Equivalent USD amount
    txHash: v.string(),           // Blockchain transaction hash
    reference: v.string(),        // Invoice/order reference
    status: v.string(),           // "pending" | "completed" | "failed"
    timestamp: v.number(),        // When transaction occurred
  }).index("by_userId", ["userId"])
    .index("by_txHash", ["txHash"]),
});
