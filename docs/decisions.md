# decisions.md

---

[DECISION] Vite proxy forwards /api/claude to https://api.anthropic.com/v1/messages
REASON: The Claude API does not support browser CORS. Proxy runs server-side in vite.config.js,
injects the API key header there so it never appears in the browser bundle.
The key is read via loadEnv() with an empty prefix so it is NOT bundled as VITE_* client code.
ALTERNATIVES: Dedicated backend proxy (out of MVP scope), Anthropic browser SDK if CORS is added.

[DECISION] loadEnv called with empty prefix ('') to read VITE_ANTHROPIC_API_KEY in vite.config.js
REASON: Vite only injects VITE_* vars into the client bundle when client code references
import.meta.env.VITE_*. Since no client code references the key, using VITE_ prefix is safe,
but loadEnv('', ...) ensures we can read it regardless of prefix.
ALTERNATIVES: Use ANTHROPIC_API_KEY (no VITE_ prefix) — equivalent safety, minor naming difference.

[DECISION] Upgraded Vite from 5.x to 6.2+ at project creation
REASON: Vite 5.x ships esbuild <= 0.24.2 which has a moderate dev-server vulnerability
(GHSA-67mh-4wv8-2f99). Vite 6.2.0 ships a patched esbuild. No breaking changes for this project.
ALTERNATIVES: Stay on Vite 5 and accept the dev-only risk (moderate, not critical).

[DECISION] CSS filter applied to PDF canvas element for page atmosphere styling
REASON: Re-rendering the PDF canvas per atmosphere would cause flicker and is expensive.
CSS filter is GPU-accelerated and transitions smoothly with transition: filter 2s ease.
ALTERNATIVES: Canvas composite operations, SVG overlay — both more complex with no benefit.

[DECISION] Particle canvas is a sibling element above the PDF canvas (zIndex 15 vs 10)
REASON: Particles must render over the text. A single stacking context achieved by positioning
both as absolute children of the reading container, with particle canvas at higher z-index.
ALTERNATIVES: Two canvases merged — loses the ability to apply CSS filter only to the PDF canvas.

[DECISION] useMoodAnalysis accepts onAtmosphere callback rather than owning atm state
REASON: The atmosphere state drives background, particles, and audio — it belongs in Reader.jsx
which orchestrates all three. The hook stays stateless about which atmosphere is active.
ALTERNATIVES: Hook owns atm state and exposes it — creates two sources of truth.

[DECISION] AudioEngine instantiated via useRef in Reader.jsx (not a singleton module)
REASON: If the user closes and reopens a PDF, Reader unmounts and remounts. A module singleton
would survive and its AudioContext could be in a stale state. Per-instance via useRef means
a fresh engine is created on each Reader mount, and disposed on unmount.
ALTERNATIVES: Module-level singleton with explicit reset — more complex cleanup.

[DECISION] Audio init() called only inside toggleAudio (user gesture), never on mount
REASON: Browsers require AudioContext creation to be triggered by a user gesture. Calling init()
on mount silently fails or throws in some browsers. The sound toggle button is the first gesture.
ALTERNATIVES: Lazy init on first play() call — same result but less explicit.

[DECISION] ParticleCanvas owns its requestAnimationFrame loop and resize handler
REASON: Particles are a self-contained visual layer. Keeping the loop inside ParticleCanvas
prevents Reader from needing refs or effects for animation — clean separation of concerns.
ALTERNATIVES: Loop in Reader with refs passed down — creates tight coupling.

[DECISION] busyRef flag in Reader.jsx prevents concurrent page renders
REASON: Rapid page navigation (arrow keys) could queue multiple pg.render() calls on the same
canvas, causing visual corruption. The ref (not state) avoids triggering re-renders.
ALTERNATIVES: Abort controller to cancel in-flight renders — more complex, similar outcome.

---

[COMPLETE] Phase 0 — Scaffold + modular extraction (Phases 0–5 of MVP build)
- Vite 6.2 + React 18 project scaffolded
- vite.config.js proxy: /api/claude → https://api.anthropic.com/v1/messages with key injection
- index.html standard Vite entry
- .env placeholder for VITE_ANTHROPIC_API_KEY
- src/atmospheres/definitions.js — all 8 ATMOSPHERES objects
- src/atmospheres/particles.js — spawnParticle, initParticles, tickParticles, PARTICLE_COUNTS
- src/hooks/useFlicker.js — thriller red flicker hook
- src/hooks/useMoodAnalysis.js — Claude API call via proxy, text + vision fallback
- src/audio/AudioEngine.js — noise, drone, pulse Web Audio engine
- src/components/ParticleCanvas.jsx — canvas above PDF, owns rAF loop + resize
- src/components/UploadScreen.jsx — drag/drop + file picker UI
- src/components/Reader.jsx — main reading screen, composes all layers
- src/App.jsx — phase state, PDF.js CDN loading
- src/main.jsx — React 18 root entry
- npm install clean (0 vulnerabilities)
