// screens-game.jsx — In-game playing screen with drag-to-place.

function GameScreen({
  state, palette, motion,
  onPause, onHint, onPlace,
  hintCell,
}) {
  const { grid, hand, score, turnsLeft, lastBonus } = state;

  // group hand by type for compact display + count badges
  const handGroups = React.useMemo(() => {
    const m = new Map();
    hand.forEach((t) => {
      const arr = m.get(t.type) || [];
      arr.push(t);
      m.set(t.type, arr);
    });
    return Array.from(m.entries()); // [type, tiles[]]
  }, [hand]);

  const [drag, setDrag] = React.useState(null); // {type, tileId, x, y}
  const [hoverCell, setHoverCell] = React.useState(null);
  const islandRef = React.useRef(null);

  // begin drag from a card
  const onCardPointerDown = (tile) => (e) => {
    e.preventDefault();
    setDrag({ type: tile.type, tileId: tile.id, x: e.clientX, y: e.clientY });
  };

  // global pointer move/up while dragging
  React.useEffect(() => {
    if (!drag) return;
    const move = (e) => {
      setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY } : null);
      // hit-test against island grid cells via DOM
      if (!islandRef.current) return;
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      const cellEl = els.find(el => el.dataset && el.dataset.cell);
      if (cellEl) {
        const [gx, gy] = cellEl.dataset.cell.split(',').map(Number);
        if (!grid[gy][gx]) {
          setHoverCell({ gx, gy });
        } else {
          setHoverCell(null);
        }
      } else {
        setHoverCell(null);
      }
    };
    const up = () => {
      if (hoverCell && !grid[hoverCell.gy][hoverCell.gx]) {
        onPlace(hoverCell.gx, hoverCell.gy, drag.tileId);
      }
      setDrag(null);
      setHoverCell(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, hoverCell, grid, onPlace]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <SkyBackground palette={palette} motion={motion} />

      {/* Top bar — pause + score */}
      <div style={{
        position: 'absolute', top: 60, left: 16, right: 16, zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <CircleIconButton palette={palette} onClick={onPause} ariaLabel="pause">
          <svg width="14" height="16" viewBox="0 0 14 16">
            <rect x="1" y="1" width="4" height="14" rx="1.2" fill={palette.ink}/>
            <rect x="9" y="1" width="4" height="14" rx="1.2" fill={palette.ink}/>
          </svg>
        </CircleIconButton>

        <div style={{
          flex: 1, height: 44,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 22,
          border: '0.5px solid rgba(255,255,255,0.7)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 10px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: '"Zen Maru Gothic", system-ui',
              fontSize: 10, color: palette.inkSoft,
              letterSpacing: '0.15em', fontWeight: 600,
            }}>景観</span>
            <span style={{
              fontFamily: '"Fraunces", "Quicksand", system-ui',
              fontSize: 22, fontWeight: 700, color: palette.ink,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}>
              <AnimatedNumber value={score} />
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{
              fontSize: 9, color: palette.inkFaint,
              letterSpacing: '0.1em', fontWeight: 600,
            }}>のこり</span>
            <span style={{
              fontSize: 14, fontWeight: 700, color: palette.terracotta,
              fontVariantNumeric: 'tabular-nums',
            }}>{turnsLeft}</span>
            <span style={{ fontSize: 11, color: palette.inkFaint }}>枚</span>
          </div>
        </div>
      </div>

      {/* Turn counter dots */}
      <div style={{
        position: 'absolute', top: 116, left: 0, right: 0, zIndex: 5,
        display: 'flex', justifyContent: 'center', gap: 4,
      }}>
        {Array.from({ length: TURNS }).map((_, i) => (
          <div key={i} style={{
            width: i < TURNS - turnsLeft ? 18 : 5, height: 5, borderRadius: 3,
            background: i < TURNS - turnsLeft ? palette.terracotta : 'rgba(255,255,255,0.55)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Island — center */}
      <div ref={islandRef} style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
      }}>
        <IslandGrid
          grid={grid}
          palette={palette}
          hoverCell={hoverCell}
          hintCell={hintCell}
          motion={motion}
        />
      </div>

      {/* Bonus popup */}
      {lastBonus && (
        <div key={lastBonus.id} style={{
          position: 'absolute', top: '38%', left: 0, right: 0,
          textAlign: 'center', zIndex: 10,
          pointerEvents: 'none',
          animation: 'bonusFloat 1.6s cubic-bezier(.2,.8,.3,1) forwards',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: 999,
            boxShadow: `0 8px 24px ${palette.terracotta}33, 0 0 0 1px rgba(255,255,255,0.6) inset`,
          }}>
            <span style={{
              fontFamily: '"Fraunces", system-ui',
              fontWeight: 700, fontSize: 18,
              color: palette.terracottaDeep,
              fontVariantNumeric: 'tabular-nums',
            }}>+{lastBonus.delta}</span>
            <span style={{
              fontFamily: '"Zen Maru Gothic", system-ui',
              fontSize: 13, fontWeight: 600, color: palette.ink,
            }}>{lastBonus.label}</span>
          </div>
        </div>
      )}

      {/* Hand — bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
        padding: '14px 12px 28px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(245,239,230,0.7) 30%, rgba(245,239,230,0.95) 100%)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px 8px',
        }}>
          <div style={{
            fontFamily: '"Zen Maru Gothic", system-ui',
            fontSize: 11, color: palette.inkSoft,
            letterSpacing: '0.15em', fontWeight: 600,
          }}>てふだ</div>
          <button
            onClick={onHint}
            style={{
              appearance: 'none', border: 0,
              height: 26, padding: '0 12px', borderRadius: 13,
              background: 'rgba(255,255,255,0.7)',
              border: `0.5px solid ${palette.parchment}`,
              fontSize: 11, fontWeight: 600, color: palette.blueDeep,
              fontFamily: '"Zen Maru Gothic", system-ui',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v1M6 10v1M1 6h1M10 6h1M2.5 2.5l0.7 0.7M8.8 8.8l0.7 0.7M2.5 9.5l0.7-0.7M8.8 3.2l0.7-0.7"
                    stroke={palette.blueDeep} strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="6" cy="6" r="2" fill={palette.blueDeep}/>
            </svg>
            ヒント
          </button>
        </div>
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          padding: '4px 4px 8px',
          overflowX: 'auto',
        }}>
          {handGroups.map(([type, tiles]) => {
            const tile = tiles[0];
            const isDragging = drag && drag.tileId === tile.id;
            return (
              <TileCard
                key={tile.id}
                tile={tile}
                palette={palette}
                isDragging={isDragging}
                onPointerDown={onCardPointerDown(tile)}
                count={tiles.length}
              />
            );
          })}
        </div>
      </div>

      {/* Drag ghost */}
      {drag && (
        <div style={{
          position: 'fixed',
          left: drag.x, top: drag.y,
          transform: 'translate(-50%, -60%)',
          pointerEvents: 'none',
          zIndex: 100,
          filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.25))',
        }}>
          <IsoTile type={drag.type} palette={palette} scale={1.1} />
        </div>
      )}
    </div>
  );
}

// Standalone island for game (with data-cell attrs for hit-testing)
function IslandGrid({ grid, palette, hoverCell, hintCell, motion }) {
  const tileW = 64, tileH = 32;
  const totalW = GRID_SIZE * tileW;
  const totalH = (GRID_SIZE + 1) * tileH + 30;
  const cx = totalW / 2;
  const cy = 28;

  const cells = [];
  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      const { x, y } = isoToScreen(gx, gy, tileW, tileH);
      cells.push({ gx, gy, x, y, type: grid[gy][gx] });
    }
  }

  return (
    <svg
      width={totalW + 60}
      height={totalH + 30}
      viewBox={`-30 -10 ${totalW + 60} ${totalH + 30}`}
      style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 14px 30px rgba(0,0,0,0.12))' }}
    >
      {/* sea */}
      <ellipse cx={cx} cy={cy + (GRID_SIZE * tileH) / 2}
               rx={totalW * 0.55} ry={(GRID_SIZE * tileH) / 2 + 18}
               fill={palette.water} opacity="0.45" />
      {/* sea ripple */}
      {motion !== 'off' && (
        <ellipse cx={cx} cy={cy + (GRID_SIZE * tileH) / 2}
                 rx={totalW * 0.5} ry={(GRID_SIZE * tileH) / 2 + 14}
                 fill="none" stroke={palette.water} strokeWidth="0.8" opacity="0.5">
          <animate attributeName="rx" values={`${totalW * 0.5};${totalW * 0.55};${totalW * 0.5}`} dur="6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="6s" repeatCount="indefinite"/>
        </ellipse>
      )}
      <ellipse cx={cx} cy={cy + (GRID_SIZE * tileH) / 2}
               rx={totalW * 0.45} ry={(GRID_SIZE * tileH) / 2 + 6}
               fill={palette.parchment} />

      {cells.map(c => {
        const isHover = hoverCell && hoverCell.gx === c.gx && hoverCell.gy === c.gy;
        const isHint = hintCell && hintCell.gx === c.gx && hintCell.gy === c.gy;
        return (
          <g key={`${c.gx}-${c.gy}`} transform={`translate(${cx + c.x}, ${cy + c.y + 16})`}>
            {!c.type && (
              <polygon
                points="0,-16 32,0 0,16 -32,0"
                fill={isHover ? palette.sage : palette.path}
                fillOpacity={isHover ? 0.85 : 0.5}
                stroke={isHint ? palette.terracotta : 'rgba(0,0,0,0.08)'}
                strokeWidth={isHint ? 1.5 : 0.5}
                strokeDasharray={isHint ? '3 2' : ''}
              >
                {isHint && <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>}
              </polygon>
            )}
            {c.type && <TileSVGContent type={c.type} palette={palette} />}
            {/* hit area */}
            <polygon
              points="0,-16 32,0 0,16 -32,0"
              fill="transparent"
              data-cell={`${c.gx},${c.gy}`}
              style={{ pointerEvents: 'all' }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function AnimatedNumber({ value }) {
  const [displayed, setDisplayed] = React.useState(value);
  React.useEffect(() => {
    if (displayed === value) return;
    const start = displayed;
    const startTime = performance.now();
    const duration = 500;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(start + (value - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{displayed}</>;
}

Object.assign(window, { GameScreen, IslandGrid, AnimatedNumber });
