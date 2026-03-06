'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React, { useCallback, useEffect, useState } from 'react'

interface TextRotateProps {
  texts: string[]
  mainClassName?: string
  staggerFrom?: 'first' | 'last'
  initial?: { y: number | string }
  animate?: { y: number }
  exit?: { y: number | string }
  staggerDuration?: number
  splitLevelClassName?: string
  transition?: {
    type: string
    damping: number
    stiffness: number
  }
  rotationInterval?: number
}

export function TextRotate({
  texts,
  mainClassName,
  staggerFrom = 'first',
  initial = { y: '100%' },
  animate = { y: 0 },
  exit = { y: '-120%' },
  staggerDuration = 0.025,
  splitLevelClassName,
  transition = { type: 'spring', damping: 30, stiffness: 400 },
  rotationInterval = 2000,
}: TextRotateProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [texts.length, rotationInterval])

  const splitText = useCallback((text: string) => {
    return text.split('')
  }, [])

  return (
    <div className={mainClassName}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          {splitText(texts[index]).map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              initial={initial}
              animate={animate}
              exit={exit}
              transition={{
                ...transition,
                delay: staggerFrom === 'first'
                  ? i * staggerDuration
                  : (splitText(texts[index]).length - i - 1) * staggerDuration,
              }}
              className={splitLevelClassName}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
