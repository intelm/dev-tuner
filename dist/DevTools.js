import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import DevToggles from './DevToggles';
import DevTuner from './DevTuner';
import './dev-tuner.css';
// Dev-only toolbar for Airship (visual editor) and DialKit (live tuning).
// Only one is on at a time. `?dials` in the URL starts with DialKit on.
export default function DevTools({ enabled = true }) {
    const [dials, setDials] = useState(() => new URLSearchParams(window.location.search).has('dials'));
    if (!enabled)
        return null;
    return (_jsxs(_Fragment, { children: [dials && _jsx(DevTuner, {}), _jsx(DevToggles, { dials: dials, onDialsChange: setDials })] }));
}
