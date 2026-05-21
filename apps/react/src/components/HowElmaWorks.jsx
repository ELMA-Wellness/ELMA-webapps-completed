import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import HoloCard from './HoloCard.jsx'
import { useLang } from '../contexts/LangContext.jsx'

// ── Journey step meta (icons, ids, status, energy, accent — language-neutral) ─
const JOURNEY_META = [
  { id: 1, icon: '🎯', relatedIds: [2],    status: 'completed',   energy: 100, accent: '#BA92FF', titleKey: 'how_step1_title', subKey: 'how_step1_sub', contentKey: 'how_step1_content' },
  { id: 2, icon: '📊', relatedIds: [1, 3], status: 'completed',   energy: 88,  accent: '#90E0EF', titleKey: 'how_step2_title', subKey: 'how_step2_sub', contentKey: 'how_step2_content' },
  { id: 3, icon: '🌸', relatedIds: [2, 4], status: 'completed',   energy: 82,  accent: '#FFBBD8', titleKey: 'how_step3_title', subKey: 'how_step3_sub', contentKey: 'how_step3_content' },
  { id: 4, icon: '📖', relatedIds: [3, 5], status: 'completed',   energy: 75,  accent: '#BA92FF', titleKey: 'how_step4_title', subKey: 'how_step4_sub', contentKey: 'how_step4_content' },
  { id: 5, icon: '🎮', relatedIds: [4, 6], status: 'completed',   energy: 78,  accent: '#90E0EF', titleKey: 'how_step5_title', subKey: 'how_step5_sub', contentKey: 'how_step5_content' },
  { id: 6, icon: '💜', relatedIds: [5, 7], status: 'completed',   energy: 92,  accent: '#FFBBD8', titleKey: 'how_step6_title', subKey: 'how_step6_sub', contentKey: 'how_step6_content' },
  { id: 7, icon: '🩺', relatedIds: [6],    status: 'in-progress', energy: 95,  accent: '#BA92FF', titleKey: 'how_step7_title', subKey: 'how_step7_sub', contentKey: 'how_step7_content' },
]

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const { t } = useLang()
  const map = {
    completed:   { labelKey: 'how_status_complete', bg: '#fff', color: '#000', border: '#fff' },
    'in-progress': { labelKey: 'how_status_progress', bg: 'rgba(255,255,255,0.12)', color: '#fff', border: 'rgba(255,255,255,0.4)' },
    pending:     { labelKey: 'how_status_pending',  bg: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.2)' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 999,
      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {t(s.labelKey)}
    </span>
  )
}

// ── Expanded info card ────────────────────────────────────────────────────────
function NodeCard({ item, allItems, onNavigate }) {
  const { t } = useLang()
  return (
    <HoloCard
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 56, left: '50%',
        transform: 'translateX(-50%)',
        width: 240,
        background: 'rgba(10,8,20,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(186,146,255,0.25)',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(186,146,255,0.1)',
        overflow: 'visible',
        zIndex: 300,
      }}
    >
      {/* connector line */}
      <div style={{
        position: 'absolute', top: -12, left: '50%',
        transform: 'translateX(-50%)',
        width: 1, height: 12,
        background: 'rgba(186,146,255,0.4)',
      }} />

      {/* header */}
      <div style={{ padding: '12px 14px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <StatusBadge status={item.status} />
          <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>
            {t('how_step_of')} {item.id} {t('how_of')} {allItems.length}
          </span>
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f2f8', lineHeight: 1.2 }}>
          {item.icon} {item.subtitle}
        </div>
      </div>

      {/* body */}
      <div style={{ padding: '0 14px 14px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 12px' }}>{item.content}</p>

        {/* energy bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.68rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 3 }}>
              ⚡ {t('how_impact')}
            </span>
            <span style={{ fontFamily: 'monospace', color: item.accent }}>{item.energy}%</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${item.energy}%`,
              background: `linear-gradient(90deg, ${item.accent}, #90E0EF)`,
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>

        {/* connected nodes */}
        {item.relatedIds.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              🔗 {t('how_connected')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {item.relatedIds.map(rid => {
                const rel = allItems.find(i => i.id === rid)
                return (
                  <button
                    key={rid}
                    onClick={e => { e.stopPropagation(); onNavigate(rid) }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 6,
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.7rem', cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  >
                    {rel?.icon} {rel?.title} →
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </HoloCard>
  )
}

// ── Single orbital node ───────────────────────────────────────────────────────
function OrbitalNode({ item, index, total, rotationAngle, isExpanded, isRelated, isPulsing, onToggle, allItems, onNavigate, radius }) {
  const angle  = ((index / total) * 360 + rotationAngle) % 360
  const rad    = (angle * Math.PI) / 180
  const x      = radius * Math.cos(rad)
  const y      = radius * Math.sin(rad)
  const zIdx   = Math.round(100 + 50 * Math.cos(rad))
  const opacity = isExpanded ? 1 : Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(rad)) / 2)))

  return (
    <div
      onClick={e => { e.stopPropagation(); onToggle(item.id) }}
      style={{
        position: 'absolute',
        transform: `translate(${x}px, ${y}px)`,
        zIndex: isExpanded ? 250 : zIdx,
        opacity,
        transition: 'transform 0.07s linear, opacity 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* glow halo */}
      <div style={{
        position: 'absolute',
        width: item.energy * 0.4 + 36,
        height: item.energy * 0.4 + 36,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${item.accent}33 0%, transparent 70%)`,
        left: -(item.energy * 0.4 + 36 - 40) / 2 - 2,
        top:  -(item.energy * 0.4 + 36 - 40) / 2 - 2,
        animation: isPulsing ? 'orbital-pulse 1s ease-in-out infinite' : undefined,
      }} />

      {/* node circle */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', lineHeight: 1,
        background: isExpanded
          ? `linear-gradient(135deg, ${item.accent}, #90E0EF)`
          : isRelated
          ? 'rgba(255,255,255,0.18)'
          : 'rgba(10,8,20,0.9)',
        border: `2px solid ${isExpanded ? item.accent : isRelated ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}`,
        boxShadow: isExpanded
          ? `0 0 20px ${item.accent}66, 0 0 40px ${item.accent}33`
          : isRelated
          ? '0 0 12px rgba(255,255,255,0.2)'
          : 'none',
        transition: 'all 0.3s ease',
        transform: isExpanded ? 'scale(1.45)' : 'scale(1)',
      }}>
        {item.icon}
      </div>

      {/* label */}
      <div style={{
        position: 'absolute',
        top: 46,
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: isExpanded ? item.accent : 'rgba(255,255,255,0.6)',
        textShadow: isExpanded ? `0 0 10px ${item.accent}88` : 'none',
        transition: 'all 0.3s ease',
      }}>
        {item.title}
      </div>

      {/* expanded card */}
      {isExpanded && (
        <NodeCard item={item} allItems={allItems} onNavigate={onNavigate} />
      )}
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────
export function HowElmaWorks() {
  const { t } = useLang()

  // Build translated journey array
  const JOURNEY = JOURNEY_META.map(m => ({
    ...m,
    title:    t(m.titleKey),
    subtitle: t(m.subKey),
    content:  t(m.contentKey),
  }))

  const [expandedId, setExpandedId]   = useState(null)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [autoRotate, setAutoRotate]   = useState(true)
  const [pulseIds, setPulseIds]       = useState({})
  const [isMobile, setIsMobile]       = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const radius = isMobile ? 130 : 190

  useEffect(() => {
    if (!autoRotate) return
    timerRef.current = setInterval(() => {
      setRotationAngle(prev => Number(((prev + 0.3) % 360).toFixed(3)))
    }, 50)
    return () => clearInterval(timerRef.current)
  }, [autoRotate])

  const handleToggle = useCallback((id) => {
    if (expandedId === id) {
      setExpandedId(null)
      setAutoRotate(true)
      setPulseIds({})
    } else {
      setExpandedId(id)
      setAutoRotate(false)
      const item = JOURNEY.find(i => i.id === id)
      const pulse = {}
      item?.relatedIds.forEach(rid => { pulse[rid] = true })
      setPulseIds(pulse)
    }
  }, [expandedId])

  const handleNavigate = useCallback((id) => {
    handleToggle(id)
  }, [handleToggle])

  const handleContainerClick = () => {
    setExpandedId(null)
    setAutoRotate(true)
    setPulseIds({})
  }

  const ease = [0.22, 1, 0.36, 1]

  return (
    <section className="how-elma-section" id="how-it-works">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="section-label">{t('how_label')}</span>
          <h2>{t('how_heading')}</h2>
          <p>{t('how_sub')}</p>
        </motion.div>
      </div>

      {/* hint text */}
      <p className="orbital-hint">{t('how_hint')}</p>

      {/* orbital stage */}
      <motion.div
        className="orbital-stage"
        onClick={handleContainerClick}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease }}
      >
        {/* orbit ring */}
        <div className="orbit-ring" />

        {/* center orb */}
        <div className="orbit-center-orb">
          <div className="orbit-ping-1" />
          <div className="orbit-ping-2" />
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
          }} />
        </div>

        {/* nodes */}
        {JOURNEY.map((item, idx) => (
          <OrbitalNode
            key={item.id}
            item={item}
            index={idx}
            total={JOURNEY.length}
            rotationAngle={rotationAngle}
            isExpanded={expandedId === item.id}
            isRelated={
              expandedId !== null &&
              expandedId !== item.id &&
              JOURNEY.find(i => i.id === expandedId)?.relatedIds.includes(item.id)
            }
            isPulsing={!!pulseIds[item.id]}
            onToggle={handleToggle}
            allItems={JOURNEY}
            onNavigate={handleNavigate}
            radius={radius}
          />
        ))}
      </motion.div>

      {/* step legend — mobile fallback and desktop label row */}
      <div className="orbital-legend">
        {JOURNEY.map((item, idx) => (
          <motion.button
            key={item.id}
            className={`legend-step${expandedId === item.id ? ' active' : ''}`}
            onClick={() => handleToggle(item.id)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * idx, duration: 0.5, ease }}
            style={{ '--accent': item.accent }}
          >
            <span className="legend-icon">{item.icon}</span>
            <span className="legend-title">{item.title}</span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
