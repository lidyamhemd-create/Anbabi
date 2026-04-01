# CLAUDE.md — Anbabi Development Protocol

Read this file fully before doing anything. Return to it whenever you are uncertain.

---

## WHAT IS ANBABI

Anbabi is an atmospheric PDF reader. It reads the emotional content of each book page and transforms the entire reading environment to match — visuals, particles, page styling, and ambient audio all shift together as the story changes.

The core feeling: the book is *alive*. The reader is *inside* the story.

---

## THE FULL VISION

### Atmosphere system
Each page is analyzed by Claude and assigned an atmosphere. The atmosphere drives everything:
- Background gradient and color palette
- Particle effects layered ON TOP of the text
- CSS filter applied to the page itself (darkness, tint, inversion)
- Ambient audio (rain, wind, tension drone, etc.)

**Atmospheres include (but are not limited to):**
- Stormy — dark blue, rain streaking across the words, thunder audio
- Autumn — warm amber tint, leaves tumbling over and through the text, wind audio
- Thriller/Suspense — inverted dark page, red flicker, tension drone
- Mysterious — dark purple, floating dust particles drifting upward
- Romantic — rose tint, petals drifting through the lines
- Action — dim orange, embers rising from the bottom
- Peaceful — cool teal motes floating gently upward
- Tropical — bright and lush; snakes wind through lines, butterflies and worms loop through words
- Neutral — default reading state, no effects

### The page is part of the world
The white PDF page must NOT look like a floating rectangle dropped on top of a background. It must feel like it belongs to the atmosphere:
- Dark themes: page background darkens, text lightens so it stays readable
- Warm themes: page gets a warm tint
- Dramatic themes: page may invert (white becomes black, black becomes white)
- The page filter transitions smoothly (2–3 seconds) when the atmosphere changes

### Particles are ON the text
Particles render above the PDF canvas — they pass over and through the words. The text is read through the weather, not in front of it.

### Audio is optional but immersive
Every atmosphere has a matching ambient audio profile built with the Web Audio API (no external audio files):
- Rain: filtered noise
- Wind: low-frequency noise sweeps
- Tension: slow drone with subtle pulse
- Silence: nothing (peaceful, romantic, mysterious, neutral)
Audio is toggled by the user and fades in/out smoothly.

---

## PROTOTYPE REFERENCE

A working prototype already exists: `prototype.jsx` in the project root.

This prototype has already solved several hard problems. Do not rewrite these from scratch — understand them and carry them into the proper architecture:
- PDF.js CDN loading and page rendering
- Per-page text extraction with word count check
- Vision fallback (base64 canvas image sent to Claude when text is sparse)
- Particle spawn/tick system for: rain, leaves, dust, motes, embers, petals
- Web Audio API engine (noise, drone, pulse)
- CSS filter system applied per atmosphere
- Particle canvas z-index above PDF canvas
- Concurrent render prevention via `busy` ref flag
- JSON fence stripping before parsing Claude's response

The job is to **restructure** this prototype into the proper file architecture below. Do not copy-paste it as one blob. Extract, modularize, and improve.

---

## MVP SCOPE

Build only this. Nothing else.

**In scope:**
- PDF upload (drag and drop + file picker)
- PDF rendering page by page using PDF.js
- Per-page LLM mood analysis via Claude API
  - Text extraction first; vision fallback if < 8 words extracted
- Atmosphere system: background gradient, page filter, particles, audio
- Smooth transitions between atmospheres (2–3 seconds)
- Page navigation (prev/next buttons + arrow keys)
- Sound toggle button
- Mood label in top bar with short reason phrase

**Out of scope — do not build yet:**
- User accounts or authentication
- Bookmarks or saved reading progress
- Library or book management
- Mobile app (web only)
- Custom atmosphere editor
- Social or sharing features
- Supabase or any backend/database
- New particle types beyond what the prototype has (tropical is future scope)

---

## TECH STACK

- **Framework:** React (Vite)
- **PDF rendering:** PDF.js via CDN — `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`
- **Worker:** `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
- **LLM:** Claude API — `https://api.anthropic.com/v1/messages`, model `claude-sonnet-4-6`
- **Audio:** Web Audio API only — no external audio files
- **Particles:** HTML5 Canvas with `requestAnimationFrame`
- **Styling:** Inline styles (no external UI libraries, no Tailwind)
- **Fonts:** Google Fonts — Cormorant Garamond
- **No backend for MVP** — fully client-side

---

## PROJECT STRUCTURE

```
/anbabi
  /src
    /components
      UploadScreen.jsx      ← drag and drop upload UI
      Reader.jsx            ← main reading screen, composes everything
      ParticleCanvas.jsx    ← canvas layer that sits above the PDF
    /atmospheres
      definitions.js        ← all atmosphere config objects
      particles.js          ← spawnParticle + tick functions per type
    /hooks
      useFlicker.js         ← thriller red flicker effect
      useMoodAnalysis.js    ← Claude API call, text + vision fallback
    /audio
      AudioEngine.js        ← Web Audio API class (noise, drone, pulse)
    App.jsx
    main.jsx
  /docs
    decisions.md            ← every significant decision + reasoning + progress log
    external-resources.md   ← all CDN links, API docs, and external references
  prototype.jsx             ← original working prototype (reference only, do not modify)
  CLAUDE.md                 ← this file
  index.html
  vite.config.js
  package.json
```

---

## DOCUMENTATION RULES

You maintain two files in `/docs`. Both are required.

### `decisions.md`
Log every non-obvious decision with reasoning, AND completed progress after each phase.

Decision format:
```
[DECISION] Used CSS filter on PDF canvas instead of re-rendering
REASON: Re-rendering causes flicker and is expensive. CSS filter is GPU-accelerated and transitions smoothly.
ALTERNATIVES: Canvas composite operations, SVG overlay
```

Progress format:
```
[COMPLETE] Phase 2 — PDF rendering
- PDF.js loads from CDN on mount
- Pages render to canvas at correct scale
- Prev/next and arrow key navigation working
```

### `external-resources.md`
Every external dependency, CDN link, or API reference used in the project. Before using any external resource, add it here. If you need documentation for something external, list it here and ask the user before proceeding.

---

## MANDATORY WORKFLOW

Follow this exact sequence for every task. Do not skip or combine steps.

### Phase 0 — Orient
Before starting any task:
- Re-read the relevant section of `CLAUDE.md`
- Check `decisions.md` to see what is already done and what decisions were made
- Check `prototype.jsx` if the task overlaps with something already solved there

### Phase 1 — Understand
- Restate the task in your own words
- List what you know and what is unclear
- Ask clarifying questions before proceeding
- Do not assume. Ambiguity is a blocker, not a reason to guess.

### Phase 2 — Plan
- Break the task into the smallest logical steps
- Name every file you will create or modify
- Define the expected output of each step

### Phase 3 — Pseudocode
- Write the logic in plain language before writing any code
- For complex functions, describe the data flow explicitly
- Identify edge cases and state how you will handle them

### Phase 4 — Validate
- Review the plan for gaps or wrong assumptions
- Flag any risks
- Confirm with the user before moving to implementation

### Phase 5 — Implement
- Write clean, modular code
- One component or function at a time
- Split any file that exceeds ~150 lines

### Phase 6 — Verify
- Confirm the implementation does exactly what was planned
- Test the edge cases identified in Phase 3
- Check that nothing regressed

### Phase 7 — Document
- Update `decisions.md` with decisions made and progress completed
- Update `external-resources.md` if anything new was added

### PAUSE RULE
After each phase: stop, show output, and wait for explicit user confirmation before continuing.
Never chain phases without a pause. The user must approve before the next phase begins.

---

## ATMOSPHERE OBJECT FORMAT

All atmospheres live in `/src/atmospheres/definitions.js` and follow this exact shape:

```js
{
  gradient:   string,  // CSS radial-gradient for the full-screen background
  pageFilter: string,  // CSS filter applied to the PDF canvas element
  particles:  string,  // "rain" | "leaves" | "dust" | "motes" | "embers" | "petals" | "none"
  audio:      string,  // "rain" | "wind" | "tension" | "silence"
  label:      string,  // display string e.g. "⛈ Stormy"
  accent:     string,  // hex — used for UI highlights and the mood pill
  glow:       string,  // rgba — ambient color wash overlay
  border:     string,  // rgba — UI border color
}
```

New atmospheres are added to `definitions.js` only. No atmosphere logic lives in components.

---

## PARTICLE SYSTEM RULES

- `spawnParticle(type, w, h, init)` creates one particle. `init=true` scatters across full canvas on load; `init=false` spawns at entry edge.
- Each particle type has its own tick logic inside a master `tickParticles(type, particles, ctx, w, h, dt, t)` function.
- Particle canvas is `position: absolute`, covers full viewport, `pointerEvents: none`, z-index above the PDF canvas.
- When atmosphere changes, reinitialize the particle array for the new type.
- Animation loop uses `requestAnimationFrame` only. Never `setInterval`.
- Particle counts per type are defined in a constants object in `particles.js`.

---

## WHAT NOT TO DO

- Do NOT write all code in one file — split by responsibility
- Do NOT skip pseudocode and jump straight to implementation
- Do NOT assume unclear requirements — ask
- Do NOT use npm packages for particles or audio — these are hand-built
- Do NOT use `localStorage` or `sessionStorage`
- Do NOT add features outside MVP scope without asking first
- Do NOT proceed to the next phase without user confirmation
- Do NOT use `setInterval` for animation
- Do NOT render particles behind the PDF canvas — they must be above it
- Do NOT let the PDF page look like a white rectangle floating over the background — it must integrate into the atmosphere via CSS filter
- Do NOT use the wrong model string — correct model is `claude-sonnet-4-6`
- Do NOT hardcode API keys — use environment variables

---

## KNOWN ISSUES (already solved in prototype — do not reintroduce)

1. **Sparse PDF text** — some PDFs yield very few extractable words. Always check word count. If < 8 words, fall back to sending the rendered canvas as base64 to Claude (vision mode).
2. **Wrong model string** — an incorrect model string causes silent API failure. Always use `claude-sonnet-4-6`.
3. **Particle z-index** — particle canvas must sit above the PDF canvas in the stacking order.
4. **Claude JSON fences** — Claude sometimes wraps JSON in markdown code fences. Always strip ` ```json ` and ` ``` ` before `JSON.parse()`.
5. **Canvas resize** — on window resize, both canvases must resize and particles must reinitialize.
6. **Concurrent renders** — use a `busy` ref flag so a new page render cannot start before the previous one finishes.

---

## DEFINITION OF DONE (MVP)

The MVP is complete when all of the following are true:

- [ ] User can drag and drop any PDF onto the upload screen
- [ ] Each page renders correctly at readable size
- [ ] Claude analyzes each page and assigns an atmosphere
- [ ] Background, page filter, particles, and audio all match the atmosphere
- [ ] Particles render ON TOP of the text (above the PDF canvas)
- [ ] The PDF page itself changes appearance per mood (dark = dark page, warm = warm tint)
- [ ] Atmosphere transitions are smooth (2–3 seconds)
- [ ] Page navigation works via buttons and arrow keys
- [ ] Sound toggles on/off with smooth fade
- [ ] Vision fallback works for image-based PDFs
- [ ] Code is split across the file structure defined above (no monolith)
- [ ] `/docs/decisions.md` and `/docs/external-resources.md` are complete and current
