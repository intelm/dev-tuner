import { useState } from 'react'
import DevToggles from './DevToggles'
import DevTuner from './DevTuner'
import './dev-tuner.css'

export type DevToolsProps = {
  /** Render nothing when false. Pass `import.meta.env.DEV` to keep it out of production. */
  enabled?: boolean
}

// Dev-only toolbar for Airship (visual editor) and DialKit (live tuning).
// Only one is on at a time. `?dials` in the URL starts with DialKit on.
export default function DevTools({ enabled = true }: DevToolsProps) {
  const [dials, setDials] = useState(() =>
    new URLSearchParams(window.location.search).has('dials'),
  )

  if (!enabled) return null
  return (
    <>
      {dials && <DevTuner />}
      <DevToggles dials={dials} onDialsChange={setDials} />
    </>
  )
}
