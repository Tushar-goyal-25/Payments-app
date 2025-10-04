"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { paymentGatewayABI } from '@/lib/paymentGatewayABI';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


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
  const [approvedAmount, setApprovedAmount] = useState<string>("0");
  const [usdAmount, setUsdAmount] = useState<string>("");
  const [usdcAmount, setUsdcAmount] = useState<string>("0");
  const [hasProcessed, setHasProcessed] = useState(false);
  const [isApprovePending, setIsApprovePending] = useState(false);

  const { address } = useAccount();
  const processPayment = useMutation(api.payments.processPayment);
  const { writeContract: approveUSDC, data: approveHash, reset: resetApprove } = useWriteContract();
  const { writeContract: sendPayment, data: paymentHash, reset: resetPayment } = useWriteContract();
  const { isLoading: isApproving, isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isPaying, isSuccess: isPaymentComplete } = useWaitForTransactionReceipt({ hash: paymentHash });

  // Reset approve pending when transaction completes or fails
  useEffect(() => {
    if (isApproving || isApproved) {
      setIsApprovePending(false);
    }
  }, [isApproving, isApproved]);

  // Process payment in Convex after blockchain transaction succeeds
  useEffect(() => {
  const processConvexPayment = async () => {
    if (isPaymentComplete && paymentHash && address && !hasProcessed) {
      try {
        const amountInDecimals = parseFloat(usdcAmount);

        await processPayment({
          walletAddress: address,
          amountUSDC: amountInDecimals,
          txHash: paymentHash,
          reference: 'test-invoice-001',
        });

        setHasProcessed(true);
        console.log("✅ Payment credited to user balance!");

        // Reset form after successful payment (no reload!)
        setTimeout(() => {
          setUsdAmount("");
          setUsdcAmount("0");
          setApprovedAmount("0");
          setHasProcessed(false);
          resetApprove();
          resetPayment();
        }, 3000); // Wait 3 seconds so user sees success message

      } catch (error) {
        console.error("Failed to process payment in Convex:", error);
      }
    }
  };

  processConvexPayment();
}, [isPaymentComplete, paymentHash, address, usdcAmount, processPayment, hasProcessed, resetApprove, resetPayment]);
  // Convert USD to USDC (1:1 for stablecoin)
 const handleAmountChange = (value: string) => {
  setUsdAmount(value);
  const numValue = parseFloat(value);

  // SECURITY: Amount validation
  if (!isNaN(numValue) && numValue > 0 && numValue <= 10000) {
    setUsdcAmount(numValue.toFixed(2));
  } else if (numValue > 10000) {
    setUsdcAmount("10000.00"); // Cap at max
  } else {
    setUsdcAmount("0");
  }

  // Reset approved amount when amount changes
  if (approvedAmount !== "0" && value !== approvedAmount) {
    setApprovedAmount("0");
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
  if (isApprovePending) return; // Prevent double calls

  setIsApprovePending(true);
  const amountInWei = parseUnits(usdcAmount, 6);

  approveUSDC({
    address: USDC_ADDRESS,
    abi: erc20ApproveABI,
    functionName: 'approve',
    args: [GATEWAY_ADDRESS, amountInWei],
  });

  setApprovedAmount(usdcAmount); // Track approved amount
};

  const handlePayment = async () => {
  if (!address) return;
  
  const amountInWei = parseUnits(usdcAmount, 6);
  
  sendPayment({
    address: GATEWAY_ADDRESS,
    abi: paymentGatewayABI,
    functionName: 'pay',
    args: [amountInWei, 'test-invoice-001'], // reference ID
  });
};

  return (
    <Card className="w-full h-fit">
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
              min="0.01"
              max="10000"
              required
            />
            <p className="text-xs text-muted-foreground">
              Min: $0.01 • Max: $10,000
            </p>
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
  disabled={
    !usdcAmount ||
    parseFloat(usdcAmount) <= 0 ||
    isApproving ||
    isApprovePending ||
    (isApproved && approvedAmount === usdcAmount) // Only disable if approved for THIS amount
  }
>
  {isApproving
    ? 'Approving...'
    : (isApproved && approvedAmount === usdcAmount)
      ? '✓ Approved'
      : 'Step 1: Approve USDC'}
</Button>
  
  <Button
  type="button"
  className="w-full"
  onClick={handlePayment}
  disabled={!(isApproved && approvedAmount === usdcAmount) || isPaying || isPaymentComplete}
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
