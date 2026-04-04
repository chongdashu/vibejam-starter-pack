import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private map!: Phaser.Tilemaps.Tilemap;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;

  // Background layers for parallax scrolling
  private bgLayer1!: Phaser.GameObjects.TileSprite;
  private bgLayer2!: Phaser.GameObjects.TileSprite;
  private bgLayer3!: Phaser.GameObjects.TileSprite;

  // Track how far ground has been generated
  private groundGeneratedToX: number = 0;

  // Attack state
  private isAttacking: boolean = false;

  constructor() {
    super("GameScene");
  }

  create(): void {
    // === BACKGROUND LAYERS (Parallax) ===
    // These are fixed to camera but we'll scroll their texture in update()
    // Layer 1 - furthest (sky/distant)
    this.bgLayer1 = this.add.tileSprite(0, 0, 320, 180, "oakwoods-bg-layer1")
      .setOrigin(0, 0)
      .setScrollFactor(0);

    // Layer 2 - mid distance
    this.bgLayer2 = this.add.tileSprite(0, 0, 320, 180, "oakwoods-bg-layer2")
      .setOrigin(0, 0)
      .setScrollFactor(0);

    // Layer 3 - nearest (foreground trees)
    this.bgLayer3 = this.add.tileSprite(0, 0, 320, 180, "oakwoods-bg-layer3")
      .setOrigin(0, 0)
      .setScrollFactor(0);

    // === GROUND TILEMAP ===
    // Create a wide tilemap for infinite scrolling (500 tiles = ~12000px)
    this.map = this.make.tilemap({
      tileWidth: 24,
      tileHeight: 24,
      width: 500,
      height: 8,
    });

    // Add the tileset image to the map
    const tileset = this.map.addTilesetImage("oakwoods-tileset");
    if (!tileset) {
      console.error("Failed to add tileset");
      return;
    }

    // Create a blank layer (y=16 anchors ground to bottom of 180px viewport)
    const layer = this.map.createBlankLayer("ground", tileset, 0, 16);
    if (!layer) {
      console.error("Failed to create layer");
      return;
    }
    this.groundLayer = layer;

    // Fill initial ground (first 20 tiles)
    for (let x = 0; x < 20; x++) {
      this.map.putTileAt(0, x, 7, true, "ground");
    }
    this.groundGeneratedToX = 20;

    // Enable collision on all tiles in the ground layer
    this.groundLayer.setCollisionByExclusion([-1]);

    // === DECORATIONS ===
    // Ground surface at bottom of viewport
    const groundY = 184;

    // Shop in the background (behind player)
    this.add.image(250, groundY, "oakwoods-shop").setOrigin(0.5, 1);

    // Lamp posts
    this.add.image(50, groundY, "oakwoods-lamp").setOrigin(0.5, 1);
    this.add.image(180, groundY, "oakwoods-lamp").setOrigin(0.5, 1);

    // Sign
    this.add.image(320, groundY, "oakwoods-sign").setOrigin(0.5, 1);

    // Fences
    this.add.image(400, groundY, "oakwoods-fence1").setOrigin(0.5, 1);
    this.add.image(470, groundY, "oakwoods-fence2").setOrigin(0.5, 1);

    // Rocks scattered around
    this.add.image(140, groundY, "oakwoods-rock1").setOrigin(0.5, 1);
    this.add.image(350, groundY, "oakwoods-rock2").setOrigin(0.5, 1);
    this.add.image(550, groundY, "oakwoods-rock3").setOrigin(0.5, 1);

    // Grass tufts on the ground
    this.add.image(70, groundY, "oakwoods-grass1").setOrigin(0.5, 1);
    this.add.image(120, groundY, "oakwoods-grass2").setOrigin(0.5, 1);
    this.add.image(200, groundY, "oakwoods-grass3").setOrigin(0.5, 1);
    this.add.image(280, groundY, "oakwoods-grass1").setOrigin(0.5, 1);
    this.add.image(380, groundY, "oakwoods-grass2").setOrigin(0.5, 1);
    this.add.image(450, groundY, "oakwoods-grass3").setOrigin(0.5, 1);

    // === PLAYER CHARACTER ===
    // Create physics sprite at starting position
    // Ground is at y=168, player origin is center, so spawn above ground
    this.player = this.physics.add.sprite(100, 120, "oakwoods-char-blue", 0);

    // Configure physics body - no world bounds (infinite scroll)
    this.player.setBounce(0);

    // Adjust hitbox - character sprite is 56x56 but actual character is smaller
    // Set a smaller hitbox aligned with character's feet at bottom of sprite
    this.player.body?.setSize(20, 38);
    this.player.body?.setOffset(18, 16);

    // Add collision between player and ground
    this.physics.add.collider(this.player, this.groundLayer);

    // === CAMERA ===
    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(50, 50);

    // Set world bounds - no left bound limit, very large right bound
    this.physics.world.setBounds(0, 0, 500 * 24, 180);
    // But player can only be stopped by left edge
    this.player.setCollideWorldBounds(true);
    this.player.body?.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, 999999, 180));

    // === ANIMATIONS ===
    // Create idle animation (frames 0-5)
    this.anims.create({
      key: "char-blue-idle",
      frames: this.anims.generateFrameNumbers("oakwoods-char-blue", {
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // Create run animation (frames 16-21)
    this.anims.create({
      key: "char-blue-run",
      frames: this.anims.generateFrameNumbers("oakwoods-char-blue", {
        start: 16,
        end: 21,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Create jump animation (frames 28-31)
    this.anims.create({
      key: "char-blue-jump",
      frames: this.anims.generateFrameNumbers("oakwoods-char-blue", {
        start: 28,
        end: 31,
      }),
      frameRate: 10,
      repeat: 0,
    });

    // Create fall animation (frames 35-37)
    this.anims.create({
      key: "char-blue-fall",
      frames: this.anims.generateFrameNumbers("oakwoods-char-blue", {
        start: 35,
        end: 37,
      }),
      frameRate: 10,
      repeat: 0,
    });

    // Create attack animation (frames 8-13)
    this.anims.create({
      key: "char-blue-attack",
      frames: this.anims.generateFrameNumbers("oakwoods-char-blue", {
        start: 8,
        end: 13,
      }),
      frameRate: 12,
      repeat: 0,
    });

    // Play idle animation by default
    this.player.anims.play("char-blue-idle", true);

    // Listen for attack animation complete
    this.player.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      if (anim.key === "char-blue-attack") {
        this.isAttacking = false;
      }
    });

    // === INPUT ===
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  update(): void {
    const speed = 100;
    const jumpVelocity = -250;

    // Check if player is on the ground
    const onGround = this.player.body?.blocked.down;
    const velocityY = this.player.body?.velocity.y ?? 0;
    const isMovingHorizontally = this.cursors.left.isDown || this.cursors.right.isDown;

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump (only when on ground and not attacking)
    if (this.cursors.up.isDown && onGround && !this.isAttacking) {
      this.player.setVelocityY(jumpVelocity);
    }

    // Attack (spacebar, only when on ground and not already attacking)
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && onGround && !this.isAttacking) {
      this.isAttacking = true;
      this.player.setVelocityX(0); // Stop movement during attack
      this.player.anims.play("char-blue-attack", true);
    }

    // === ANIMATION STATE MACHINE ===
    // Skip animation updates if attacking - let attack animation complete
    if (!this.isAttacking) {
      if (!onGround) {
        // In the air
        if (velocityY < 0) {
          // Rising - play jump animation
          this.player.anims.play("char-blue-jump", true);
        } else {
          // Falling - play fall animation
          this.player.anims.play("char-blue-fall", true);
        }
      } else {
        // On the ground
        if (isMovingHorizontally) {
          // Moving - play run animation
          this.player.anims.play("char-blue-run", true);
        } else {
          // Standing still - play idle animation
          this.player.anims.play("char-blue-idle", true);
        }
      }
    }

    // === PARALLAX SCROLLING ===
    // Scroll background layers based on camera position
    const camX = this.cameras.main.scrollX;
    this.bgLayer1.tilePositionX = camX * 0.1; // Slowest - furthest
    this.bgLayer2.tilePositionX = camX * 0.3; // Medium
    this.bgLayer3.tilePositionX = camX * 0.5; // Fastest - nearest

    // === INFINITE GROUND GENERATION ===
    // Generate more ground tiles as player approaches the edge
    const playerTileX = Math.floor(this.player.x / 24);
    const generateAhead = 20; // Generate 20 tiles ahead of player

    if (playerTileX + generateAhead > this.groundGeneratedToX) {
      // Generate more ground tiles
      const tilesToGenerate = (playerTileX + generateAhead) - this.groundGeneratedToX;
      for (let i = 0; i < tilesToGenerate; i++) {
        const x = this.groundGeneratedToX + i;
        if (x < 500) { // Don't exceed map width
          this.map.putTileAt(0, x, 7, true, "ground");
        }
      }
      this.groundGeneratedToX = Math.min(playerTileX + generateAhead, 500);
    }
  }
}
