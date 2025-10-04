"use client ";
import { useAccount, useReadContracts } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUnits } from 'viem';

// USDC contract addresses (testnet)
const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  80002: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Polygon Amoy
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
};
// ERC20 ABI - just the balanceOf function
const erc20ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
] as const;

const WalletStatus = () => {
    const { address, isConnected, chain } = useAccount()
    const {data, isLoading, refetch} = useReadContracts({
        contracts: address && isConnected && chain && USDC_ADDRESSES[chain.id] ? [{
            address: USDC_ADDRESSES[chain.id],
            abi: erc20ABI,
            functionName: 'balanceOf',
            args: address ? [address] : undefined,
            chainId: chain.id,
        }] : [],
        query: {
            refetchInterval: 3000, // Refetch every 3 seconds
        }
    });

 const balance = data?.[0]?.result;
  const formattedBalance = balance ? formatUnits(balance, 6) : '0'; // USDC has 6 decimals
  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No wallet connected</p>
        </CardContent>
      </Card>
    );
  }
    return (
            <Card className="w-full">
      <CardHeader>
        <CardTitle>Wallet Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Address</p>
          <p className="font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Network</p>
          <p className="font-medium">{chain?.name || 'Unknown'}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">USDC Balance</p>
          <p className="text-2xl font-bold">
            {isLoading ? 'Loading...' : `${formattedBalance} USDC`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default WalletStatus