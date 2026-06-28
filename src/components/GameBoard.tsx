import React, { useEffect, useRef, useState } from 'react';
import { Point, FoodItem, GRID_SIZE } from '../utils/gameHelpers';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
}

interface GameBoardProps {
  snake: Point[];
  foods: FoodItem[];
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  powerUpActive: 'SPEED' | 'SLOW' | 'SHIELD' | null;
  isRainbow?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  snake,
  foods,
  direction,
  powerUpActive,
  isRainbow = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevFoodsRef = useRef<FoodItem[]>(foods);
  
  // Helper to fetch the dynamic CSS theme accent color
  const getAccentColorWithAlpha = (alpha: number) => {
    try {
      const accent = getComputedStyle(document.body).getPropertyValue('--neon-cyan').trim() || '#00e5ff';
      if (accent.startsWith('#')) {
        const r = parseInt(accent.slice(1, 3), 16);
        const g = parseInt(accent.slice(3, 5), 16);
        const b = parseInt(accent.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return `rgba(0, 229, 255, ${alpha})`;
    } catch {
      return `rgba(0, 229, 255, ${alpha})`;
    }
  };

  // Theme Color Tokens
  const emeraldColor = '#05f2c7';
  const emeraldGlow = 'rgba(5, 242, 199, 0.4)';
  const cyanColor = '#00e5ff';
  const cyanGlow = 'rgba(0, 229, 255, 0.4)';
  const pinkColor = '#ff2a74';
  const pinkGlow = 'rgba(255, 42, 116, 0.4)';
  const purpleColor = '#b026ff';
  const purpleGlow = 'rgba(176, 38, 255, 0.4)';
  const goldColor = '#ffd700';

  const getFoodColor = (type: 'normal' | 'gold' | 'speed' | 'slow' | 'shield'): string => {
    switch (type) {
      case 'normal': return emeraldColor;
      case 'gold': return goldColor;
      case 'speed': return cyanColor;
      case 'slow': return purpleColor;
      case 'shield': return pinkColor;
      default: return emeraldColor;
    }
  };

  const createExplosion = (gx: number, gy: number, type: 'normal' | 'gold' | 'speed' | 'slow' | 'shield') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;
    
    // Pixel coordinates of the center of the grid cell
    const centerX = gx * cellWidth + cellWidth / 2;
    const centerY = gy * cellHeight + cellHeight / 2;
    const color = getFoodColor(type);
    
    const count = type === 'gold' ? 30 : 15;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      newParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015,
        size: Math.random() * 3 + 1.5,
        color,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Watch for food collection (e.g. food array size shrink or coordinates change)
  useEffect(() => {
    // Determine if any food was eaten by comparing current foods to prevFoodsRef
    prevFoodsRef.current.forEach((prevFood) => {
      const stillExists = foods.some((f) => f.x === prevFood.x && f.y === prevFood.y && f.type === prevFood.type);
      if (!stillExists) {
        // This food was captured! Trigger particle explosion.
        createExplosion(prevFood.x, prevFood.y, prevFood.type);
      }
    });
    prevFoodsRef.current = foods;
  }, [foods]);

  // Particle Physics Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const updateParticles = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.alpha - p.decay,
          }))
          .filter((p) => p.alpha > 0)
      );
      animationFrameId = requestAnimationFrame(updateParticles);
    };

    animationFrameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear board
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;

    // 1. Draw Grid Lines (Subtle retro scanlines)
    ctx.save();
    for (let i = 0; i <= GRID_SIZE; i++) {
      const isBorder = i === 0 || i === GRID_SIZE;
      ctx.strokeStyle = isBorder ? getAccentColorWithAlpha(0.18) : getAccentColorWithAlpha(0.08);
      ctx.lineWidth = isBorder ? 1.5 : 1;

      // Vertical
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, canvas.height);
      ctx.stroke();

      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(canvas.width, i * cellHeight);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Food Items
    foods.forEach((foodItem) => {
      const fx = foodItem.x * cellWidth + cellWidth / 2;
      const fy = foodItem.y * cellHeight + cellHeight / 2;
      const foodRadius = cellWidth / 2.5;
      const foodColor = getFoodColor(foodItem.type);

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = foodColor;
      ctx.fillStyle = foodColor;

      // Pulse animation factor based on system timestamp
      const pulseFactor = 1 + Math.sin(Date.now() / 120) * 0.15;

      ctx.beginPath();
      if (foodItem.type === 'shield') {
        // Draw hexagon
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = fx + Math.cos(angle) * foodRadius * pulseFactor;
          const y = fy + Math.sin(angle) * foodRadius * pulseFactor;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      } else if (foodItem.type === 'speed') {
        // Draw diamond / lightning star
        ctx.moveTo(fx, fy - foodRadius * pulseFactor);
        ctx.lineTo(fx + foodRadius * 0.7 * pulseFactor, fy);
        ctx.lineTo(fx, fy + foodRadius * pulseFactor);
        ctx.lineTo(fx - foodRadius * 0.7 * pulseFactor, fy);
        ctx.closePath();
      } else {
        // Draw circle
        ctx.arc(fx, fy, foodRadius * pulseFactor, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    });

    // 3. Draw Snake
    snake.forEach((segment, index) => {
      const sx = segment.x * cellWidth;
      const sy = segment.y * cellHeight;
      const isHead = index === 0;

      ctx.save();

      // Determine glow colors
      let segmentColor = emeraldColor;
      let glowColor = emeraldGlow;

      if (isRainbow) {
        // Cycle colors based on index & timestamp
        const hue = (index * 15 + Date.now() / 15) % 360;
        segmentColor = `hsl(${hue}, 100%, 60%)`;
        glowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
      } else if (powerUpActive === 'SPEED') {
        segmentColor = cyanColor;
        glowColor = cyanGlow;
      } else if (powerUpActive === 'SHIELD') {
        segmentColor = pinkColor;
        glowColor = pinkGlow;
      } else if (powerUpActive === 'SLOW') {
        segmentColor = purpleColor;
        glowColor = purpleGlow;
      }

      ctx.shadowBlur = isHead ? 20 : 10;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = segmentColor;

      // Draw head with distinct shape or details
      if (isHead) {
        ctx.beginPath();
        // Rounded rectangle for head
        const r = 8; // corner radius
        ctx.roundRect(sx + 1, sy + 1, cellWidth - 2, cellHeight - 2, r);
        ctx.fill();

        // Eyes facing the movement direction
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffffff';

        const eyeRadius = 2.5;
        const offset = 5;
        let leftEye = { x: 0, y: 0 };
        let rightEye = { x: 0, y: 0 };

        if (direction === 'UP') {
          leftEye = { x: sx + offset, y: sy + offset };
          rightEye = { x: sx + cellWidth - offset, y: sy + offset };
        } else if (direction === 'DOWN') {
          leftEye = { x: sx + offset, y: sy + cellHeight - offset };
          rightEye = { x: sx + cellWidth - offset, y: sy + cellHeight - offset };
        } else if (direction === 'LEFT') {
          leftEye = { x: sx + offset, y: sy + offset };
          rightEye = { x: sx + offset, y: sy + cellHeight - offset };
        } else if (direction === 'RIGHT') {
          leftEye = { x: sx + cellWidth - offset, y: sy + offset };
          rightEye = { x: sx + cellWidth - offset, y: sy + cellHeight - offset };
        }

        ctx.beginPath();
        ctx.arc(leftEye.x, leftEye.y, eyeRadius, 0, Math.PI * 2);
        ctx.arc(rightEye.x, rightEye.y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw normal segment
        ctx.beginPath();
        // Body scaling slightly down towards the tail
        const scale = Math.max(0.6, 1 - index / (snake.length * 1.5));
        ctx.arc(
          sx + cellWidth / 2,
          sy + cellHeight / 2,
          (cellWidth / 2.2) * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    });

    // 4. Draw Canvas Particles
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [snake, foods, direction, particles, powerUpActive, isRainbow]);

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(5, 12, 22, 0.65)',
        border: `2px solid ${getAccentColorWithAlpha(0.18)}`,
        borderRadius: '16px',
        padding: '8px',
        boxShadow: `inset 0 0 30px rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.5), 0 0 25px ${getAccentColorWithAlpha(0.1)}`,
        width: 'fit-content',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{
          display: 'block',
          borderRadius: '8px',
          boxShadow: `0 0 15px ${getAccentColorWithAlpha(0.12)}`,
        }}
      />
    </div>
  );
};
