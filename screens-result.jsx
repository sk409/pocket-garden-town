// screens-result.jsx — Result screen with rotating town view, score breakdown, missions.

function ResultScreen({
  state, palette, motion,
  onReplay, onAdmire, onShare, missions,
}) {
  const { grid, score, bestScore, bonusLog, unlocked } = state;
  const isNewBest = score > bestScore;
  const [rotateY, setRotateY] = React.useState(0);

  React.useEffect(() => {
    if (motion === 'off') return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotateY(r => (r + dt * 4) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion]);

  // tally bonus log by label
  const bonusTotals = React.useMemo(() => {
    const m = new Map();
    bonusLog.forEach(b => {
      m.set(b.label, (m.get(b.label) || 0) + b.delta);
    });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [bonusLog]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <SkyBackground palette={palette} motion={motion} />

      {/* Top — title strip */}
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, zIndex: 5,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: '"Zen Maru Gothic", system-ui',
          fontSize: 11, letterSpacing: '0.4em',
          color: palette.terracottaDeep, fontWeight: 600,
        }}>RESULT</div>
        <div style={{
          fontFamily: '"Zen Maru Gothic", system-ui',
          fontSize: 22, fontWeight: 700, color: palette.ink,
          marginTop: 2, letterSpacing: '0.04em',
        }}>きょうのまち</div>
      </div>

      {/* Rotating town */}
      <div style={{
        position: 'absolute', top: 116, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        zIndex: 2,
        perspective: 800,
      }}>
        <div style={{
          transform: `rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: motion === 'off' ? 'none' : '',
        }}>
          <IslandGrid grid={grid} palette={palette} motion={motion} />
        </div>
      </div>

      {/* Score */}
      <div style={{
        position: 'absolute', top: 320, left: 16, right: 16,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 16, zIndex: 5,
        padding: '14px 18px',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderRadius: 20,
        border: '0.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.7) inset',
      }}>
        <div>
          <div style={{
            fontFamily: '"Zen Maru Gothic", system-ui',
            fontSize: 10, color: palette.inkSoft,
            letterSpacing: '0.2em', fontWeight: 600,
          }}>けいかんスコア</div>
          <div style={{
            fontFamily: '"Fraunces", "Quicksand", system-ui',
            fontSize: 44, fontWeight: 700, color: palette.ink,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
            lineHeight: 1, marginTop: 2,
          }}>{score}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {isNewBest ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 12,
              background: palette.terracotta, color: '#fff',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              boxShadow: `0 4px 12px ${palette.terracotta}66`,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 0l1.5 3.2 3.5.5-2.5 2.5.6 3.5L5 8l-3.1 1.7.6-3.5L0 3.7l3.5-.5z" fill="#fff"/>
              </svg>
              NEW BEST!
            </div>
          ) : (
            <div style={{
              fontSize: 10, color: palette.inkFaint,
              letterSpacing: '0.15em', fontWeight: 600,
            }}>BEST</div>
          )}
          <div style={{
            fontFamily: '"Fraunces", system-ui',
            fontSize: 18, fontWeight: 600,
            color: isNewBest ? palette.terracottaDeep : palette.inkSoft,
            fontVariantNumeric: 'tabular-nums',
            marginTop: 2,
          }}>{Math.max(score, bestScore)}</div>
        </div>
      </div>

      {/* Bonus breakdown */}
      <div style={{
        position: 'absolute', top: 422, left: 16, right: 16, zIndex: 5,
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: 16,
        border: '0.5px solid rgba(255,255,255,0.6)',
      }}>
        <div style={{
          fontFamily: '"Zen Maru Gothic", system-ui',
          fontSize: 11, color: palette.inkSoft,
          letterSpacing: '0.15em', fontWeight: 600,
          marginBottom: 6,
        }}>ボーナスのうちわけ</div>
        {bonusTotals.length === 0 ? (
          <div style={{ fontSize: 11, color: palette.inkFaint, padding: '4px 0' }}>
            ボーナスはありませんでした
          </div>
        ) : bonusTotals.slice(0, 3).map(([label, total]) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '3px 0',
          }}>
            <div style={{
              fontSize: 12, color: palette.ink, fontWeight: 500,
            }}>{label}</div>
            <div style={{
              fontFamily: '"Fraunces", system-ui',
              fontSize: 13, fontWeight: 700,
              color: palette.terracottaDeep,
              fontVariantNumeric: 'tabular-nums',
            }}>+{total}</div>
          </div>
        ))}
      </div>

      {/* Unlock notification */}
      {unlocked && (
        <div style={{
          position: 'absolute', top: 540, left: 16, right: 16, zIndex: 6,
          padding: '12px 16px',
          background: `linear-gradient(135deg, ${palette.butter}33, ${palette.terracotta}22)`,
          borderRadius: 14,
          border: `1px dashed ${palette.terracotta}66`,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'unlockGlow 2s ease-in-out infinite',
        }}>
          <div style={{ flexShrink: 0 }}>
            <IsoTile type={unlocked} palette={palette} scale={0.7} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 9, color: palette.terracottaDeep,
              fontWeight: 700, letterSpacing: '0.2em',
            }}>NEW UNLOCK</div>
            <div style={{
              fontFamily: '"Zen Maru Gothic", system-ui',
              fontSize: 13, fontWeight: 700, color: palette.ink, marginTop: 2,
            }}>{TILE_TYPES[unlocked].jp}を解放！</div>
          </div>
        </div>
      )}

      {/* Daily missions check */}
      <div style={{
        position: 'absolute', bottom: 110, left: 16, right: 16, zIndex: 5,
        display: 'flex', gap: 6, justifyContent: 'space-between',
      }}>
        {missions.map(m => (
          <div key={m.id} style={{
            flex: 1,
            background: m.done ? palette.sageDeep : 'rgba(255,255,255,0.5)',
            color: m.done ? '#fff' : palette.inkSoft,
            borderRadius: 10,
            padding: '6px 8px',
            fontSize: 10, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
            border: m.done ? 'none' : '0.5px solid rgba(255,255,255,0.6)',
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: 6,
              background: m.done ? '#fff' : 'transparent',
              border: m.done ? 'none' : `1.2px solid ${palette.inkFaint}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {m.done && (
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <path d="M1 4l2 2L7 1" stroke={palette.sageDeep} strokeWidth="1.5"
                        fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.text.length > 8 ? m.text.slice(0, 8) + '…' : m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom buttons */}
      <div style={{
        position: 'absolute', bottom: 30, left: 16, right: 16, zIndex: 5,
        display: 'flex', gap: 8,
      }}>
        <ResultButton palette={palette} onClick={onAdmire} variant="ghost" icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7c2-3 4-4 6-4s4 1 6 4c-2 3-4 4-6 4s-4-1-6-4z" stroke={palette.ink} strokeWidth="1.4"/>
            <circle cx="7" cy="7" r="1.5" fill={palette.ink}/>
          </svg>
        }>眺める</ResultButton>
        <ResultButton palette={palette} onClick={onShare} variant="ghost" icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="11" cy="3" r="2" stroke={palette.ink} strokeWidth="1.4"/>
            <circle cx="3" cy="7" r="2" stroke={palette.ink} strokeWidth="1.4"/>
            <circle cx="11" cy="11" r="2" stroke={palette.ink} strokeWidth="1.4"/>
            <path d="M5 6L9 4M5 8L9 10" stroke={palette.ink} strokeWidth="1.4"/>
          </svg>
        }>シェア</ResultButton>
        <ResultButton palette={palette} onClick={onReplay} variant="primary" flex={1.5}>
          もう一度
        </ResultButton>
      </div>
    </div>
  );
}

function ResultButton({ children, onClick, palette, variant, icon, flex = 1 }) {
  const primary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      style={{
        flex,
        appearance: 'none', border: 0,
        height: 50, borderRadius: 25,
        background: primary
          ? `linear-gradient(180deg, ${palette.terracotta}, ${palette.terracottaDeep})`
          : 'rgba(255,255,255,0.7)',
        color: primary ? '#fff' : palette.ink,
        fontFamily: '"Zen Maru Gothic", system-ui',
        fontSize: 14, fontWeight: 700,
        letterSpacing: '0.08em',
        boxShadow: primary
          ? `0 1px 0 rgba(255,255,255,0.3) inset, 0 6px 16px ${palette.terracotta}66`
          : '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 10px rgba(0,0,0,0.06)',
        border: primary ? 'none' : `0.5px solid ${palette.parchment}`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

Object.assign(window, { ResultScreen, ResultButton });
