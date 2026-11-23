// NEON DODGE simulation: pure logic, no DOM, no network. The browser game (game.js)
// and the video frame renderer both step this same code, so the video shows the real game.
// One prompt: a neon triangle ship dodges falling asteroids. Score climbs per second
// survived, speed rises, one hit ends the game, R restarts.

export const WIDTH = 1280;
export const HEIGHT = 720;
export const SHIP_Y = 640;
export const SHIP_RADIUS = 16;

// Deterministic RNG so a run replays exactly the same way every time.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newState(seed = 20261123) {
  return {
    time: 0,
    shipX: WIDTH / 2,
    shipSpeed: 0,
    asteroids: [],
    spawnIn: 0.4,
    score: 0,
    alive: true,
    overAt: 0,
    rng: mulberry32(seed),
    stars: makeStars(mulberry32(seed ^ 0x9e3779b9)),
  };
}

function makeStars(rng) {
  const stars = [];
  for (let i = 0; i < 110; i++) {
    stars.push({ x: rng() * WIDTH, y: rng() * HEIGHT, r: 0.6 + rng() * 1.6, tw: rng() * 6.28 });
  }
  return stars;
}

function spawnAsteroid(state) {
  const r = 14 + state.rng() * 26;
  state.asteroids.push({
    x: 30 + state.rng() * (WIDTH - 60),
    y: -r - 10,
    r,
    vy: 150 + state.rng() * 90 + state.time * 6,
    vx: (state.rng() - 0.5) * 40,
    rot: state.rng() * 6.28,
    vr: (state.rng() - 0.5) * 1.6,
  });
}

// input: -1 (left), 0 (none), 1 (right). dt in seconds.
export function step(state, input, dt) {
  if (!state.alive) return state;
  state.time += dt;
  state.score = Math.floor(state.time);

  // Ship: accelerate toward the input direction, clamp to the screen.
  const accel = 2600;
  const maxSpeed = 620;
  state.shipSpeed += input * accel * dt;
  state.shipSpeed *= Math.pow(0.12, dt); // friction when no input
  if (state.shipSpeed > maxSpeed) state.shipSpeed = maxSpeed;
  if (state.shipSpeed < -maxSpeed) state.shipSpeed = -maxSpeed;
  state.shipX += state.shipSpeed * dt;
  if (state.shipX < 24) { state.shipX = 24; state.shipSpeed = 0; }
  if (state.shipX > WIDTH - 24) { state.shipX = WIDTH - 24; state.shipSpeed = 0; }

  // Spawn faster as the run goes on.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnAsteroid(state);
    const gap = Math.max(0.22, 0.62 - state.time * 0.012);
    state.spawnIn = gap * (0.7 + state.rng() * 0.6);
  }

  for (const a of state.asteroids) {
    a.y += a.vy * dt;
    a.x += a.vx * dt;
    a.rot += a.vr * dt;
    if (a.x < a.r) { a.x = a.r; a.vx = Math.abs(a.vx); }
    if (a.x > WIDTH - a.r) { a.x = WIDTH - a.r; a.vx = -Math.abs(a.vx); }
  }
  state.asteroids = state.asteroids.filter((a) => a.y - a.r < HEIGHT + 20);

  // Collision: ship circle vs asteroid circle.
  for (const a of state.asteroids) {
    const dx = a.x - state.shipX;
    const dy = a.y - SHIP_Y;
    const hit = a.r + SHIP_RADIUS - 6;
    if (dx * dx + dy * dy < hit * hit) {
      state.alive = false;
      state.overAt = state.time;
      break;
    }
  }
  return state;
}

// Demo pilot used by the video renderer: steers toward the widest gap.
export function demoInput(state) {
  if (!state.alive) return 0;
  let threat = null;
  for (const a of state.asteroids) {
    if (a.y > SHIP_Y - 260 && a.y < SHIP_Y + 40) {
      if (!threat || a.y > threat.y) threat = a;
    }
  }
  if (!threat) return 0;
  const dx = threat.x - state.shipX;
  if (Math.abs(dx) < threat.r + 26) return dx > 0 ? -1 : 1;
  return 0;
}
