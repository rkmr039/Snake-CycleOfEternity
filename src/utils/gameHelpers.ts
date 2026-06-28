export interface Point {
  x: number;
  y: number;
}

export interface FoodItem {
  x: number;
  y: number;
  type: 'normal' | 'gold' | 'speed' | 'slow' | 'shield';
}

export const GRID_SIZE = 20;

export const wrapCoordinate = (val: number, size: number): number => {
  return ((val % size) + size) % size;
};

export const getBaseSpeed = (difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VIBE', foodsEaten: number): number => {
  switch (difficulty) {
    case 'EASY':
      return 160;
    case 'MEDIUM':
      return 110;
    case 'HARD':
      return 70;
    case 'VIBE': {
      const speed = 110 - foodsEaten * 3;
      return Math.max(40, speed);
    }
    default:
      return 110;
  }
};

export const getModifiedSpeed = (baseSpeed: number, powerUp: 'SPEED' | 'SLOW' | 'SHIELD' | null): number => {
  if (powerUp === 'SPEED') {
    return Math.round(baseSpeed * 0.55);
  }
  if (powerUp === 'SLOW') {
    return Math.round(baseSpeed * 1.60);
  }
  return baseSpeed;
};

export const getScorePoints = (type: 'normal' | 'gold' | 'speed' | 'slow' | 'shield', _isSpeedActive: boolean): number => {
  if (type === 'gold') {
    return 30;
  }
  return 10;
};

export const getRandomPosition = (snake: Point[]): Point => {
  let candidate: Point = { x: 0, y: 0 };
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    
    const overlaps = snake.some(segment => segment.x === candidate.x && segment.y === candidate.y);
    if (!overlaps) {
      return candidate;
    }
    attempts++;
  }
  
  // Systemic search fallback if random trial threshold is hit
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const overlaps = snake.some(segment => segment.x === x && segment.y === y);
      if (!overlaps) {
        return { x, y };
      }
    }
  }
  
  return snake[snake.length - 1] || { x: 0, y: 0 };
};

export const getFarthestPosition = (occupiedPoints: Point[]): Point => {
  const head = occupiedPoints.length > 1 ? occupiedPoints[1] : occupiedPoints[0];
  
  let farthestPoint: Point = { x: 0, y: 0 };
  let maxDistance = -1;
  
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const isOccupied = occupiedPoints.some(p => p.x === x && p.y === y);
      if (!isOccupied) {
        const dist = Math.abs(x - head.x) + Math.abs(y - head.y);
        if (dist > maxDistance) {
          maxDistance = dist;
          farthestPoint = { x, y };
        }
      }
    }
  }
  
  return farthestPoint;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};
