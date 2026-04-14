import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

/**
 * Interactive radial spotlight that follows the cursor inside its parent element.
 * Parent must have position: relative (set automatically).
 */
export function Spotlight({ size = 320, color = 'rgba(186,146,255,0.18)', style }) {
  const containerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parentElement, setParentElement] = useState(null)

  const mouseX = useSpring(0, { bounce: 0 })
  const mouseY = useSpring(0, { bounce: 0 })

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`)
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`)

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement
      if (parent) {
        parent.style.position = 'relative'
        parent.style.overflow = 'hidden'
        setParentElement(parent)
      }
    }
  }, [])

  const handleMouseMove = useCallback(
    (event) => {
      if (!parentElement) return
      const { left, top } = parentElement.getBoundingClientRect()
      mouseX.set(event.clientX - left)
      mouseY.set(event.clientY - top)
    },
    [mouseX, mouseY, parentElement]
  )

  useEffect(() => {
    if (!parentElement) return
    const onEnter = () => setIsHovered(true)
    const onLeave = () => setIsHovered(false)
    parentElement.addEventListener('mousemove', handleMouseMove)
    parentElement.addEventListener('mouseenter', onEnter)
    parentElement.addEventListener('mouseleave', onLeave)
    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove)
      parentElement.removeEventListener('mouseenter', onEnter)
      parentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [parentElement, handleMouseMove])

  return (
    <motion.div
      ref={containerRef}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        borderRadius: '50%',
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${color}, transparent 80%)`,
        filter: 'blur(40px)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
        left: spotlightLeft,
        top: spotlightTop,
        zIndex: 0,
        ...style,
      }}
    />
  )
}
