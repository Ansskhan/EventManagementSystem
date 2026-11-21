import { useEffect, useRef, useState } from 'react'

export default function CountUp({ value, prefix = '', suffix = '', duration = 1500, className }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return undefined
    }
    if (typeof IntersectionObserver === 'undefined') {
      setStarted(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [value])

  useEffect(() => {
    if (!started) return undefined
    let frame = null
    const began = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - began) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      if (frame) cancelAnimationFrame(frame)
    }
  }, [started, value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
