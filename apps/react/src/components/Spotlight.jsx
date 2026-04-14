import { useRef, useEffect } from 'react'

/**
 * Pure CSS/JS cursor spotlight — no framer-motion dependency.
 * Renders a radial glow that follows the mouse inside the hero section.
 */
export function Spotlight({ size = 500, color = 'rgba(186,146,255,0.18)' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const section = el.parentElement
    if (!section) return

    const onMove = (e) => {
      const { left, top } = section.getBoundingClientRect()
      el.style.opacity = '1'
      el.style.left = `${e.clientX - left - size / 2}px`
      el.style.top  = `${e.clientY - top  - size / 2}px`
    }
    const onLeave = () => { el.style.opacity = '0' }

    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseleave', onLeave)
    return () => {
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
    }
  }, [size])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        borderRadius: '50%',
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${color}, transparent 80%)`,
        filter: 'blur(60px)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        zIndex: 0,
        willChange: 'left, top',
      }}
    />
  )
}
