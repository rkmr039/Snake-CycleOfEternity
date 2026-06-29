import React, { useState, useRef, useEffect } from 'react';

interface MenuProps {
  highScore: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VIBE';
  setDifficulty: (d: 'EASY' | 'MEDIUM' | 'HARD' | 'VIBE') => void;
  wallWrapEnabled: boolean;
  setWallWrapEnabled: (w: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (m: boolean) => void;
  onStartGame: () => void;
  onShowInstructions: () => void;
  playSound: (type: 'eat' | 'crash' | 'powerup' | 'powerdown' | 'levelup' | 'click') => void;
  theme: 'cyber-dark' | 'forest-green' | 'pink-vibe';
  setTheme: (t: 'cyber-dark' | 'forest-green' | 'pink-vibe') => void;
}

export const Menu: React.FC<MenuProps> = ({
  highScore,
  difficulty,
  setDifficulty,
  wallWrapEnabled,
  setWallWrapEnabled,
  soundEnabled,
  setSoundEnabled,
  musicEnabled,
  setMusicEnabled,
  onStartGame,
  onShowInstructions,
  playSound,
  theme,
  setTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDifficultyClick = (d: 'EASY' | 'MEDIUM' | 'HARD' | 'VIBE') => {
    playSound('click');
    setDifficulty(d);
  };

  const handleToggleWrap = () => {
    playSound('click');
    setWallWrapEnabled(!wallWrapEnabled);
  };

  const handleToggleSound = () => {
    // Enable sound first so we can play the click
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(() => playSound('click'), 10);
    }
  };

  const handleToggleMusic = () => {
    playSound('click');
    setMusicEnabled(!musicEnabled);
  };

  const handleStartGameClick = () => {
    playSound('levelup');
    onStartGame();
  };

  const handleInstructionsClick = () => {
    playSound('click');
    onShowInstructions();
  };

  return (
    <div
      className="glass-panel"
      style={{
        width: 'var(--panel-width)',
        maxWidth: '95vw',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        boxShadow: '0 0 25px rgba(5, 242, 199, 0.1)',
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1
          className="font-arcade"
          style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            margin: 0,
            background: 'linear-gradient(45deg, var(--neon-cyan), var(--neon-purple), var(--neon-pink))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
            lineHeight: 1.1,
            letterSpacing: '0.05em',
          }}
        >
          SNAKE
        </h1>
        <div
          className="font-arcade"
          style={{
            fontSize: '0.85rem',
            color: 'var(--neon-gold)',
            letterSpacing: '0.25em',
            marginTop: '8px',
            textShadow: '0 0 8px var(--neon-gold-glow)',
          }}
        >
          VIBE EDITION
        </div>
      </div>

      {/* Hi Score */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '10px 30px',
          width: '80%',
        }}
      >
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PERSONAL RECORD</span>
        <span className="font-arcade" style={{ fontSize: '1.2rem', color: 'var(--neon-emerald)', textShadow: '0 0 8px var(--neon-emerald-glow)' }}>
          {highScore} PTS
        </span>
      </div>

      {/* Settings Grid */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Difficulty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>DIFFICULTY MULTIPLIER</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {(['EASY', 'MEDIUM', 'HARD', 'VIBE'] as const).map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultyClick(d)}
                className={`btn-subtle font-arcade ${difficulty === d ? 'active' : ''}`}
                style={{
                  padding: '10px 0',
                  fontSize: '0.65rem',
                  letterSpacing: '0.05em',
                  border: difficulty === d ? '1px solid var(--neon-cyan)' : '1px solid var(--glass-border)',
                  color: difficulty === d ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  textShadow: difficulty === d ? '0 0 8px var(--neon-cyan-glow)' : 'none',
                  background: difficulty === d ? 'rgba(0, 229, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>VISUAL THEME ENGINE</label>
          <div ref={dropdownRef} className="theme-select-container" style={{ zIndex: isOpen ? 50 : 1 }}>
            {/* Trigger Button */}
            <div
              onClick={() => {
                playSound('click');
                setIsOpen(!isOpen);
              }}
              className="theme-select font-arcade"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                height: '44px',
              }}
            >
              <span>
                {theme === 'cyber-dark' && 'CYBERPUNK DARK'}
                {theme === 'forest-green' && 'FOREST GREEN'}
                {theme === 'pink-vibe' && 'PINK VIBE'}
              </span>
              <span style={{ fontSize: '0.65rem', transition: 'transform 0.25s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>

            {/* Custom Options List */}
            {isOpen && (
              <div
                className="glass-panel font-arcade"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  borderRadius: '12px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 200,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 42, 116, 0.1)',
                  border: '1px solid var(--glass-border)',
                  backgroundColor: 'var(--dropdown-bg)',
                }}
              >
                {(['cyber-dark', 'forest-green', 'pink-vibe'] as const).map((t) => (
                  <div
                    key={t}
                    onClick={() => {
                      playSound('click');
                      setTheme(t);
                      setIsOpen(false);
                    }}
                    className={`dropdown-option ${theme === t ? 'active' : ''}`}
                    style={{
                      padding: '10px 14px',
                      fontSize: '0.7rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      color: theme === t ? 'var(--neon-pink)' : 'var(--text-secondary)',
                      background: theme === t ? 'rgba(255, 42, 116, 0.05)' : 'transparent',
                      textShadow: theme === t ? '0 0 8px var(--neon-pink-glow)' : 'none',
                    }}
                  >
                    {t === 'cyber-dark' && 'CYBERPUNK DARK'}
                    {t === 'forest-green' && 'FOREST GREEN'}
                    {t === 'pink-vibe' && 'PINK VIBE'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wall mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WALL COLLISION MODE</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              onClick={handleToggleWrap}
              className={`switch-track ${wallWrapEnabled ? 'active' : ''}`}
              style={{ flexShrink: 0 }}
            >
              <div className="switch-thumb" />
            </div>
            <span
              className="font-arcade"
              style={{
                fontSize: '0.7rem',
                color: wallWrapEnabled ? 'var(--neon-emerald)' : 'var(--neon-pink)',
                textShadow: wallWrapEnabled ? '0 0 8px var(--neon-emerald-glow)' : '0 0 8px var(--neon-pink-glow)',
              }}
            >
              {wallWrapEnabled ? 'PASS-THROUGH' : 'CRASH'}
            </span>
          </div>
        </div>

        {/* Audio */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={handleToggleSound}
            className="btn-subtle font-arcade"
            style={{
              padding: '12px 0',
              fontSize: '0.75rem',
              border: soundEnabled ? '1px solid var(--neon-emerald)' : '1px solid var(--glass-border)',
              color: soundEnabled ? 'var(--neon-emerald)' : 'var(--text-secondary)',
              background: soundEnabled ? 'rgba(5, 242, 199, 0.05)' : 'rgba(255, 255, 255, 0.01)',
              textShadow: soundEnabled ? '0 0 8px var(--neon-emerald-glow)' : 'none',
            }}
          >
            SFX: {soundEnabled ? 'ACTIVE' : 'MUTED'}
          </button>
          <button
            onClick={handleToggleMusic}
            className="btn-subtle font-arcade"
            style={{
              padding: '12px 0',
              fontSize: '0.75rem',
              border: musicEnabled ? '1px solid var(--neon-purple)' : '1px solid var(--glass-border)',
              color: musicEnabled ? 'var(--neon-purple)' : 'var(--text-secondary)',
              background: musicEnabled ? 'rgba(176, 38, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
              textShadow: musicEnabled ? '0 0 8px var(--neon-purple-glow)' : 'none',
            }}
          >
            SYNTH: {musicEnabled ? 'ACTIVE' : 'MUTED'}
          </button>
        </div>
      </div>

      {/* Start Button & Instructions */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
        <button
          onClick={handleStartGameClick}
          className="btn-neon btn-cyan font-arcade"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
          }}
        >
          ▶ START SESSION
        </button>

        <button
          onClick={handleInstructionsClick}
          className="btn-neon btn-pink font-arcade"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: 'rgba(255, 42, 116, 0.05)',
          }}
        >
          📖 RULES & CONTROLS
        </button>
      </div>
    </div>
  );
};
