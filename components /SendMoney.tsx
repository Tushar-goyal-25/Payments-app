"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SendMoney() {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const transferUSD = useMutation(api.payments.transferUSD);
  const userBalance = useQuery(api.payments.getUserBalance);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSuccess(false);

    try {
      // SECURITY: Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        setError("Invalid email address");
        return;
      }

      // SECURITY: Amount validation
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Invalid amount");
        return;
      }

      if (amountNum < 0.01) {
        setError("Minimum transfer is $0.01");
        return;
      }

      if (amountNum > 10000) {
        setError("Maximum transfer is $10,000");
        return;
      }

      if (!userBalance || userBalance < amountNum) {
        setError("Insufficient balance");
        return;
      }

      // SECURITY: Reference sanitization
      const sanitizedReference = reference.slice(0, 200);

      await transferUSD({
        recipientEmail: recipientEmail.toLowerCase().trim(),
        amount: amountNum,
        reference: sanitizedReference || "Transfer",
      });

      setIsSuccess(true);
      setRecipientEmail("");
      setAmount("");
      setReference("");

      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Transfer failed");
    }
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle>Send Money</CardTitle>
        <CardDescription>
          Transfer USD to another user by email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              max="10000"
              required
            />
            {userBalance !== undefined && userBalance !== null && (
              <p className="text-xs text-muted-foreground">
                Available: ${userBalance.toFixed(2)} • Min: $0.01 • Max: $10,000
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Note (Optional)</Label>
            <Input
              id="reference"
              type="text"
              placeholder="What's this for?"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {reference.length}/200 characters
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!recipientEmail || !amount || parseFloat(amount) <= 0}
          >
            Send ${amount || "0.00"}
          </Button>

          {isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-semibold">✓ Transfer Successful!</p>
              <p className="text-sm text-green-700">
                Sent ${parseFloat(amount).toFixed(2)} to {recipientEmail}
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-semibold">✗ Transfer Failed</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}