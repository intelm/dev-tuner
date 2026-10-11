import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Outline from './Outline';
// Dev-only element picker: click selects, hover outlines, Esc clears.
// While mounted, clicks on the page select instead of activating the element.
const IGNORED = '.dialkit-root, .dev-toggles, .dev-edited, #__airship-root, .__airship-chrome-layer';
const ignored = (target) => !(target instanceof HTMLElement) || !!target.closest(IGNORED);
export function useElementPicker() {
    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);
    useEffect(() => {
        const onClick = (e) => {
            if (ignored(e.target))
                return;
            e.preventDefault();
            e.stopPropagation();
            setSelected(e.target);
        };
        const onMove = (e) => setHovered(ignored(e.target) ? null : e.target);
        const onKey = (e) => {
            if (e.key === 'Escape')
                setSelected(null);
        };
        window.addEventListener('click', onClick, true);
        window.addEventListener('pointermove', onMove, true);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('click', onClick, true);
            window.removeEventListener('pointermove', onMove, true);
            window.removeEventListener('keydown', onKey);
        };
    }, []);
    const outlines = (_jsxs(_Fragment, { children: [hovered && hovered !== selected && _jsx(Outline, { el: hovered, kind: "hover" }, `h`), selected && _jsx(Outline, { el: selected, kind: "selected" })] }));
    return { selected, select: setSelected, outlines };
}
