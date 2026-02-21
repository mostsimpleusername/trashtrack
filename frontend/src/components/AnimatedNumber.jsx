import { useState, useEffect, useRef } from 'react'

export function AnimatedNumber({ value, decimals = 1 }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const start = prev.current; const end = value; prev.current = value
    if (start === end) return
    const dur = 600; const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1)
      setDisplay(start + (end - start) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  const int = Math.floor(display) === display
  return <span>{int ? display.toFixed(0) : display.toFixed(decimals)}</span>
}
