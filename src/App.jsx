import { useMemo, useState } from 'react';
import { Leva, button, useControls } from 'leva';
import Scene from './scene/Scene';
import { TANK_HEIGHT } from './scene/constants';
import './App.css';

export default function App() {
  const [triggeredMap, setTriggeredMap] = useState({});
  const [triggerCounts, setTriggerCounts] = useState({});

  const triggeredTotal = useMemo(
    () => Object.values(triggeredMap).filter(Boolean).length,
    [triggeredMap],
  );

  const reset = () => {
    setTriggeredMap({});
    setTriggerCounts({});
  };

  const { rows, cols, density, launchScale, postProcessing, showStats } = useControls('PongTrap', {
    rows: { value: 12, min: 4, max: 30, step: 1, label: 'rows' },
    cols: { value: 12, min: 4, max: 30, step: 1, label: 'cols' },
    density: {
      value: 1,
      min: 0.5,
      max: 2,
      step: 0.05,
      label: 'density',
    },
    launchScale: {
      value: 0.1,
      min: 0.02,
      max: 0.3,
      step: 0.01,
      label: 'launch velocity',
    },
    postProcessing: { value: true, label: 'bloom' },
    showStats: { value: false, label: 'fps stats' },
    reset: button(reset),
  });

  const triggerTrap = (id) => {
    setTriggeredMap((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    setTriggerCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  return (
    <div className="app">
      <Leva collapsed={false} oneLineLabels hideCopyButton />

      <div className="hud">
        <strong>PongTrap Lab</strong>
        <span>Height: {TANK_HEIGHT}</span>
        <span>
          Grid: {rows} × {cols}
        </span>
        <span>Triggered: {triggeredTotal}</span>
      </div>

      <Scene
        rows={rows}
        cols={cols}
        density={density}
        launchScale={launchScale}
        triggeredMap={triggeredMap}
        triggerCounts={triggerCounts}
        onTrigger={triggerTrap}
        postProcessing={postProcessing}
        showStats={showStats}
      />
    </div>
  );
}
