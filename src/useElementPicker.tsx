import { useEffect, useState } from 'react'
import Outline from './Outline'

// Dev-only element picker: click selects, hover outlines, Esc clears.
// While mounted, clicks on the page select instead of activating the element.

const IGNORED =
  '.dialkit-root, .dev-toggles, .dev-edited, #__airship-root, .__airship-chrome-layer'

const ignored = (target: EventTarget | null) =>
  !(target instanceof HTMLElement) || !!target.closest(IGNORED)

export function useElementPicker() {
  const [selected, setSelected] = useState<HTMLElement | null>(null)
  const [hovered, setHovered] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ignored(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      setSelected(e.target as HTMLElement)
    }
    const onMove = (e: PointerEvent) => setHovered(ignored(e.target) ? null : (e.target as HTMLElement))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('click', onClick, true)
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const outlines = (
    <>
      {hovered && hovered !== selected && <Outline key={`h`} el={hovered} kind="hover" />}
      {selected && <Outline el={selected} kind="selected" />}
    </>
  )

  return { selected, select: setSelected, outlines }
}
