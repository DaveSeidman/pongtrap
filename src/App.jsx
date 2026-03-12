import { useMemo, useState } from 'react';
import Scene from './scene/Scene';
import { TANK_HEIGHT } from './scene/constants';
import './App.css';

const MIN_SIZE = 8;
const MAX_SIZE = 36;

export default function App() {
  const [width, setWidth] = useState(18);
  const [depth, setDepth] = useState(18);
  const [postProcessing, setPostProcessing] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [triggeredMap, setTriggeredMap] = useState({});
  const [triggerCounts, setTriggerCounts] = useState({});

  const triggeredTotal = useMemo(
    () => Object.values(triggeredMap).filter(Boolean).length,
    [triggeredMap],
  );

  const triggerTrap = (id) => {
    setTriggeredMap((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    setTriggerCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const reset = () => {
    setTriggeredMap({});
    setTriggerCounts({});
  };

  return (
    <div className="app">
      <aside className="control-panel">
        <h1>PongTrap Lab</h1>
        <p>Set tank size, click any trap, and enjoy the chain reaction.</p>

        <label>
          X (width): <strong>{width}</strong>
          <input
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </label>

        <label>
          Y (depth): <strong>{depth}</strong>
          <input
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
        </label>

        <div className="meta">
          <div>Height: {TANK_HEIGHT} (constant)</div>
          <div>Triggered: {triggeredTotal}</div>
        </div>

        <div className="toggles">
          <label>
            <input
              type="checkbox"
              checked={postProcessing}
              onChange={(e) => setPostProcessing(e.target.checked)}
            />{' '}
            Bloom
          </label>
          <label>
            <input
              type="checkbox"
              checked={showStats}
              onChange={(e) => setShowStats(e.target.checked)}
            />{' '}
            FPS stats
          </label>
        </div>

        <button onClick={reset}>Reset simulation</button>
      </aside>

      <main className="viewport">
        <Scene
          width={width}
          depth={depth}
          triggeredMap={triggeredMap}
          triggerCounts={triggerCounts}
          onTrigger={triggerTrap}
          postProcessing={postProcessing}
          showStats={showStats}
        />
      </main>
    </div>
  );
}
