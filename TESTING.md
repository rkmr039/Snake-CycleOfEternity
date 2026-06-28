# Testing Plan - Snake Game (Vibe Edition)

This document maps out the core test scenarios and expected results for verification of game mechanics and math logic.

---

## 🛡️ 3. Collision Resolution & Aegis Halo (Shield)

Verify that wall and tail boundary checks trigger Game Over under normal circumstances, but wrap or absorb coordinates when a shield is active.

| ID | Description | Test Condition | Expected Result |
| :--- | :--- | :--- | :--- |
| **COL-001** | Border crash without shield | Position: `x = 0, y = 10`. Direction: `LEFT`. Run 1 tick. | `expect(gameState).to.equal('GAME_OVER')`<br>`expect(playSoundSpy.calledWith('crash')).to.be.true` |
| **COL-002** | Border wrap with Aegis Halo | Shield active. Position: `x = 0`. Direction: `LEFT`. Run 1 tick. | `expect(newHead.x).to.equal(GRID_SIZE - 1)` (wrapped)<br>`expect(powerUpActive).to.be.null` (shield consumed) |
| **COL-003** | Self-collision crash without shield | Head steps on tail coordinate. | `expect(gameState).to.equal('GAME_OVER')` |
| **COL-004** | Self-collision bypass with Aegis Halo | Shield active. Head steps on tail coordinate. | `expect(gameState).to.equal('PLAYING')` (absorbs hit)<br>`expect(powerUpActive).to.be.null` |
| **COL-005** | Custom Wall Wrap Mode | Wrap Mode enabled. Position: `x = 0`. Direction: `LEFT`. Run 1 tick. | `expect(newHead.x).to.equal(GRID_SIZE - 1)` (wrapped)<br>Shield remains unconsumed if active. |

---

## 🍎 4. Food, Scoring & Power-up Durations

| ID | Description | Test Condition | Expected Result |
| :--- | :--- | :--- | :--- |
| **FOD-006** | Power-up timer countdown | Run game loop ticks when power-up is active. | `expect(powerUpDuration).to.decrement()` |

---

## ⏱️ 5. Play Duration Tracker

| ID | Description | Test Condition | Expected Result |
| :--- | :--- | :--- | :--- |
| **TIM-004** | Save final duration to state on crash | Trigger crash. Inspect game over stats. | `expect(gameDuration).to.equal(finalSeconds)` |
