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
      // Update existing balance (and email if missing)
      await ctx.db.patch(existingBalance._id, {
        usdBalance: existingBalance.usdBalance + amountUSD,
        email: existingBalance.email || identity.email,
      });
    } else {
      // Create new balance record
      await ctx.db.insert("userBalances", {
        userId,
        email: identity.email,
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

// Initialize user account (call this on first login)
export const initializeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const email = identity.email;

    // Check if user already has a balance
    const existingBalance = await ctx.db
      .query("userBalances")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existingBalance) {
      // Create initial balance entry
      await ctx.db.insert("userBalances", {
        userId,
        email,
        walletAddress: "0x0000000000000000000000000000000000000000", // Placeholder until wallet connected
        usdBalance: 0,
      });
      return { success: true, message: "User initialized" };
    }

    return { success: true, message: "User already exists" };
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
// Transfer USD from one user to another
export const transferUSD = mutation({
  args: {
    recipientEmail: v.string(),
    amount: v.number(),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const senderId = identity.subject;
    const senderEmail = identity.email || "unknown";

    // Validate amount
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Get sender's balance
    const senderBalance = await ctx.db
      .query("userBalances")
      .withIndex("by_userId", (q) => q.eq("userId", senderId))
      .first();

    if (!senderBalance || senderBalance.usdBalance < args.amount) {
      throw new Error("Insufficient balance");
    }

    // Find recipient by email
    const recipientBalance = await ctx.db
      .query("userBalances")
      .withIndex("by_email", (q) => q.eq("email", args.recipientEmail))
      .first();

    if (!recipientBalance) {
      throw new Error("Recipient not found. They need to create an account first.");
    }

    // Prevent self-transfer
    if (recipientBalance.userId === senderId) {
      throw new Error("Cannot transfer to yourself");
    }

    // Deduct from sender
    await ctx.db.patch(senderBalance._id, {
      usdBalance: senderBalance.usdBalance - args.amount,
    });

    // Credit recipient
    await ctx.db.patch(recipientBalance._id, {
      usdBalance: recipientBalance.usdBalance + args.amount,
    });

    const transferId = `transfer-${Date.now()}`;

    // Record sender's transaction (outgoing)
    await ctx.db.insert("transactions", {
      userId: senderId,
      walletAddress: senderBalance.walletAddress,
      type: "transfer_out",
      amountUSDC: 0,
      amountUSD: -args.amount, // Negative for outgoing
      txHash: transferId,
      reference: args.reference,
      status: "completed",
      timestamp: Date.now(),
      recipientEmail: args.recipientEmail,
      recipientUserId: recipientBalance.userId,
      senderEmail: senderEmail,
    });

    // Record recipient's transaction (incoming)
    await ctx.db.insert("transactions", {
      userId: recipientBalance.userId,
      walletAddress: recipientBalance.walletAddress,
      type: "transfer_in",
      amountUSDC: 0,
      amountUSD: args.amount, // Positive for incoming
      txHash: transferId,
      reference: args.reference,
      status: "completed",
      timestamp: Date.now(),
      recipientEmail: args.recipientEmail,
      recipientUserId: recipientBalance.userId,
      senderEmail: senderEmail,
    });

    return {
      success: true,
      newBalance: senderBalance.usdBalance - args.amount,
      recipientEmail: args.recipientEmail
    };
  },
});

