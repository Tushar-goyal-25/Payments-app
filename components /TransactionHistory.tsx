"use client"
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TransactionHistory() {
      const transactions = useQuery(api.payments.getUserTransactions);

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No transactions yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {tx.type === 'deposit' || tx.type === 'transfer_in' ? '+' : '-'}$
                    {Math.abs(tx.amountUSD).toFixed(2)}
                  </span>
                  {tx.amountUSDC > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({tx.amountUSDC.toFixed(2)} USDC)
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    tx.type === 'deposit' ? 'bg-blue-100 text-blue-700' :
                    tx.type === 'transfer_in' ? 'bg-green-100 text-green-700' :
                    tx.type === 'transfer_out' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {tx.type === 'deposit' ? 'Deposit' :
                     tx.type === 'transfer_in' ? 'Received' :
                     tx.type === 'transfer_out' ? 'Sent' :
                     tx.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {tx.reference}
                  </span>
                  {(tx.type === 'transfer_in' || tx.type === 'transfer_out') && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {tx.type === 'transfer_out' ? `To: ${tx.recipientEmail}` : `From: ${tx.senderEmail}`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tx.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : tx.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {tx.status}
                </span>
                {tx.type === 'deposit' ? (
                  <a
                    href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View →
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Internal</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}