// island.jsx — The isometric island view used by Title (mini), Game (interactive), Result (rotating).

function Island({
  grid, palette, scale = 1, interactive = false,
  hoverCell = null, hintCell = null, validCells = null,
  onCellEnter, onCellLeave, onCellDown, dragOverlay,
  showResidents = true,
}) {
  const tileW = 64;
  const tileH = 32;
  const W = GRID_SIZE * tileW;
  const H = GRID_SIZE * tileH;

  // Render order: top→bottom, left→right (so back tiles draw first)
  const cells = [];
  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      const type = grid[gy][gx];
      const { x, y } = isoToScreen(gx, gy, tileW, tileH);
      const isHover = hoverCell && hoverCell.gx === gx && hoverCell.gy === gy;
      const isHint = hintCell && hintCell.gx === gx && hintCell.gy === gy;
      const isEmpty = !type;
      const isValid = validCells ? validCells.some(c => c.gx === gx && c.gy === gy) : true;

      cells.push({ gx, gy, x, y, type, isHover, isHint, isEmpty, isValid });
    }
  }

  // Centering: leftmost cell is gx=0,gy=GRID_SIZE-1 → x = -(GRID-1)*tileW/2
  // Rightmost is gx=GRID-1,gy=0 → x = (GRID-1)*tileW/2
  // Top is gx=0,gy=0 → y=0; bottom is gx=GRID-1,gy=GRID-1 → y=(GRID-1)*tileH
  const totalW = (GRID_SIZE) * tileW;
  const totalH = (GRID_SIZE + 1) * tileH + 30; // extra for tall buildings poking up
  const cx = totalW / 2;
  const cy = 28; // top padding for tall tiles

  return (
    <div style={{
      position: 'relative',
      width: totalW * scale,
      height: totalH * scale,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    }}>
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* island shadow */}
        <ellipse
          cx={cx}
          cy={totalH - 8}
          rx={totalW * 0.42}
          ry={10}
          fill="rgba(0,0,0,0.10)"
        />
        {/* sea ring under island */}
        <ellipse
          cx={cx}
          cy={cy + (GRID_SIZE * tileH) / 2}
          rx={totalW * 0.48}
          ry={(GRID_SIZE * tileH) / 2 + 12}
          fill={palette.water}
          opacity="0.55"
        />
        {/* sand ring */}
        <ellipse
          cx={cx}
          cy={cy + (GRID_SIZE * tileH) / 2}
          rx={totalW * 0.42}
          ry={(GRID_SIZE * tileH) / 2 + 4}
          fill={palette.parchment}
        />

        {cells.map(c => (
          <g key={`${c.gx}-${c.gy}`} transform={`translate(${cx + c.x}, ${cy + c.y + 16})`}>
            {/* base diamond — empty cells get a faint grid */}
            {c.isEmpty && (
              <polygon
                points={`0,-16 32,0 0,16 -32,0`}
                fill={c.isHover && c.isValid ? palette.sage : palette.path}
                fillOpacity={c.isHover && c.isValid ? 0.7 : 0.55}
                stroke={c.isHint ? palette.terracotta : 'rgba(0,0,0,0.08)'}
                strokeWidth={c.isHint ? 1.5 : 0.5}
                strokeDasharray={c.isHint ? '2 2' : ''}
              >
                {c.isHint && (
                  <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
                )}
              </polygon>
            )}
            {c.type && (
              <g style={{
                transformOrigin: '0 0',
                animation: c.justPlaced ? 'tilePlop 0.4s cubic-bezier(.2,1.4,.5,1)' : '',
              }}>
                <TileSVGContent type={c.type} palette={palette} />
              </g>
            )}
            {/* interactive overlay (catches pointer) */}
            {interactive && c.isEmpty && (
              <polygon
                points={`0,-16 32,0 0,16 -32,0`}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onPointerEnter={() => onCellEnter && onCellEnter(c.gx, c.gy)}
                onPointerLeave={() => onCellLeave && onCellLeave(c.gx, c.gy)}
                onPointerDown={(e) => onCellDown && onCellDown(e, c.gx, c.gy)}
              />
            )}
          </g>
        ))}

        {/* residents (tiny walking dots — placeholder) */}
        {showResidents && (
          <g>
            {[0, 1, 2].map(i => {
              const dur = 14 + i * 3;
              const offset = i * 1.5;
              return (
                <circle key={i} r="1.5" fill={palette.terracottaDeep}>
                  <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`-${offset}s`}
                                 path={`M ${cx - 30} ${cy + 50} Q ${cx} ${cy + 80}, ${cx + 30} ${cy + 50} Q ${cx} ${cy + 20}, ${cx - 30} ${cy + 50} Z`} />
                </circle>
              );
            })}
          </g>
        )}
      </svg>

      {dragOverlay}
    </div>
  );
}

// Inlines tile SVG without the wrapping <svg> — for nesting inside the island svg.
function TileSVGContent({ type, palette }) {
  const Art = TILE_ART[type];
  if (!Art) return null;
  return <Art palette={palette} />;
}

Object.assign(window, { Island, TileSVGContent });
