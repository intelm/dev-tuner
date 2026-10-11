import { useEffect, useRef, useState } from 'react'

const AIRSHIP_KEY = 'dev:airship-hidden'
const STOP_EVENTS = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick']

// Airship has no public API for its Edit/View switch, so press its button.
// Retries because the overlay mounts after the page loads. Returns a cancel fn.
function pressAirshipMode(label: 'Edit' | 'View') {
  let tries = 0
  const leaf = (root: ParentNode, text: string) =>
    [...root.querySelectorAll('#__airship-root *')].find(
      (el) => el.childElementCount === 0 && el.textContent?.trim() === text,
    )
  const timer = window.setInterval(() => {
    // The inspector has its own "Edit" tab; the mode switch is the Edit that
    // shares a container with View.
    let target: Element | undefined
    const view = leaf(document, 'View')
    for (let node = view?.parentElement; node && !target; node = node.parentElement) {
      target = leaf(node, label)
      if (node.id === '__airship-root') break
    }
    if (target) {
      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }))
      }
    }
    if (target || ++tries > 50) window.clearInterval(timer)
  }, 200)
  return () => window.clearInterval(timer)
}

type Props = {
  dials: boolean
  onDialsChange: (next: boolean) => void
}

// Dev-only buttons: show/hide the Airship editor and the DialKit panel.
// Airship's UI is injected by its proxy; hiding it is a CSS class on <html>.
export default function DevToggles({ dials, onDialsChange }: Props) {
  // Airship and Dials are mutually exclusive; ?dials wins over a stored "on".
  const [airshipHidden, setAirshipHidden] = useState(
    () => dials || localStorage.getItem(AIRSHIP_KEY) === '1',
  )

  const firstRun = useRef(true)
  const barRef = useRef<HTMLDivElement>(null)

  // A manual popover lives in the browser's top layer, above every z-index,
  // so the bar stays over Airship and DialKit.
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    bar.showPopover()
    return () => bar.hidePopover()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('airship-hidden', airshipHidden)
    // In Edit mode Airship swallows clicks on app elements even when hidden,
    // so park it in View mode while hidden. Skip the no-op on first load.
    if (!airshipHidden && firstRun.current) {
      firstRun.current = false
      return
    }
    firstRun.current = false
    return pressAirshipMode(airshipHidden ? 'View' : 'Edit')
  }, [airshipHidden])

  useEffect(() => {
    const setDials = (next: boolean) => {
      const url = new URL(window.location.href)
      if (next) url.searchParams.set('dials', '')
      else url.searchParams.delete('dials')
      window.history.replaceState(null, '', url)
      onDialsChange(next)
    }
    const setAirship = (hidden: boolean) => {
      localStorage.setItem(AIRSHIP_KEY, hidden ? '1' : '0')
      setAirshipHidden(hidden)
    }

    // Airship, in Edit mode, listens on document in the capture phase and
    // treats presses on app elements as selection. A window-level capture
    // listener runs first, so handle the toggles here and keep the events
    // away from Airship (and React).
    const inToggles = (e: Event) =>
      e.target instanceof Element && e.target.closest('.dev-toggles')
    const onClick = (e: MouseEvent) => {
      const button = e.target instanceof Element && e.target.closest('[data-toggle]')
      if (!button || !inToggles(e)) return
      e.stopPropagation()
      if (button.getAttribute('data-toggle') === 'airship') {
        // Turning Airship on turns Dials off, and vice versa.
        setAirship(!airshipHidden)
        if (airshipHidden) setDials(false)
      } else {
        setDials(!dials)
        if (!dials) setAirship(true)
      }
    }
    const swallow = (e: Event) => {
      if (inToggles(e)) e.stopPropagation()
    }

    window.addEventListener('click', onClick, true)
    for (const name of STOP_EVENTS) window.addEventListener(name, swallow, true)
    return () => {
      window.removeEventListener('click', onClick, true)
      for (const name of STOP_EVENTS) window.removeEventListener(name, swallow, true)
    }
  }, [dials, airshipHidden, onDialsChange])

  return (
    <div className="dev-toggles" popover="manual" ref={barRef}>
      <button type="button" data-toggle="airship" aria-pressed={!airshipHidden}>
        Airship {airshipHidden ? 'off' : 'on'}
      </button>
      <button type="button" data-toggle="dials" aria-pressed={dials}>
        Dials {dials ? 'on' : 'off'}
      </button>
    </div>
  )
}
