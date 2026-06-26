# Froggo

A desktop pet that reminds you to take care of yourself. Froggo gets thirsty, hungry, and tired over time, and caring for it nudges you to drink water, eat, and stretch too.

<p align="center">
  <img src="assets/froggo-thirsty.gif" width="160" alt="Froggo thirsty" />
  <img src="assets/froggo-drink.gif" width="160" alt="Froggo being watered" />
  <img src="assets/froggo-hungry.gif" width="160" alt="Froggo hungry" />
  <img src="assets/froggo-eat.gif" width="160" alt="Froggo eating" />
</p>

## What it does

Three timers (water, food, stretch) run down over time. When one runs out, the frog gets thirsty, hungry, or tired on its own. Click it to care for whatever it needs most, which plays an animation and resets that timer. Hold to make it hop around the screen, drag to move it, right-click for more options.

It floats on top of your desktop in a transparent window, lives in the system tray, and remembers its state between sessions.

## Built with

Electron (desktop shell, tray, transparent window), React + Vite (the animation engine), and electron-builder (packaging). The frog uses no image assets: every frame is a grid of characters mapped to colors, animations are playlists of those frames, and a timestamp-based need engine drives its mood.

## Running it

Download the latest `Froggo.exe` from [Releases](../../releases) and run it (no install needed).

From source:

```bash
npm install
npm run dev        # Vite dev server (terminal 1)
npm run electron   # Electron window (terminal 2)
npm run dist       # build a portable .exe
```
