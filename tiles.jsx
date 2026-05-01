// tiles.jsx — Isometric tile artwork (SVG) for Pocket Garden Town
// Each tile is a self-contained SVG drawn within a diamond footprint.
// TILE_W: 64, TILE_H: 32 (2:1 isometric).

const TILE_W = 64;
const TILE_H = 32;
const HALF_W = 32;
const HALF_H = 16;

// Re-usable diamond ground (slightly tinted by terrain)
function GroundDiamond({ fill = '#E8DFCB', stroke = 'rgba(0,0,0,0.06)' }) {
  return (
    <polygon
      points={`0,-${HALF_H} ${HALF_W},0 0,${HALF_H} -${HALF_W},0`}
      fill={fill}
      stroke={stroke}
      strokeWidth="0.5"
    />
  );
}

// Tile palette — drawn in local coords, centered on (0,0).
// Buildings sit on top of the diamond; the "y" lifts the volume up.
const TILE_ART = {
  grass: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.grass} stroke="rgba(80,110,80,0.18)" />
      {/* tiny grass tufts */}
      <ellipse cx="-8" cy="2" rx="2.5" ry="1" fill="rgba(0,0,0,0.06)" />
      <ellipse cx="6" cy="-3" rx="2" ry="0.8" fill="rgba(0,0,0,0.06)" />
      <ellipse cx="3" cy="6" rx="2" ry="0.8" fill="rgba(0,0,0,0.06)" />
    </g>
  ),

  tree: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.grass} stroke="rgba(80,110,80,0.18)" />
      {/* trunk */}
      <rect x="-1.5" y="-10" width="3" height="10" fill="#8a6a4a" rx="1" />
      {/* foliage — three blobs for hand-drawn feel */}
      <circle cx="-4" cy="-13" r="7" fill={palette.tree1} />
      <circle cx="5" cy="-15" r="7" fill={palette.tree2} />
      <circle cx="0" cy="-19" r="7" fill={palette.tree1} />
      {/* highlight */}
      <circle cx="-2" cy="-20" r="2.5" fill="rgba(255,255,255,0.35)" />
    </g>
  ),

  pine: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.grass} stroke="rgba(80,110,80,0.18)" />
      <rect x="-1.5" y="-8" width="3" height="8" fill="#7a5638" rx="1" />
      <polygon points="-7,-8 7,-8 0,-16" fill={palette.tree2} />
      <polygon points="-6,-13 6,-13 0,-20" fill={palette.tree1} />
      <polygon points="-5,-18 5,-18 0,-24" fill={palette.tree2} />
    </g>
  ),

  house: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.path} stroke="rgba(0,0,0,0.08)" />
      {/* base cube — left, right, top faces */}
      {/* left face */}
      <polygon points="-20,-2 -20,-14 0,-20 0,-8" fill={palette.houseBodyShade} />
      {/* right face */}
      <polygon points="20,-2 20,-14 0,-20 0,-8" fill={palette.houseBody} />
      {/* roof — pitched */}
      <polygon points="-22,-14 0,-26 0,-20" fill={palette.roofShade} />
      <polygon points="22,-14 0,-26 0,-20" fill={palette.roof} />
      <polygon points="-22,-14 0,-22 22,-14 0,-20" fill={palette.roof} opacity="0" />
      {/* roof peak ridge */}
      <line x1="-22" y1="-14" x2="0" y2="-26" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1="22" y1="-14" x2="0" y2="-26" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      {/* window */}
      <rect x="5" y="-15" width="6" height="6" fill="#fff8e0" rx="0.5" />
      <line x1="8" y1="-15" x2="8" y2="-9" stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />
      {/* door */}
      <rect x="-12" y="-12" width="5" height="8" fill={palette.door} rx="0.5" />
      {/* chimney */}
      <rect x="6" y="-26" width="3" height="5" fill={palette.roofShade} />
    </g>
  ),

  cottage: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.path} stroke="rgba(0,0,0,0.08)" />
      {/* squat body */}
      <polygon points="-18,-2 -18,-10 0,-16 0,-8" fill={palette.cottageBodyShade} />
      <polygon points="18,-2 18,-10 0,-16 0,-8" fill={palette.cottageBody} />
      {/* round-ish thatched roof */}
      <ellipse cx="0" cy="-16" rx="22" ry="6" fill={palette.thatch} />
      <ellipse cx="0" cy="-17" rx="20" ry="5" fill={palette.thatchLight} />
      {/* window */}
      <circle cx="6" cy="-9" r="2" fill="#fff8e0" />
      <circle cx="-7" cy="-7" r="1.8" fill="#fff8e0" />
    </g>
  ),

  shop: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.path} stroke="rgba(0,0,0,0.08)" />
      <polygon points="-22,-2 -22,-15 0,-21 0,-8" fill={palette.shopBodyShade} />
      <polygon points="22,-2 22,-15 0,-21 0,-8" fill={palette.shopBody} />
      {/* awning stripes */}
      <polygon points="-22,-15 0,-21 0,-17 -22,-11" fill={palette.terracotta} />
      <polygon points="22,-15 0,-21 0,-17 22,-11" fill={palette.terracotta} />
      <line x1="-15" y1="-19" x2="-15" y2="-13" stroke="#fff" strokeWidth="0.6" opacity="0.5" />
      <line x1="-8" y1="-21" x2="-8" y2="-15" stroke="#fff" strokeWidth="0.6" opacity="0.5" />
      <line x1="8" y1="-21" x2="8" y2="-15" stroke="#fff" strokeWidth="0.6" opacity="0.5" />
      <line x1="15" y1="-19" x2="15" y2="-13" stroke="#fff" strokeWidth="0.6" opacity="0.5" />
      {/* door */}
      <rect x="-3" y="-10" width="6" height="6" fill={palette.door} />
      {/* flat roof line */}
      <polygon points="-22,-15 0,-21 22,-15 0,-9" fill={palette.shopBody} opacity="0" />
    </g>
  ),

  cafe: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.path} stroke="rgba(0,0,0,0.08)" />
      <polygon points="-18,-2 -18,-12 0,-18 0,-8" fill={palette.cafeBodyShade} />
      <polygon points="18,-2 18,-12 0,-18 0,-8" fill={palette.cafeBody} />
      {/* roof — flat */}
      <polygon points="-20,-12 0,-20 20,-12 0,-16" fill={palette.roof} />
      {/* steam */}
      <circle cx="0" cy="-22" r="2" fill="rgba(255,255,255,0.7)">
        <animate attributeName="cy" values="-22;-28;-22" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="3" cy="-25" r="1.5" fill="rgba(255,255,255,0.5)">
        <animate attributeName="cy" values="-25;-32;-25" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="3.5s" repeatCount="indefinite" />
      </circle>
      {/* window */}
      <rect x="2" y="-12" width="8" height="5" fill="#fff8e0" rx="0.5" />
    </g>
  ),

  fountain: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.path} stroke="rgba(0,0,0,0.08)" />
      <ellipse cx="0" cy="-2" rx="14" ry="6" fill={palette.stone} />
      <ellipse cx="0" cy="-3" rx="11" ry="4.5" fill={palette.water} />
      {/* center spout */}
      <rect x="-1" y="-10" width="2" height="6" fill={palette.stone} />
      <circle cx="0" cy="-12" r="2.5" fill={palette.water}>
        <animate attributeName="r" values="2.5;3.2;2.5" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* drops */}
      <circle cx="-4" cy="-9" r="0.8" fill={palette.water}>
        <animate attributeName="cy" values="-9;-5;-9" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="4" cy="-9" r="0.8" fill={palette.water}>
        <animate attributeName="cy" values="-9;-5;-9" dur="1.7s" repeatCount="indefinite" />
      </circle>
    </g>
  ),

  pond: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.grass} stroke="rgba(80,110,80,0.18)" />
      <ellipse cx="0" cy="0" rx="22" ry="11" fill={palette.water} />
      <ellipse cx="-4" cy="-2" rx="6" ry="2" fill="rgba(255,255,255,0.35)" />
      {/* lily pad */}
      <ellipse cx="6" cy="2" rx="3" ry="1.5" fill={palette.tree2} />
      <circle cx="6" cy="1.5" r="0.8" fill="#fff8e0" />
    </g>
  ),

  flower: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.grass} stroke="rgba(80,110,80,0.18)" />
      {/* flower clusters */}
      <circle cx="-5" cy="-2" r="2" fill={palette.flowerA} />
      <circle cx="-3" cy="0" r="1.5" fill={palette.flowerB} />
      <circle cx="6" cy="-3" r="2" fill={palette.flowerB} />
      <circle cx="4" cy="-1" r="1.5" fill={palette.flowerA} />
      <circle cx="0" cy="3" r="1.8" fill={palette.flowerA} />
      <circle cx="2" cy="5" r="1.3" fill={palette.flowerB} />
      <circle cx="-7" cy="3" r="1.4" fill={palette.flowerB} />
    </g>
  ),

  bridge: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.water} stroke="rgba(80,110,140,0.25)" />
      <polygon points="-22,0 -10,-6 10,-6 22,0 10,6 -10,6" fill="#c8a878" />
      <line x1="-18" y1="-2" x2="-12" y2="-5" stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />
      <line x1="-12" y1="-5" x2="0" y2="-7" stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />
      <line x1="12" y1="-5" x2="0" y2="-7" stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />
      {/* railing */}
      <line x1="-10" y1="-6" x2="-10" y2="-10" stroke="#8a6a4a" strokeWidth="1" />
      <line x1="0" y1="-7" x2="0" y2="-12" stroke="#8a6a4a" strokeWidth="1" />
      <line x1="10" y1="-6" x2="10" y2="-10" stroke="#8a6a4a" strokeWidth="1" />
      <line x1="-10" y1="-10" x2="10" y2="-10" stroke="#8a6a4a" strokeWidth="1" />
    </g>
  ),

  windmill: ({ palette }) => (
    <g>
      <GroundDiamond fill={palette.grass} stroke="rgba(80,110,80,0.18)" />
      {/* tower (truncated cone, drawn as trapezoid) */}
      <polygon points="-7,-2 7,-2 5,-22 -5,-22" fill={palette.cottageBody} />
      <polygon points="-5,-22 5,-22 3,-26 -3,-26" fill={palette.roofShade} />
      {/* blades */}
      <g transform="translate(0,-24)">
        <g>
          <rect x="-1" y="-10" width="2" height="20" fill="#fff8e0" />
          <rect x="-10" y="-1" width="20" height="2" fill="#fff8e0" />
          <animateTransform attributeName="transform" type="rotate"
                            from="0" to="360" dur="12s" repeatCount="indefinite" />
        </g>
      </g>
      {/* door */}
      <rect x="-2" y="-8" width="4" height="6" fill={palette.door} />
    </g>
  ),
};

// Tile metadata: display name (JP), category, scoring rules, count in deck pool
const TILE_TYPES = {
  grass:    { jp: '草地',     en: 'Grass',    cat: 'nature', emoji: '🌿', baseScore: 5 },
  tree:     { jp: '樹木',     en: 'Tree',     cat: 'nature', emoji: '🌳', baseScore: 12 },
  pine:     { jp: '針葉樹',   en: 'Pine',     cat: 'nature', emoji: '🌲', baseScore: 12 },
  flower:   { jp: '花畑',     en: 'Flowers',  cat: 'nature', emoji: '🌸', baseScore: 15 },
  pond:     { jp: '池',       en: 'Pond',     cat: 'nature', emoji: '💧', baseScore: 18 },
  house:    { jp: '住宅',     en: 'House',    cat: 'building', emoji: '🏠', baseScore: 15 },
  cottage:  { jp: '小屋',     en: 'Cottage',  cat: 'building', emoji: '🛖', baseScore: 14 },
  shop:     { jp: '商店',     en: 'Shop',     cat: 'building', emoji: '🏪', baseScore: 18 },
  cafe:     { jp: 'カフェ',   en: 'Café',     cat: 'building', emoji: '☕', baseScore: 20 },
  fountain: { jp: '噴水',     en: 'Fountain', cat: 'special',  emoji: '⛲', baseScore: 22 },
  bridge:   { jp: '橋',       en: 'Bridge',   cat: 'special',  emoji: '🌉', baseScore: 16 },
  windmill: { jp: '風車',     en: 'Windmill', cat: 'special',  emoji: '🌾', baseScore: 25 },
};

// Render a single tile at (0,0). Pass scale to size up for cards.
function IsoTile({ type, palette, scale = 1, style = {} }) {
  const Art = TILE_ART[type];
  if (!Art) return null;
  const w = TILE_W * scale;
  const h = (TILE_H + 30) * scale; // extra height for rooflines
  return (
    <svg
      width={w}
      height={h}
      viewBox={`-${HALF_W + 2} -${HALF_H + 30} ${TILE_W + 4} ${TILE_H + 30}`}
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      <Art palette={palette} />
    </svg>
  );
}

Object.assign(window, { TILE_ART, TILE_TYPES, IsoTile, TILE_W, TILE_H, HALF_W, HALF_H });
