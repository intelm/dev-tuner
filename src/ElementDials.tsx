import { useEffect, useMemo, useRef, useState } from 'react'
import { useDialKit } from 'dialkit'
import { CSS_PROPS, matchingElements, recordEdit, removeEdit, type StyleValues } from './editStore'
import Outline from './Outline'

// Dev-only: a DialKit panel for one picked element. Edits are CSS rules on the
// chosen scope (this element, its classes, one class, or its tag), so similar
// elements stay consistent. Live preview only; nothing touches source files.

let canvas: CanvasRenderingContext2D | null = null

// Any CSS color -> #rrggbb (the browser normalises it through a canvas).
function toHex(css: string): string {
  canvas ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!canvas) return '#000000'
  canvas.clearRect(0, 0, 1, 1)
  canvas.fillStyle = '#000'
  canvas.fillStyle = css
  canvas.fillRect(0, 0, 1, 1)
  const [r, g, b] = canvas.getImageData(0, 0, 1, 1).data
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

function isTransparent(css: string): boolean {
  return css === 'transparent' || /rgba?\(.*[, /]\s*0\)$/.test(css)
}

const px = (value: string) => Math.round(parseFloat(value) || 0)
const range = (value: number, max: number): [number, number, number, number] => [
  value,
  0,
  Math.max(max, value * 2),
  1,
]

function readValues(el: HTMLElement): StyleValues {
  const cs = getComputedStyle(el)
  const layout = cs.display.includes('flex') || cs.display.includes('grid')
  return {
    fontSize: px(cs.fontSize),
    color: toHex(cs.color),
    background: isTransparent(cs.backgroundColor) ? null : toHex(cs.backgroundColor),
    paddingBlock: px(cs.paddingTop),
    paddingInline: px(cs.paddingLeft),
    radius: px(cs.borderTopLeftRadius),
    gap: layout ? px(cs.rowGap) : null,
    opacity: Number(cs.opacity),
  }
}

type Scope = { value: string; label: string; name: string; selector: string }

let nextId = 0

// Scopes an edit can target, with how many elements each one reaches.
function buildScopes(el: HTMLElement): Scope[] {
  const count = (selector: string) => matchingElements(selector).length
  const classes = [...el.classList].filter((c) => !c.startsWith('dev-'))
  const tag = el.tagName.toLowerCase()
  const selectors = new Set<string>()
  if (classes.length > 1) selectors.add(classes.map((c) => `.${CSS.escape(c)}`).join(''))
  for (const c of classes) selectors.add(`.${CSS.escape(c)}`)
  selectors.add(tag)

  if (!el.dataset.devId) el.dataset.devId = String(++nextId)
  const own = `[data-dev-id="${el.dataset.devId}"]`

  const shared = [...selectors].map((selector) => ({
    value: selector,
    label: `${selector} (${count(selector)})`,
    name: selector,
    selector,
  }))
  const self: Scope = { value: own, label: 'This element', name: `${tag} · this element`, selector: own }
  // Classes first (consistency across similar elements); a classless element
  // defaults to itself.
  return classes.length ? [...shared, self] : [self, ...shared]
}

export default function ElementDials({ el }: { el: HTMLElement }) {
  const [initial] = useState(() => readValues(el))
  const [scopes] = useState(() => buildScopes(el))
  const [config] = useState(() => ({
    scope: {
      type: 'select' as const,
      options: scopes.map(({ value, label }) => ({ value, label })),
      default: scopes[0].value,
    },
    fontSize: range(initial.fontSize, 64),
    color: initial.color,
    ...(initial.background ? { background: initial.background } : {}),
    paddingBlock: range(initial.paddingBlock, 48),
    paddingInline: range(initial.paddingInline, 48),
    radius: range(initial.radius, 48),
    ...(initial.gap === null ? {} : { gap: range(initial.gap, 48) }),
    opacity: [initial.opacity, 0, 1, 0.05] as [number, number, number, number],
  }))

  const values = useDialKit(`Selected · ${el.tagName.toLowerCase()}`, config) as unknown as
    StyleValues & { scope: string }
  const scope = scopes.find((s) => s.value === values.scope) ?? scopes[0]
  const applied = useRef<{ selector: string; keys: Set<keyof StyleValues> }>({
    selector: scope.selector,
    keys: new Set(),
  })

  // Write only values that moved, so selecting an element never adds rules.
  // Changing the scope moves the edits to the new selector.
  useEffect(() => {
    if (applied.current.selector !== scope.selector) {
      removeEdit(applied.current.selector)
      applied.current = { selector: scope.selector, keys: new Set() }
    }
    for (const key of Object.keys(CSS_PROPS) as (keyof StyleValues)[]) {
      const value = values[key]
      if (value == null) continue
      const moved = value !== initial[key]
      if (!moved && !applied.current.keys.has(key)) continue
      if (moved) applied.current.keys.add(key)
      else applied.current.keys.delete(key)
      recordEdit(scope.selector, scope.name, el, initial, key, value as never)
    }
  }, [values, scope, el, initial])

  // Outline the other elements this scope reaches.
  const matches = useMemo(
    () => matchingElements(scope.selector).filter((m) => m !== el),
    [scope, el],
  )

  return (
    <>
      {matches.map((m, i) => (
        <Outline key={i} el={m} kind="match" />
      ))}
    </>
  )
}
