# Tile Specifications

Detailed technical specifications for Tiny Swords tilemap elements.

## Grid System

The entire tilemap operates on a **64x64 pixel grid**. All positioning, collision detection, and coordinate systems should use this as the base unit.

```
1 tile = 64px × 64px
Map coordinate (x, y) → pixel position (x * 64, y * 64)
```

## Tile Types and Dimensions

### Standard Tiles (64x64)

| Tile Type | Dimensions | Sprite Sheet Layout |
|-----------|------------|---------------------|
| Flat Ground | 64x64 | Single tile per variant |
| Elevated Ground | 64x64 | Includes edge pieces |
| Stairs | 64x64 | Top, center, bottom variants |
| Water Foam | 64x64 | Animation frames horizontal |
| BG Color | 64x64 | Solid fill tile |

### Oversized Sprites

| Sprite Type | Dimensions | Grid Placement |
|-------------|------------|----------------|
| Shadow | 128x128 | Centered on 64x64 grid cell |

The 128x128 shadow sprite creates overlap effects. When placed at grid position (x, y), it visually extends into adjacent cells, creating soft shadow transitions.

## Tilemap Color Variants

Each `Tilemap_colorN.png` contains the same tile arrangement in different color palettes:

| File | Suggested Use | Color Tone |
|------|---------------|------------|
| Tilemap_color1.png | Grass, meadows | Green |
| Tilemap_color2.png | Sand, beaches | Tan/Yellow |
| Tilemap_color3.png | Dirt, earth | Brown |
| Tilemap_color4.png | Stone, rock | Gray |
| Tilemap_color5.png | Dark terrain | Purple/Dark |

## Edge and Corner Pieces

Each tilemap spritesheet includes:

### Flat Ground Edges
- 4 cardinal edges (N, S, E, W)
- 4 outer corners (NE, NW, SE, SW)
- 4 inner corners (for concave shapes)
- 1 center fill tile

### Elevated Ground Edges
- **Cliff edges** (facing lower terrain): 4 cardinals + 4 corners
- **Water edges** (facing water): 4 cardinals + 4 corners
- Center fill tiles

### Edge Selection Logic

```
IF adjacent_tile is WATER:
    use water-facing cliff edge
ELSE IF adjacent_tile is LOWER_ELEVATION:
    use terrain-facing cliff edge
ELSE IF adjacent_tile is SAME_ELEVATION:
    use center fill or appropriate connection
```

## Water Foam Sprite Sheet

The `Water Foam.png` sprite sheet contains animation frames arranged horizontally.

| Property | Value |
|----------|-------|
| Frame size | 64x64 |
| Animation type | Loop |
| Frame count | Check sprite sheet width ÷ 64 |

### Frame Extraction

```javascript
// Extract frame N from sprite sheet
const frameWidth = 64;
const frameHeight = 64;
const sourceX = frameIndex * frameWidth;
const sourceY = 0;

ctx.drawImage(
  spriteSheet,
  sourceX, sourceY, frameWidth, frameHeight,  // source
  destX, destY, frameWidth, frameHeight       // destination
);
```

## Shadow Sprite

The `Shadow.png` is a single 128x128 sprite designed to be placed beneath elevated terrain.

### Positioning Algorithm

```javascript
// For elevated tile at grid position (gx, gy)
const shadowGridX = gx;
const shadowGridY = gy + 1;  // One tile below

// Convert to pixel position (shadow is 128x128, centered on 64x64 cell)
const shadowPixelX = shadowGridX * 64 - 32;  // Offset to center
const shadowPixelY = shadowGridY * 64 - 32;
```

## Coordinate Systems

### Grid Coordinates
- Origin: Top-left of map
- X: Increases rightward
- Y: Increases downward
- Unit: Tiles (64px)

### Pixel Coordinates
- Origin: Top-left of canvas
- X: Increases rightward
- Y: Increases downward
- Unit: Pixels

### Conversion Functions

```javascript
function gridToPixel(gridX, gridY) {
  return {
    x: gridX * 64,
    y: gridY * 64
  };
}

function pixelToGrid(pixelX, pixelY) {
  return {
    x: Math.floor(pixelX / 64),
    y: Math.floor(pixelY / 64)
  };
}
```
