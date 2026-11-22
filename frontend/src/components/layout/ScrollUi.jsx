import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'

// The reading progress bar belongs to the public site pages only. Dashboard,
// auth and status pages keep the back-to-top button but not the progress bar.
const PROGRESS_ROUTES = [
  '/',
  '/events',
  '/exhibitors',
  '/schedule',
  '/floor-plan',
  '/about',
  '/contact',
]

function showsProgress(pathname) {
  return PROGRESS_ROUTES.some(
    (route) => pathname === route || (route !== '/' && pathname.startsWith(`${route}/`)),
  )
}

export default function ScrollUi() {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  const complete = progress >= 0.995
  const withProgress = showsProgress(pathname)

  function backToTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <>
      {withProgress && (
        <div className="scroll-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}
      <button
        type="button"
        className={`back-to-top${progress > 0.04 ? ' is-visible' : ''}${complete ? ' is-complete' : ''}`}
        aria-label="Back to top"
        title="Back to top"
        onClick={backToTop}
      >
        <ArrowUp size={18} />
      </button>
    </>
  )
}
