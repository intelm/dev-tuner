# dev-tuner

Dev-only toolbar for React apps. Two tools, one on at a time:

- **Airship** (visual editor, runs as a proxy in front of your dev server).
- **Dials** (DialKit): click any element to tune its styles live.

Dials details:
- A **Scope** dropdown picks what an edit applies to: the element's class combo, one class, the tag, or just that element. Match counts are shown and the other matches are highlighted, so similar elements stay consistent.
- An **Edited** tab lists every change with its original (**v0**) value next to the current one, and a **Reset to v0** button.
- Edits are CSS rules in an injected stylesheet. Live preview only; nothing touches your source files. Use DialKit's Copy button to carry values over.

## Install

```bash
# from a local checkout while developing
npm i ../dev-tuner           # or: npm link dev-tuner
# from GitHub (tarball; `github:` git installs fail on npm 11.19)
npm i https://codeload.github.com/intelm/dev-tuner/tar.gz/refs/heads/main
npm i dialkit motion         # peer dependencies, if the app doesn't have them
```

## Use

```tsx
import { DevTools } from 'dev-tuner'

export default function App() {
  return (
    <>
      {/* your app */}
      <DevTools enabled={import.meta.env.DEV} />
    </>
  )
}
```

`?dials` in the URL starts with Dials on. Remove `<DevTools />` and any `useDialKit` calls before shipping.

### Vite: dedupe React and DialKit

When installed from a local path, the package gets its own copy of React and DialKit, which breaks hooks and splits DialKit's store. Add to `vite.config.ts`:

```ts
export default defineConfig({
  resolve: { dedupe: ['react', 'react-dom', 'dialkit', 'motion'] },
})
```

## Run with Airship

Airship needs Node 22.13+ and runs as a proxy on its own port. Run your dev server on one port and Airship in front of it on the port you open:

```bash
npm run dev -- --port 5170 --strictPort
npx @airshiplabs/cli --target 5170 --port 5173 --mode inline
```

Open `http://localhost:5173`. Airship's inline mode keeps `?dials` working on the same URL.

## Theming

Defaults are built in. Override on `:root` if you want:

| Variable | Default |
| --- | --- |
| `--dt-accent` | `#aa3bff` |
| `--dt-border` | `#e5e4e7` |
| `--dt-font` | `system-ui, sans-serif` |
| `--dt-shadow` | soft drop shadow |

## Claude Code skill

`skills/use-dev-tuner/` is a Claude Code skill that sets this up in a project (install, Vite dedupe, mount, run, verify). Install it for all projects by linking it:

```bash
ln -s "$(pwd)/skills/use-dev-tuner" ~/.claude/skills/use-dev-tuner
```

Then ask Claude to "use dev-tuner in this project".

## Notes

- Airship has no public API for its Edit/View switch or selection. dev-tuner presses its Edit and View buttons and finds its UI by `#__airship-root`. An Airship update that changes that markup may need a fix in `src/DevToggles.tsx`.
- While Airship is in Edit mode it captures clicks on the page, so turning it off switches it to View mode.
- React only.

## Develop

`dist/` is committed so git installs need no build step. Run `npm run build` and commit `dist/` after changing `src/`.

```bash
npm run dev     # tsc --watch into dist/
npm run build
```
