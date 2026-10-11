import { useSyncExternalStore } from 'react';
// CSS property each tuned value writes to.
export const CSS_PROPS = {
    fontSize: 'font-size',
    color: 'color',
    background: 'background-color',
    paddingBlock: 'padding-block',
    paddingInline: 'padding-inline',
    radius: 'border-radius',
    gap: 'gap',
    opacity: 'opacity',
};
export const formatValue = (key, v) => v === null ? '–' : key === 'color' || key === 'background' || key === 'opacity' ? String(v) : `${v}px`;
// Dev tooling UI that edits must never touch or count.
const DEV_UI = '.dialkit-root, .dev-toggles, .dev-edited, .dev-outline, #__airship-root';
export const matchingElements = (selector) => [...document.querySelectorAll(selector)].filter((el) => !el.closest(DEV_UI));
const listeners = new Set();
const edits = new Map();
const resets = new WeakMap();
let snapshot = [];
let sheet = null;
function emit() {
    snapshot = [...edits.values()];
    sheet ??= Object.assign(document.createElement('style'), { id: 'dev-edits' });
    if (!sheet.isConnected)
        document.head.append(sheet);
    // !important so a tuned value beats whatever specificity the page uses.
    sheet.textContent = snapshot
        .map((edit) => {
        const decls = Object.keys(edit.changed)
            .map((key) => `${CSS_PROPS[key]}: ${formatValue(key, edit.changed[key])} !important;`)
            .join(' ');
        const guard = DEV_UI.split(', ').map((s) => `${s} *`).join(', ');
        return `${edit.selector}:not(${guard}) { ${decls} }`;
    })
        .join('\n');
    listeners.forEach((l) => l());
}
// Record one changed value for a selector. v0 is captured on its first edit.
export function recordEdit(selector, label, el, v0, key, value) {
    let edit = edits.get(selector);
    if (!edit) {
        edit = { selector, label, el, v0, changed: {} };
        edits.set(selector, edit);
    }
    if (value === edit.v0[key])
        delete edit.changed[key];
    else
        edit.changed[key] = value;
    if (Object.keys(edit.changed).length === 0)
        edits.delete(selector);
    emit();
}
// Drop an edit's rule without touching the selected panel (used when the
// scope changes and the values move to another selector).
export function removeEdit(selector) {
    if (edits.delete(selector))
        emit();
}
// User-facing reset: restore v0 and remount the selected panel.
export function resetEdit(selector) {
    const edit = edits.get(selector);
    if (!edit)
        return;
    resets.set(edit.el, (resets.get(edit.el) ?? 0) + 1);
    removeEdit(selector);
}
// Bumps on reset so a selection panel remounts with the restored values.
export function resetCount(el) {
    return resets.get(el) ?? 0;
}
export function useEdits() {
    return useSyncExternalStore((listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, () => snapshot);
}
