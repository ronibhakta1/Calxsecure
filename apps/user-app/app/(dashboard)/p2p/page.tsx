import { P2PTransactionHistory } from '@/components/P2pTransationsHistory'
import { SendCard } from '@/components/SendCard'
import React from 'react'

const page = () => {
  return (
    <div className='w-full'>
      <SendCard />
      <P2PTransactionHistory />
    </div>
  )
}

export default page
