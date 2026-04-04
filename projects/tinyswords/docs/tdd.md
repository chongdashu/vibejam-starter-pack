# Castle Clash Duel - Technical Design Document

## 1. Overview

This document translates the Game Design Document (PRD) into concrete Phaser 3 implementation specifications using the Tiny Swords asset pack.

### Tech Stack
- **Engine**: Phaser 3.70.0 (via CDN)
- **Physics**: Arcade Physics (top-down, no gravity)
- **Delivery**: Single HTML file with inline CSS/JS
- **Assets**: Tiny Swords asset pack (`/assets/tinyswords/`)

### Architecture Summary
```
┌─────────────────────────────────────────────────────────────┐
│                        Game Config                          │
│  960×540 canvas | Arcade Physics | Scale.FIT letterbox      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  BootScene   │────▶│  MenuScene   │────▶│  GameScene   │
│  (preload)   │     │  (title/UI)  │     │  (gameplay)  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                     ┌────────────────────────────┼────────┐
                     ▼                            ▼        ▼
              ┌────────────┐              ┌────────────┐ ┌────────────┐
              │ UIScene    │              │PauseScene  │ │GameOverScene│
              │ (HUD layer)│              │ (overlay)  │ └────────────┘
              └────────────┘              └────────────┘
```

---

## 2. Phaser Configuration

```javascript
const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game-container',
  backgroundColor: '#7FAE5E',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // Top-down, no gravity
      debug: false
    }
  },

  scene: [BootScene, MenuScene, GameScene, UIScene, PauseScene, GameOverScene],

  input: {
    activePointers: 2  // Support multi-touch for mobile
  }
};
```

---

## 3. Scene Specifications

### 3.1 BootScene

**Purpose**: Load all assets, display progress bar.

**Lifecycle**:
```
preload() → Load all assets with progress tracking
create()  → Transition to MenuScene
```

**Asset Loading Manifest**:

| Category | Asset Key | Path | Config |
|----------|-----------|------|--------|
| **Terrain** | `tilemap-color1` | `Terrain/Tileset/Tilemap_color1.png` | 576×384, 9×6 tiles |
| **Terrain** | `water-bg` | `Terrain/Tileset/Water Background color.png` | 64×64 |
| **Terrain** | `shadow` | `Terrain/Tileset/Shadow.png` | 192×192 |
| **Castle** | `castle-blue` | `Buildings/Blue Buildings/Castle.png` | 320×256 |
| **Castle** | `castle-red` | `Buildings/Red Buildings/Castle.png` | 320×256 |
| **Unit** | `warrior-blue-idle` | `Units/Blue Units/Warrior/Warrior_Idle.png` | spritesheet: 192×192, 8 frames |
| **Unit** | `warrior-blue-run` | `Units/Blue Units/Warrior/Warrior_Run.png` | spritesheet: 192×192, 6 frames |
| **Unit** | `warrior-blue-attack` | `Units/Blue Units/Warrior/Warrior_Attack1.png` | spritesheet: 192×192, 4 frames |
| **Unit** | `warrior-red-idle` | `Units/Red Units/Warrior/Warrior_Idle.png` | spritesheet: 192×192, 8 frames |
| **Unit** | `warrior-red-run` | `Units/Red Units/Warrior/Warrior_Run.png` | spritesheet: 192×192, 6 frames |
| **Unit** | `warrior-red-attack` | `Units/Red Units/Warrior/Warrior_Attack1.png` | spritesheet: 192×192, 4 frames |
| **Unit** | `archer-blue-idle` | `Units/Blue Units/Archer/Archer_Idle.png` | spritesheet: 192×192, 6 frames |
| **Unit** | `archer-blue-run` | `Units/Blue Units/Archer/Archer_Run.png` | spritesheet: 192×192, 4 frames |
| **Unit** | `archer-blue-shoot` | `Units/Blue Units/Archer/Archer_Shoot.png` | spritesheet: 192×192, 8 frames |
| **Unit** | `archer-red-idle` | `Units/Red Units/Archer/Archer_Idle.png` | spritesheet: 192×192, 6 frames |
| **Unit** | `archer-red-run` | `Units/Red Units/Archer/Archer_Run.png` | spritesheet: 192×192, 4 frames |
| **Unit** | `archer-red-shoot` | `Units/Red Units/Archer/Archer_Shoot.png` | spritesheet: 192×192, 8 frames |
| **Projectile** | `arrow-blue` | `Units/Blue Units/Archer/Arrow.png` | 64×64 |
| **Projectile** | `arrow-red` | `Units/Red Units/Archer/Arrow.png` | 64×64 |
| **Particle** | `dust-01` | `Particle FX/Dust_01.png` | spritesheet: 64×64, 8 frames |
| **Particle** | `dust-02` | `Particle FX/Dust_02.png` | spritesheet: 64×64, 10 frames |
| **Particle** | `explosion-01` | `Particle FX/Explosion_01.png` | spritesheet: 192×192, 8 frames |
| **UI** | `cursor-01` | `UI Elements/UI Elements/Cursors/Cursor_01.png` | 64×64 |
| **UI** | `btn-blue-small` | `UI Elements/UI Elements/Buttons/SmallBlueSquareButton_Regular.png` | 128×128 |
| **UI** | `btn-blue-small-pressed` | `UI Elements/UI Elements/Buttons/SmallBlueSquareButton_Pressed.png` | 128×128 |
| **UI** | `bar-big-base` | `UI Elements/UI Elements/Bars/BigBar_Base.png` | 320×64 |
| **UI** | `bar-big-fill` | `UI Elements/UI Elements/Bars/BigBar_Fill.png` | 64×64 |

**Progress Bar Implementation**:
```javascript
preload() {
  const width = this.cameras.main.width;
  const height = this.cameras.main.height;

  // Progress bar graphics
  const progressBox = this.add.graphics();
  const progressBar = this.add.graphics();

  progressBox.fillStyle(0x2A2F3A, 0.8);
  progressBox.fillRect(width/2 - 160, height/2 - 25, 320, 50);

  this.load.on('progress', (value) => {
    progressBar.clear();
    progressBar.fillStyle(0x7EC8FF, 1);
    progressBar.fillRect(width/2 - 150, height/2 - 15, 300 * value, 30);
  });

  // Load all assets...
}
```

---

### 3.2 MenuScene

**Purpose**: Title screen with start button and controls display.

**Layout** (960×540 canvas):
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    CASTLE CLASH DUEL                        │  y=120
│                      ═══════════════                        │
│                                                             │
│                    ┌─────────────┐                          │  y=240
│                    │    START    │                          │
│                    └─────────────┘                          │
│                    ┌─────────────┐                          │  y=320
│                    │ HOW TO PLAY │                          │
│                    └─────────────┘                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │  y=420
│  │ Select: Click/Tap  |  Command: Right-click/Tap        │  │
│  │ Spawn: W=Warrior(3) A=Archer(4)  |  Pause: P/Esc      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Input Bindings**:
- `ENTER` / `SPACE` → Start game
- Start button click/tap → Start game
- How to Play → Toggle controls panel

**Transitions**:
- `this.scene.start('GameScene')` on start

---

### 3.3 GameScene

**Purpose**: Main gameplay loop, unit management, combat.

**World Configuration**:
```javascript
create() {
  // World bounds larger than camera view
  this.physics.world.setBounds(0, 0, 1600, 540);

  // Camera setup (fixed, centered on battlefield)
  this.cameras.main.setBounds(0, 0, 1600, 540);
  this.cameras.main.centerOn(800, 270);  // Center of 1600×540 world
}
```

**Layer Z-Order** (bottom to top):
1. Terrain tilemap (z=0)
2. Shadows (z=10)
3. Castles (z=20)
4. Units - sorted by Y position (z=30-100)
5. Projectiles (z=110)
6. Particle effects (z=120)
7. Selection rings (z=130)
8. Health bars (z=140)

**State Management**:
```javascript
// GameScene state object
this.gameState = {
  // Teams
  teams: {
    blue: {
      castle: null,           // Castle sprite
      castleHP: 1200,
      units: null,            // Phaser.Physics.Arcade.Group
      supply: 6,
      maxSupply: 20
    },
    red: {
      castle: null,
      castleHP: 1200,
      units: null,
      supply: 6,
      maxSupply: 20
    }
  },

  // Selection
  selectedUnits: [],          // Array of unit references
  selectionBox: null,         // Graphics object for box select

  // Projectiles
  projectiles: null,          // Phaser.Physics.Arcade.Group

  // Timing
  matchTime: 0,               // Seconds elapsed
  supplyTimer: 0,             // For supply regen
  aiSpawnTimer: 0,            // For AI spawn cadence

  // Score
  score: 0,
  highScore: parseInt(localStorage.getItem('castle-clash-duel_highscore') || '0'),

  // Intensity
  intensityLevel: 0           // 0-3 based on time/score
};
```

---

### 3.4 UIScene

**Purpose**: HUD overlay running parallel to GameScene.

**Launch**: `this.scene.launch('UIScene')` from GameScene.create()

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ ┌──────────────┐              SCORE: 000              ┌──────────────┐ │
│ │ BLUE: 1200   │              BEST: 000               │   RED: 1200  │ │
│ │ ████████████ │                                      │ ████████████ │ │
│ └──────────────┘                                      └──────────────┘ │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Controls hint (compact)                                             │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                    ┌──────────┐  ┌──────────┐                          │
│  Supply: 6/20      │ WARRIOR  │  │  ARCHER  │                          │
│                    │   (3)    │  │   (4)    │                          │
│                    └──────────┘  └──────────┘                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Scene Communication**:
```javascript
// UIScene listens to GameScene events via registry
this.registry.events.on('updateScore', (score) => {
  this.scoreText.setText(`SCORE: ${score}`);
});

this.registry.events.on('updateSupply', (supply, max) => {
  this.supplyText.setText(`Supply: ${supply}/${max}`);
});

this.registry.events.on('updateCastleHP', (team, hp, maxHp) => {
  // Update health bar fill width
});
```

---

### 3.5 PauseScene

**Purpose**: Overlay when game is paused.

**Trigger**: `P` or `ESC` key during GameScene.

**Implementation**:
```javascript
// GameScene
this.input.keyboard.on('keydown-P', () => {
  this.scene.pause();
  this.scene.launch('PauseScene');
});

// PauseScene
create() {
  // Dark overlay
  this.add.rectangle(480, 270, 960, 540, 0x000000, 0.6);

  // PAUSED text
  this.add.text(480, 200, 'PAUSED', {
    fontSize: '64px',
    fill: '#FFFFFF'
  }).setOrigin(0.5);

  // Controls reminder
  this.add.text(480, 300, 'Press P or ESC to resume', {
    fontSize: '24px',
    fill: '#F6E27F'
  }).setOrigin(0.5);

  this.input.keyboard.on('keydown-P', this.resume, this);
  this.input.keyboard.on('keydown-ESC', this.resume, this);
}

resume() {
  this.scene.stop();
  this.scene.resume('GameScene');
}
```

---

### 3.6 GameOverScene

**Purpose**: Victory/Defeat display with retry option.

**Data Input**:
```javascript
// Called from GameScene when castle destroyed
this.scene.start('GameOverScene', {
  victory: this.gameState.teams.red.castleHP <= 0,
  score: this.gameState.score,
  highScore: this.gameState.highScore
});
```

**Death Sequence** (PRD 12.8):
1. Freeze-frame: 120ms
2. Screen shake: 10px for 260ms
3. Desaturate world: 40% over 400ms
4. Show overlay with result

---

## 4. Entity Specifications

### 4.1 Unit Base Class

```javascript
class Unit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, team, unitType) {
    const textureKey = `${unitType}-${team}-idle`;
    super(scene, x, y, textureKey);

    // Core properties
    this.team = team;                    // 'blue' | 'red'
    this.unitType = unitType;            // 'warrior' | 'archer'
    this.hp = this.getMaxHP();
    this.state = 'idle';                 // 'idle' | 'moving' | 'attacking'

    // Command queue
    this.commandQueue = [];              // Max 3 commands (shift-queue)
    this.currentTarget = null;           // Unit or Castle or {x, y}

    // Combat timing
    this.attackCooldown = 0;
    this.windupTimer = 0;
    this.isInWindup = false;

    // Near-miss tracking
    this.lastCommandTime = 0;
    this.nearMissCooldown = 0;           // 4 second anti-spam

    // Visual
    this.selectionRing = null;
    this.healthBar = null;
    this.healthBarTimer = 0;             // Fade after 2 seconds

    // Physics body setup
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Hitbox (hurt radius reduced by 6px per PRD)
    const hurtRadius = Math.max(10, (192 * 0.3) - 6);  // ~52px radius
    this.body.setCircle(hurtRadius, 96 - hurtRadius, 96 - hurtRadius);
  }

  getMaxHP() {
    return this.unitType === 'warrior' ? 140 : 90;
  }

  getMoveSpeed() {
    return this.unitType === 'warrior' ? 110 : 95;
  }

  getAttackRange() {
    return this.unitType === 'warrior' ? 22 : 190;
  }

  getAttackCooldown() {
    return this.unitType === 'warrior' ? 750 : 1050;  // ms
  }

  getWindupTime() {
    return this.unitType === 'warrior' ? 200 : 250;   // ms
  }

  getAggroRadius() {
    return 140;
  }
}
```

### 4.2 Unit Stats Reference

| Property | Warrior | Archer |
|----------|---------|--------|
| Max HP | 140 | 90 |
| Move Speed | 110 px/s | 95 px/s |
| Attack Damage | 18 | 14 |
| Attack Range | 22 px | 190 px |
| Attack Cooldown | 0.75s | 1.05s |
| Windup Time | 0.20s | 0.25s |
| Aggro Radius | 140 px | 140 px |
| Supply Cost | 3 | 4 |
| Hurt Radius | ~52 px | ~52 px |
| Min Range | N/A | 40 px (backstep) |

### 4.3 Castle Entity

```javascript
class Castle extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, team) {
    super(scene, x, y, `castle-${team}`);

    this.team = team;
    this.hp = 1200;
    this.maxHP = 1200;

    // Hurtbox shrunk by 12px per PRD
    // Castle sprite is 320×256
    this.hurtbox = new Phaser.Geom.Rectangle(
      x - 160 + 12,    // x - halfWidth + shrink
      y - 128 + 12,    // y - halfHeight + shrink
      320 - 24,        // width - 2*shrink
      256 - 24         // height - 2*shrink
    );

    scene.add.existing(this);
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);

    // Screen shake every 60 damage chunk
    if (Math.floor((this.hp + amount) / 60) > Math.floor(this.hp / 60)) {
      this.scene.cameras.main.shake(120, 0.006);
    }

    // Score: +1 per 10 damage to enemy castle
    if (this.team === 'red') {
      const scoreGain = Math.floor(amount / 10);
      this.scene.addScore(scoreGain);
    }

    // Low HP pulse (< 25%)
    if (this.hp > 0 && this.hp < this.maxHP * 0.25) {
      this.scene.registry.events.emit('castleLowHP', this.team);
    }

    // Destruction check
    if (this.hp <= 0) {
      this.scene.triggerGameOver(this.team === 'red');
    }

    this.scene.registry.events.emit('updateCastleHP', this.team, this.hp, this.maxHP);
  }
}
```

### 4.4 Arrow Projectile

```javascript
class Arrow extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, team, targetX, targetY) {
    super(scene, x, y, `arrow-${team}`);

    this.team = team;
    this.damage = 14;
    this.lifetime = 900;  // ms
    this.spawnTime = scene.time.now;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Calculate velocity toward target with spread
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const spread = Phaser.Math.DegToRad(Phaser.Math.Between(-4, 4));
    const finalAngle = angle + spread;

    const speed = 420;  // px/sec
    this.body.setVelocity(
      Math.cos(finalAngle) * speed,
      Math.sin(finalAngle) * speed
    );

    // Rotate sprite to face direction
    this.setRotation(finalAngle);

    // Small hitbox
    this.body.setCircle(8);
  }

  update(time, delta) {
    // Despawn after lifetime
    if (time - this.spawnTime > this.lifetime) {
      this.destroy();
    }
  }
}
```

---

## 5. Animation Definitions

### 5.1 Animation Registry

All animations created in BootScene.create():

```javascript
// Warrior animations (both teams)
['blue', 'red'].forEach(team => {
  // Idle - 8 frames @ 8fps
  this.anims.create({
    key: `warrior-${team}-idle`,
    frames: this.anims.generateFrameNumbers(`warrior-${team}-idle`, { start: 0, end: 7 }),
    frameRate: 8,
    repeat: -1
  });

  // Run - 6 frames @ 10fps
  this.anims.create({
    key: `warrior-${team}-run`,
    frames: this.anims.generateFrameNumbers(`warrior-${team}-run`, { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
  });

  // Attack - 4 frames @ 12fps
  this.anims.create({
    key: `warrior-${team}-attack`,
    frames: this.anims.generateFrameNumbers(`warrior-${team}-attack`, { start: 0, end: 3 }),
    frameRate: 12,
    repeat: 0
  });
});

// Archer animations (both teams)
['blue', 'red'].forEach(team => {
  // Idle - 6 frames @ 8fps
  this.anims.create({
    key: `archer-${team}-idle`,
    frames: this.anims.generateFrameNumbers(`archer-${team}-idle`, { start: 0, end: 5 }),
    frameRate: 8,
    repeat: -1
  });

  // Run - 4 frames @ 10fps
  this.anims.create({
    key: `archer-${team}-run`,
    frames: this.anims.generateFrameNumbers(`archer-${team}-run`, { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  // Shoot - 8 frames @ 12fps
  this.anims.create({
    key: `archer-${team}-shoot`,
    frames: this.anims.generateFrameNumbers(`archer-${team}-shoot`, { start: 0, end: 7 }),
    frameRate: 12,
    repeat: 0
  });
});

// Particle animations
this.anims.create({
  key: 'dust-puff',
  frames: this.anims.generateFrameNumbers('dust-01', { start: 0, end: 7 }),
  frameRate: 16,
  hideOnComplete: true
});

this.anims.create({
  key: 'explosion',
  frames: this.anims.generateFrameNumbers('explosion-01', { start: 0, end: 7 }),
  frameRate: 16,
  hideOnComplete: true
});
```

### 5.2 Animation State Machine

```javascript
// Unit.update() animation handling
updateAnimation() {
  const currentAnim = `${this.unitType}-${this.team}-${this.state}`;

  if (this.state === 'attacking') {
    // Play attack animation once
    if (!this.anims.isPlaying || this.anims.currentAnim.key !== currentAnim) {
      this.anims.play(currentAnim);
    }
  } else if (this.state === 'moving') {
    // Transition within 80ms
    this.anims.play(`${this.unitType}-${this.team}-run`, true);
  } else {
    // Idle with 120ms delay after stopping
    if (this.idleTransitionTimer > 120) {
      this.anims.play(`${this.unitType}-${this.team}-idle`, true);
    }
  }
}
```

---

## 6. Terrain & Map System

### 6.1 Tilemap Construction

Since no JSON tilemap is provided, construct procedurally:

```javascript
buildTerrain() {
  // Load tilemap image as spritesheet
  // Tilemap_color1.png: 576×384, 64px tiles, 9 columns × 6 rows

  const TILE_SIZE = 64;
  const WORLD_WIDTH = 1600;
  const WORLD_HEIGHT = 540;

  // Tile indices from tilemap (row-major, 0-indexed)
  const TILES = {
    GRASS_FULL: 0,           // Row 0, Col 0
    GRASS_EDGE_TOP: 1,       // Row 0, Col 1
    GRASS_EDGE_BOTTOM: 9,    // Row 1, Col 0
    DIRT_FULL: 27,           // Row 3, Col 0
    DIRT_EDGE_TOP: 18,       // Row 2, Col 0
    DIRT_EDGE_BOTTOM: 36     // Row 4, Col 0
  };

  // Lane boundaries
  const LANE_TOP = 160;
  const LANE_BOTTOM = 380;

  for (let x = 0; x < WORLD_WIDTH; x += TILE_SIZE) {
    for (let y = 0; y < WORLD_HEIGHT; y += TILE_SIZE) {
      let tileIndex;

      if (y < LANE_TOP - TILE_SIZE) {
        tileIndex = TILES.GRASS_FULL;
      } else if (y < LANE_TOP) {
        tileIndex = TILES.DIRT_EDGE_TOP;
      } else if (y < LANE_BOTTOM) {
        tileIndex = TILES.DIRT_FULL;
      } else if (y < LANE_BOTTOM + TILE_SIZE) {
        tileIndex = TILES.DIRT_EDGE_BOTTOM;
      } else {
        tileIndex = TILES.GRASS_FULL;
      }

      // Create tile sprite from tilemap
      const tileX = (tileIndex % 9) * TILE_SIZE;
      const tileY = Math.floor(tileIndex / 9) * TILE_SIZE;

      const tile = this.add.image(x + TILE_SIZE/2, y + TILE_SIZE/2, 'tilemap-color1');
      tile.setCrop(tileX, tileY, TILE_SIZE, TILE_SIZE);
      tile.setDepth(0);
    }
  }
}
```

### 6.2 Map Layout Constants

```javascript
const MAP = {
  WORLD_WIDTH: 1600,
  WORLD_HEIGHT: 540,
  CAMERA_WIDTH: 960,
  CAMERA_HEIGHT: 540,

  LANE_CENTER_Y: 270,
  LANE_TOP: 160,
  LANE_BOTTOM: 380,
  LANE_WIDTH: 220,

  CASTLE_BLUE_X: 260,
  CASTLE_BLUE_Y: 270,
  CASTLE_RED_X: 1340,
  CASTLE_RED_Y: 270,

  SPAWN_BLUE_X: 360,
  SPAWN_BLUE_Y: 270,
  SPAWN_RED_X: 1240,
  SPAWN_RED_Y: 270,

  TILE_SIZE: 64
};
```

---

## 7. Input System

### 7.1 Desktop Controls

```javascript
setupDesktopInput() {
  // Cursor keys (not used in this RTS, but available)
  this.cursors = this.input.keyboard.createCursorKeys();

  // Hotkeys
  this.input.keyboard.on('keydown-W', () => this.trySpawnUnit('warrior'));
  this.input.keyboard.on('keydown-A', () => this.trySpawnUnit('archer'));
  this.input.keyboard.on('keydown-P', () => this.togglePause());
  this.input.keyboard.on('keydown-ESC', () => this.togglePause());

  // Shift modifier for queue
  this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

  // Left click - selection
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      this.startSelection(pointer.worldX, pointer.worldY);
    }
  });

  this.input.on('pointermove', (pointer) => {
    if (pointer.leftButtonDown() && this.isSelecting) {
      this.updateSelectionBox(pointer.worldX, pointer.worldY);
    }
  });

  this.input.on('pointerup', (pointer) => {
    if (pointer.leftButtonReleased()) {
      this.endSelection(pointer.worldX, pointer.worldY);
    }
  });

  // Right click - command
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      this.issueCommand(pointer.worldX, pointer.worldY);
    }
  });

  // Custom cursor
  this.input.setDefaultCursor('url(assets/tinyswords/UI Elements/UI Elements/Cursors/Cursor_01.png), pointer');
}
```

### 7.2 Touch Controls

```javascript
setupTouchInput() {
  // Tap to select
  this.input.on('pointerdown', (pointer) => {
    if (!pointer.wasTouch) return;

    this.touchStartTime = this.time.now;
    this.touchStartPos = { x: pointer.worldX, y: pointer.worldY };
  });

  this.input.on('pointerup', (pointer) => {
    if (!pointer.wasTouch) return;

    const tapDuration = this.time.now - this.touchStartTime;
    const tapDistance = Phaser.Math.Distance.Between(
      this.touchStartPos.x, this.touchStartPos.y,
      pointer.worldX, pointer.worldY
    );

    // Short tap = selection or command
    if (tapDuration < 300 && tapDistance < 20) {
      // Check if tapped on enemy
      const enemy = this.getEnemyAtPosition(pointer.worldX, pointer.worldY);
      if (enemy && this.selectedUnits.length > 0) {
        this.issueAttackCommand(enemy);
        return;
      }

      // Check if tapped on friendly unit
      const friendly = this.getFriendlyAtPosition(pointer.worldX, pointer.worldY);
      if (friendly) {
        this.selectUnit(friendly);

        // Double-tap detection
        if (this.lastTapTime && this.time.now - this.lastTapTime < 300) {
          this.selectAllOfType(friendly.unitType);
        }
        this.lastTapTime = this.time.now;
        return;
      }

      // Tap on ground = move command
      if (this.selectedUnits.length > 0) {
        this.issueMoveCommand(pointer.worldX, pointer.worldY);
      }
    }
  });
}
```

### 7.3 Selection System

```javascript
// Selection within 28px radius
selectUnitAt(x, y) {
  const SELECT_RADIUS = 28;
  let nearest = null;
  let nearestDist = SELECT_RADIUS;

  this.blueUnits.children.iterate(unit => {
    const dist = Phaser.Math.Distance.Between(x, y, unit.x, unit.y);
    if (dist < nearestDist) {
      nearest = unit;
      nearestDist = dist;
    }
  });

  return nearest;
}

// Box selection
updateSelectionBox(x, y) {
  const box = new Phaser.Geom.Rectangle(
    Math.min(this.selectionStart.x, x),
    Math.min(this.selectionStart.y, y),
    Math.abs(x - this.selectionStart.x),
    Math.abs(y - this.selectionStart.y)
  );

  // Visual feedback
  this.selectionGraphics.clear();
  this.selectionGraphics.lineStyle(2, 0xF6E27F, 1);
  this.selectionGraphics.strokeRectShape(box);
  this.selectionGraphics.fillStyle(0xF6E27F, 0.2);
  this.selectionGraphics.fillRectShape(box);
}
```

---

## 8. Combat System

### 8.1 Targeting Logic

```javascript
findTarget(unit) {
  const aggroRadius = unit.getAggroRadius();
  let nearestEnemy = null;
  let nearestDist = aggroRadius;

  const enemies = unit.team === 'blue' ? this.redUnits : this.blueUnits;

  enemies.children.iterate(enemy => {
    if (!enemy.active) return;

    const dist = Phaser.Math.Distance.Between(unit.x, unit.y, enemy.x, enemy.y);
    if (dist < nearestDist) {
      nearestEnemy = enemy;
      nearestDist = dist;
    }
  });

  return nearestEnemy;
}
```

### 8.2 Attack Execution

```javascript
executeAttack(attacker, target) {
  // Start windup
  attacker.isInWindup = true;
  attacker.windupTimer = attacker.getWindupTime();
  attacker.state = 'attacking';

  // Face target
  attacker.flipX = target.x < attacker.x;

  // Reduce move speed during windup (20%)
  attacker.body.setMaxVelocity(attacker.getMoveSpeed() * 0.2);

  // After windup, deal damage
  this.time.delayedCall(attacker.getWindupTime(), () => {
    if (!attacker.active || !target.active) return;

    if (attacker.unitType === 'warrior') {
      // Melee hit
      target.takeDamage(18, attacker);
      this.spawnDustEffect(target.x, target.y);
    } else {
      // Spawn arrow
      this.spawnArrow(attacker, target);
    }

    attacker.isInWindup = false;
    attacker.attackCooldown = attacker.getAttackCooldown();
    attacker.body.setMaxVelocity(attacker.getMoveSpeed());
  });
}
```

### 8.3 Archer Backstep Logic

```javascript
updateArcher(archer, delta) {
  if (archer.currentTarget && archer.currentTarget.active) {
    const dist = Phaser.Math.Distance.Between(
      archer.x, archer.y,
      archer.currentTarget.x, archer.currentTarget.y
    );

    // Backstep if enemy too close (within 40px)
    if (dist < 40) {
      const angle = Phaser.Math.Angle.Between(
        archer.currentTarget.x, archer.currentTarget.y,
        archer.x, archer.y
      );

      // Move away for 0.35 seconds
      archer.body.setVelocity(
        Math.cos(angle) * archer.getMoveSpeed(),
        Math.sin(angle) * archer.getMoveSpeed()
      );

      // Can still shoot while backstepping
      if (archer.attackCooldown <= 0) {
        this.executeAttack(archer, archer.currentTarget);
      }
    }
  }
}
```

### 8.4 Collision Detection

```javascript
setupCollisions() {
  // Unit vs Unit (both teams)
  this.physics.add.collider(this.blueUnits, this.blueUnits, this.separateUnits);
  this.physics.add.collider(this.redUnits, this.redUnits, this.separateUnits);

  // Arrow vs Units
  this.physics.add.overlap(this.projectiles, this.blueUnits, (arrow, unit) => {
    if (arrow.team !== 'blue') {
      unit.takeDamage(arrow.damage, arrow);
      arrow.destroy();
    }
  });

  this.physics.add.overlap(this.projectiles, this.redUnits, (arrow, unit) => {
    if (arrow.team !== 'red') {
      unit.takeDamage(arrow.damage, arrow);
      arrow.destroy();
    }
  });

  // Arrow vs Castle (using manual rect check since castle isn't physics-enabled)
  // Checked in update loop
}

// Separation steering (anti-stacking)
separateUnits(unitA, unitB) {
  const dist = Phaser.Math.Distance.Between(unitA.x, unitA.y, unitB.x, unitB.y);

  if (dist < 22) {
    const angle = Phaser.Math.Angle.Between(unitB.x, unitB.y, unitA.x, unitA.y);
    const separation = 60;  // px/sec equivalent

    unitA.body.velocity.x += Math.cos(angle) * separation * 0.016;
    unitA.body.velocity.y += Math.sin(angle) * separation * 0.016;
  }
}
```

---

## 9. AI System

### 9.1 AI Controller

```javascript
class AIController {
  constructor(scene) {
    this.scene = scene;
    this.spawnInterval = 3000;  // Start at 3 seconds
    this.spawnTimer = 0;
  }

  update(delta) {
    this.spawnTimer += delta;

    // Update spawn interval based on time (ramps from 3s to 2s over 4 minutes)
    const matchTime = this.scene.gameState.matchTime;
    this.spawnInterval = Phaser.Math.Linear(3000, 2000, Math.min(matchTime / 240, 1));

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnUnit();
    }

    // Issue attack-move commands to idle units
    this.scene.redUnits.children.iterate(unit => {
      if (unit.state === 'idle' && !unit.currentTarget) {
        unit.currentTarget = { x: MAP.CASTLE_BLUE_X, y: MAP.CASTLE_BLUE_Y };
      }
    });
  }

  spawnUnit() {
    // Composition logic per PRD
    const blueArchers = this.scene.blueUnits.children.getAll()
      .filter(u => u.unitType === 'archer').length;
    const redMelee = this.scene.redUnits.children.getAll()
      .filter(u => u.unitType === 'warrior').length;

    let unitType;
    if (blueArchers > redMelee + 1) {
      unitType = 'warrior';  // Counter with melee
    } else {
      // Alternate
      unitType = this.lastSpawnType === 'warrior' ? 'archer' : 'warrior';
    }

    this.lastSpawnType = unitType;
    this.scene.spawnUnit('red', unitType, MAP.SPAWN_RED_X, MAP.SPAWN_RED_Y);
  }
}
```

---

## 10. Economy System

### 10.1 Supply Management

```javascript
class SupplyManager {
  constructor(scene, team) {
    this.scene = scene;
    this.team = team;
    this.supply = 6;
    this.maxSupply = 20;
    this.regenRate = 2000;  // +1 every 2 seconds
    this.regenTimer = 0;
  }

  update(delta) {
    if (this.supply < this.maxSupply) {
      this.regenTimer += delta;

      if (this.regenTimer >= this.regenRate) {
        this.regenTimer = 0;
        this.supply = Math.min(this.maxSupply, this.supply + 1);
        this.scene.registry.events.emit('updateSupply', this.supply, this.maxSupply);
      }
    }
  }

  canAfford(cost) {
    return this.supply >= cost;
  }

  spend(cost) {
    if (!this.canAfford(cost)) return false;
    this.supply -= cost;
    this.scene.registry.events.emit('updateSupply', this.supply, this.maxSupply);
    return true;
  }
}
```

### 10.2 Spawn Button Feedback

```javascript
trySpawnUnit(unitType) {
  const cost = unitType === 'warrior' ? 3 : 4;

  if (!this.supplyManager.canAfford(cost)) {
    // Denied feedback per PRD 12.1
    this.denySpawnFeedback(unitType);
    return;
  }

  this.supplyManager.spend(cost);

  const unit = this.spawnUnit('blue', unitType, MAP.SPAWN_BLUE_X, MAP.SPAWN_BLUE_Y);

  // Spawn animation: scale 0.85 → 1.0 over 120ms
  unit.setScale(0.85);
  this.tweens.add({
    targets: unit,
    scale: 1,
    duration: 120,
    ease: 'Back.easeOut'
  });

  // Dust puff at spawn
  this.spawnDustEffect(MAP.SPAWN_BLUE_X, MAP.SPAWN_BLUE_Y);
}

denySpawnFeedback(unitType) {
  const button = this.ui[`${unitType}Button`];

  // Button shake: 6px horizontal for 180ms
  this.tweens.add({
    targets: button,
    x: { from: button.x - 6, to: button.x + 6 },
    duration: 45,
    yoyo: true,
    repeat: 3
  });

  // Button tint flash: #FF8A7A for 120ms
  button.setTint(0xFF8A7A);
  this.time.delayedCall(120, () => button.clearTint());

  // Supply number pulse: scale 1.0 → 1.15 → 1.0 over 200ms
  this.tweens.add({
    targets: this.ui.supplyText,
    scale: { from: 1, to: 1.15 },
    duration: 100,
    yoyo: true
  });
}
```

---

## 11. Visual Effects (Juice)

### 11.1 Screen Shake

```javascript
// Castle hit shake (every 60 damage)
shakeOnCastleHit() {
  this.cameras.main.shake(120, 0.006);  // 6px intensity
}

// Unit death shake
shakeOnUnitDeath() {
  this.cameras.main.shake(90, 0.003);  // 3px intensity
}

// Castle destruction shake
shakeOnCastleDestruction() {
  this.cameras.main.shake(260, 0.010);  // 10px intensity
}
```

### 11.2 Selection Visual

```javascript
createSelectionRing(unit) {
  const ring = this.add.ellipse(unit.x, unit.y + 20, 50, 25);
  ring.setStrokeStyle(2, unit.team === 'blue' ? 0xF6E27F : 0xFF8A7A);
  ring.setFillStyle(unit.team === 'blue' ? 0xF6E27F : 0xFF8A7A, 0.3);
  ring.setDepth(130);
  return ring;
}

// Selection ping: expanding circle over 120ms
spawnSelectionPing(x, y) {
  const ping = this.add.circle(x, y, 10, 0xF6E27F, 0.5);

  this.tweens.add({
    targets: ping,
    scale: 2,
    alpha: 0,
    duration: 120,
    onComplete: () => ping.destroy()
  });
}
```

### 11.3 Command Acknowledgment

```javascript
spawnCommandMarker(x, y, isAttack = false) {
  // Dust puff
  const dust = this.add.sprite(x, y, 'dust-01');
  dust.anims.play('dust-puff');
  dust.on('animationcomplete', () => dust.destroy());

  // Ring effect
  const ring = this.add.circle(x, y, 15);
  ring.setStrokeStyle(2, isAttack ? 0xFF8A7A : 0xF6E27F);

  this.tweens.add({
    targets: ring,
    scale: 1.5,
    alpha: 0,
    duration: 140,
    onComplete: () => ring.destroy()
  });
}
```

### 11.4 Near-Miss System (Save/Dodge)

```javascript
checkNearMiss(unit, damage, sourcePosition) {
  // Anti-spam cooldown
  if (unit.nearMissCooldown > 0) return;

  const timeSinceCommand = this.time.now - unit.lastCommandTime;

  // "Save": would be lethal, commanded within 350ms, survives 600ms
  if (unit.hp - damage <= 0 && timeSinceCommand < 350) {
    // Track for 600ms survival check
    unit.pendingSave = true;
    this.time.delayedCall(600, () => {
      if (unit.active && unit.hp > 0) {
        this.triggerNearMissReward(unit, 'SAVE');
      }
      unit.pendingSave = false;
    });
  }
}

checkArrowDodge(arrow, unit) {
  // Missed by ≤10px within 250ms of move command
  const dist = Phaser.Math.Distance.Between(arrow.x, arrow.y, unit.x, unit.y);
  const timeSinceCommand = this.time.now - unit.lastCommandTime;

  if (dist <= 10 + unit.body.radius && dist > unit.body.radius && timeSinceCommand < 250) {
    if (unit.nearMissCooldown <= 0) {
      this.triggerNearMissReward(unit, 'DODGE');
    }
  }
}

triggerNearMissReward(unit, type) {
  unit.nearMissCooldown = 4000;  // 4 second cooldown

  // Slow-mo: 0.85x time for 220ms
  this.time.timeScale = 0.85;
  this.time.delayedCall(220, () => this.time.timeScale = 1);

  // Gold outline flash
  unit.setTint(0xF6E27F);
  this.time.delayedCall(120, () => unit.clearTint());

  // Floating text
  const text = this.add.text(unit.x, unit.y - 30, `${type} +5`, {
    fontSize: '16px',
    fill: '#F6E27F',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  this.tweens.add({
    targets: text,
    y: text.y - 24,
    alpha: 0,
    duration: 600,
    onComplete: () => text.destroy()
  });

  // Score
  this.addScore(5);
}
```

### 11.5 Unit Death Sequence

```javascript
killUnit(unit) {
  // Freeze frame: 70ms
  this.time.timeScale = 0;

  this.time.delayedCall(70, () => {
    this.time.timeScale = 1;

    // White flash: 60ms
    unit.setTint(0xFFFFFF);

    this.time.delayedCall(60, () => {
      // Fade out: 180ms
      this.tweens.add({
        targets: unit,
        alpha: 0,
        duration: 180,
        onComplete: () => {
          // Dust burst
          this.spawnDeathDust(unit.x, unit.y);

          // Screen shake
          this.shakeOnUnitDeath();

          // Score if enemy
          if (unit.team === 'red') {
            this.addScore(15);
          }

          unit.destroy();
        }
      });
    });
  });
}

spawnDeathDust(x, y) {
  // 6-10 particles bursting outward over 300ms
  const particleCount = Phaser.Math.Between(6, 10);

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const dist = Phaser.Math.Between(20, 40);

    const particle = this.add.circle(x, y, 4, 0xC6A15B);

    this.tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      duration: 300,
      onComplete: () => particle.destroy()
    });
  }
}
```

### 11.6 Idle Breathing Animation

```javascript
// Applied to all units during idle state
startIdleBreathing(unit) {
  unit.breathingTween = this.tweens.add({
    targets: unit,
    y: unit.y - 2,
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

stopIdleBreathing(unit) {
  if (unit.breathingTween) {
    unit.breathingTween.stop();
    unit.breathingTween = null;
  }
}
```

### 11.7 Progressive Intensity

```javascript
updateIntensity() {
  const score = this.gameState.score;
  const time = this.gameState.matchTime;

  let newLevel = 0;

  if (score >= 700 || time >= 240) newLevel = 3;
  else if (score >= 450 || time >= 180) newLevel = 2;
  else if (score >= 200 || time >= 90) newLevel = 1;

  if (newLevel !== this.gameState.intensityLevel) {
    this.gameState.intensityLevel = newLevel;
    this.applyIntensityEffects(newLevel);
  }
}

applyIntensityEffects(level) {
  // Vignette strength
  const vignetteAlpha = 0.1 + level * 0.03;
  this.vignetteOverlay.setAlpha(vignetteAlpha);

  // Battle heat overlay (level 3)
  if (level >= 3) {
    this.heatOverlay.setAlpha(0.05);
  }

  // AI spawn rate handled in AIController.update()
}
```

---

## 12. Score & Persistence

### 12.1 Score Events

```javascript
addScore(amount) {
  const previousScore = this.gameState.score;
  this.gameState.score += amount;

  // Check milestone (every 250)
  const prevMilestone = Math.floor(previousScore / 250);
  const newMilestone = Math.floor(this.gameState.score / 250);

  if (newMilestone > prevMilestone) {
    this.celebrateMilestone();
  }

  // Check high score
  if (this.gameState.score > this.gameState.highScore) {
    this.gameState.highScore = this.gameState.score;
    localStorage.setItem('castle-clash-duel_highscore', this.gameState.highScore.toString());

    if (!this.newHighScoreShown) {
      this.showNewHighScore();
      this.newHighScoreShown = true;
    }
  }

  this.registry.events.emit('updateScore', this.gameState.score);
}
```

### 12.2 Milestone Celebration

```javascript
celebrateMilestone() {
  // Banner
  const banner = this.add.text(480, 100, 'Milestone +250!', {
    fontSize: '32px',
    fill: '#F6E27F',
    fontStyle: 'bold'
  }).setOrigin(0.5).setAlpha(0);

  this.tweens.add({
    targets: banner,
    alpha: 1,
    duration: 220
  });

  this.time.delayedCall(620, () => {
    this.tweens.add({
      targets: banner,
      alpha: 0,
      duration: 220,
      onComplete: () => banner.destroy()
    });
  });

  // Confetti burst (12 colored rectangles)
  for (let i = 0; i < 12; i++) {
    const colors = [0x2B6DE8, 0xE23B3B, 0xF6E27F, 0x7EC8FF];
    const rect = this.add.rectangle(
      480 + Phaser.Math.Between(-20, 20),
      80,
      8, 8,
      Phaser.Utils.Array.GetRandom(colors)
    );

    this.tweens.add({
      targets: rect,
      x: rect.x + Phaser.Math.Between(-60, 60),
      y: rect.y + Phaser.Math.Between(40, 80),
      rotation: Phaser.Math.DegToRad(Phaser.Math.Between(-180, 180)),
      alpha: 0,
      duration: 600,
      onComplete: () => rect.destroy()
    });
  }
}
```

---

## 13. Health Bar System

### 13.1 Unit Health Bars

```javascript
class HealthBar {
  constructor(scene, unit) {
    this.scene = scene;
    this.unit = unit;
    this.visible = false;
    this.fadeTimer = 0;

    // Background
    this.bg = scene.add.rectangle(0, 0, 40, 6, 0x1B1F2A);

    // Fill
    this.fill = scene.add.rectangle(0, 0, 38, 4,
      unit.team === 'blue' ? 0x2B6DE8 : 0xE23B3B
    );

    this.bg.setDepth(140);
    this.fill.setDepth(141);
    this.setVisible(false);
  }

  update(delta) {
    // Position above unit
    const x = this.unit.x;
    const y = this.unit.y - 45;

    this.bg.setPosition(x, y);
    this.fill.setPosition(x - 19 + (38 * this.getHealthPercent()) / 2, y);
    this.fill.setSize(38 * this.getHealthPercent(), 4);

    // Fade logic
    if (this.fadeTimer > 0) {
      this.fadeTimer -= delta;
      this.setVisible(true);
      this.setAlpha(1);
    } else {
      this.setAlpha(0.3);
    }
  }

  getHealthPercent() {
    return this.unit.hp / this.unit.getMaxHP();
  }

  showForDuration(ms = 2000) {
    this.fadeTimer = ms;
  }

  setVisible(visible) {
    this.bg.setVisible(visible);
    this.fill.setVisible(visible);
  }

  setAlpha(alpha) {
    this.bg.setAlpha(alpha);
    this.fill.setAlpha(alpha);
  }

  destroy() {
    this.bg.destroy();
    this.fill.destroy();
  }
}
```

### 13.2 Castle Health Bars (UI)

```javascript
// In UIScene
createCastleHealthBar(team, x, y) {
  // Base bar image
  const base = this.add.image(x, y, 'bar-big-base');

  // Fill (tiled for scaling)
  const fillColor = team === 'blue' ? 0x2B6DE8 : 0xE23B3B;
  const fill = this.add.rectangle(x - 140, y, 280, 30, fillColor);
  fill.setOrigin(0, 0.5);

  // Numeric display
  const text = this.add.text(x, y, '1200', {
    fontSize: '20px',
    fill: '#FFFFFF',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // Label
  const label = this.add.text(x, y - 25, team.toUpperCase(), {
    fontSize: '14px',
    fill: '#FFFFFF'
  }).setOrigin(0.5);

  return { base, fill, text, label, maxWidth: 280 };
}

updateCastleHealthBar(bar, hp, maxHp) {
  const percent = hp / maxHp;
  bar.fill.setSize(bar.maxWidth * percent, 30);
  bar.text.setText(hp.toString());

  // Low HP pulse (< 25%)
  if (percent < 0.25 && !bar.pulsing) {
    bar.pulsing = true;
    this.tweens.add({
      targets: bar.fill,
      scaleY: { from: 1, to: 1.06 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });
  }
}
```

---

## 14. Game Over Sequence

```javascript
triggerGameOver(victory) {
  // Freeze frame
  this.time.timeScale = 0;

  this.time.delayedCall(120, () => {
    // Strong shake
    this.cameras.main.shake(260, 0.010);

    // Time dilation for final blow
    this.time.timeScale = 0.6;

    this.time.delayedCall(350, () => {
      this.time.timeScale = 1;

      // Desaturate
      const pipeline = this.cameras.main.postFX.addColorMatrix();
      this.tweens.add({
        targets: pipeline,
        saturate: -0.4,
        duration: 400,
        onComplete: () => {
          // Stop GameScene, launch GameOverScene
          this.scene.pause();
          this.scene.launch('GameOverScene', {
            victory: victory,
            score: this.gameState.score,
            highScore: this.gameState.highScore
          });
        }
      });
    });
  });
}
```

---

## 15. File Structure (Single HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Castle Clash Duel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #1B1F2A;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    #game-container {
      max-width: 100vw;
      max-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
  <script>
    // === CONSTANTS ===
    const MAP = { /* ... */ };
    const UNIT_STATS = { /* ... */ };
    const COLORS = { /* ... */ };

    // === CLASSES ===
    class Unit extends Phaser.Physics.Arcade.Sprite { /* ... */ }
    class Castle extends Phaser.GameObjects.Sprite { /* ... */ }
    class Arrow extends Phaser.Physics.Arcade.Sprite { /* ... */ }
    class HealthBar { /* ... */ }
    class AIController { /* ... */ }
    class SupplyManager { /* ... */ }

    // === SCENES ===
    class BootScene extends Phaser.Scene { /* ... */ }
    class MenuScene extends Phaser.Scene { /* ... */ }
    class GameScene extends Phaser.Scene { /* ... */ }
    class UIScene extends Phaser.Scene { /* ... */ }
    class PauseScene extends Phaser.Scene { /* ... */ }
    class GameOverScene extends Phaser.Scene { /* ... */ }

    // === GAME CONFIG ===
    const config = {
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      parent: 'game-container',
      backgroundColor: '#7FAE5E',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: [BootScene, MenuScene, GameScene, UIScene, PauseScene, GameOverScene]
    };

    // === START ===
    new Phaser.Game(config);
  </script>
</body>
</html>
```

---

## 16. Asset Path Reference

All paths relative to `/assets/tinyswords/`:

```javascript
const ASSET_PATHS = {
  // Terrain
  tilemap: 'Terrain/Tileset/Tilemap_color1.png',
  waterBg: 'Terrain/Tileset/Water Background color.png',
  shadow: 'Terrain/Tileset/Shadow.png',

  // Buildings
  castleBlue: 'Buildings/Blue Buildings/Castle.png',
  castleRed: 'Buildings/Red Buildings/Castle.png',

  // Units (template)
  unit: (team, type, anim) => `Units/${team} Units/${type}/${anim}.png`,

  // Particles
  dust01: 'Particle FX/Dust_01.png',
  dust02: 'Particle FX/Dust_02.png',
  explosion01: 'Particle FX/Explosion_01.png',

  // UI
  cursor: 'UI Elements/UI Elements/Cursors/Cursor_01.png',
  buttonBlue: 'UI Elements/UI Elements/Buttons/SmallBlueSquareButton_Regular.png',
  buttonBluePressed: 'UI Elements/UI Elements/Buttons/SmallBlueSquareButton_Pressed.png',
  barBase: 'UI Elements/UI Elements/Bars/BigBar_Base.png',
  barFill: 'UI Elements/UI Elements/Bars/BigBar_Fill.png'
};
```

---

## 17. Implementation Checklist

### Phase 1: Core Setup
- [ ] HTML structure with Phaser CDN
- [ ] Game config with Arcade physics
- [ ] BootScene with asset loading + progress bar
- [ ] MenuScene with start button

### Phase 2: Battlefield
- [ ] Procedural tilemap generation
- [ ] Castle placement (blue/red)
- [ ] Camera setup (fixed, centered)

### Phase 3: Units
- [ ] Unit base class with physics
- [ ] Warrior implementation
- [ ] Archer implementation with projectiles
- [ ] Animation system (idle/run/attack)
- [ ] Health bars

### Phase 4: Controls
- [ ] Desktop: click select, right-click command
- [ ] Desktop: box selection
- [ ] Desktop: hotkeys (W, A, P, ESC)
- [ ] Touch: tap select, tap command
- [ ] Touch: double-tap select all

### Phase 5: Combat
- [ ] Target finding (aggro radius)
- [ ] Attack execution with windup
- [ ] Damage application
- [ ] Arrow projectiles
- [ ] Castle damage

### Phase 6: AI
- [ ] AIController with spawn cadence
- [ ] Composition logic (counter archers)
- [ ] Attack-move behavior

### Phase 7: Economy
- [ ] Supply manager
- [ ] Spawn buttons with costs
- [ ] Denied spawn feedback

### Phase 8: Game Feel
- [ ] Selection visuals
- [ ] Command markers
- [ ] Screen shake
- [ ] Near-miss system
- [ ] Death sequences
- [ ] Idle breathing

### Phase 9: UI & Polish
- [ ] UIScene HUD layer
- [ ] Score + high score display
- [ ] Castle HP bars
- [ ] Controls hints
- [ ] PauseScene
- [ ] GameOverScene

### Phase 10: Final
- [ ] Progressive intensity
- [ ] Milestone celebrations
- [ ] LocalStorage persistence
- [ ] Mobile testing
- [ ] Performance optimization

---

## 18. Performance Considerations

1. **Object Pooling**: Reuse arrows and particle effects via `setActive(false)` rather than `destroy()`
2. **Depth Sorting**: Only sort Y-depth for units, not every frame for static objects
3. **Collision Groups**: Separate physics groups to minimize collision checks
4. **Tilemap**: Use static tiles, no per-frame updates
5. **Text Objects**: Cache text objects, update only when values change
6. **Tweens**: Clean up completed tweens to prevent memory leaks

---

## 19. Testing Scenarios

1. **Spawn Stress Test**: Spam spawn buttons, verify supply limits work
2. **Combat Balance**: Verify warriors beat archers at close range, archers at distance
3. **AI Scaling**: Let match run 5 minutes, verify AI ramps correctly
4. **Touch Controls**: Test on mobile device, verify hit areas
5. **Near-Miss**: Verify Save/Dodge triggers correctly with timing
6. **Game Over**: Test both victory and defeat paths
7. **Persistence**: Verify high score saves/loads from localStorage
