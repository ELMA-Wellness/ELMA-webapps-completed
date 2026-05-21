import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { GooeyFilter } from './GooeyFilter.jsx'

// ── Single pixel dot ─────────────────────────────────────────────────────────
const PixelDot = ({ id, size, fadeDuration, delay, color }) => {
  const controls = useAnimationControls()

  const animatePixel = useCallback(() => {
    controls.start({
      opacity: [1, 0],
      transition: { duration: fadeDuration / 1000, delay: delay / 1000 },
    })
  }, [controls, fadeDuration, delay])

  const ref = useCallback((node) => {
    if (node) node.__animatePixel = animatePixel
  }, [animatePixel])

  return (
    <motion.div
      id={id}
      ref={ref}
      style={{ width: size, height: size, background: color, flexShrink: 0 }}
      initial={{ opacity: 0 }}
      animate={controls}
    />
  )
}

// ── Global pixel trail — fixed, full-page, pointer-events: none ───────────────
export function GlobalPixelTrail({
  pixelSize   = 28,
  fadeDuration = 650,
  delay        = 300,
  pixelColor   = 'rgba(186,146,255,0.82)',
}) {
  const trailId = useRef(uuidv4())
  const [dims, setDims] = useState({ width: 0, height: 0 })

  // Update dimensions on resize
  useEffect(() => {
    const update = () => setDims({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Listen to document-level mousemove so it fires everywhere on the page
  useEffect(() => {
    const onMove = (e) => {
      const x = Math.floor(e.clientX / pixelSize)
      const y = Math.floor(e.clientY / pixelSize)
      const el = document.getElementById(`${trailId.current}-px-${x}-${y}`)
      if (el?.__animatePixel) el.__animatePixel()
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [pixelSize])

  const cols = useMemo(() => Math.ceil(dims.width  / pixelSize), [dims.width,  pixelSize])
  const rows = useMemo(() => Math.ceil(dims.height / pixelSize), [dims.height, pixelSize])

  if (!dims.width) return <GooeyFilter id="global-goo" strength={5} />

  return (
    <>
      <GooeyFilter id="global-goo" strength={5} />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9990,
          pointerEvents: 'none',   // never blocks clicks
          filter: 'url(#global-goo)',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} style={{ display: 'flex' }}>
            {Array.from({ length: cols }).map((_, col) => (
              <PixelDot
                key={`${col}-${row}`}
                id={`${trailId.current}-px-${col}-${row}`}
                size={pixelSize}
                fadeDuration={fadeDuration}
                delay={delay}
                color={pixelColor}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
