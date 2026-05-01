// screens.jsx — Title, Game, Result screens.

// ─── Card (hand tile) ──────────────────────────────────────────────────
function TileCard({ tile, palette, isDragging, onPointerDown, count }) {
  const meta = TILE_TYPES[tile.type];
  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        width: 78,
        height: 102,
        flexShrink: 0,
        background: palette.cream,
        borderRadius: 14,
        boxShadow: isDragging
          ? '0 12px 28px rgba(0,0,0,0.18), 0 0 0 1.5px ' + palette.terracotta
          : '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 10px rgba(0,0,0,0.06), 0 0.5px 0 rgba(0,0,0,0.05)',
        border: `0.5px solid ${palette.parchment}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 6px 6px',
        position: 'relative',
        cursor: 'grab',
        touchAction: 'none',
        transition: isDragging ? 'none' : 'transform 0.18s, box-shadow 0.18s',
        transform: isDragging ? 'scale(0.95)' : 'scale(1)',
        userSelect: 'none',
      }}
    >
      <div style={{
        fontSize: 9,
        letterSpacing: '0.08em',
        color: palette.inkFaint,
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>{meta.cat === 'nature' ? '自然' : meta.cat === 'building' ? '建物' : 'シンボル'}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IsoTile type={tile.type} palette={palette} scale={0.85} />
      </div>
      <div style={{
        fontSize: 12,
        color: palette.ink,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}>{meta.jp}</div>
      {count > 1 && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
          background: palette.terracotta, color: '#fff',
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×{count}</div>
      )}
    </div>
  );
}

// ─── Sky/Background ────────────────────────────────────────────────────
function SkyBackground({ palette, motion }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: palette.sky,
      overflow: 'hidden',
    }}>
      {/* clouds */}
      {motion !== 'off' && (
        <>
          <div style={{
            position: 'absolute', top: '8%', left: '-30%',
            width: 120, height: 28, borderRadius: 28,
            background: palette.cloud, opacity: 0.7,
            filter: 'blur(0.5px)',
            animation: `cloudDrift ${motion === 'lively' ? '40s' : '70s'} linear infinite`,
          }} />
          <div style={{
            position: 'absolute', top: '18%', left: '-50%',
            width: 80, height: 22, borderRadius: 22,
            background: palette.cloud, opacity: 0.6,
            animation: `cloudDrift ${motion === 'lively' ? '55s' : '90s'} linear infinite`,
            animationDelay: '-20s',
          }} />
        </>
      )}
      {/* sun/moon */}
      <div style={{
        position: 'absolute', top: 50, right: 28,
        width: 36, height: 36, borderRadius: '50%',
        background: palette.butter,
        boxShadow: `0 0 40px ${palette.butter}55, 0 0 80px ${palette.butter}33`,
        opacity: 0.85,
      }} />
    </div>
  );
}

// ─── Title screen ──────────────────────────────────────────────────────
function TitleScreen({ palette, motion, onPlay, onCollection, onSettings, missions }) {
  // a pre-built lovely town for the background mini-view
  const titleGrid = React.useMemo(() => {
    const g = makeEmptyGrid();
    g[1][1] = 'tree';     g[1][2] = 'house';    g[1][3] = 'flower';
    g[2][1] = 'cottage';  g[2][2] = 'fountain'; g[2][3] = 'cafe';
    g[3][1] = 'flower';   g[3][2] = 'pond';     g[3][3] = 'pine';
    g[0][2] = 'pine';     g[4][2] = 'windmill';
    return g;
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <SkyBackground palette={palette} motion={motion} />

      {/* Top bar — collection + settings */}
      <div style={{
        position: 'absolute', top: 60, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between', zIndex: 5,
      }}>
        <CircleIconButton palette={palette} onClick={onCollection} ariaLabel="図鑑">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h12a2 2 0 012 2v14l-3-2-3 2-3-2-3 2-3-2V6a2 2 0 012-2z"
                  stroke={palette.ink} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M9 9h6M9 13h6" stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </CircleIconButton>
        <CircleIconButton palette={palette} onClick={onSettings} ariaLabel="設定">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke={palette.ink} strokeWidth="1.6"/>
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"
                  stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </CircleIconButton>
      </div>

      {/* Logo */}
      <div style={{
        position: 'absolute', top: 110, left: 0, right: 0,
        textAlign: 'center', zIndex: 5,
      }}>
        <div style={{
          fontFamily: '"Zen Maru Gothic", "Quicksand", system-ui',
          fontSize: 13, letterSpacing: '0.4em',
          color: palette.terracottaDeep, fontWeight: 600,
          marginBottom: 4,
        }}>POCKET</div>
        <div style={{
          fontFamily: '"Zen Maru Gothic", "Quicksand", system-ui',
          fontSize: 36, fontWeight: 700,
          color: palette.ink, letterSpacing: '0.01em',
          lineHeight: 1,
        }}>Garden Town</div>
        <div style={{
          fontFamily: '"Zen Maru Gothic", system-ui',
          fontSize: 11, color: palette.inkSoft,
          marginTop: 8, letterSpacing: '0.3em',
        }}>てのひらの まちづくり</div>
      </div>

      {/* Mini town in center */}
      <div style={{
        position: 'absolute', top: '36%', left: '50%',
        transform: 'translate(-50%, 0)',
        zIndex: 2,
      }}>
        <Island grid={titleGrid} palette={palette} scale={0.85} showResidents={motion !== 'off'} />
      </div>

      {/* PLAY button */}
      <div style={{
        position: 'absolute', bottom: 240, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', zIndex: 6,
      }}>
        <button
          onClick={onPlay}
          style={{
            appearance: 'none', border: 0,
            width: 200, height: 64, borderRadius: 32,
            background: `linear-gradient(180deg, ${palette.terracotta}, ${palette.terracottaDeep})`,
            color: '#fff',
            fontFamily: '"Zen Maru Gothic", "Quicksand", system-ui',
            fontSize: 22, fontWeight: 700, letterSpacing: '0.2em',
            boxShadow: `0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 24px ${palette.terracotta}66, 0 2px 0 ${palette.terracottaDeep}`,
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform 0.1s',
          }}
          onPointerDown={(e) => e.currentTarget.style.transform = 'translateY(2px) scale(0.98)'}
          onPointerUp={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
          onPointerLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        >
          PLAY
          <div style={{
            position: 'absolute', inset: 4, borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.3)',
            pointerEvents: 'none',
          }} />
        </button>
      </div>

      {/* Daily missions */}
      <div style={{
        position: 'absolute', bottom: 50, left: 16, right: 16,
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderRadius: 20,
        padding: '14px 18px 16px',
        border: `0.5px solid rgba(255,255,255,0.7)`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        zIndex: 5,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{
            fontFamily: '"Zen Maru Gothic", system-ui',
            fontSize: 13, fontWeight: 700, color: palette.ink,
            letterSpacing: '0.05em',
          }}>きょうのミッション</div>
          <div style={{
            fontSize: 10, color: palette.inkFaint,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.05em',
          }}>残り 14:32</div>
        </div>
        {missions.map((m, i) => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '5px 0',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 6,
              border: `1.5px solid ${m.done ? palette.sageDeep : palette.inkFaint}`,
              background: m.done ? palette.sageDeep : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {m.done && (
                <svg width="11" height="11" viewBox="0 0 11 11">
                  <path d="M2 5.5L4.5 8L9 3" stroke="#fff" strokeWidth="1.8"
                        fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div style={{
              flex: 1, fontSize: 12.5,
              color: m.done ? palette.inkFaint : palette.ink,
              textDecoration: m.done ? 'line-through' : 'none',
            }}>{m.text}</div>
            <div style={{
              fontSize: 10, color: palette.inkSoft,
              fontVariantNumeric: 'tabular-nums',
            }}>{m.progress}/{m.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CircleIconButton({ palette, children, onClick, ariaLabel }) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        appearance: 'none', border: 0,
        width: 44, height: 44, borderRadius: 22,
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 10px rgba(0,0,0,0.08)',
        border: `0.5px solid rgba(255,255,255,0.6)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >{children}</button>
  );
}

Object.assign(window, { TitleScreen, TileCard, SkyBackground, CircleIconButton });
