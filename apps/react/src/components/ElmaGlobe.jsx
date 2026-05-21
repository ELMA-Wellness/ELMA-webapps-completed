import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// ELMA brand palette for the globe
const ELMA_PURPLE = 'rgba(186,146,255,'
const ELMA_CYAN   = 'rgba(144,224,239,'
const ELMA_PINK   = 'rgba(255,187,216,'

export function ElmaGlobe({ size = 420 }) {
  const canvasRef  = useRef(null)
  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr    = window.devicePixelRatio || 1
    const radius = size / 2 - 8

    canvas.width        = size * dpr
    canvas.height       = size * dpr
    canvas.style.width  = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([cx, cy])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(ctx)

    // ── Point-in-polygon helpers ──────────────────────────────
    const ptInRing = (pt, ring) => {
      let inside = false
      const [x, y] = pt
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i], [xj, yj] = ring[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
          inside = !inside
      }
      return inside
    }

    const ptInFeature = (pt, feature) => {
      const { type, coordinates } = feature.geometry
      if (type === 'Polygon') {
        if (!ptInRing(pt, coordinates[0])) return false
        for (let i = 1; i < coordinates.length; i++)
          if (ptInRing(pt, coordinates[i])) return false
        return true
      }
      if (type === 'MultiPolygon') {
        for (const poly of coordinates) {
          if (ptInRing(pt, poly[0])) {
            let hole = false
            for (let i = 1; i < poly.length; i++)
              if (ptInRing(pt, poly[i])) { hole = true; break }
            if (!hole) return true
          }
        }
      }
      return false
    }

    const buildDots = (feature, step = 1.1) => {
      const dots = []
      const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature)
      for (let lng = minLng; lng <= maxLng; lng += step)
        for (let lat = minLat; lat <= maxLat; lat += step)
          if (ptInFeature([lng, lat], feature)) dots.push([lng, lat])
      return dots
    }

    let landFeatures = null
    const allDots = []   // [{lng, lat}]

    // ── Render loop ───────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, size, size)

      const sc = projection.scale()
      const sf = sc / radius

      // Outer glow
      const grd = ctx.createRadialGradient(cx, cy, sc * 0.85, cx, cy, sc * 1.1)
      grd.addColorStop(0, `${ELMA_PURPLE}0.08)`)
      grd.addColorStop(1, `${ELMA_PURPLE}0)`)
      ctx.beginPath()
      ctx.arc(cx, cy, sc * 1.1, 0, 2 * Math.PI)
      ctx.fillStyle = grd
      ctx.fill()

      // Sphere fill
      ctx.beginPath()
      ctx.arc(cx, cy, sc, 0, 2 * Math.PI)
      ctx.fillStyle = '#07050f'
      ctx.fill()

      // Sphere edge
      ctx.beginPath()
      ctx.arc(cx, cy, sc, 0, 2 * Math.PI)
      ctx.strokeStyle = `${ELMA_PURPLE}0.35)`
      ctx.lineWidth = 1.5 * sf
      ctx.stroke()

      if (!landFeatures) return

      // Graticule — faint cyan lines
      const grat = d3.geoGraticule()
      ctx.beginPath()
      path(grat())
      ctx.strokeStyle = `${ELMA_CYAN}0.1)`
      ctx.lineWidth = 0.6 * sf
      ctx.globalAlpha = 1
      ctx.stroke()

      // Land outlines — purple
      ctx.beginPath()
      landFeatures.features.forEach(f => path(f))
      ctx.strokeStyle = `${ELMA_PURPLE}0.28)`
      ctx.lineWidth = 0.8 * sf
      ctx.stroke()

      // Dot fill on land — pink/purple mix
      allDots.forEach(([lng, lat]) => {
        const proj = projection([lng, lat])
        if (!proj) return
        const [px, py] = proj
        if (px < 0 || px > size || py < 0 || py > size) return

        // Vary dot color gently between purple and cyan based on latitude
        const t = (lat + 90) / 180       // 0..1 south→north
        const alpha = 0.55 + t * 0.25
        const useColor = t < 0.5
          ? `${ELMA_PURPLE}${alpha.toFixed(2)})`
          : `${ELMA_CYAN}${(alpha * 0.85).toFixed(2)})`

        ctx.beginPath()
        ctx.arc(px, py, 1.1 * sf, 0, 2 * Math.PI)
        ctx.fillStyle = useColor
        ctx.fill()
      })
    }

    // ── Load GeoJSON ──────────────────────────────────────────
    const load = async () => {
      try {
        const res = await fetch(
          'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json'
        )
        if (!res.ok) throw new Error('geo fetch failed')
        landFeatures = await res.json()

        landFeatures.features.forEach(f => {
          buildDots(f, 1.1).forEach(d => allDots.push(d))
        })

        render()
        setLoading(false)
      } catch {
        setErrored(true)
        setLoading(false)
      }
    }

    // ── Rotation ──────────────────────────────────────────────
    const rot = [0, -20]   // start slightly north
    let auto = true

    const timer = d3.timer(() => {
      if (auto) {
        rot[0] += 0.25
        projection.rotate(rot)
        render()
      }
    })

    // Drag to rotate
    const onDown = (e) => {
      auto = false
      const sx = e.clientX, sy = e.clientY
      const sr = [...rot]

      const onMove = (me) => {
        rot[0] = sr[0] + (me.clientX - sx) * 0.5
        rot[1] = Math.max(-70, Math.min(70, sr[1] - (me.clientY - sy) * 0.4))
        projection.rotate(rot)
        render()
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        setTimeout(() => { auto = true }, 30)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }

    // Touch drag
    const onTouch = (e) => {
      if (e.touches.length !== 1) return
      auto = false
      const sx = e.touches[0].clientX
      const sy = e.touches[0].clientY
      const sr = [...rot]

      const onTMove = (te) => {
        if (!te.touches[0]) return
        rot[0] = sr[0] + (te.touches[0].clientX - sx) * 0.5
        rot[1] = Math.max(-70, Math.min(70, sr[1] - (te.touches[0].clientY - sy) * 0.4))
        projection.rotate(rot)
        render()
      }
      const onTEnd = () => {
        canvas.removeEventListener('touchmove', onTMove)
        canvas.removeEventListener('touchend', onTEnd)
        setTimeout(() => { auto = true }, 30)
      }
      canvas.addEventListener('touchmove', onTMove, { passive: true })
      canvas.addEventListener('touchend', onTEnd)
    }

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('touchstart', onTouch, { passive: true })

    load()

    return () => {
      timer.stop()
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('touchstart', onTouch)
    }
  }, [size])

  if (errored) return null   // fail silently — section still looks fine

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Purple outer glow ring */}
      <div style={{
        position: 'absolute',
        inset: -24,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(186,146,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: '50%',
          cursor: 'grab',
          display: 'block',
          boxShadow: '0 0 60px rgba(186,146,255,0.2), 0 0 120px rgba(186,146,255,0.08)',
        }}
      />
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          background: '#07050f',
          color: 'rgba(186,146,255,0.5)',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}>
          Loading world…
        </div>
      )}
      <p style={{
        position: 'absolute', bottom: -28, left: 0, right: 0,
        textAlign: 'center',
        fontSize: '0.68rem',
        color: 'rgba(186,146,255,0.35)',
        letterSpacing: '0.04em',
        pointerEvents: 'none',
      }}>
        drag to explore
      </p>
    </div>
  )
}
