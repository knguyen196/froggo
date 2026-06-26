import { useState, useEffect, useRef, useMemo, memo } from "react";

// FROGGO desktop pet: timer-driven need engine (water > food > stretch priority).

// Palette (Layer 1)
const PALETTES = {
  green: {
    g: "#6fcf7f",
    s: "#4f9e63",
    d: "#3d8b4f",
    l: "#eafbe3",
    k: "#2b2b2b",
    w: "#ffffff",
    p: "#ff9eb5",
    c: "#7ec8e3",
    f: "#5a4632",
    v: "#cfd6cf",
    b: "#23341f",
    G: "#9fab9f",
    S: "#828e84",
    L: "#e2e6df",
    D: "#6a746c",
    outline: "#2b5e3f",
    outlineGrey: "#5d665f",
  },
  lavender: {
    g: "#c4a8e8",
    s: "#9d7fc9",
    d: "#7d5fa8",
    l: "#f3ecfb",
    k: "#2b2b2b",
    w: "#ffffff",
    p: "#ff9ec4",
    c: "#7ec8e3",
    f: "#5a4632",
    v: "#d8cfe6",
    b: "#2e2340",
    G: "#aaa6b2",
    S: "#8e8896",
    L: "#e8e4ee",
    D: "#746c7e",
    outline: "#5a3f7e",
    outlineGrey: "#665d6e",
  },
};
const E = "............................";

const IDLE = [
  E,
  E,
  E,
  E,
  E,
  ".....gggggg......gggggg.....",
  "....gkkkkkggggggggkkkkkg....",
  "...ggwwkkkggggggggwwkkkgg...",
  "...ggwwkkkggggggggwwkkkgg...",
  "...ggkkkkkggggggggkkkkkgg...",
  "...ggkkkkwggggggggkkkkwgg...",
  "...gpppggggggggggggggpppg...",
  "...gggggggggdggdggggggggg...",
  "...ggggggggggddgggggggggg...",
  "...ggggggllllllllllgggggg...",
  "..ggggsgllllllllllllgsgggg..",
  "..ggggsgllllllllllllgsgggg..",
  "..ggggsgllllllllllllgsgggg..",
  "..ggggsgllllllllllllgsgggg..",
  "..ggggsggllllllllllggsgggg..",
  "..gggggggggggggggggggggggg..",
  "...gggggggggggggggggggggg...",
  "...ggggggg........ggggggg...",
  "...gg.gg.gg......gg.gg.gg...",
  E,
  E,
];

const mod = (base, changes) => {
  const f = [...base];
  for (const [i, row] of Object.entries(changes)) f[+i] = row;
  return f;
};
const GREY_MAP = { g: "G", s: "S", l: "L", d: "D" };
const desat = (frame) =>
  frame.map((row) => [...row].map((ch) => GREY_MAP[ch] || ch).join(""));

const HAPPY_EYES = {
  6: "....gggggggggggggggggggg....",
  7: "...gggggggggggggggggggggg...",
  8: "...gggdddggggggggggdddggg...",
  9: "...ggdgggdggggggggdgggdgg...",
  10: "...gggggggggggggggggggggg...",
};
const MOUTH_OPEN = {
  12: "...gggggggggbbbbggggggggg...",
  13: "...gggggggggbbbbggggggggg...",
};

const FRAMES = {
  idle: IDLE,
  blink: mod(IDLE, HAPPY_EYES),
  smile: mod(IDLE, { ...HAPPY_EYES, 2: "....w..................w...." }),

  pour1: mod(IDLE, {
    0: ".........c...c...c..........",
    1: "...........c...c............",
  }),
  pour2: mod(IDLE, {
    0: ".........c...c...c..........",
    1: "...........c...c............",
    2: ".........c...c...c..........",
    3: "...........c...c............",
  }),
  absorb1: mod(IDLE, {
    ...HAPPY_EYES,
    0: ".........c...c...c..........",
    2: "...........c...c............",
    5: ".....gggggg..cc..gggggg.....",
    14: "...cgggggllllllllllgggggc...",
    17: "..cgggsgllllllllllllgsgggc..",
  }),
  absorb2: mod(IDLE, {
    ...HAPPY_EYES,
    1: ".........c...c...c..........",
    3: "...........c...c............",
    5: ".....gggggg..cc..gggggg.....",
    15: "..cgggsgllllllllllllgsgggc..",
    18: "..cgggsgllllllllllllgsgggc..",
  }),

  eat1: mod(IDLE, {
    0: ".....................v..v...",
    1: "......................ff....",
  }),
  eat2: mod(IDLE, { 1: "...............vffv.........", ...MOUTH_OPEN }),
  eat3: mod(IDLE, {
    0: "............v..v............",
    1: ".............ff.............",
    2: ".............pp.............",
    3: ".............pp.............",
    4: ".............pp.............",
    5: ".....gggggg..pp..gggggg.....",
    6: "....gkkkkkgggppgggkkkkkg....",
    7: "...ggwwkkkgggppgggwwkkkgg...",
    8: "...ggwwkkkgggppgggwwkkkgg...",
    9: "...ggkkkkkgggppgggkkkkkgg...",
    10: "...ggkkkkwgggppgggkkkkwgg...",
    11: "...gpppggggggppggggggpppg...",
    12: "...gggggggggbppbggggggggg...",
    13: "...gggggggggbbbbggggggggg...",
  }),
  gulp: mod(IDLE, {
    12: "...gggggggggggggggggggggg...",
    13: "...gggggggggddddggggggggg...",
    14: "..gggggggllllllllllggggggg..",
  }),

  tired1: mod(IDLE, {
    0: "...................www..w...",
    1: "....................w..w....",
    2: "...............www.www......",
    3: "................w...........",
    4: "...............www..........",
    6: "....gggggggggggggggggggg....",
    7: "...gggggggggggggggggggggg...",
    8: "...gggggggggggggggggggggg...",
    9: "...gggggggggggggggggggggg...",
    10: "...ggsssssggggggggsssssgg...",
    11: "...gggggggggggggggggggggg...",
    12: "...gggggggggddddggggggggg...",
    13: "...gggggggggggggggggggggg...",
  }),
  tired2: mod(IDLE, {
    0: "...................www......",
    1: "....................w.......",
    2: "...............www.www......",
    3: "................w...........",
    4: "...............www..........",
    6: "....gggggggggggggggggggg....",
    7: "...gggggggggggggggggggggg...",
    8: "...gggggggggggggggggggggg...",
    9: "...gggggggggggggggggggggg...",
    10: "...ggsssssggggggggsssssgg...",
    11: "...gggggggggggggggggggggg...",
    12: "...gggggggggddddggggggggg...",
    13: "...gggggggggggggggggggggg...",
  }),

  thirsty1: desat(
    mod(IDLE, {
      11: "...gggggggggggggggggggggg...",
      12: "...ggggggggggddgggggggggg...",
      13: "...gggggggggdggdggggggggg...",
    }),
  ),
  thirsty2: desat(
    mod(IDLE, {
      11: "...gggggggggggggggggggggg...",
      12: "...ggggggggggddgggggggggg...",
      13: "...gggggggggdggdggggggggg...",
    }),
  ),

  hungry1: mod(IDLE, {
    12: "...ggggggggggddgggggggggg...",
    13: "...gggggggggdggdcgggggggg...",
    14: "...gggggglllllllcllgggggg...",
  }),
  hungry2: mod(IDLE, {
    12: "...ggggggggggddgggggggggg...",
    13: "...gggggggggdggdggggggggg...",
    14: "...gggggglllllllcllgggggg...",
    15: "..ggggsgllllllllclllgsgggg..",
  }),

  crouch: [E, E, ...IDLE.filter((_, i) => i !== 16 && i !== 17)],
  air: mod([...IDLE.slice(2), E, E], {
    20: "......ggggg......ggggg......",
    21: E,
  }),
};

const PAD = [E, E, E, E, E, E];
for (const key of Object.keys(FRAMES)) FRAMES[key] = [...PAD, ...FRAMES[key]];

const CLOUD = {
  0: "...........wwwwww...........",
  1: ".........wwwwwwwwww.........",
  2: "......wwwwwwwwwwwwwwww......",
  3: "....wwwwwwwwwwwwwwwwww......",
  4: "...wwwwwwwwwwwwwwwwwwwwww...",
  5: "...wwwwwwwwwwwwwwwwwwwwww...",
  6: "....wwwwwwwwwwwwwwwwwwww....",
  7: ".....www.www.www.www.ww.....",
  8: "....................ww......",
  9: "....................ww......",
  10: "...................w........",
};
FRAMES.thirsty1 = [
  E,
  ...mod(FRAMES.thirsty1, {
    ...CLOUD,
    3: "....wwwwwwwwwcwwwwwwww......",
    4: "...wwwwwwwwwcccwwwwwwwwww...",
    5: "...wwwwwwwwwcccwwwwwwwwww...",
  }),
];
FRAMES.thirsty2 = [
  E,
  ...mod(FRAMES.thirsty2, {
    ...CLOUD,
    3: "....wwwwwwwwwwcwwwwwww......",
    4: "...wwwwwwwwwwcccwwwwwwwww...",
    5: "...wwwwwwwwwwcccwwwwwwwww...",
    10: E,
  }),
];
FRAMES.hungry1 = [
  E,
  ...mod(FRAMES.hungry1, {
    ...CLOUD,
    3: "....wwwwwwwvwwvwwwwwww......",
    4: "...wwwwwwwwwffwwwwwwwwwww...",
  }),
];
FRAMES.hungry2 = [
  E,
  ...mod(FRAMES.hungry2, {
    ...CLOUD,
    4: "...wwwwwwwwvffvwwwwwwwwww...",
    10: E,
  }),
];

// Animations (Layer 2)
const ANIMS = {
  idle: {
    frames: ["idle", "idle", "crouch", "idle", "blink"],
    fps: 2,
    loop: true,
  },
  drink: {
    frames: [
      "pour1",
      "pour2",
      "absorb1",
      "absorb2",
      "absorb1",
      "absorb2",
      "smile",
      "smile",
    ],
    fps: 5,
  },
  eat: {
    frames: [
      "eat1",
      "eat2",
      "eat3",
      "gulp",
      "idle",
      "gulp",
      "smile",
      "smile",
      "smile",
    ],
    fps: 5,
  },
  hop: {
    frames: ["crouch", "crouch", "air", "air", "crouch", "idle"],
    fps: 8,
    dy: [0, 0, 34, 40, 0, 0],
  },
  holdHop: {
    frames: ["crouch", "crouch", "air", "air", "crouch", "idle"],
    fps: 8,
    loop: true,
    dy: [0, 0, 34, 40, 0, 0],
  },
  stretch: {
    frames: [
      "crouch",
      "air",
      "crouch",
      "air",
      "crouch",
      "smile",
      "smile",
      "smile",
    ],
    fps: 6,
    dy: [0, 36, 0, 36, 0, 0, 0, 0],
  },
  tired: {
    frames: ["tired1", "tired1", "tired2", "tired2"],
    fps: 2,
    loop: true,
  },
  thirsty: {
    frames: ["thirsty1", "thirsty1", "thirsty2", "thirsty2"],
    fps: 2,
    loop: true,
  },
  hungry: {
    frames: ["hungry1", "hungry1", "hungry2", "hungry2"],
    fps: 2,
    loop: true,
  },
};
const ONE_SHOT = new Set(["drink", "eat", "hop", "stretch"]);
const HOLD_ANIMS = new Set(["holdHop"]);
// 4-step cycle: left, center, right, center
const HOP_PATTERN = [
  { dx: -15, flip: true },
  { dx: 15, flip: false },
  { dx: 15, flip: false },
  { dx: -15, flip: true },
];

// Need engine: each need has a "due" timestamp; priority follows array order.
const NEEDS = [
  {
    key: "water",
    minutes: 60,
    state: "thirsty",
    careAnim: "drink",
    label: "Water",
  },
  {
    key: "food",
    minutes: 240,
    state: "hungry",
    careAnim: "eat",
    label: "Food",
  },
  {
    key: "stretch",
    minutes: 90,
    state: "tired",
    careAnim: "stretch",
    label: "Stretch",
  },
];
const NEED_BY_KEY = Object.fromEntries(NEEDS.map((n) => [n.key, n]));

// Sprite renderer (Layer 1 -> pixels)
const COLS = 28,
  ROWS = 32,
  P = 8;
const SPRITE_W = COLS * P,
  SPRITE_H = ROWS * P;

// Memoized so per second `now` updates don't redraw the sprite unnecessarily.
const Sprite = memo(function Sprite({ frame, flip, pal, scale }) {
  const grid = FRAMES[frame];
  const rows = grid.length;
  const w = COLS * scale;
  const h = rows * scale;
  const outline = frame.startsWith("thirsty") ? pal.outlineGrey : pal.outline;
  const filled = (x, y) =>
    y >= 0 && y < rows && x >= 0 && x < COLS && grid[y][x] !== ".";
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < COLS; x++) {
      const ch = grid[y][x];
      if (ch !== ".")
        cells.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="1"
            height="1"
            fill={pal[ch]}
          />,
        );
      else if (
        filled(x - 1, y) ||
        filled(x + 1, y) ||
        filled(x, y - 1) ||
        filled(x, y + 1)
      )
        cells.push(
          <rect
            key={`o${x}-${y}`}
            x={x}
            y={y}
            width="1"
            height="1"
            fill={outline}
          />,
        );
    }
  }
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${COLS} ${rows}`}
      shapeRendering="crispEdges"
      style={{ transform: flip ? "scaleX(-1)" : "none", display: "block" }}
    >
      {cells}
    </svg>
  );
});

export default function Froggo() {
  const [anim, setAnim] = useState("idle");
  const [frame, setFrame] = useState("idle");
  const [flip, setFlip] = useState(false);
  const [dy, setDy] = useState(0);
  const [now, setNow] = useState(Date.now());

  const [timers, setTimers] = useState({ water: 60, food: 240, stretch: 90 });
  const [palette, setPalette] = useState("green");
  const [showSettings, setShowSettings] = useState(false);
  const [scale, setScale] = useState(8);

  // dueRef holds each need's "due" timestamp (ms), starting from now.
  const loaded = useRef(false);
  const dueRef = useRef(null);
  if (dueRef.current === null) {
    const t = Date.now();
    dueRef.current = {};
    for (const n of NEEDS) dueRef.current[n.key] = t + n.minutes * 60000;
  }
  // tick forces dueNeeds to recompute after a direct dueRef mutation.
  const [tick, bump] = useState(0);
  const reTick = () => bump((b) => b + 1);

  const hopCycleRef = useRef(0); // index into HOP_PATTERN
  const holdTimerRef = useRef(null);
  // Ref so the once-registered IPC listener always sees the latest anim.
  const animRef = useRef(anim);
  animRef.current = anim;

  useEffect(() => {
    if (!window.frogAPI) {
      loaded.current = true;
      return;
    }
    (async () => {
      const save = await window.frogAPI.loadSave();
      if (save) {
        if (save.timers) setTimers(save.timers);
        if (save.palette) setPalette(save.palette);
        if (save.scale) setScale(save.scale);
        if (save.due) dueRef.current = save.due;
        reTick();
      }
      loaded.current = true;
    })();
  }, []);
  useEffect(() => {
    if (!loaded.current || !window.frogAPI) return;
    window.frogAPI?.writeSave({ timers, palette, scale, due: dueRef.current });
  }, [timers, palette, scale]);

  // Clock: advance "now" every second.
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!window.frogAPI) return;
    return window.frogAPI.onAction((action) => {
      if (action === "water") careFor("water");
      if (action === "food") careFor("food");
      if (action === "stretch") careFor("stretch");
      if (action === "hop" && !ONE_SHOT.has(animRef.current)) setAnim("hop");
      if (action === "settings") setShowSettings(true);
    });
  }, []);

  const careFor = (key) => {
    const n = NEED_BY_KEY[key];
    setAnim(n.careAnim);
  };

  // Needs currently due (timer elapsed), in priority order.
  const dueNeeds = useMemo(() => {
    return NEEDS.filter((n) => now >= dueRef.current[n.key]);
  }, [now, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const topNeed = dueNeeds[0] || null;

  // Resting animation = top due need's mood, or idle.
  const restingAnim = topNeed ? topNeed.state : "idle";
  const restingRef = useRef(restingAnim);
  restingRef.current = restingAnim;

  // Switch the resting loop when the top need changes, unless mid one-shot/hold-hop.
  useEffect(() => {
    if (!ONE_SHOT.has(anim) && !HOLD_ANIMS.has(anim)) setAnim(restingAnim);
  }, [restingAnim]); // eslint-disable-line

  useEffect(() => {
    if (!window.frogAPI) return;
    if (showSettings) {
      window.frogAPI.resizeWindow({ width: 240, height: 320 });
      return;
    }
    const spriteW = COLS * scale;
    const needsHeadroom = anim === "thirsty" || anim === "hungry";
    const height = needsHeadroom ? (ROWS + 1) * scale : (ROWS - 5) * scale;
    window.frogAPI.resizeWindow({ width: spriteW, height });
  }, [anim, showSettings, scale]);

  // Animation player
  useEffect(() => {
    const a = ANIMS[anim];
    let i = 0;
    setFrame(a.frames[0]);
    setDy(a.dy ? a.dy[0] : 0);
    const id = setInterval(() => {
      i++;
      if (i >= a.frames.length) {
        if (a.loop) {
          i = 0;
          if (anim === "holdHop") {
            hopCycleRef.current =
              (hopCycleRef.current + 1) % HOP_PATTERN.length;
            setFlip(HOP_PATTERN[hopCycleRef.current].flip);
          }
        } else {
          setAnim(restingRef.current);
          return;
        }
      }
      setFrame(a.frames[i]);
      setDy(a.dy ? a.dy[i] : 0);
      if (anim === "holdHop" && (i === 2 || i === 3)) {
        window.frogAPI?.dragWindow({
          dx: HOP_PATTERN[hopCycleRef.current].dx,
          dy: 0,
        });
      }
    }, 1000 / a.fps);
    return () => clearInterval(id);
  }, [anim]);

  // Click the frog: fix the top need and play its care anim, or just hop if content.
  const clickFrog = () => {
    const top = dueNeeds[0];
    if (top) {
      dueRef.current[top.key] = Date.now() + timers[top.key] * 60000;
      reTick();
      window.frogAPI?.writeSave({
        timers,
        palette,
        scale,
        due: dueRef.current,
      });
      setAnim(top.careAnim);
    } else if (!ONE_SHOT.has(anim)) {
      setAnim("hop");
    }
  };

  // Pointer handlers: short tap → click, move > 4px → drag window, hold 300ms → side-hop.
  const pressRef = useRef(null);
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pressRef.current = {
      state: "down",
      startX: e.screenX,
      startY: e.screenY,
      lastX: e.screenX,
      lastY: e.screenY,
    };
    holdTimerRef.current = setTimeout(() => {
      const p = pressRef.current;
      if (
        p?.state === "down" &&
        !ONE_SHOT.has(animRef.current) &&
        !HOLD_ANIMS.has(animRef.current)
      ) {
        p.state = "hopping";
        hopCycleRef.current = 0;
        setFlip(HOP_PATTERN[0].flip);
        setAnim("holdHop");
      }
    }, 300);
  };
  const onPointerMove = (e) => {
    const p = pressRef.current;
    if (!p || p.state === "hopping") return;
    if (
      p.state === "down" &&
      (Math.abs(e.screenX - p.startX) > 4 || Math.abs(e.screenY - p.startY) > 4)
    ) {
      p.state = "dragging";
      clearTimeout(holdTimerRef.current);
    }
    if (p.state === "dragging") {
      window.frogAPI?.dragWindow({
        dx: e.screenX - p.lastX,
        dy: e.screenY - p.lastY,
      });
      p.lastX = e.screenX;
      p.lastY = e.screenY;
    }
  };
  const onPointerUp = (e) => {
    if (e.button !== 0) return;
    clearTimeout(holdTimerRef.current);
    const p = pressRef.current;
    if (p?.state === "down") clickFrog();
    else if (p?.state === "hopping") {
      setAnim(restingRef.current);
      setFlip(false);
    }
    pressRef.current = null;
  };

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        window.frogAPI?.openMenu();
      }}
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ cursor: "pointer", WebkitAppRegion: "no-drag" }}
      >
        <Sprite
          frame={frame}
          flip={flip}
          pal={PALETTES[palette]}
          scale={scale}
        />
      </div>
      {showSettings && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,24,18,0.96)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 18,
            color: "#cfe6d4",
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            WebkitAppRegion: "no-drag",
          }}
        >
          <div style={{ fontSize: 15, color: "#eaf5ec", marginBottom: 4 }}>
            Froggo Settings
          </div>

          {["water", "food", "stretch"].map((key) => (
            <label
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{key} (min)</span>
              <input
                type="number"
                min="1"
                value={timers[key]}
                onChange={(e) => {
                  const raw = e.target.value;
                  setTimers((t) => ({
                    ...t,
                    [key]: raw === "" ? "" : Number(raw),
                  }));
                }}
                onBlur={(e) => {
                  const mins = Math.max(1, Number(e.target.value) || 1);
                  setTimers((t) => ({ ...t, [key]: mins }));
                  dueRef.current[key] = Date.now() + mins * 60000;
                  reTick();
                }}
                style={{
                  width: 64,
                  background: "#1d2b22",
                  color: "#eaf5ec",
                  border: "1px solid #3a5142",
                  borderRadius: 4,
                  padding: "3px 6px",
                  fontFamily: "inherit",
                }}
              />
            </label>
          ))}

          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Frog color</span>
            <select
              value={palette}
              onChange={(e) => setPalette(e.target.value)}
              style={{
                background: "#1d2b22",
                color: "#eaf5ec",
                border: "1px solid #3a5142",
                borderRadius: 4,
                padding: "3px 6px",
                fontFamily: "inherit",
              }}
            >
              <option value="green">Green</option>
              <option value="lavender">Lavender</option>
            </select>
          </label>
          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Frog size</span>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              style={{
                background: "#1d2b22",
                color: "#eaf5ec",
                border: "1px solid #3a5142",
                borderRadius: 4,
                padding: "3px 6px",
                fontFamily: "inherit",
              }}
            >
              <option value={6}>Small</option>
              <option value={8}>Medium</option>
              <option value={12}>Large</option>
            </select>
          </label>
          <button
            onClick={() => setShowSettings(false)}
            style={{
              marginTop: 8,
              background: "#4a6b52",
              color: "#eaf5ec",
              border: "none",
              borderRadius: 4,
              padding: "8px",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
