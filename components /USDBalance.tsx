"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function USDBalance() {
  const balance = useQuery(api.payments.getUserBalance);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>USD Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-4xl font-bold text-green-600">
            ${balance?.toFixed(2) ?? '0.00'}
          </p>
          <p className="text-xs text-muted-foreground">
            Converted from USDC deposits
          </p>
        </div>
      </CardContent>
    </Card>
  );
}