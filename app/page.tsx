'use client'

import { Authenticated, Unauthenticated } from 'convex/react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import PaymentForm from '@/components /PaymentsForm'
import WalletStatus from '@/components /WalletStatus'
import USDBalance from '@/components /USDBalance'
import TransactionHistory from '@/components /TransactionHistory'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Authenticated>
        {/* Header */}
        <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Payment Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your crypto payments</p>
              </div>
              <div className="flex items-center gap-4">
                <ConnectButton />
                <UserButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="container mx-auto px-4 py-8">
          <Content />
        </main>
      </Authenticated>

      <Unauthenticated>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome to Payment Gateway</h1>
            <p className="text-muted-foreground">Sign in to manage your payments</p>
            <SignInButton />
          </div>
        </div>
      </Unauthenticated>
    </div>
  )
}

function Content() {
  return (
    <div className="space-y-6">
      {/* Balance Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <USDBalance />
        <WalletStatus />
      </div>

      {/* Payment Form and History Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form - Takes 1 column */}
        <div className="lg:col-span-1">
          <PaymentForm />
        </div>

        {/* Transaction History - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TransactionHistory />
        </div>
      </div>
    </div>
  )
}