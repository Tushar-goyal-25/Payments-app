import {v} from "convex/values";
import {mutation, query} from "./_generated/server";

// Process a crypto payment and credit user's USD balance
export const processPayment = mutation({
  args: {
    walletAddress: v.string(),
    amountUSDC: v.number(),
    txHash: v.string(),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
        const userId = identity.subject; // Clerk user ID

    // Convert USDC to USD (1:1 for stablecoin)
    const amountUSD = args.amountUSDC;

    // Check if user balance exists
    const existingBalance = await ctx.db
      .query("userBalances")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
          if (existingBalance) {
      // Update existing balance
      await ctx.db.patch(existingBalance._id, {
        usdBalance: existingBalance.usdBalance + amountUSD,
      });
    } else {
      // Create new balance record
      await ctx.db.insert("userBalances", {
        userId,
        walletAddress: args.walletAddress,
        usdBalance: amountUSD,
      });
    }
    // Record the transaction
        // Record transaction
    await ctx.db.insert("transactions", {
      userId,
      walletAddress: args.walletAddress,
      type: "deposit",
      amountUSDC: args.amountUSDC,
      amountUSD,
      txHash: args.txHash,
      reference: args.reference,
      status: "completed",
      timestamp: Date.now(),
    });

    return { success: true, newBalance: existingBalance ? existingBalance.usdBalance + amountUSD : amountUSD };
  },
  });

// Get user's current USD balance
export const getUserBalance = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const balance = await ctx.db
      .query("userBalances")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    return balance?.usdBalance ?? 0;
  },
  });

// Get user's transaction history
export const getUserTransactions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
          return transactions;
  },
});

// Check if a transaction has already been processed (prevent duplicates)
export const isTransactionProcessed = query({
  args: { txHash: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("transactions")
      .withIndex("by_txHash", (q) => q.eq("txHash", args.txHash))
      .first();

    return existing !== null;
  },
});