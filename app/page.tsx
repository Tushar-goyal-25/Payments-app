'use client'

import { Authenticated, Unauthenticated } from 'convex/react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import PaymentForm from '@/components /PaymentsForm'
import WalletStatus from '@/components /WalletStatus'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Authenticated>
        <div className="flex items-center gap-4">
          <UserButton />
          <ConnectButton />
          
        </div>
        
        <Content />
        
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </div>
  )
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser)
  return (
    <div className="space-y-4">
      <WalletStatus />
      <PaymentForm />
      <div>Authenticated content: {messages?.length}</div>
    </div>
  )}