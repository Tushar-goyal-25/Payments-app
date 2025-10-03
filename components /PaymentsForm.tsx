"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function PaymentForm() {
  const [usdAmount, setUsdAmount] = useState<string>("");
  const [usdcAmount, setUsdcAmount] = useState<string>("0");

  // Convert USD to USDC (1:1 for stablecoin)
  const handleAmountChange = (value: string) => {
    setUsdAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setUsdcAmount(numValue.toFixed(2));
    } else {
      setUsdcAmount("0");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement USDC payment logic here
    console.log("Processing payment:", {
      usdAmount,
      usdcAmount
    });
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Send Payment</CardTitle>
        <CardDescription>
          Enter the amount in USD to pay with USDC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usd-amount">Amount (USD)</Label>
            <Input
              id="usd-amount"
              type="number"
              placeholder="0.00"
              value={usdAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>USDC Equivalent</Label>
            <div className="text-2xl font-bold text-primary">
              {usdcAmount} USDC
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!usdAmount || parseFloat(usdAmount) <= 0}
          >
            Continue to Payment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
