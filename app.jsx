// app.jsx — Pocket Garden Town root.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lighting": "day",
  "motion": "moderate",
  "showFrame": true,
  "ambientSound": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = PALETTES[t.lighting] || PALETTES.day;

  const [screen, setScreen] = React.useState('title'); // title | game | result

  // Fit the fixed-size 390×844 frame into the visible viewport so nothing is clipped
  // by mobile browser chrome (address bar / tabs).
  const [fit, setFit] = React.useState(1);
  React.useLayoutEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setFit(Math.min(1, w / 390, h / 844));
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('orientationchange', compute);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', compute);
    };
  }, []);

  // persistent best score
  const [bestScore, setBestScore] = React.useState(() => {
    return Number(localStorage.getItem('pgt_best') || 220);
  });

  // game state
  const [gameState, setGameState] = React.useState(() => initGame());
  const [hintCell, setHintCell] = React.useState(null);

  // mission progress (cosmetic)
  const [missions, setMissions] = React.useState(() => {
    return DAILY_MISSIONS.map((m, i) => ({
      ...m, progress: i === 0 ? 1 : i === 1 ? 142 : 3, done: false,
    }));
  });

  function initGame() {
    return {
      grid: makeStartingGrid(),
      hand: makeHand(HAND_SIZE),
      score: 0,
      turnsLeft: TURNS,
      lastBonus: null,
      bonusLog: [],
      unlocked: null,
    };
  }

  // place a tile
  const onPlace = (gx, gy, tileId) => {
    setGameState(s => {
      if (s.grid[gy][gx]) return s;
      const tile = s.hand.find(h => h.id === tileId);
      if (!tile) return s;
      const newGrid = s.grid.map(row => [...row]);
      newGrid[gy][gx] = tile.type;

      const result = scorePlacement(newGrid, gx, gy, tile.type);
      const newScore = s.score + result.delta;

      const newHand = s.hand.filter(h => h.id !== tileId);
      // refill hand
      while (newHand.length < HAND_SIZE && (TURNS - (s.turnsLeft - 1)) < TURNS) {
        newHand.push({ id: Math.random().toString(36).slice(2, 9), type: pickWeighted() });
      }

      const turnsLeft = s.turnsLeft - 1;
      const topBonus = result.bonuses[0] || null;
      const lastBonus = topBonus
        ? { ...topBonus, delta: result.delta, id: Math.random() }
        : { label: TILE_TYPES[tile.type].jp, en: TILE_TYPES[tile.type].en, delta: result.delta, id: Math.random() };

      return {
        ...s,
        grid: newGrid,
        hand: newHand,
        score: newScore,
        turnsLeft,
        lastBonus,
        bonusLog: [...s.bonusLog, ...result.bonuses, { label: 'ベース得点', delta: result.base }],
      };
    });
    setHintCell(null);
  };

  // when game runs out, transition
  React.useEffect(() => {
    if (screen === 'game' && gameState.turnsLeft === 0) {
      const timer = setTimeout(() => {
        // tally missions
        const buildings = countCat(gameState.grid, 'building');
        const natures = countCat(gameState.grid, 'nature');
        const newMissions = missions.map(m => {
          if (m.type === 'building') return { ...m, progress: buildings, done: buildings >= m.target };
          if (m.type === 'nature') return { ...m, progress: natures, done: natures >= m.target };
          if (m.type === 'score') return { ...m, progress: gameState.score, done: gameState.score >= m.target };
          return m;
        });
        setMissions(newMissions);

        // unlock check (every 200pts unlock something)
        const unlocked = gameState.score > 250 ? 'windmill' : null;

        if (gameState.score > bestScore) {
          setBestScore(gameState.score);
          localStorage.setItem('pgt_best', String(gameState.score));
        }
        setGameState(s => ({ ...s, unlocked }));
        setScreen('result');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gameState.turnsLeft, screen]);

  // clear bonus popup after delay
  React.useEffect(() => {
    if (gameState.lastBonus) {
      const id = gameState.lastBonus.id;
      const timer = setTimeout(() => {
        setGameState(s => (s.lastBonus && s.lastBonus.id === id ? { ...s, lastBonus: null } : s));
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastBonus]);

  // hint: highlight a random empty cell
  const onHint = () => {
    const empties = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!gameState.grid[y][x]) empties.push({ gx: x, gy: y });
      }
    }
    if (!empties.length) return;
    // pick the cell that gives best score for the first card in hand
    const tile = gameState.hand[0];
    let best = empties[0], bestDelta = -1;
    for (const c of empties) {
      const r = scorePlacement(gameState.grid, c.gx, c.gy, tile.type);
      if (r.delta > bestDelta) { bestDelta = r.delta; best = c; }
    }
    setHintCell(best);
    setTimeout(() => setHintCell(null), 3000);
  };

  const startGame = () => {
    setGameState(initGame());
    setScreen('game');
  };

  // Inner content
  const content = (
    <div style={{
      position: 'absolute', inset: 0,
      fontFamily: '"Zen Maru Gothic", "Quicksand", system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      color: palette.ink,
    }}>
      {screen === 'title' && (
        <TitleScreen
          palette={palette}
          motion={t.motion}
          missions={missions}
          onPlay={startGame}
          onCollection={() => alert('図鑑画面（プロトタイプ外）')}
          onSettings={() => alert('設定画面（プロトタイプ外）')}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          state={{ ...gameState }}
          palette={palette}
          motion={t.motion}
          hintCell={hintCell}
          onPause={() => setScreen('title')}
          onHint={onHint}
          onPlace={onPlace}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          state={{ ...gameState, bestScore }}
          palette={palette}
          motion={t.motion}
          missions={missions}
          onReplay={startGame}
          onAdmire={() => setScreen('title')}
          onShare={() => alert('シェア機能（プロトタイプ外）')}
        />
      )}
    </div>
  );

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: t.showFrame
        ? `radial-gradient(ellipse at top, ${palette.cream} 0%, ${palette.parchment} 100%)`
        : palette.skySolid,
      overflow: 'hidden',
      position: 'relative',
    }} data-screen-label="Pocket Garden Town">
      {t.showFrame ? (
        <div style={{
          position: 'relative',
          transform: `scale(${fit})`,
          transformOrigin: 'center center',
        }}>
          <IOSDevice width={390} height={844}>
            {content}
          </IOSDevice>
        </div>
      ) : (
        <div style={{
          width: 390, height: 844, position: 'relative', overflow: 'hidden', borderRadius: 0,
          transform: `scale(${fit})`,
          transformOrigin: 'center center',
        }}>
          {content}
        </div>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Visuals" />
        <TweakRadio
          label="ライティング"
          value={t.lighting}
          options={[
            { value: 'day', label: 'ひる' },
            { value: 'dusk', label: 'たそがれ' },
            { value: 'night', label: 'よる' },
          ]}
          onChange={(v) => setTweak('lighting', v)}
        />
        <TweakRadio
          label="アニメーション"
          value={t.motion}
          options={[
            { value: 'off', label: 'オフ' },
            { value: 'moderate', label: 'ふつう' },
            { value: 'lively', label: 'いきいき' },
          ]}
          onChange={(v) => setTweak('motion', v)}
        />
        <TweakSection label="Display" />
        <TweakToggle
          label="iPhoneフレーム"
          value={t.showFrame}
          onChange={(v) => setTweak('showFrame', v)}
        />
        <TweakSection label="Navigate" />
        <TweakRadio
          label="画面"
          value={screen}
          options={[
            { value: 'title', label: 'タイトル' },
            { value: 'game', label: 'ゲーム' },
            { value: 'result', label: 'リザルト' },
          ]}
          onChange={(v) => {
            if (v === 'game') startGame();
            else if (v === 'result') {
              // populate a sample completed grid
              const g = makeEmptyGrid();
              g[0] = ['tree', 'house', 'flower', 'pine', 'cottage'];
              g[1] = ['flower', 'fountain', 'cafe', 'house', 'tree'];
              g[2] = ['pond', 'bridge', 'shop', 'windmill', 'flower'];
              g[3] = ['flower', 'cafe', 'house', 'cottage', 'pine'];
              g[4] = ['tree', 'pine', 'flower', 'tree', 'pond'];
              setGameState({
                grid: g, hand: [], score: 312, turnsLeft: 0,
                lastBonus: null,
                bonusLog: [
                  { label: '緑のある暮らし', delta: 80 },
                  { label: 'にぎわい', delta: 75 },
                  { label: 'まちのシンボル', delta: 60 },
                  { label: 'やすらぎ', delta: 45 },
                  { label: 'ベース得点', delta: 52 },
                ],
                unlocked: 'windmill',
              });
              setScreen('result');
            } else setScreen('title');
          }}
        />
      </TweaksPanel>
    </div>
  );
}

function countCat(grid, cat) {
  let n = 0;
  for (const row of grid) for (const t of row) {
    if (t && TILE_TYPES[t].cat === cat) n++;
  }
  return n;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
