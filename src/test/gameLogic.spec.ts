import { expect } from 'chai';
import {
  wrapCoordinate,
  getBaseSpeed,
  getModifiedSpeed,
  getScorePoints,
  getRandomPosition,
  getFarthestPosition,
  formatDuration,
} from '../utils/gameHelpers';

describe('Snake Game Logic & Math Algorithms', () => {
  describe('wrapCoordinate()', () => {
    it('should keep coordinates within bounds when inside grid', () => {
      expect(wrapCoordinate(5, 20)).to.equal(5);
    });

    it('should wrap negative coordinates around grid width/height', () => {
      expect(wrapCoordinate(-1, 20)).to.equal(19);
    });

    it('should wrap out of bound positive coordinates using modulo math', () => {
      expect(wrapCoordinate(20, 20)).to.equal(0);
      expect(wrapCoordinate(25, 20)).to.equal(5);
    });
  });

  describe('getBaseSpeed()', () => {
    it('should return correct base speeds mapping difficulties', () => {
      expect(getBaseSpeed('EASY', 0)).to.equal(160);
      expect(getBaseSpeed('MEDIUM', 0)).to.equal(110);
      expect(getBaseSpeed('HARD', 0)).to.equal(70);
    });

    it('should scale down VIBE difficulty speed per food eaten', () => {
      expect(getBaseSpeed('VIBE', 0)).to.equal(110);
      expect(getBaseSpeed('VIBE', 5)).to.equal(95);
    });

    it('should respect the VIBE mode speed threshold minimum of 40ms', () => {
      expect(getBaseSpeed('VIBE', 100)).to.equal(40);
    });
  });

  describe('getModifiedSpeed()', () => {
    it('should apply SPEED powerup (Hyper Drive) 0.55x multiplier', () => {
      expect(getModifiedSpeed(100, 'SPEED')).to.equal(55);
    });

    it('should apply SLOW powerup (Chill Vibe) 1.6x multiplier', () => {
      expect(getModifiedSpeed(100, 'SLOW')).to.equal(160);
    });

    it('should return base speed when no power-ups are active', () => {
      expect(getModifiedSpeed(100, null)).to.equal(100);
    });
  });

  describe('getScorePoints()', () => {
    it('should return 30 points for gold food and 10 points for all other foods', () => {
      expect(getScorePoints('gold', false)).to.equal(30);
      expect(getScorePoints('normal', false)).to.equal(10);
      expect(getScorePoints('shield', false)).to.equal(10);
    });
  });

  describe('getRandomPosition()', () => {
    it('should not spawn coordinates occupied by the snake', () => {
      const snake = [];
      for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
          if (x === 0 && y === 0) continue;
          snake.push({ x, y });
        }
      }
      const pos = getRandomPosition(snake);
      expect(pos).to.deep.equal({ x: 0, y: 0 });
    });
  });

  describe('getFarthestPosition()', () => {
    it('should select coordinates far from the snake head', () => {
      const occupied = [
        { x: 5, y: 5 }, // low score food
        { x: 10, y: 10 }, // head
      ];
      const pos = getFarthestPosition(occupied);
      const distance = Math.abs(pos.x - 10) + Math.abs(pos.y - 10);
      expect(distance).to.equal(20);
    });
  });

  describe('formatDuration()', () => {
    it('should format seconds below a minute into seconds', () => {
      expect(formatDuration(0)).to.equal('0s');
      expect(formatDuration(45)).to.equal('45s');
    });

    it('should format seconds exceeding a minute into minutes and seconds', () => {
      expect(formatDuration(60)).to.equal('1m 0s');
      expect(formatDuration(75)).to.equal('1m 15s');
      expect(formatDuration(130)).to.equal('2m 10s');
    });
  });
});
