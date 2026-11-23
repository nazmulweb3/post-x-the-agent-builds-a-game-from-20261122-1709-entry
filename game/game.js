// NEON DODGE — browser game. Canvas 2D, keyboard only, no network, no libraries.
// One prompt: dodge the falling asteroids, survive, score climbs, one hit ends it, R restarts.
import { WIDTH, HEIGHT, SHIP_Y, SHIP_RADIUS, newState, step } from "./sim.mjs";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;

const demo = new URLSearchParams(location.search).get("demo") === "1";

let state = newState();
let keys = new Set();
let last = performance.now();

addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) e.preventDefault();
  keys.add(e.key);
  if ((e.key === "r" || e.key === "R") && !state.alive) state = newState();
});
addEventListener("keyup", (e) => keys.delete(e.key));

function input() {
  if (demo) return 0; // demo mode is driven by the bot below, not keys
  let v = 0;
  if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) v -= 1;
  if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) v += 1;
  return v;
}

// The demo pilot lives in sim.mjs so the video renderer steers exactly like the game.
import { demoInput } from "./sim.mjs";

function drawStar(s, t) {
  const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.5 + s.tw));
  ctx.globalAlpha = a;
  ctx.fillStyle = "#cfe8ff";
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.r, 0, 6.2832);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawAsteroid(a) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rot);
  ctx.fillStyle = "#3a2b4d";
  ctx.strokeStyle = "#ff5da2";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const ang = (i / 9) * 6.2832;
    const rr = a.r * (0.82 + 0.18 * Math.sin(i * 2.7 + a.rot));
    const x = Math.cos(ang) * rr;
    const y = Math.sin(ang) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawShip(x) {
  ctx.save();
  ctx.translate(x, SHIP_Y);
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#00f0ff";
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(15, 14);
  ctx.lineTo(0, 6);
  ctx.lineTo(-15, 14);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0b1026";
  ctx.beginPath();
  ctx.arc(0, -2, 4, 0, 6.2832);
  ctx.fill();
  ctx.restore();
}

function draw(now) {
  const t = now / 1000;
  const g = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  g.addColorStop(0, "#070312");
  g.addColorStop(1, "#160a2e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (const s of state.stars) drawStar(s, t);
  for (const a of state.asteroids) drawAsteroid(a);
  if (state.alive) drawShip(state.shipX);

  ctx.fillStyle = "#e8f6ff";
  ctx.font = "bold 30px 'DejaVu Sans', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("NEON DODGE", 24, 46);
  ctx.textAlign = "right";
  ctx.fillText("SCORE " + state.score, WIDTH - 24, 46);
  ctx.textAlign = "center";
  ctx.font = "20px 'DejaVu Sans', sans-serif";
  ctx.fillStyle = "#8fd8ff";
  if (state.alive && state.time < 2.5) {
    ctx.fillText("ARROWS or A / D to move — dodge the asteroids", WIDTH / 2, HEIGHT - 24);
  }
  if (!state.alive) {
    ctx.fillStyle = "#ff5da2";
    ctx.font = "bold 54px 'DejaVu Sans', sans-serif";
    ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 10);
    ctx.fillStyle = "#e8f6ff";
    ctx.font = "26px 'DejaVu Sans', sans-serif";
    ctx.fillText("You survived " + state.overAt.toFixed(1) + "s — score " + state.score, WIDTH / 2, HEIGHT / 2 + 36);
    ctx.fillStyle = "#8fd8ff";
    ctx.font = "20px 'DejaVu Sans', sans-serif";
    ctx.fillText("Press R to play again", WIDTH / 2, HEIGHT / 2 + 72);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(state, demo ? demoInput(state) : input(), dt);
  draw(now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
