import React, { useEffect, useRef, useState } from 'react';
import { useSound } from '../hooks/useSound';
import { GameBoard } from './GameBoard';
import { ScoreBoard } from './ScoreBoard';
import { Menu } from './Menu';
import { Instructions } from './Instructions';
import {
  Point,
  FoodItem,
  GRID_SIZE,
  wrapCoordinate,
  getBaseSpeed,
  getModifiedSpeed,
  getScorePoints,
  getRandomPosition,
  getFarthestPosition,
  formatDuration,
} from '../utils/gameHelpers';

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const generateOuroborosPath = (): string => {
  const points: string[] = [];
  const steps = 80;
  const center = 50;
  const outerR = 35;

  // Outer boundary (clockwise from -85 deg to 255 deg)
  for (let i = 0; i <= steps; i++) {
    const angle = -85 + (i * 340) / steps;
    const rad = (angle * Math.PI) / 180;
    const x = center + outerR * Math.cos(rad);
    const y = center + outerR * Math.sin(rad);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  // Inner boundary (counter-clockwise from 255 deg back to -85 deg)
  for (let i = steps; i >= 0; i--) {
    const angle = -85 + (i * 340) / steps;
    const rad = (angle * Math.PI) / 180;

    // Thickness tapers from 7px at i=0 (head) to 2px at i=steps (tail)
    const t = 7 - (i * 5) / steps;
    const innerR = outerR - t;

    const x = center + innerR * Math.cos(rad);
    const y = center + innerR * Math.sin(rad);
    points.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  points.push('Z');
  return points.join(' ');
};

const generateSnakeScales = (): React.ReactNode[] => {
  const scales: React.ReactNode[] = [];
  const steps = 75;
  const center = 50;
  const outerR = 35;

  for (let i = 1; i < steps; i++) {
    const angle = -85 + (i * 340) / steps;
    const rad = (angle * Math.PI) / 180;

    const t = 7 - (i * 5) / steps;
    const innerR = outerR - t;

    // Calculate outer and inner edge points
    const xOut = center + outerR * Math.cos(rad);
    const yOut = center + outerR * Math.sin(rad);
    const xIn = center + innerR * Math.cos(rad);
    const yIn = center + innerR * Math.sin(rad);

    // Control point pulled counter-clockwise (backwards) for scale curvature
    const backAngle = angle - 4.5;
    const backRad = (backAngle * Math.PI) / 180;
    const midR = outerR - t / 2;
    const xCtrl = center + midR * Math.cos(backRad);
    const yCtrl = center + midR * Math.sin(backRad);

    scales.push(
      <path
        key={`scale-${i}`}
        d={`M ${xOut.toFixed(2)} ${yOut.toFixed(2)} Q ${xCtrl.toFixed(2)} ${yCtrl.toFixed(2)} ${xIn.toFixed(2)} ${yIn.toFixed(2)}`}
        stroke="rgba(0, 0, 0, 0.25)"
        strokeWidth="0.6"
        fill="none"
      />
    );
  }
  return scales;
};

export const Game: React.FC = () => {
  // Sound Hook
  const {
    soundEnabled,
    setSoundEnabled,
    musicEnabled,
    setMusicEnabled,
    playSound,
  } = useSound();

  // Core Game State
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'INSTRUCTIONS' | 'OUROBOROS' | 'VICTORY'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('vibe_snake_highscore') || 0);
    } catch {
      return 0;
    }
  });
  const [level, setLevel] = useState(1);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [powerUpActive, setPowerUpActive] = useState<'SPEED' | 'SLOW' | 'SHIELD' | null>(null);
  const [powerUpDuration, setPowerUpDuration] = useState(0);
  const [shieldCharges, setShieldCharges] = useState(0);
  const [wallWrapEnabled, setWallWrapEnabled] = useState(false);
  const [gameDuration, setGameDuration] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<'wall' | 'self' | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [theme, setTheme] = useState<'cyber-dark' | 'forest-green' | 'pink-vibe'>(() => {
    try {
      return (localStorage.getItem('vibe_snake_theme') as any) || 'cyber-dark';
    } catch {
      return 'cyber-dark';
    }
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('vibe_snake_theme', theme);
    } catch { }
  }, [theme]);

  const [, setNormalEatenCount] = useState(0);
  const [challengeThreshold, setChallengeThreshold] = useState(() => Math.floor(Math.random() * 3) + 3);

  // Refs for Game Loop / Direction Buffer / Play Time
  const nextDirectionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const gameLoopRef = useRef<number | null>(null);
  const playTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const MAX_POWERUP_DURATION = 80; // 80 ticks (8 seconds at normal speed)

  // Sync ref
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Keep track of high score
  useEffect(() => {
    if (score > highScore && score > 0) {
      setIsNewHighScore(true);
      setHighScore(score);
      try {
        localStorage.setItem('vibe_snake_highscore', String(score));
      } catch { }
    }
  }, [score, highScore]);

  // Play Time Accumulator Loop
  useEffect(() => {
    let animFrameId: number;

    const tickPlayTime = (timestamp: number) => {
      if (gameState === 'PLAYING') {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = timestamp;
        }
        const delta = timestamp - lastTimeRef.current;
        playTimeRef.current += delta;

        // Update state every integer second
        setGameDuration(Math.floor(playTimeRef.current / 1000));
      }
      lastTimeRef.current = timestamp;
      animFrameId = requestAnimationFrame(tickPlayTime);
    };

    if (gameState === 'PLAYING') {
      lastTimeRef.current = 0;
      animFrameId = requestAnimationFrame(tickPlayTime);
    }

    return () => cancelAnimationFrame(animFrameId);
  }, [gameState]);

  // Keyboard controls keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // DEBUG SHORTCUTS FOR SCREENSHOTS
      if (e.key === 'g' || e.key === 'G') {
        setScore(340);
        setIsNewHighScore(true);
        setGameOverReason('self');
        setGameState('GAME_OVER');
        return;
      }
      if (e.key === 'o' || e.key === 'O') {
        setGameState('OUROBOROS');
        return;
      }
      if (e.key === 'v' || e.key === 'V') {
        setScore(1250);
        setGameState('VICTORY');
        return;
      }

      if (gameState === 'INSTRUCTIONS') return;

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (gameState === 'PLAYING') {
          playSound('click');
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          playSound('click');
          setGameState('PLAYING');
        }
        return;
      }

      if (gameState !== 'PLAYING') return;

      let newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') newDir = 'UP';
      else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') newDir = 'DOWN';
      else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') newDir = 'LEFT';
      else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') newDir = 'RIGHT';

      if (newDir) {
        e.preventDefault();
        const currentDir = directionRef.current;
        const opposites = {
          UP: 'DOWN',
          DOWN: 'UP',
          LEFT: 'RIGHT',
          RIGHT: 'LEFT',
        };
        if (opposites[newDir] !== currentDir) {
          nextDirectionRef.current = newDir;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playSound]);

  // Spawn food with specific type or randomized type helper
  const spawnFoodItem = (currentSnake: Point[], forceType?: 'normal' | 'gold' | 'speed' | 'slow' | 'shield'): FoodItem => {
    const pos = getRandomPosition(currentSnake);
    let type: 'normal' | 'gold' | 'speed' | 'slow' | 'shield' = 'normal';

    if (forceType) {
      type = forceType;
    } else {
      const rand = Math.random();
      if (rand < 0.04) {
        type = 'shield';
      } else if (rand < 0.14) {
        type = 'speed';
      } else if (rand < 0.24) {
        type = 'slow';
      }
    }

    return { x: pos.x, y: pos.y, type };
  };

  const handleGameOver = (reason: 'wall' | 'self', finalLength: number) => {
    playSound('crash');
    setGameOverReason(reason);

    // Ouroboros Easter Egg check
    if (reason === 'self' && finalLength >= GRID_SIZE * GRID_SIZE && powerUpActive !== 'SHIELD') {
      setGameState('OUROBOROS');
    } else {
      setGameState('GAME_OVER');
    }
  };

  // Main Game Loop Effect
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'VIBE'>('MEDIUM');

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const runTick = () => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const nextDir = nextDirectionRef.current;
        setDirection(nextDir);

        let delta = { x: 0, y: 0 };
        if (nextDir === 'UP') delta = { x: 0, y: -1 };
        else if (nextDir === 'DOWN') delta = { x: 0, y: 1 };
        else if (nextDir === 'LEFT') delta = { x: -1, y: 0 };
        else if (nextDir === 'RIGHT') delta = { x: 1, y: 0 };

        let newHead = { x: head.x + delta.x, y: head.y + delta.y };

        // 1. Check Wall Collision
        const isWallCollision =
          newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;

        if (isWallCollision) {
          if (powerUpActive === 'SHIELD' || wallWrapEnabled) {
            if (powerUpActive === 'SHIELD' && !wallWrapEnabled) {
              // Shield is consumed to wrap only when wrap mode is disabled
              if (shieldCharges > 1) {
                playSound('crash');
                setShieldCharges((c) => c - 1);
              } else {
                playSound('powerdown');
                setShieldCharges(0);
                setPowerUpActive(null);
                setPowerUpDuration(0);
              }
            }
            if (wallWrapEnabled) {
              // Penalty of 5 points for choosing pass-through wrap
              setScore((s) => Math.max(0, s - 5));
              playSound('powerdown');
            }
            newHead = {
              x: wrapCoordinate(newHead.x, GRID_SIZE),
              y: wrapCoordinate(newHead.y, GRID_SIZE),
            };
          } else {
            if (gameLoopRef.current) {
              clearInterval(gameLoopRef.current);
              gameLoopRef.current = null;
            }
            setTimeout(() => handleGameOver('wall', currentSnake.length), 0);
            return currentSnake;
          }
        }

        // 2. Check Self Collision (ignoring tail segment because it will move out of the way)
        const isSelfCollision = currentSnake
          .slice(0, -1)
          .some((segment) => segment.x === newHead.x && segment.y === newHead.y);

        if (isSelfCollision) {
          if (powerUpActive === 'SHIELD') {
            // Shield absorbs tail collision and lets you pass through
            if (shieldCharges > 1) {
              playSound('crash');
              setShieldCharges((c) => c - 1);
            } else {
              playSound('powerdown');
              setShieldCharges(0);
              setPowerUpActive(null);
              setPowerUpDuration(0);
            }
          } else {
            if (gameLoopRef.current) {
              clearInterval(gameLoopRef.current);
              gameLoopRef.current = null;
            }
            setTimeout(() => handleGameOver('self', currentSnake.length), 0);
            return currentSnake;
          }
        }

        const newSnake = [newHead, ...currentSnake];

        // 3. Check Food capture
        let foodsCopy = [...foods];
        const eatenFoodIndex = foodsCopy.findIndex((f) => newHead.x === f.x && newHead.y === f.y);
        const hasEatenFood = eatenFoodIndex !== -1;

        if (hasEatenFood) {
          const eatenFood = foodsCopy[eatenFoodIndex];
          const points = getScorePoints(eatenFood.type, powerUpActive === 'SPEED');
          let multiplier = 1.0;
          if (difficulty === 'MEDIUM') multiplier = 1.5;
          else if (difficulty === 'HARD') multiplier = 2.0;
          else if (difficulty === 'VIBE') multiplier = 2.5;

          const finalPoints = Math.round(points * multiplier);

          playSound(eatenFood.type === 'gold' ? 'levelup' : 'eat');
          setScore((s) => {
            const nextScore = s + finalPoints;
            const nextLevel = Math.floor(nextScore / 100) + 1;
            setLevel((l) => {
              if (nextLevel > l) {
                playSound('levelup');
                return nextLevel;
              }
              return l;
            });
            return nextScore;
          });

          if (newSnake.length >= GRID_SIZE * GRID_SIZE) {
            if (gameLoopRef.current) {
              clearInterval(gameLoopRef.current);
              gameLoopRef.current = null;
            }
            setTimeout(() => {
              playSound('levelup');
              setGameState('VICTORY');
            }, 0);
            return newSnake;
          }

          setNormalEatenCount((cnt) => {
            const nextCount = eatenFood.type === 'normal' ? cnt + 1 : cnt;

            // Re-spawn logic
            if (foods.length === 2) {
              // Dual-Food Challenge resolved (clear count and spawn single food)
              setChallengeThreshold(Math.floor(Math.random() * 3) + 3);
              const nextFood = spawnFoodItem(newSnake);
              setFoods([nextFood]);
              return 0;
            } else {
              // Normal single food eat
              if (nextCount >= challengeThreshold) {
                // Trigger Dual-Food Challenge!
                const lowScoreFood = spawnFoodItem(newSnake, 'normal');
                const goldPos = getFarthestPosition([lowScoreFood, ...newSnake]);
                const highScoreFood: FoodItem = {
                  x: goldPos.x,
                  y: goldPos.y,
                  type: 'gold',
                };
                setFoods([lowScoreFood, highScoreFood]);
              } else {
                const nextFood = spawnFoodItem(newSnake);
                setFoods([nextFood]);
              }
              return nextCount;
            }
          });

          // Apply powerup status
          if (eatenFood.type === 'speed') {
            playSound('powerup');
            setPowerUpActive('SPEED');
            setPowerUpDuration(MAX_POWERUP_DURATION);
          } else if (eatenFood.type === 'slow') {
            playSound('powerup');
            setPowerUpActive('SLOW');
            setPowerUpDuration(MAX_POWERUP_DURATION);
          } else if (eatenFood.type === 'shield') {
            playSound('powerup');
            setPowerUpActive('SHIELD');
            setPowerUpDuration(MAX_POWERUP_DURATION);
            setShieldCharges(5);
          }
        } else {
          // Normal step, remove tail
          newSnake.pop();
        }

        // Update powerup duration
        setPowerUpDuration((dur) => {
          if (dur > 1) return dur - 1;
          if (dur === 1) {
            playSound('powerdown');
            setPowerUpActive(null);
            setShieldCharges(0);
            return 0;
          }
          return 0;
        });

        return newSnake;
      });
    };

    const baseSpeed = getBaseSpeed(difficulty, score / 10);
    const speed = getModifiedSpeed(baseSpeed, powerUpActive);

    gameLoopRef.current = window.setInterval(runTick, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, foods, powerUpActive, difficulty, score, challengeThreshold, shieldCharges]);

  const handleStartGame = () => {
    setScore(0);
    setLevel(1);
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    nextDirectionRef.current = 'UP';
    setPowerUpActive(null);
    setPowerUpDuration(0);
    setShieldCharges(0);
    setIsNewHighScore(false);
    playTimeRef.current = 0;
    setGameDuration(0);
    setNormalEatenCount(0);
    setChallengeThreshold(Math.floor(Math.random() * 3) + 3);

    const firstFood = spawnFoodItem(INITIAL_SNAKE, 'normal');
    setFoods([firstFood]);
    setGameState('PLAYING');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        width: '100%',
        height: '100vh',
        position: 'relative',
      }}
    >
      {/* HUD Active Powerup Overlay Glare Effect */}
      {gameState === 'PLAYING' && powerUpActive === 'SPEED' && <div className="neon-pulse-cyan" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 5 }} />}
      {gameState === 'PLAYING' && powerUpActive === 'SHIELD' && <div className="neon-pulse-pink" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 5 }} />}
      {gameState === 'PLAYING' && powerUpActive === 'SLOW' && <div className="neon-pulse-purple" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 5 }} />}

      {gameState === 'MENU' && (
        <Menu
          highScore={highScore}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          wallWrapEnabled={wallWrapEnabled}
          setWallWrapEnabled={setWallWrapEnabled}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          onStartGame={handleStartGame}
          onShowInstructions={() => setGameState('INSTRUCTIONS')}
          playSound={playSound}
          theme={theme}
          setTheme={setTheme}
        />
      )}

      {gameState === 'INSTRUCTIONS' && (
        <Instructions
          onBackToMenu={() => setGameState('MENU')}
          playSound={playSound}
        />
      )}

      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <ScoreBoard
            score={score}
            level={level}
            highScore={highScore}
            gameDuration={gameDuration}
            powerUpActive={powerUpActive}
            powerUpDuration={powerUpDuration}
            maxPowerUpDuration={MAX_POWERUP_DURATION}
            shieldCharges={shieldCharges}
          />

          <div style={{ position: 'relative' }}>
            <GameBoard
              snake={snake}
              foods={foods}
              direction={direction}
              powerUpActive={powerUpActive}
              isRainbow={snake.length >= 25}
            />

            {/* Pause Screen Overlay */}
            {gameState === 'PAUSED' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(3, 7, 18, 0.85)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)',
                  zIndex: 10,
                }}
              >
                <h2 className="font-arcade" style={{ fontSize: '1.8rem', color: 'var(--neon-cyan)', textShadow: '0 0 15px var(--neon-cyan-glow)' }}>
                  SESSION PAUSED
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  PRESS <kbd className="key-kbd">SPACE</kbd> TO RESUME
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    setGameState('MENU');
                  }}
                  className="btn-neon btn-pink font-arcade"
                  style={{ padding: '10px 24px', fontSize: '0.75rem', marginTop: '10px' }}
                >
                  QUIT TO MENU
                </button>
              </div>
            )}
          </div>

          {/* Controls below Game Board */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
              maxWidth: '400px',
              marginTop: '4px',
            }}
          >
            <button
              onClick={() => {
                playSound('click');
                setGameState(gameState === 'PLAYING' ? 'PAUSED' : 'PLAYING');
              }}
              className="btn-neon btn-cyan font-arcade"
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {gameState === 'PLAYING' ? '⏸ PAUSE' : '▶ RESUME'}
            </button>
            <button
              onClick={() => {
                playSound('click');
                setGameState('MENU');
              }}
              className="btn-neon btn-pink font-arcade"
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(255, 42, 116, 0.05)',
              }}
            >
              🔌 QUIT GAME
            </button>
          </div>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div
          className="glass-panel"
          style={{
            width: 'var(--panel-width)',
            maxWidth: '95vw',
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            boxShadow: '0 0 25px rgba(255, 42, 116, 0.15)',
            border: '1px solid rgba(255, 42, 116, 0.3)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2
              className="font-arcade"
              style={{
                fontSize: '1.8rem',
                color: 'var(--neon-pink)',
                textShadow: '0 0 20px var(--neon-pink-glow)',
                margin: 0,
              }}
            >
              GAME OVER
            </h2>
            <div
              className="font-arcade"
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.15em',
                marginTop: '4px',
              }}
            >
              {gameOverReason === 'wall' ? 'WALL CRASH DETECTED' : 'SELF COLLISION DETECTED'}
            </div>
          </div>

          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>FINAL SCORE:</span>
              <strong className="font-arcade" style={{ color: 'var(--neon-cyan)' }}>{score} PTS</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>LEVEL REACHED:</span>
              <strong className="font-arcade" style={{ color: '#ffffff' }}>LEVEL {level}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>PLAY DURATION:</span>
              <strong className="font-arcade" style={{ color: 'var(--neon-gold)' }}>{formatDuration(gameDuration)}</strong>
            </div>
          </div>

          {isNewHighScore && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'rgba(255, 215, 0, 0.03)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.05)',
              }}
            >
              <div
                className="font-arcade"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--neon-gold)',
                  textShadow: '0 0 8px var(--neon-gold-glow)',
                  fontWeight: 'bold',
                }}
              >
                🏆 NEW HI-SCORE SECURED!
              </div>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                Share your epic achievement with friends on social channels!
              </p>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  onClick={() => {
                    playSound('click');
                    const shareText = `I just secured a NEW High Score of ${score} PTS in ${formatDuration(gameDuration)} in Snake Game (Vibe Edition)! 🚀 Can you beat my record? Play here: ${window.location.origin} #SnakeVibe #RetroArcade`;
                    const url = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}`;
                    window.open(url, '_blank');
                  }}
                  className="btn-neon font-arcade"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.65rem',
                    background: '#000000',
                    border: '1px solid #333333',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  𝕏 SHARE ON 𝕏
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    const shareText = `I just secured a NEW High Score of ${score} PTS in ${formatDuration(gameDuration)} in Snake Game (Vibe Edition)! 🚀 Can you beat my record? Play here: ${window.location.origin} #SnakeVibe #RetroArcade`;
                    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
                    window.open(url, '_blank');
                  }}
                  className="btn-neon font-arcade"
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.65rem',
                    background: '#128c7e',
                    boxShadow: '0 0 10px rgba(18, 140, 126, 0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  💬 WHATSAPP
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <button
              onClick={handleStartGame}
              className="btn-neon btn-cyan font-arcade"
              style={{ width: '100%', padding: '14px', fontSize: '0.9rem' }}
            >
              ▶ RESTART SESSION
            </button>
            <button
              onClick={() => {
                playSound('click');
                setGameState('MENU');
              }}
              className="btn-neon btn-pink font-arcade"
              style={{ width: '100%', padding: '10px', fontSize: '0.75rem', background: 'rgba(255, 42, 116, 0.05)' }}
            >
              ◀ BACK TO MENU
            </button>
          </div>
        </div>
      )}

      {/* Ouroboros Easter Egg Popup Achievement */}
      {gameState === 'OUROBOROS' && (
        <div
          className="glass-panel"
          style={{
            width: 'var(--panel-width)',
            maxWidth: '95vw',
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            boxShadow: '0 0 35px var(--neon-gold-glow)',
            border: '2px solid var(--neon-gold)',
            zIndex: 100,
            textAlign: 'center',
          }}
        >
          {/* Circular spinning SVG snake biting its tail */}
          <svg className="ouroboros-spin" width="120" height="120" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}>
            <defs>
              <radialGradient id="ouro-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--neon-gold)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ouro-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#ffae00" />
                <stop offset="100%" stopColor="#ff1100" />
              </linearGradient>
            </defs>
            {/* Background Glow */}
            <circle cx="50" cy="50" r="45" fill="url(#ouro-glow)" />

            {/* Snake Body */}
            <g>
              {/* Solid tapering body */}
              <path d={generateOuroborosPath()} fill="url(#ouro-grad)" filter="drop-shadow(0 0 4px var(--neon-gold-glow))" />

              {/* Scales Overlay */}
              {generateSnakeScales()}

              {/* Detailed Viper Snake Head & Tongue shifted down to align with body circular path */}
              <g transform="translate(-1, 3.5)" filter="drop-shadow(0 0 5px var(--neon-gold-glow))">
                {/* Forked tongue sticking out of the mouth wrapping around the tail */}
                <path d="M 45 15.2 Q 41 15.2 38 14.5 M 41 15.2 Q 38 16.5 37 16.5" stroke="#ff0022" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                {/* Upper Head, Snout, Mouth & Lower Jaw */}
                <path
                  d="M 54 9 
                     C 52 9, 49 8.2, 47 10 
                     C 45 11, 42 11, 41 12.5 
                     C 40.5 13, 40.5 13.5, 41.5 13.8 
                     L 46.5 15.2 
                     L 41.5 16.2 
                     C 40.5 16.5, 40.5 17, 41 17.5 
                     C 42 18.5, 45 18.5, 47 19.5 
                     C 49 20.5, 52 20, 54 19 Z"
                  fill="var(--neon-gold)"
                  stroke="#4c3300"
                  strokeWidth="0.8"
                />

                {/* White Fangs */}
                {/* Upper Fang */}
                <polygon points="43,12.8 42,15 44,13.5" fill="#ffffff" stroke="#4c3300" strokeWidth="0.3" />
                {/* Lower Fang */}
                <polygon points="43.5,15.8 42.5,14 44.5,15" fill="#ffffff" stroke="#4c3300" strokeWidth="0.3" />

                {/* Menacing Reptile Eye */}
                <polygon points="46.5,12.5 48.5,11.7 50.5,12.5 48.5,13.3" fill="#ffffff" stroke="#cc9600" strokeWidth="0.4" />
                {/* Slit Pupil */}
                <line x1="48.5" y1="11.9" x2="48.5" y2="13.1" stroke="#000000" strokeWidth="0.8" strokeLinecap="round" />
                {/* Eyebrow Ridge */}
                <path d="M 46 11.5 Q 48.5 10.5 51 11.5" stroke="#4c3300" strokeWidth="0.8" fill="none" strokeLinecap="round" />

                {/* Nostril */}
                <circle cx="42" cy="12.2" r="0.4" fill="#4c3300" />

                {/* Scale accent lines on the head skull */}
                <path d="M 51 15 Q 52.5 13.5 54 15 M 50 16.5 Q 52 16.5 53.5 17.5" stroke="#4c3300" strokeWidth="0.5" fill="none" />
              </g>
            </g>
          </svg>

          <div>
            <h2
              className="font-arcade"
              style={{
                fontSize: '1.6rem',
                color: 'var(--neon-gold)',
                textShadow: '0 0 15px var(--neon-gold-glow)',
                margin: 0,
                letterSpacing: '0.1em',
              }}
            >
              OUROBOROS UNLOCKED
            </h2>
            <div
              className="font-arcade"
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.2em',
                marginTop: '4px',
              }}
            >
              COSMIC CYCLE COMPLETE
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            The snake has occupied the entire space grid and consumed its own tail, completing the cosmic cycle of death and rebirth. You have embraced the infinite loop of eternity.
          </p>

          <button
            onClick={() => {
              playSound('click');
              setGameState('GAME_OVER');
            }}
            className="btn-neon font-arcade"
            style={{
              width: '80%',
              padding: '14px',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, var(--neon-gold), #cc9600)',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
            }}
          >
            EMBRACE THE CYCLE
          </button>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === 'VICTORY' && (
        <div
          className="glass-panel"
          style={{
            width: 'var(--panel-width)',
            maxWidth: '95vw',
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            boxShadow: '0 0 35px var(--neon-emerald-glow)',
            border: '2px solid var(--neon-emerald)',
            zIndex: 100,
            textAlign: 'center',
          }}
        >
          {/* Stylized Victory Crown/Trophy SVG */}
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--neon-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px var(--neon-gold-glow))' }}>
            <circle cx="12" cy="8" r="7" />
            <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
            <path d="M12 4v8" />
            <path d="M9 8h6" />
          </svg>

          <div>
            <h2
              className="font-arcade"
              style={{
                fontSize: '1.2rem',
                color: 'var(--neon-emerald)',
                textShadow: '0 0 15px var(--neon-emerald-glow)',
                margin: 0,
                letterSpacing: '0.05em',
                lineHeight: '1.4',
              }}
            >
              WINNER OF SELF CONTROL &amp; DECISIONS
            </h2>
            <div
              className="font-arcade"
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.2em',
                marginTop: '6px',
              }}
            >
              THE ULTIMATE MASTER
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Unbelievable! You have successfully filled all 400 coordinates of the space grid. By avoiding self-collision on the final movement, you are crowned the ultimate champion of precision, self control, and logical decisions.
          </p>

          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>FINAL SCORE:</span>
              <strong className="font-arcade" style={{ color: 'var(--neon-cyan)' }}>{score} PTS</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>LEVEL REACHED:</span>
              <strong className="font-arcade" style={{ color: 'var(--neon-gold)' }}>LEVEL {level}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>TIME SECURED:</span>
              <strong className="font-arcade" style={{ color: 'var(--neon-purple)' }}>{formatDuration(gameDuration)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <button
              onClick={() => {
                playSound('levelup');
                handleStartGame();
              }}
              className="btn-neon font-arcade"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, var(--neon-emerald), #028a70)',
                boxShadow: '0 0 15px rgba(5, 242, 199, 0.4)',
              }}
            >
              PLAY AGAIN
            </button>
            <button
              onClick={() => {
                playSound('click');
                setGameState('MENU');
              }}
              className="btn-neon btn-pink font-arcade"
              style={{ width: '100%', padding: '10px', fontSize: '0.75rem', background: 'rgba(255, 42, 116, 0.05)' }}
            >
              RETURN TO MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
