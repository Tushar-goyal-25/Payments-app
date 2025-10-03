"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { paymentGatewayABI } from '@/lib/paymentGatewayABI';

// Add ERC20 approve ABI
const erc20ApproveABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const USDC_ADDRESS = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'; // Polygon Amoy
const GATEWAY_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_ADDRESS as `0x${string}`;
export default function PaymentForm() {
  const [usdAmount, setUsdAmount] = useState<string>("");
  const [usdcAmount, setUsdcAmount] = useState<string>("0");
  const { address } = useAccount();
  const { writeContract: approveUSDC, data: approveHash } = useWriteContract();
  const { writeContract: sendPayment, data: paymentHash } = useWriteContract();
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isPaying } = useWaitForTransactionReceipt({ hash: paymentHash });
  const { isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: isPaymentComplete } = useWaitForTransactionReceipt({ hash: paymentHash });

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
  const handleApprove = async () => {
    const amountInWei = parseUnits(usdcAmount, 6); // USDC has 6 decimals
    
    approveUSDC({
      address: USDC_ADDRESS,
      abi: erc20ApproveABI,
      functionName: 'approve',
      args: [GATEWAY_ADDRESS, amountInWei],
    });
  };
  const handlePayment = async () => {
    const amountInWei = parseUnits(usdcAmount, 6);
    
    sendPayment({
      address: GATEWAY_ADDRESS,
      abi: paymentGatewayABI,
      functionName: 'pay',
      args: [amountInWei, 'test-invoice-001'], // reference ID
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

          <div className="space-y-2">
    <Button
    type="button"
    className="w-full"
    onClick={handleApprove}
    disabled={!usdcAmount || parseFloat(usdcAmount) <= 0 || isApproving || isApproved}
  >
    {isApproving ? 'Approving...' : isApproved ? '✓ Approved' : 'Step 1: Approve USDC'}
  </Button>
  
  <Button
  type="button"
  className="w-full"
  onClick={handlePayment}
  disabled={!approveHash || isPaying || isPaymentComplete}
  variant={isPaymentComplete ? "secondary" : "default"}
  >
    {isPaying ? 'Processing...' : isPaymentComplete ? '✓ Payment Complete' : 'Step 2: Send Payment'}
  </Button>
</div>
  {isPaymentComplete && paymentHash && (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
      <p className="text-green-800 font-semibold">✓ Transaction Approved!</p>
      <a
        href={`https://amoy.polygonscan.com/tx/${paymentHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:underline"
      >
        View on PolygonScan →
      </a>
    </div>
  )}
        </form>
      </CardContent>
    </Card>
  );
}
