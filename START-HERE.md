# Start Here

If you only read one file before building, read this one.

This repo is a curated Vibe Jam starter pack:
- real starter projects
- shared Claude Code / agent skills at the repo root
- a bonus sprite workflow repo for visual pipeline ideas

If you want the full ecosystem beyond this pack, go to [vibegamedev.com](https://vibegamedev.com?utm_source=github&utm_medium=start-here&utm_campaign=vibejam-starter-pack).

---

## The important rule

Open the repo root in Claude Code or your agent tool of choice.

Why:
- the shared skills live in `.claude/skills/` and `.agents/skills/`
- if you only open a single subfolder, your agent may miss the unified skill set

---

## Fastest way to use this pack

### Option 1 — Jam fast
1. Pick one starter from `projects/`
2. Copy it into a brand new repo/folder for your jam entry
3. Keep this pack open separately as your reference + skills workspace

### Option 2 — Explore first
1. Read the root `README.md`
2. Open one project README
3. Browse the shared skills
4. Decide which lane matches your idea

---

## Which starter should you use?

### Use `projects/oakwoods/` if you want…
- a 2D platformer base
- Phaser + Vite + TypeScript
- movement, jump, attack, parallax

Local run:
```bash
npm install
npm run dev
```

Important: this project expects the Oak Woods art pack. Check `projects/oakwoods/README.md`.

---

### Use `projects/tinyswords/` if you want…
- a 2D tactics / strategy prototype
- layered tilemaps and stylized UI
- Tiny Swords asset workflow ideas

Local run:
- open `projects/tinyswords/public/index.html`
- or serve that folder locally

Best skills to pair with it:
- `phaser-gamedev`
- `tinyswords-tilemap`
- `playwright-testing`

---

### Use `projects/toonshooter/` if you want…
- a 3D action prototype
- Three.js scene composition
- GLTF-heavy workflow examples

Local run:
```bash
serve public
```
Then open `/toonshooter/`.

Best skill to pair with it:
- `threejs-builder`

---

### Use `projects/forest-census/` if you want…
- a tiny 3D mini-game starter
- static deployable Three.js structure
- a compact asset-manifest workflow

Local run:
```bash
serve public
```
Then open `/forest/`.

Best skill to pair with it:
- `threejs-builder`

---

### Use `bonus/vibe-isometric-sprites/` if you want…
- prompt ideas for isometric art pipelines
- a lightweight bonus workflow folder for art-direction inspiration
- the shared `fal-ai-image` skill at the repo root

This one is best treated as a reference folder, not your main gameplay starter.

---

## Shared skills in this pack

Both Claude and agent-compatible workflows get:
- `phaser-gamedev`
- `playwright-testing`
- `threejs-builder`
- `tinyswords-tilemap`
- `threejs-capacitor-ios`
- `fal-ai-image`

Important note:
- Pirate 3D iOS is not bundled as a project
- but the reusable Capacitor/iOS workflow skill is included for future builds

---

## Recommended first moves

### If your idea is 2D
Start with `oakwoods` for movement/action or `tinyswords` for tactics/UI.

### If your idea is 3D
Start with `toonshooter` if you want something action-oriented.
Start with `forest-census` if you want a smaller, cleaner base.

### If your idea depends on visual style
Browse `bonus/vibe-isometric-sprites/` for prompt/process inspiration.

---

## If you outgrow this pack

This starter pack is meant to help you get moving fast.

If you want more projects, more workflows, and the broader AI gamedev ecosystem around this work, go to:

**[vibegamedev.com](https://vibegamedev.com?utm_source=github&utm_medium=start-here&utm_campaign=vibejam-starter-pack-footer)**
