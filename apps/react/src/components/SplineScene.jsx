import { Suspense, lazy, Component } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

export function SplineScene({ scene, style }) {
  // If it's a my.spline.design viewer URL, embed via iframe (no publish needed)
  if (scene && scene.includes('my.spline.design')) {
    return (
      <iframe
        src={scene}
        title="Elma 3D"
        allowFullScreen
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
          ...style,
        }}
      />
    )
  }

  // Otherwise use the React Spline component with the .splinecode URL
  return (
    <SplineErrorBoundary>
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
    </SplineErrorBoundary>
  )
}
