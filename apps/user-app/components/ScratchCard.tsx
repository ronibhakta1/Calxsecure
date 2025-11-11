
'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

interface ScratchCardProps {
  amount: number
  onReveal: () => void
}

export function ScratchCard({ amount, onReveal }: ScratchCardProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 shadow-2xl"
      onClick={() => {
        setRevealed(true)
        onReveal()
      }}
    >
      {!revealed ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 backdrop-blur-sm" />
          <div className="relative z-10 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
            <p className="text-zinc-300 text-lg font-semibold">Scratch to Reveal!</p>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-center"
        >
          <Sparkles className="mx-auto h-16 w-16 text-yellow-400 mb-4 animate-pulse" />
          <p className="text-4xl font-bold text-white">₹{amount / 100}</p>
          <p className="text-zinc-200 mt-2">Congratulations!</p>
        </motion.div>
      )}
    </motion.div>
  )
}