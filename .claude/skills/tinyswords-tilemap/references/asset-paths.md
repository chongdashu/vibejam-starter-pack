# Asset Paths

Complete file paths for Tiny Swords tilemap assets in this project.

## Base Path

All assets are located under:
```
public/assets/tinyswords/
```

## Tileset Assets

### Core Tilemap Files

```
Terrain/Tileset/
├── Tilemap_color1.png    # Green grass variant
├── Tilemap_color2.png    # Sand/beach variant
├── Tilemap_color3.png    # Brown earth variant
├── Tilemap_color4.png    # Gray stone variant
├── Tilemap_color5.png    # Dark/purple variant
├── Shadow.png            # 128x128 elevation shadow
├── Water Foam.png        # Animated water edge (sprite sheet)
├── Water Foam.aseprite   # Source file for water animation
└── Water Background color.png  # Water fill color
```

### Full Paths for Import

```javascript
// ES Module imports (if using bundler)
import tilemap1 from '/assets/tinyswords/Terrain/Tileset/Tilemap_color1.png';
import tilemap2 from '/assets/tinyswords/Terrain/Tileset/Tilemap_color2.png';
import tilemap3 from '/assets/tinyswords/Terrain/Tileset/Tilemap_color3.png';
import tilemap4 from '/assets/tinyswords/Terrain/Tileset/Tilemap_color4.png';
import tilemap5 from '/assets/tinyswords/Terrain/Tileset/Tilemap_color5.png';
import shadow from '/assets/tinyswords/Terrain/Tileset/Shadow.png';
import waterFoam from '/assets/tinyswords/Terrain/Tileset/Water Foam.png';
import waterBg from '/assets/tinyswords/Terrain/Tileset/Water Background color.png';
```

```javascript
// Runtime loading (browser)
const ASSET_BASE = '/assets/tinyswords/Terrain/Tileset/';

const TILESET_PATHS = {
  tilemap: [
    `${ASSET_BASE}Tilemap_color1.png`,
    `${ASSET_BASE}Tilemap_color2.png`,
    `${ASSET_BASE}Tilemap_color3.png`,
    `${ASSET_BASE}Tilemap_color4.png`,
    `${ASSET_BASE}Tilemap_color5.png`,
  ],
  shadow: `${ASSET_BASE}Shadow.png`,
  waterFoam: `${ASSET_BASE}Water Foam.png`,
  waterBackground: `${ASSET_BASE}Water Background color.png`,
};
```

## Decoration Assets

### Rocks

```
Terrain/Decorations/Rocks/
├── Rock1.png
├── Rock2.png
├── Rock3.png
└── Rock4.png
```

### Bushes

```
Terrain/Decorations/Bushes/
├── Bushe1.png
├── Bushe2.png
├── Bushe3.png
├── Bushe4.png
└── Bushes.aseprite
```

### Clouds

```
Terrain/Decorations/Clouds/
├── Clouds_01.png
├── Clouds_02.png
├── Clouds_03.png
├── Clouds_04.png
├── Clouds_05.png
├── Clouds_06.png
├── Clouds_07.png
├── Clouds_08.png
└── Clouds.aseprite
```

### Water Rocks

```
Terrain/Decorations/Rocks in the Water/
├── Water Rocks_01.png
├── Water Rocks_01.aseprite
├── Water Rocks_02.png
├── Water Rocks_02.aseprite
├── Water Rocks_03.png
├── Water Rocks_03.aseprite
├── Water Rocks_04.png
└── Water Rocks_04.aseprite
```

### Rubber Duck (Easter Egg)

```
Terrain/Decorations/Rubber Duck/
├── Rubber duck.png
└── Rubber Duck.aseprite
```

## Resource Assets

### Trees

```
Terrain/Resources/Wood/Trees/
├── Tree1.png
├── Tree2.png
├── Tree3.png
├── Tree4.png
├── Stump 1.png
├── Stump 2.png
├── Stump 3.png
├── Stump 4.png
└── Trees.aseprite
```

### Gold

```
Terrain/Resources/Gold/Gold Stones/
├── Gold Stone 1.png
├── Gold Stone 1_Highlight.png
├── Gold Stone 2.png
├── Gold Stone 2_Highlight.png
├── Gold Stone 3.png
├── Gold Stone 3_Highlight.png
├── Gold Stone 4.png
├── Gold Stone 4_Highlight.png
├── Gold Stone 5.png
├── Gold Stone 5_Highlight.png
├── Gold Stone 6.png
├── Gold Stone 6_Highlight.png
└── Gold Stones.aseprite

Terrain/Resources/Gold/Gold Resource/
├── Gold_Resource.png
├── Gold_Resource_Highlight.png
└── Gold Resource.aseprite
```

### Wood Resource

```
Terrain/Resources/Wood/Wood Resource/
└── Wood Resource.png
```

### Meat

```
Terrain/Resources/Meat/Meat Resource/
└── Meat Resource.png

Terrain/Resources/Meat/Sheep/
├── Sheep_Idle.png
├── Sheep_Grass.png
├── Sheep_Move.png
└── Sheep.aseprite
```

### Tools

```
Terrain/Resources/Tools/
├── Tool_01.png
├── Tool_02.png
├── Tool_03.png
└── Tool_04.png
```

## Building Assets

Buildings are available in 5 team colors: Blue, Red, Yellow, Black, Purple

```
Buildings/{Color} Buildings/
├── Castle.png
├── Tower.png
├── House1.png
├── House2.png
└── House3.png
```

Example paths:
```javascript
const BUILDING_COLORS = ['Blue', 'Red', 'Yellow', 'Black', 'Purple'];

function getBuildingPath(color, building) {
  return `/assets/tinyswords/Buildings/${color} Buildings/${building}.png`;
}

// Usage
getBuildingPath('Blue', 'Castle');  // '/assets/tinyswords/Buildings/Blue Buildings/Castle.png'
```

## Unit Assets

Units are available in 5 team colors with multiple animation states.

```
Units/{Color} Units/{UnitType}/
└── {UnitType}_{Animation}.png
```

### Unit Types and Animations

| Unit | Animations |
|------|------------|
| Warrior | Idle, Run, Attack1, Attack2, Guard |
| Archer | Idle, Run, Shoot + Arrow.png |
| Lancer | Idle, Run, + 8-directional Attack/Defence |

Example path:
```javascript
function getUnitPath(color, unitType, animation) {
  return `/assets/tinyswords/Units/${color} Units/${unitType}/${unitType}_${animation}.png`;
}

// Usage
getUnitPath('Blue', 'Warrior', 'Idle');  // '/assets/tinyswords/Units/Blue Units/Warrior/Warrior_Idle.png'
```

## Asset Loading Helper

```javascript
class TinySwordsAssets {
  constructor(basePath = '/assets/tinyswords') {
    this.basePath = basePath;
    this.cache = new Map();
  }

  async loadImage(path) {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    const img = new Image();
    img.src = `${this.basePath}/${path}`;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    this.cache.set(path, img);
    return img;
  }

  async loadTileset(colorIndex = 1) {
    return this.loadImage(`Terrain/Tileset/Tilemap_color${colorIndex}.png`);
  }

  async loadShadow() {
    return this.loadImage('Terrain/Tileset/Shadow.png');
  }

  async loadWaterFoam() {
    return this.loadImage('Terrain/Tileset/Water Foam.png');
  }

  async loadAllTilesets() {
    return Promise.all([
      this.loadTileset(1),
      this.loadTileset(2),
      this.loadTileset(3),
      this.loadTileset(4),
      this.loadTileset(5),
      this.loadShadow(),
      this.loadWaterFoam(),
    ]);
  }
}
```
