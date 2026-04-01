# Anbabi

An atmospheric PDF reader. Claude reads the emotional content of each page and transforms the entire reading environment to match — background, particles, page styling, and ambient audio all shift together as the story changes.

---

## What it does

Every time you turn a page, Claude analyzes the text and assigns an atmosphere. That atmosphere drives everything at once:

- **Background** — full-screen gradient shifts to match the mood
- **Particles** — rain, falling leaves, embers, rose petals, dust, or glowing motes render *over* the text
- **Page filter** — the PDF page itself darkens, warms, inverts, or tints to match the world
- **Audio** — ambient sound (rain, wind, tension drone) built with the Web Audio API, no external files

| Atmosphere | Particles | Audio |
|---|---|---|
| Stormy | Rain streaking across the words | Rain |
| Autumn | Leaves tumbling through the lines | Wind |
| Suspense | None — inverted dark page, red flicker | Tension drone |
| Action | Embers rising from the bottom | Tension drone |
| Mysterious | Dust drifting upward | Silence |
| Romantic | Rose petals drifting down | Silence |
| Peaceful | Glowing motes floating up | Silence |
| Neutral | None | Silence |

---

## Prerequisites

- Node.js v18 or later
- An [Anthropic API key](https://console.anthropic.com/)

---

## Setup

```bash
# 1. Clone or download the repo
cd anbabi

# 2. Install dependencies
npm install

# 3. Add your API key
# Edit .env and replace the placeholder:
VITE_ANTHROPIC_API_KEY=your_key_here
```

---

## Run

```bash
npm run dev
```

Open `http://localhost:5173` in your browser, drop in any PDF, and start reading.

---

## How the API key works

The key never reaches the browser. `vite.config.js` runs a local proxy — requests from the app go to `/api/claude`, the proxy rewrites them to `https://api.anthropic.com/v1/messages` and injects the key as a server-side header. The browser only ever sees your own localhost.

---

## Project structure

```
src/
  App.jsx                    ← phase state (upload / reading), PDF.js loader
  main.jsx                   ← React 18 entry point
  atmospheres/
    definitions.js           ← all 8 atmosphere config objects
    particles.js             ← spawn + tick logic for all particle types
  audio/
    AudioEngine.js           ← Web Audio API engine (noise, drone, pulse)
  components/
    UploadScreen.jsx         ← drag-and-drop upload UI
    ParticleCanvas.jsx       ← canvas layer above the PDF, owns animation loop
    Reader.jsx               ← main reading screen, composes all layers
  hooks/
    useFlicker.js            ← thriller red-flicker effect
    useMoodAnalysis.js       ← Claude API call + vision fallback for image PDFs
```

---

## Notes

- **Image-based PDFs** (scanned books) are handled automatically — if fewer than 8 words are extracted from a page, the rendered canvas is sent to Claude as a JPEG instead.
- **Audio** starts muted. Click the sound button to enable it; the browser requires a user gesture before any audio can play.
- This is a fully client-side app. There is no backend, no database, no accounts.
