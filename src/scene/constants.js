export const TANK_HEIGHT = 10;

export const WORLD = {
  gravity: [0, -9.81, 0],
  // smaller fixed step improves collision robustness (less tunneling)
  timeStep: 1 / 120,
};

export const TANK_VISUAL = {
  wallThickness: 0.2,
  glassOpacity: 0.15,
  floorColor: '#11151d',
  glassColor: '#b7e3ff',
};

export const TRAP = {
  size: [0.8, 0.16, 0.55],
  color: '#7d8794',
  metalColor: '#b8c2cf',
  ballRadius: 0.12,
  ballColor: '#f6f7fb',
  ballMass: 0.04,
  ballRestitution: 0.78,
  ballFriction: 0.35,
};

export const GRID = {
  baseSpacing: 1.35,
  edgePadding: 0.8,
};

export const LAUNCH = {
  upwardImpulse: 0.95,
  lateralImpulse: 0.45,
  randomLateralJitter: 0.15,
};

export const CHAIN_REACTION = {
  minSpeedToTrigger: 1.2,
  trapTriggerRadius: 0.5,
  maxBallHeightForTrigger: 0.9,
};
