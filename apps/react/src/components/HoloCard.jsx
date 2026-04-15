import { useRef, useState } from 'react'

/**
 * HoloCard — drop-in wrapper that adds holographic tilt + glow to any card.
 * Usage:
 *   <HoloCard style={{ borderRadius: '20px', ... }}>
 *     {children}
 *   </HoloCard>
 */
export default function HoloCard({ children, style, ...rest }) {
  const ref = useRef(null)
  const [glow, setGlow] = useState({ x: '50%', y: '50%', on: false })

  const onMove = (e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const rotX = (y - r.height / 2) / 14
    const rotY = (r.width / 2 - x) / 14
    ref.current.style.transition = 'none'
    ref.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
    setGlow({ x: `${(x / r.width) * 100}%`, y: `${(y / r.height) * 100}%`, on: true })
  }

  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.transition = 'transform 0.35s ease'
    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    setGlow(g => ({ ...g, on: false }))
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
      {/* Holographic shimmer overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 'inherit',
          background: glow.on
            ? `radial-gradient(circle at ${glow.x} ${glow.y}, rgba(186,146,255,0.18) 0%, rgba(144,224,239,0.1) 40%, transparent 68%)`
            : 'transparent',
          pointerEvents: 'none',
          transition: 'background 0.15s ease',
          zIndex: 1,
        }}
      />
    </div>
  )
}
