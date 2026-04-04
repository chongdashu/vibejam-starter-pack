# Layer System

Comprehensive guide to the Tiny Swords tilemap layer architecture.

## Layer Philosophy

The layer system creates **pseudo-3D depth** through careful ordering. Each layer serves a specific visual purpose, and skipping layers breaks the illusion.

## Complete Layer Stack

From bottom (rendered first) to top (rendered last):

```
Layer Index | Layer Name           | Purpose
------------|---------------------|----------------------------------
0           | BG Color            | Water/void fill
1           | Water Foam          | Animated water edge effect
2           | Flat Ground         | Base walkable terrain
3           | Shadow (Level 1)    | Depth for first elevation
4           | Elevated (Level 1)  | First raised terrain
5           | Shadow (Level 2)    | Depth for second elevation
6           | Elevated (Level 2)  | Second raised terrain
...         | ...                 | Pattern repeats for more levels
N           | Decorations         | Trees, rocks, buildings (optional)
N+1         | Units/Characters    | Moving entities (optional)
```

## Layer Rendering Order

**Critical**: Layers MUST be rendered in order from lowest index to highest. Later layers occlude earlier layers.

```javascript
// Correct rendering order
function renderMap(layers) {
  // Sort by layer index ascending
  layers.sort((a, b) => a.index - b.index);

  for (const layer of layers) {
    renderLayer(layer);
  }
}
```

## Layer Types Explained

### BG Color Layer (Index 0)

The bottommost layer fills empty space with water background color.

```javascript
// Fill entire canvas with water background
ctx.fillStyle = '#3498db'; // Or use Water Background color.png
ctx.fillRect(0, 0, canvasWidth, canvasHeight);
```

### Water Foam Layer (Index 1)

Animated sprites at water/land boundaries.

**Key requirements**:
- Place along edges where Flat Ground meets water
- Stagger animation start frames
- Loop continuously

```javascript
class FoamSprite {
  constructor(x, y, totalFrames) {
    this.x = x;
    this.y = y;
    this.currentFrame = Math.floor(Math.random() * totalFrames);
    this.totalFrames = totalFrames;
  }

  update(deltaTime) {
    // Advance frame based on time
    this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
  }
}
```

### Flat Ground Layer (Index 2)

The lowest elevation walkable terrain. Directly adjacent to water.

**Tile selection**:
- Use edge tiles where adjacent to water
- Use fill tiles for interior
- Use corner tiles for diagonal water adjacency

### Shadow Layers (Index 3, 5, 7, ...)

Shadow layers appear **immediately before** their corresponding elevated ground.

**Positioning rule**: Shadow at grid (x, y+1) for elevated ground at (x, y).

```javascript
function addShadowForElevation(elevatedTileX, elevatedTileY, layerIndex) {
  const shadowLayer = layerIndex - 1; // Shadow is always one layer below
  const shadowY = elevatedTileY + 1;  // Shadow is one tile below

  placeShadow(elevatedTileX, shadowY, shadowLayer);
}
```

### Elevated Ground Layers (Index 4, 6, 8, ...)

Raised terrain with two cliff edge types:

1. **Terrain-facing cliffs**: Used when adjacent to lower walkable ground
2. **Water-facing cliffs**: Used when adjacent to water

```javascript
function selectCliffType(tile, adjacentTile) {
  if (adjacentTile.type === 'WATER') {
    return 'water_cliff';
  } else if (adjacentTile.elevation < tile.elevation) {
    return 'terrain_cliff';
  } else {
    return 'fill'; // Same elevation, use center tile
  }
}
```

## Multi-Elevation Example

A map with 3 elevation levels:

```
Level 0 (Water): BG Color
Level 1 (Beach): Water Foam + Flat Ground
Level 2 (Grass): Shadow + Elevated (color1)
Level 3 (Hill):  Shadow + Elevated (color3)
Level 4 (Peak):  Shadow + Elevated (color5)
```

**Total layers**: 9 (BG, Foam, Flat, Shadow1, Elev1, Shadow2, Elev2, Shadow3, Elev3)

## Layer Data Structure

```javascript
const mapData = {
  width: 20,    // tiles
  height: 15,   // tiles
  layers: [
    {
      index: 0,
      name: 'background',
      type: 'fill',
      color: '#2980b9'
    },
    {
      index: 1,
      name: 'water_foam',
      type: 'animated',
      tiles: [
        { x: 0, y: 5, frameOffset: 0 },
        { x: 1, y: 5, frameOffset: 2 },
        // ...
      ]
    },
    {
      index: 2,
      name: 'flat_ground',
      type: 'static',
      tileset: 'Tilemap_color2.png',
      tiles: [
        { x: 0, y: 6, tileId: 'center' },
        { x: 1, y: 6, tileId: 'edge_north' },
        // ...
      ]
    },
    // ... more layers
  ]
};
```

## Z-Index Considerations for Game Engines

When using game engines (Phaser, PixiJS, etc.), map layer indices to z-index values:

```javascript
// Reserve z-index ranges for different purposes
const Z_INDEX = {
  BACKGROUND: 0,
  WATER_FOAM: 10,
  FLAT_GROUND: 20,
  SHADOWS_START: 30,      // 30, 50, 70, ...
  ELEVATION_START: 40,    // 40, 60, 80, ...
  DECORATIONS: 1000,
  UNITS: 2000,
  UI: 3000
};

function getElevationZIndex(level) {
  return Z_INDEX.ELEVATION_START + (level - 1) * 20;
}

function getShadowZIndex(level) {
  return Z_INDEX.SHADOWS_START + (level - 1) * 20;
}
```

## Performance Optimization

### Static Layer Caching

Layers that don't animate can be pre-rendered to off-screen canvases:

```javascript
// Cache static layers
const staticLayerCanvas = document.createElement('canvas');
const staticCtx = staticLayerCanvas.getContext('2d');

// Render BG, Flat Ground, Shadows, Elevated once
renderStaticLayers(staticCtx);

// In game loop, only re-render animated layers
function render() {
  ctx.drawImage(staticLayerCanvas, 0, 0);  // Cached static
  renderWaterFoam(ctx);                     // Animated
  renderUnits(ctx);                         // Dynamic
}
```

### Culling Off-Screen Tiles

Only render tiles visible in the viewport:

```javascript
function getVisibleTiles(viewport, tileSize) {
  const startX = Math.floor(viewport.x / tileSize);
  const startY = Math.floor(viewport.y / tileSize);
  const endX = Math.ceil((viewport.x + viewport.width) / tileSize);
  const endY = Math.ceil((viewport.y + viewport.height) / tileSize);

  return { startX, startY, endX, endY };
}
```
