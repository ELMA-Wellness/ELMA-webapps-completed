import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

/**
 * Lazy-loaded Spline 3D scene wrapper.
 * Replace the `scene` URL with your own Spline scene to show Elma.
 */
export function SplineScene({ scene, style }) {
  return (
    <Suspense
      fallback={
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="spline-loader" />
        </div>
      }
    >
      <Spline scene={scene} style={{ width: '100%', height: '100%', ...style }} />
    </Suspense>
  )
}
