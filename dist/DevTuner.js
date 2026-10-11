import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { DialRoot } from 'dialkit';
import ElementDials from './ElementDials';
import EditedPanel from './EditedPanel';
import { resetCount, useEdits } from './editStore';
import { useElementPicker } from './useElementPicker';
const ids = new WeakMap();
let nextId = 0;
const idOf = (el) => {
    if (!ids.has(el))
        ids.set(el, ++nextId);
    return ids.get(el);
};
// Dev-only: everything shown while Dials is on. Remove before merge.
export default function DevTuner() {
    const { selected, select, outlines } = useElementPicker();
    useEdits(); // re-render on reset so the selected panel remounts with fresh values
    return (_jsxs(_Fragment, { children: [_jsx(DialRoot, {}), selected && _jsx(ElementDials, { el: selected }, `${idOf(selected)}-${resetCount(selected)}`), _jsx(EditedPanel, { selected: selected, onSelect: select }), outlines] }));
}
