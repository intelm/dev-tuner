import { DialRoot } from 'dialkit'
import ElementDials from './ElementDials'
import EditedPanel from './EditedPanel'
import { resetCount, useEdits } from './editStore'
import { useElementPicker } from './useElementPicker'

const ids = new WeakMap<HTMLElement, number>()
let nextId = 0
const idOf = (el: HTMLElement) => {
  if (!ids.has(el)) ids.set(el, ++nextId)
  return ids.get(el)
}

// Dev-only: everything shown while Dials is on. Remove before merge.
export default function DevTuner() {
  const { selected, select, outlines } = useElementPicker()
  useEdits() // re-render on reset so the selected panel remounts with fresh values

  return (
    <>
      <DialRoot />
      {selected && <ElementDials key={`${idOf(selected)}-${resetCount(selected)}`} el={selected} />}
      <EditedPanel selected={selected} onSelect={select} />
      {outlines}
    </>
  )
}
