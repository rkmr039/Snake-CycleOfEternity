# Snake Game (Vibe Edition)

Welcome to **Snake Game (Vibe Edition)**, a premium, retro-futuristic arcade experience built on modern web technologies. This project reimagines the classic Nokia Snake game with rich neon aesthetics, HTML5 Canvas particle physics, dynamic speed modifications, custom shield collision wrapping, and real-time audio synthesis powered by the Web Audio API.

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Dev Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

---

## 🛡️ Aegis Halo & Power-ups

The game includes several power-ups that spawn dynamically:

| Power-up         | Color          | Score | Effect                                                              |
| :--------------- | :------------- | :---- | :------------------------------------------------------------------ |
| **Normal Food**  | Neon Green     | `+10` | Restores base speed.                                                |
| **Golden Chime** | Neon Gold      | `+30` | Spawns at maximum distance during the dual-choice challenge.        |
| **Hyper Drive**  | Neon Cyan      | `+10` | Overclocks game loop (1.8x speed) for 8s.                           |
| **Chill Vibe**   | Neon Purple    | `+10` | Slows game loop (0.62x speed) for 8s.                               |
| **Aegis Halo**   | Pulsating Pink | `+10` | Provides a 5-charge shield protecting against wall or tail crashes. |

### Shield Collision Wrap & Tail Absorption

If an active shield (`Aegis Halo`) is detected during border violations or self-intersection tests, the collision is absorbed, a charge is consumed, and when all 5 charges run out the shield is deactivated:

- Hitting a boundary in CRASH mode wraps you safely to the opposite border.
- Hitting a tail segment lets you pass through.
