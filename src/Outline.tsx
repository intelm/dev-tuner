import { useEffect, useState } from 'react'

// Dev-only: a box that tracks an element's rect (follows scroll and layout).
export default function Outline({ el, kind }: { el: HTMLElement; kind: 'hover' | 'selected' | 'match' }) {
  const [rect, setRect] = useState(() => el.getBoundingClientRect())

  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const r = el.getBoundingClientRect()
      setRect((prev) =>
        prev.x === r.x && prev.y === r.y && prev.width === r.width && prev.height === r.height
          ? prev
          : r,
      )
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [el])

  return (
    <div
      className={`dev-outline dev-outline-${kind}`}
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
    />
  )
}
