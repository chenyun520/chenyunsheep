'use client'

import { type ReactNode, useEffect, useRef } from 'react'

interface BreathingTextProps {
  children: ReactNode
  staggerDuration?: number
  fromFontVariationSettings?: string
  toFontVariationSettings?: string
  className?: string
}

export function BreathingText({
  children,
  staggerDuration = 0.08,
  fromFontVariationSettings = "'wght' 100, 'slnt' 0",
  toFontVariationSettings = "'wght' 800, 'slnt' -10",
  className = '',
}: BreathingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const text = container.textContent || ''
    container.textContent = ''

    // 创建每个字符的 span
    const chars = text.split('')
    chars.forEach((char, index) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.className = 'inline-block transition-all duration-700 ease-in-out'
      span.style.fontVariationSettings = fromFontVariationSettings
      span.style.animationDelay = `${index * staggerDuration}s`
      container.appendChild(span)

      // 呼吸动画
      setTimeout(() => {
        const breathe = () => {
          span.style.fontVariationSettings = toFontVariationSettings
          setTimeout(() => {
            span.style.fontVariationSettings = fromFontVariationSettings
            setTimeout(breathe, 2000 + Math.random() * 1000)
          }, 1500)
        }
        breathe()
      }, index * staggerDuration * 1000)
    })

    return () => {
      container.textContent = ''
    }
  }, [staggerDuration, fromFontVariationSettings, toFontVariationSettings])

  return (
    <div
      ref={containerRef}
      className={`breathing-text ${className}`}
      style={{
        fontVariationSettings: fromFontVariationSettings,
      }}
    >
      {children}
    </div>
  )
}
