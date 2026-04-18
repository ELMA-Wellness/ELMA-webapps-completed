import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'

// ── Debounced dimensions hook (inline) ──────────────────────────────────────
function useDimensions(ref) {
  const [dims, setDims] = useState({ width: 0, height: 0 })

  useEffect(() => {
    let timeout
    const update = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect()
        setDims({ width, height })
      }
    }
    const debounced = () => {
      clearTimeout(timeout)
      timeout = setTimeout(update, 250)
    }
    update()
    window.addEventListener('resize', debounced)
    return () => {
      window.removeEventListener('resize', debounced)
      clearTimeout(timeout)
    }
  }, [ref])

  return dims
}

// ── Pixel dot ────────────────────────────────────────────────────────────────
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
      style={{ width: size, height: size, background: color }}
      initial={{ opacity: 0 }}
      animate={controls}
    />
  )
}

// ── Pixel trail ──────────────────────────────────────────────────────────────
export function PixelTrail({
  pixelSize = 28,
  fadeDuration = 600,
  delay = 400,
  pixelColor = 'rgba(186,146,255,0.9)',
}) {
  const containerRef = useRef(null)
  const dims = useDimensions(containerRef)
  const trailId = useRef(uuidv4())

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)
    const el = document.getElementById(`${trailId.current}-px-${x}-${y}`)
    if (el && el.__animatePixel) el.__animatePixel()
  }, [pixelSize])

  const cols = useMemo(() => Math.ceil(dims.width  / pixelSize), [dims.width,  pixelSize])
  const rows = useMemo(() => Math.ceil(dims.height / pixelSize), [dims.height, pixelSize])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 0,
      }}
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
  )
}
