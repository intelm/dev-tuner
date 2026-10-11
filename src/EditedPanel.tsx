import {
  CSS_PROPS,
  formatValue,
  matchingElements,
  resetEdit,
  useEdits,
  type StyleValues,
} from './editStore'

type Props = { selected: HTMLElement | null; onSelect: (el: HTMLElement) => void }

// Dev-only tab listing every element changed through DialKit, with its
// original (v0) value beside the current one. Entries appear after an edit.
export default function EditedPanel({ selected, onSelect }: Props) {
  const edits = useEdits()

  return (
    <aside className="dev-edited" aria-label="Edited elements">
      <header>
        <strong>Edited</strong>
        <span>{edits.length}</span>
      </header>
      {edits.length === 0 ? (
        <p className="dev-edited-empty">Pick an element and change a value. It will show up here.</p>
      ) : (
        <ul>
          {edits.map((edit) => (
            <li key={edit.selector} data-active={edit.el === selected}>
              <div className="dev-edited-row">
                <button type="button" className="dev-edited-name" onClick={() => onSelect(edit.el)}>
                  {edit.label}
                  <span className="dev-edited-count"> ×{matchingElements(edit.selector).length}</span>
                </button>
                <button type="button" className="dev-edited-reset" onClick={() => resetEdit(edit.selector)}>
                  Reset to v0
                </button>
              </div>
              <dl>
                {(Object.keys(edit.changed) as (keyof StyleValues)[]).map((key) => (
                  <div key={key}>
                    <dt>{CSS_PROPS[key]}</dt>
                    <dd>
                      <s>{formatValue(key, edit.v0[key])}</s> {formatValue(key, edit.changed[key] as never)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
