import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CSS_PROPS, formatValue, matchingElements, resetEdit, useEdits, } from './editStore';
// Dev-only tab listing every element changed through DialKit, with its
// original (v0) value beside the current one. Entries appear after an edit.
export default function EditedPanel({ selected, onSelect }) {
    const edits = useEdits();
    return (_jsxs("aside", { className: "dev-edited", "aria-label": "Edited elements", children: [_jsxs("header", { children: [_jsx("strong", { children: "Edited" }), _jsx("span", { children: edits.length })] }), edits.length === 0 ? (_jsx("p", { className: "dev-edited-empty", children: "Pick an element and change a value. It will show up here." })) : (_jsx("ul", { children: edits.map((edit) => (_jsxs("li", { "data-active": edit.el === selected, children: [_jsxs("div", { className: "dev-edited-row", children: [_jsxs("button", { type: "button", className: "dev-edited-name", onClick: () => onSelect(edit.el), children: [edit.label, _jsxs("span", { className: "dev-edited-count", children: [" \u00D7", matchingElements(edit.selector).length] })] }), _jsx("button", { type: "button", className: "dev-edited-reset", onClick: () => resetEdit(edit.selector), children: "Reset to v0" })] }), _jsx("dl", { children: Object.keys(edit.changed).map((key) => (_jsxs("div", { children: [_jsx("dt", { children: CSS_PROPS[key] }), _jsxs("dd", { children: [_jsx("s", { children: formatValue(key, edit.v0[key]) }), " ", formatValue(key, edit.changed[key])] })] }, key))) })] }, edit.selector))) }))] }));
}
