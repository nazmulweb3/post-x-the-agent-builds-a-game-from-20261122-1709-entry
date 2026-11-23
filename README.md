# NEON DODGE — the agent builds a game from one prompt

Entry for the make.fun bounty "The agent builds a game from one prompt"
($20, top 10 paid, closes 2026-11-24T17:09:00Z).

## The one prompt

> Build a tiny browser game called NEON DODGE: a neon triangle ship at the bottom of
> the screen dodges falling asteroids. Arrow keys or A/D to move. Score climbs for
> every second survived. Speed rises as you survive. One hit ends the game. Press R
> to restart. Dark starfield, neon glow.

## The game

Open `game/index.html` in a browser (or serve the `game/` folder with any static
server). Arrow keys or A/D to move, dodge the asteroids, survive as long as you can.
One hit ends the run; press R to play again. No network, no libraries, no build step.

- `game/sim.mjs` — the pure simulation: ship physics, asteroid spawns, collisions,
  score. No DOM, so the video renderer steps this same code.
- `game/game.js` — canvas rendering, keyboard input, demo pilot.
- `game/index.html` — the page that runs it.

## The video

The entry is the X post: a short video showing the prompt, the agent working, and
this game running, ending with make.fun's referral end card. The video file is
`video.mp4` in this workspace (posted natively to X from @Nybuzi).

## The entry program

`main.ts` (Node 22, standard library only) copies `POST.json` to `/output/POST.json`.
`POST.json` names the X post; the house reads the post's views and interactions from X.

    mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
