# Phaser Core Patterns (Scenes, Objects, Input, Assets)

Practical Phaser 3 snippets and patterns that are helpful to copy/adapt during implementation.

## Contents

- Game configuration (scale, physics, scenes)
- Scene lifecycle + transitions
- Common game objects + sprite creation
- Physics overview (Arcade and Matter)
- Input handling (keyboard + pointer)
- Animations (create + play)
- Asset loading + Boot scene loading bar
- Suggested project structure + ES module setup

---

## Game Configuration

### Minimal configuration

```javascript
const config = {
  type: Phaser.AUTO,           // WebGL with Canvas fallback
  width: 800,
  height: 600,
  scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);
```

### Common “full” configuration pattern

```javascript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',    // DOM element ID
  backgroundColor: '#2d2d2d',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false              // Enable during development
    }
  },

  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};
```

### Physics system choice

| System | Use when |
|---|---|
| Arcade | Platformers, shooters, most 2D games; fast AABB collisions |
| Matter | Physics puzzles, ragdolls, realistic collisions; slower but more accurate |
| None | Menu scenes, visual novels, card games |

---

## Scene Architecture

### Scene lifecycle methods

```javascript
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');        // Scene key for reference
  }

  init(data) {
    // Receive data from previous scene
    this.level = data.level || 1;
  }

  preload() {
    // Load assets before create()
    this.load.image('player', 'assets/player.png');
    this.load.spritesheet('enemy', 'assets/enemy.png', {
      frameWidth: 32, frameHeight: 32
    });
  }

  create() {
    // Set up objects, physics, input
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    // Game loop; delta = ms since last frame
    this.player.x += this.speed * (delta / 1000);
  }
}
```

### Scene transitions

```javascript
// Start a new scene (stops current)
this.scene.start('GameOverScene', { score: this.score });

// Launch scene in parallel (both run)
this.scene.launch('UIScene');

// Pause/resume scenes
this.scene.pause('GameScene');
this.scene.resume('GameScene');

// Stop a scene
this.scene.stop('UIScene');
```

### Recommended scene structure

```
scenes/
├── BootScene.js      # Asset loading, progress bar
├── MenuScene.js      # Title screen, options
├── GameScene.js      # Main gameplay
├── UIScene.js        # HUD overlay (launched parallel)
├── PauseScene.js     # Pause menu overlay
└── GameOverScene.js  # End screen, restart option
```

---

## Game Objects

### Common game objects

```javascript
// Images (static)
this.add.image(400, 300, 'background');

// Sprites (can animate)
const player = this.add.sprite(100, 100, 'player');

// Text
const score = this.add.text(16, 16, 'Score: 0', {
  fontSize: '32px',
  fill: '#fff'
});

// Graphics (draw shapes)
const graphics = this.add.graphics();
graphics.fillStyle(0xff0000);
graphics.fillRect(100, 100, 50, 50);

// Containers (group objects)
const container = this.add.container(400, 300, [sprite1, sprite2]);

// Tilemaps
const map = this.make.tilemap({ key: 'level1' });
```

### Sprite creation patterns

```javascript
// Basic sprite
const sprite = this.add.sprite(x, y, 'textureKey');

// Sprite with physics body
const bodySprite = this.physics.add.sprite(x, y, 'textureKey');

// From spritesheet frame
const framed = this.add.sprite(x, y, 'sheet', frameIndex);

// From atlas
const atlasSprite = this.add.sprite(x, y, 'atlas', 'frameName');
```

---

## Physics Systems

### Arcade physics (good default)

```javascript
// Enable physics on sprite
this.physics.add.sprite(x, y, 'player');

// Or add physics to existing sprite
this.physics.add.existing(sprite);

// Configure body
sprite.body.setVelocity(200, 0);
sprite.body.setBounce(0.5);
sprite.body.setCollideWorldBounds(true);
sprite.body.setGravityY(300);

// Collision detection
this.physics.add.collider(player, platforms);
this.physics.add.overlap(player, coins, collectCoin, null, this);

function collectCoin(player, coin) {
  coin.disableBody(true, true);
  this.score += 10;
}
```

### Physics groups

```javascript
// Static group (platforms, walls)
const platforms = this.physics.add.staticGroup();
platforms.create(400, 568, 'ground').setScale(2).refreshBody();

// Dynamic group (enemies, bullets)
const enemies = this.physics.add.group({
  key: 'enemy',
  repeat: 5,
  setXY: { x: 100, y: 0, stepX: 70 }
});

enemies.children.iterate(enemy => {
  enemy.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
});
```

### Matter physics (realistic collisions)

```javascript
// Config
physics: {
  default: 'matter',
  matter: {
    gravity: { y: 1 },
    debug: true
  }
}

// Create bodies
const ball = this.matter.add.circle(400, 100, 25);
const box = this.matter.add.rectangle(400, 400, 100, 50, { isStatic: true });

// Sprite with Matter body
const player = this.matter.add.sprite(100, 100, 'player');
player.setFriction(0.005);
player.setBounce(0.9);
```

---

## Input Handling

### Keyboard input

```javascript
// Cursor keys
this.cursors = this.input.keyboard.createCursorKeys();

// In update()
if (this.cursors.left.isDown) {
  player.setVelocityX(-160);
} else if (this.cursors.right.isDown) {
  player.setVelocityX(160);
}

if (this.cursors.up.isDown && player.body.touching.down) {
  player.setVelocityY(-330);  // Jump
}

// Custom keys
this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

// Key events
this.input.keyboard.on('keydown-SPACE', () => {
  this.fire();
});
```

### Pointer/mouse input

```javascript
// Click/tap
this.input.on('pointerdown', (pointer) => {
  console.log(pointer.x, pointer.y);
});

// Make object interactive
sprite.setInteractive();
sprite.on('pointerdown', () => sprite.setTint(0xff0000));
sprite.on('pointerup', () => sprite.clearTint());

// Drag
this.input.setDraggable(sprite);
this.input.on('drag', (pointer, obj, dragX, dragY) => {
  obj.x = dragX;
  obj.y = dragY;
});
```

---

## Animations

### Creating animations

```javascript
this.anims.create({
  key: 'walk',
  frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
  frameRate: 10,
  repeat: -1
});

this.anims.create({
  key: 'jump',
  frames: [{ key: 'player', frame: 4 }],
  frameRate: 20
});

// From atlas
this.anims.create({
  key: 'explode',
  frames: this.anims.generateFrameNames('atlas', {
    prefix: 'explosion_',
    start: 1,
    end: 8,
    zeroPad: 2
  }),
  frameRate: 16,
  hideOnComplete: true
});
```

### Playing animations

```javascript
sprite.anims.play('walk', true);  // ignore if already playing
sprite.anims.play('jump');
sprite.anims.stop();

sprite.on('animationcomplete', (anim) => {
  if (anim.key === 'die') sprite.destroy();
});
```

---

## Asset Loading

### Preload patterns

```javascript
preload() {
  this.load.image('sky', 'assets/sky.png');

  this.load.spritesheet('player', 'assets/player.png', {
    frameWidth: 32,
    frameHeight: 48
  });

  // Atlases (TexturePacker)
  this.load.atlas('sprites', 'assets/sprites.png', 'assets/sprites.json');

  // Tilemaps
  this.load.tilemapTiledJSON('map', 'assets/level1.json');
  this.load.image('tiles', 'assets/tileset.png');

  // Audio
  this.load.audio('bgm', 'assets/music.mp3');
  this.load.audio('sfx', ['assets/sound.ogg', 'assets/sound.mp3']);

  // Progress tracking
  this.load.on('progress', (value) => {
    console.log(`Loading: ${Math.round(value * 100)}%`);
  });
}
```

### Boot scene pattern (loading bar)

```javascript
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width/2 - 160, height/2 - 25, 320, 50);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width/2 - 150, height/2 - 15, 300 * value, 30);
    });

    // Load all game assets here
    this.load.image('player', 'assets/player.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
```

---

## Project Structure

### Suggested organization

```
game/
├── src/
│   ├── scenes/
│   ├── gameObjects/
│   ├── systems/
│   ├── config/
│   └── main.js
├── assets/
│   ├── images/
│   ├── audio/
│   ├── tilemaps/
│   └── fonts/
├── index.html
└── package.json
```

### ES module setup

```javascript
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import { gameConfig } from './config/gameConfig';

const config = {
  ...gameConfig,
  scene: [BootScene, GameScene]
};

new Phaser.Game(config);
```

