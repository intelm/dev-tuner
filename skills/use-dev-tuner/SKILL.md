---
name: use-dev-tuner
description: Add dev-tuner (Airship + DialKit dev toolbar) to a React/Vite project and get it running. Use when the user wants to set up dev-tuner, Airship, or DialKit tuning in a project, tune styles live on a page, or start the Airship editor.
---

# Use dev-tuner in a project

dev-tuner is a dev-only toolbar for React apps. It toggles two tools, one on at a time:
**Airship** (visual editor, a proxy in front of the dev server) and **Dials** (DialKit:
click an element, tune its styles, scoped to a class, with an Edited tab showing v0 and reset).
Source: `/Users/intel/AI-Lab/mhmdlsyd/dev-tuner` (README has the full reference).

## 1. Check the project fits

- Needs React 18/19 and Vite. If it's another bundler, say so and stop. For non-React pages, the package doesn't apply.
- Find the dev command and port in `package.json` / `vite.config.*`.
- Airship needs Node 22.13+. Run `node -v`. If older, look for a newer one (`nvm ls`) and use it only for the Airship command.

## 2. Install

Use the local checkout unless the user has pushed it to a git remote (then use `github:<owner>/dev-tuner`):

```bash
npm i /Users/intel/AI-Lab/mhmdlsyd/dev-tuner dialkit motion
```

Skip `dialkit` and `motion` if already present. If the checkout's `dist/` is missing, run `npm run build` in it first.

## 3. Vite config

A linked package brings its own copy of React and DialKit, which breaks hooks and splits DialKit's store. Add (merge, don't overwrite) to `vite.config.*`:

```ts
resolve: { dedupe: ['react', 'react-dom', 'dialkit', 'motion'] },
```

## 4. Mount the component

In the root component (usually `src/App.tsx`), once:

```tsx
import { DevTools } from 'dev-tuner'
// ...
<DevTools enabled={import.meta.env.DEV} />
```

Optional: if the project's `Claude.md`/`CLAUDE.md` has no note on it, suggest adding
"dev-tuner/DialKit = dev tuning only. Before merge: bake values, remove `<DevTools />` and `useDialKit`."

## 5. Run

Airship runs on its own port in front of the dev server. Pick two free ports (dev server `N`, Airship `N+3` is fine):

```bash
npm run dev -- --port 5170 --strictPort
npx @airshiplabs/cli --target 5170 --port 5173 --mode inline
```

Open the Airship port. `?dials` in the URL starts with Dials on. Tell the user:
- Airship runs **unsandboxed** (can write anywhere, reach the network). Offer `--safe` if they want it confined.
- Don't start it without the user's OK if the project isn't theirs; it downloads `@airshiplabs/cli` via npx.

## 6. Verify

Use the browser tools: load the Airship port with `?dials`, confirm the "Airship / Dials" buttons (bottom-right) and the Edited panel (top-left) render, click an element, and confirm a "Selected · …" panel with a Scope dropdown appears. Check the console for errors (a "Invalid hook call" means step 3 was missed).

## Notes

- Edits are live CSS-rule previews, never source changes. DialKit's Copy button copies values.
- Dials on: page clicks select elements instead of activating them. Airship off switches Airship to View mode so the page stays clickable.
- Don't commit unless asked. Before shipping: remove `<DevTools />` and any `useDialKit` calls.
- If Airship was updated and the toggle stops switching modes, the fix is in `src/DevToggles.tsx` in the dev-tuner repo (it presses Airship's Edit/View buttons).
