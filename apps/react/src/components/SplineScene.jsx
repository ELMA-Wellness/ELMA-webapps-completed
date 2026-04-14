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
    if (this.state.failed) return null   // silently hide on error
    return this.props.children
  }
}

export function SplineScene({ scene, style }) {
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
