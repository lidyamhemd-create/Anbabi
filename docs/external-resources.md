# external-resources.md

All external dependencies, CDN links, and API references used in this project.

---

## PDF Rendering

**PDF.js** (Mozilla)
- Library: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`
- Worker:  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
- Docs: https://mozilla.github.io/pdf.js/
- Usage: Loaded dynamically via script tag in App.jsx on mount. Worker URL set via
  `window.pdfjsLib.GlobalWorkerOptions.workerSrc`.

---

## LLM / Mood Analysis

**Claude API** (Anthropic)
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-sonnet-4-6`
- Auth header: `x-api-key` (injected by Vite proxy — never sent from browser)
- Required header: `anthropic-version: 2023-06-01`
- Docs: https://docs.anthropic.com/en/api/messages
- Usage: Called via Vite proxy at `/api/claude`. Sends page text (or base64 image for
  sparse pages). Returns JSON `{atmosphere, reason}`.

---

## Fonts

**Google Fonts — Cormorant Garamond**
- Import: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap')`
- Loaded via inline `<style>` in UploadScreen.jsx and Reader.jsx.
- Weights used: 300 (light), 400 (regular), italic variants of both.

---

## Build Tooling (npm / local)

| Package | Version | Purpose |
|---|---|---|
| vite | ^6.2.0 | Dev server, build tool, proxy config |
| @vitejs/plugin-react | ^4.3.1 | React JSX transform for Vite |
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | React DOM renderer |

---

## Browser APIs (no external dependency)

- **Web Audio API** — `AudioContext`, `createGain`, `createBiquadFilter`, `createBufferSource`,
  `createOscillator`. Used in AudioEngine.js for rain, wind, and tension audio.
- **HTML5 Canvas 2D** — `getContext('2d')`, used for both PDF rendering (PDF.js) and
  particle animation (ParticleCanvas.jsx).
- **requestAnimationFrame** — particle animation loop in ParticleCanvas.jsx.
- **File API** — `file.arrayBuffer()` for reading dropped/selected PDF files.
