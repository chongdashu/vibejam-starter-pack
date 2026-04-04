# Vibe Jam Starter Pack

> A curated bundle of real AI-assisted game starter repos + unified Claude Code / agent skills to help you ship something playable fast.

<a href="https://vibegamedev.com?utm_source=github&utm_medium=readme&utm_campaign=vibejam-starter-pack">
  <img src="assets/vgd.png" width="720" alt="VibeGameDev.com — AI game dev resources" />
</a>

> Want more game-dev-first AI workflows, starter projects, and build resources? → [vibegamedev.com](https://vibegamedev.com?utm_source=github&utm_medium=readme&utm_campaign=vibejam-starter-pack)

---

## What this pack gives you

- 4 standalone game starter projects
- 1 bonus isometric sprite workflow repo
- 6 battle-tested agent skills for game development — works with Codex, Claude Code, and Cursor
- beginner-friendly full tutorial videos for both 2D and 3D workflows

This pack is designed for builders who want to move quickly during a jam without starting from a blank folder.

If you want the broader ecosystem of projects, writeups, workflows, and whatever I’m building next, go to [vibegamedev.com](https://vibegamedev.com?utm_source=github&utm_medium=readme&utm_campaign=vibejam-starter-pack-mid).

---

## Start here

1. Download this repo or ZIP it.
2. Open the repo root in Claude Code or your agent tool of choice.
3. Read [START-HERE.md](START-HERE.md).
4. Pick one lane:
   - 2D Phaser
   - 3D Three.js
   - bonus asset workflow
5. Copy a starter into a new working repo if you want a clean jam project.

Important: open the repo root, not just a single project folder, if you want the shared skills to be visible to your agent.

---

## Pick your lane

| Lane | Folder | Best for | Run locally |
|---|---|---|---|
| 2D platformer | `projects/oakwoods/` | movement, combat, parallax, Phaser + Vite | `npm install && npm run dev` |
| 2D tactics prototype | `projects/tinyswords/` | tilemaps, layered UI, turn-based ideas | serve/open `public/index.html` |
| 3D arena shooter | `projects/toonshooter/` | Three.js scene building, GLTF workflows, action prototypes | `serve public` then open `/toonshooter/` |
| 3D mini-game | `projects/forest-census/` | compact Three.js game loops, asset manifests, static deploy flow | `serve public` then open `/forest/` |
| Bonus sprite workflow | `bonus/vibe-isometric-sprites/` | isometric sprite prompting + fal.ai image workflow ideas | browse the prompts + shared skill |

Notes:
- `oakwoods` requires the external Oak Woods art pack. See that project’s README for asset setup.
- Pirate 3D iOS is intentionally not included as a project in this pack.
- The reusable `threejs-capacitor-ios` skill is included at the root for builders who want the iOS export workflow.

## Beginner-friendly videos

- 3D — Here's How I Use Agent Skills 3D Game Dev (Full Tutorial)
  - https://youtu.be/ak0QkJjwK9U
- 2D — Vibe Coding 2D Games with Agent Skills (Full Tutorial)
  - https://youtu.be/QPZCMd5REP8

---

## Preview gallery

<table>
  <tr>
    <td align="center" width="50%">
      <a href="projects/oakwoods/README.md"><img src="projects/oakwoods/docs/preview.gif" alt="Oak Woods preview" width="100%" /></a><br />
      <strong>Oak Woods</strong><br />
      Phaser platformer starter
    </td>
    <td align="center" width="50%">
      <a href="projects/tinyswords/README.md"><img src="projects/tinyswords/docs/preview.gif" alt="Tinyswords preview" width="100%" /></a><br />
      <strong>Tinyswords</strong><br />
      Tactical 2D prototype
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <a href="projects/toonshooter/README.md"><img src="projects/toonshooter/public/toonshooter/design-markedup.jpeg" alt="Toonshooter preview" width="100%" /></a><br />
      <strong>Toonshooter</strong><br />
      Three.js shooter sandbox
    </td>
    <td align="center" width="50%">
      <a href="projects/forest-census/README.md"><img src="projects/forest-census/public/forest/design.png" alt="Forest Census preview" width="100%" /></a><br />
      <strong>Forest Census</strong><br />
      Tiny 3D counting game
    </td>
  </tr>
</table>

---

## Unified skills included

This pack dedupes the most reusable skills into one shared root.

### Claude Code
- `.claude/skills/phaser-gamedev/`
- `.claude/skills/playwright-testing/`
- `.claude/skills/threejs-builder/`
- `.claude/skills/tinyswords-tilemap/`
- `.claude/skills/threejs-capacitor-ios/`
- `.claude/skills/fal-ai-image/`

### Agent-compatible
- `.agents/skills/phaser-gamedev/`
- `.agents/skills/playwright-testing/`
- `.agents/skills/threejs-builder/`
- `.agents/skills/tinyswords-tilemap/`
- `.agents/skills/threejs-capacitor-ios/`
- `.agents/skills/fal-ai-image/`

Why this matters:
- no duplicated skill folders hidden inside every project
- one place to update the shared workflows
- easier to browse what your agent can actually use
- cleaner zip for a lead magnet or jam download

---

## Repo layout

```text
vibejam-starter-pack/
├─ README.md
├─ START-HERE.md
├─ assets/
│  └─ vgd.png
├─ .claude/
│  └─ skills/
├─ .agents/
│  └─ skills/
├─ projects/
│  ├─ oakwoods/
│  ├─ tinyswords/
│  ├─ toonshooter/
│  └─ forest-census/
└─ bonus/
   └─ vibe-isometric-sprites/
```

Each project folder is kept standalone on purpose.

That means you can:
- inspect the original project structure
- copy one starter out into its own repo
- keep the shared agent skills at the root

---

## Why this pack is useful during a jam

Most jam packs are either:
- too abstract to be useful, or
- too messy to trust under time pressure.

This one is built around real repos that already proved useful publicly.

You get examples for:
- 2D Phaser architecture
- Three.js static game deployment
- GLTF asset pipelines
- Playwright/canvas testing patterns
- Tiny Swords tilemap layering
- iOS export workflow skills for Three.js + Capacitor
- prompt/process inspiration from the isometric sprite bonus repo
- a reusable fal.ai image-generation skill for sprite workflow experimentation

---

## This pack vs full VibeGameDev

| | This starter pack | [VibeGameDev.com](https://vibegamedev.com?utm_source=github&utm_medium=readme&utm_campaign=vibejam-starter-pack-comparison) |
|---|---|---|
| Curated jam-ready starter repos | ✅ | ✅ |
| Unified Claude/agent skills | ✅ | ✅ |
| Bonus sprite workflow repo | ✅ | ✅ |
| One downloadable repo/zip | ✅ | ✅ |
| Broader library of AI gamedev resources | — | ✅ |
| More builds, workflows, and future resources | — | ✅ |
| Best place to see the full ecosystem | — | ✅ |

> 👉 Want the bigger picture beyond this free pack? Visit [vibegamedev.com](https://vibegamedev.com?utm_source=github&utm_medium=readme&utm_campaign=vibejam-starter-pack-cta).

---

## Credits + notes

- Each included project keeps its own README, credits, and implementation details.
- Some projects rely on third-party assets or specific static hosting assumptions.
- Use the original project READMEs for project-specific setup.
- Use [START-HERE.md](START-HERE.md) if you want the fastest route into the pack.

### Asset attribution

- `projects/oakwoods/`
  - Oak Woods asset pack by [brullov](https://brullov.itch.io/oak-woods)
- `projects/tinyswords/`
  - Tiny Swords asset pack by [Pixel Frog](https://pixelfrog-assets.itch.io/tiny-swords)
- `projects/toonshooter/`
  - Includes low-poly 3D game assets associated with [Quaternius](https://quaternius.com/)
- `projects/forest-census/`
  - Includes low-poly 3D game assets associated with [Quaternius](https://quaternius.com/)

If you reuse any starter commercially or redistribute assets separately, check the original pack pages and license terms yourself first.

If this pack helps you ship something fun, I’d love to see it.

And if you want more: [vibegamedev.com](https://vibegamedev.com?utm_source=github&utm_medium=readme&utm_campaign=vibejam-starter-pack-footer)
