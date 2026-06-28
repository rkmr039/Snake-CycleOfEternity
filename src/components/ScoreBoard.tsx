import React from 'react';
import { formatDuration } from '../utils/gameHelpers';

interface ScoreBoardProps {
  score: number;
  level: number;
  highScore: number;
  gameDuration: number;
  powerUpActive: 'SPEED' | 'SLOW' | 'SHIELD' | null;
  powerUpDuration: number;
  maxPowerUpDuration: number;
  shieldCharges?: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  level,
  highScore,
  gameDuration,
  powerUpActive,
  powerUpDuration,
  maxPowerUpDuration,
  shieldCharges = 0,
}) => {
  const getPowerUpColor = () => {
    switch (powerUpActive) {
      case 'SPEED': return 'var(--neon-cyan)';
      case 'SLOW': return 'var(--neon-purple)';
      case 'SHIELD': return 'var(--neon-pink)';
      default: return 'transparent';
    }
  };

  const getPowerUpLabel = () => {
    switch (powerUpActive) {
      case 'SPEED': return 'HYPER DRIVE // ACTIVE';
      case 'SLOW': return 'CHILL VIBE // DAMPEN';
      case 'SHIELD': return `AEGIS HALO // ${shieldCharges} CHG`;
      default: return '';
    }
  };

  const progressPercent = maxPowerUpDuration > 0 
    ? Math.max(0, Math.min(100, (powerUpDuration / maxPowerUpDuration) * 100)) 
    : 0;

  return (
    <div
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '400px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 0 20px rgba(5, 242, 199, 0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Score Block */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="font-arcade" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>SCORE</div>
          <div className="font-arcade" style={{ fontSize: '1.4rem', color: 'var(--neon-cyan)', textShadow: '0 0 10px var(--neon-cyan)' }}>
            {score}
          </div>
        </div>

        {/* High Score Block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="font-arcade" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>HI-SCORE</div>
          <div className="font-arcade" style={{ fontSize: '1.4rem', color: 'var(--neon-gold)', textShadow: '0 0 10px var(--neon-gold)' }}>
            {highScore}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
        {/* Level Block */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>LVL:</span>
          <span className="font-arcade" style={{ fontSize: '0.95rem', color: '#ffffff' }}>{level}</span>
        </div>

        {/* Duration Block */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TIME:</span>
          <span className="font-arcade" style={{ fontSize: '0.95rem', color: '#ffffff' }}>{formatDuration(gameDuration)}</span>
        </div>
      </div>

      {/* Active Power-up Progress Bar */}
      {powerUpActive && (
        <div
          style={{
            marginTop: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderTop: '1px dashed var(--glass-border)',
            paddingTop: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}
          >
            <span style={{ color: getPowerUpColor() }}>{getPowerUpLabel()}</span>
            <span style={{ color: '#ffffff' }}>{Math.ceil(powerUpDuration / 10)}s</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '3px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: getPowerUpColor(),
                boxShadow: `0 0 8px ${getPowerUpColor()}`,
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
