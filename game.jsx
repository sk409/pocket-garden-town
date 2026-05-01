// game.jsx — Game state, scoring, tile generation, isometric helpers.

const GRID_SIZE = 5; // 5x5 island
const HAND_SIZE = 4;
const TURNS = 12; // tiles to place per game

// Build a deterministic-ish pool weighted by tile rarity
const TILE_POOL = [
  { type: 'grass',    weight: 14 },
  { type: 'tree',     weight: 12 },
  { type: 'pine',     weight: 10 },
  { type: 'flower',   weight: 9 },
  { type: 'pond',     weight: 5 },
  { type: 'house',    weight: 11 },
  { type: 'cottage',  weight: 9 },
  { type: 'shop',     weight: 6 },
  { type: 'cafe',     weight: 5 },
  { type: 'fountain', weight: 3 },
  { type: 'bridge',   weight: 4 },
  { type: 'windmill', weight: 3 },
];

function pickWeighted(rng = Math.random) {
  const total = TILE_POOL.reduce((s, p) => s + p.weight, 0);
  let r = rng() * total;
  for (const p of TILE_POOL) {
    r -= p.weight;
    if (r <= 0) return p.type;
  }
  return TILE_POOL[0].type;
}

// Iso transforms
function isoToScreen(gx, gy, tileW = 64, tileH = 32) {
  return {
    x: (gx - gy) * (tileW / 2),
    y: (gx + gy) * (tileH / 2),
  };
}

// Drop-zone hit test (rough): given a grid origin and pointer xy,
// return the {gx, gy} cell or null.
function screenToIso(px, py, originX, originY, tileW = 64, tileH = 32) {
  const x = px - originX;
  const y = py - originY;
  const gx = (x / (tileW / 2) + y / (tileH / 2)) / 2;
  const gy = (y / (tileH / 2) - x / (tileW / 2)) / 2;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  if (ix < 0 || iy < 0 || ix >= GRID_SIZE || iy >= GRID_SIZE) return null;
  return { gx: ix, gy: iy };
}

// ─── Scoring ─────────────────────────────────────────────────────────────
// Adjacency-based bonuses. Returns { delta, label } or null.
function scorePlacement(grid, gx, gy, type) {
  const TILE = TILE_TYPES[type];
  if (!TILE) return { delta: 0, bonuses: [] };

  const base = TILE.baseScore;
  const bonuses = [];
  const neighbors = [
    [gx - 1, gy], [gx + 1, gy], [gx, gy - 1], [gx, gy + 1],
  ];
  const adjTypes = neighbors
    .map(([x, y]) => (grid[y]?.[x] || null))
    .filter(Boolean);

  const isNature = (t) => t && TILE_TYPES[t].cat === 'nature';
  const isBuilding = (t) => t && TILE_TYPES[t].cat === 'building';

  // Building next to nature → "緑のある暮らし"
  if (TILE.cat === 'building') {
    const greens = adjTypes.filter(isNature).length;
    if (greens >= 1) bonuses.push({ delta: 20 * greens, label: '緑のある暮らし', en: 'Green Living' });
  }
  // Nature next to nature → "やすらぎ"
  if (TILE.cat === 'nature') {
    const greens = adjTypes.filter(isNature).length;
    if (greens >= 2) bonuses.push({ delta: 15, label: 'やすらぎ', en: 'Tranquility' });
  }
  // Building cluster → "にぎわい"
  if (TILE.cat === 'building') {
    const builds = adjTypes.filter(isBuilding).length;
    if (builds >= 2) bonuses.push({ delta: 25, label: 'にぎわい', en: 'Bustle' });
  }
  // Fountain / windmill near building → "シンボル"
  if (type === 'fountain' || type === 'windmill') {
    const builds = adjTypes.filter(isBuilding).length;
    if (builds >= 1) bonuses.push({ delta: 30, label: 'まちのシンボル', en: 'Landmark' });
  }
  // Bridge over water (pond adjacent) → "わたりばし"
  if (type === 'bridge') {
    const ponds = adjTypes.filter(t => t === 'pond').length;
    if (ponds >= 1) bonuses.push({ delta: 25, label: 'わたりばし', en: 'Crossing' });
  }
  // Pond + flower → "花のほとり"
  if (type === 'flower' || type === 'pond') {
    const has = adjTypes.some(t =>
      (type === 'flower' && t === 'pond') ||
      (type === 'pond' && t === 'flower')
    );
    if (has) bonuses.push({ delta: 18, label: '花のほとり', en: 'Lakeside Bloom' });
  }

  const delta = base + bonuses.reduce((s, b) => s + b.delta, 0);
  return { delta, base, bonuses };
}

// Empty grid
function makeEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

// Pre-seed grid with a couple of grass tiles for visual interest at start
function makeStartingGrid() {
  const g = makeEmptyGrid();
  // a small starting cluster
  g[2][2] = 'grass';
  return g;
}

// Build a hand of N tiles
function makeHand(n = HAND_SIZE) {
  return Array.from({ length: n }, () => ({ id: Math.random().toString(36).slice(2, 9), type: pickWeighted() }));
}

// Daily missions (static for prototype)
const DAILY_MISSIONS = [
  { id: 'm1', text: '建物を3つ配置する',         en: 'Place 3 buildings',   target: 3, type: 'building' },
  { id: 'm2', text: '景観スコア 200 を達成',     en: 'Reach score 200',     target: 200, type: 'score' },
  { id: 'm3', text: '自然タイルを5つ配置する',   en: 'Place 5 nature tiles', target: 5, type: 'nature' },
];

Object.assign(window, {
  GRID_SIZE, HAND_SIZE, TURNS,
  pickWeighted, isoToScreen, screenToIso,
  scorePlacement, makeEmptyGrid, makeStartingGrid, makeHand,
  DAILY_MISSIONS,
});
