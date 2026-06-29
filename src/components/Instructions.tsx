import React from 'react';

interface InstructionsProps {
  onBackToMenu: () => void;
  playSound: (type: 'eat' | 'crash' | 'powerup' | 'powerdown' | 'levelup' | 'click') => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onBackToMenu, playSound }) => {
  const handleBackClick = () => {
    playSound('click');
    onBackToMenu();
  };

  return (
    <div
      className="glass-panel"
      style={{
        width: 'var(--panel-width)',
        maxWidth: '95vw',
        padding: '24px 20px 16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 0 25px rgba(5, 242, 199, 0.1)',
        position: 'relative',
      }}
    >
      {/* Title Header (Fixed) */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <h1
          className="font-arcade"
          style={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            background: 'linear-gradient(45deg, var(--neon-cyan), var(--neon-purple), var(--neon-pink))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 229, 255, 0.2)',
            lineHeight: 1.2,
          }}
        >
          RULES & CONTROLS
        </h1>
        <div
          className="font-arcade"
          style={{
            fontSize: '0.8rem',
            color: 'var(--neon-cyan)',
            letterSpacing: '0.2em',
            marginTop: '4px',
            textShadow: '0 0 8px var(--neon-cyan-glow)',
          }}
        >
          SYSTEM MANUAL
        </div>
      </div>

      {/* Navigation Return Button (Fixed) */}
      <button
        onClick={handleBackClick}
        className="btn-neon btn-pink font-arcade"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '0.9rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          background: 'rgba(255, 42, 116, 0.05)',
          flexShrink: 0,
        }}
      >
        ◀ RETURN TO MENU
      </button>

      {/* Scrollable Container Content */}
      <div
        className="no-scrollbar"
        style={{
          width: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingRight: '6px',
        }}
      >

        {/* Section: Keyboard Controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2
            className="font-arcade"
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '6px',
              letterSpacing: '0.05em',
            }}
          >
            🎮 MOVEMENT CONTROLS
          </h2>

          {/* Key Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MOVE UP:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <kbd className="key-kbd">W</kbd>
                <kbd className="key-kbd">▲</kbd>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MOVE LEFT:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <kbd className="key-kbd">A</kbd>
                <kbd className="key-kbd">◀</kbd>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MOVE DOWN:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <kbd className="key-kbd">S</kbd>
                <kbd className="key-kbd">▼</kbd>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MOVE RIGHT:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <kbd className="key-kbd">D</kbd>
                <kbd className="key-kbd">▶</kbd>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>PAUSE / RESUME:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <kbd className="key-kbd" style={{ minWidth: '70px' }}>SPACE</kbd>
                <kbd className="key-kbd">ESC</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Game Mechanics */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2
            className="font-arcade"
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '6px',
              letterSpacing: '0.05em',
            }}
          >
            ⚙️ GAME LAWS
          </h2>
          <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              Eating food increases the snake length and triggers level progressions every <strong style={{ color: '#ffffff' }}>100 points</strong>.
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>Wall Collision Mode</strong>: Choose between <strong style={{ color: 'var(--neon-red)' }}>CRASH</strong> (hitting borders triggers immediate session termination, unless protected by Aegis Halo) or <strong style={{ color: 'var(--neon-emerald)' }}>PASS-THROUGH</strong> (snake wraps around to the opposite side of the grid safely, but incurs a <strong style={{ color: 'var(--neon-red)' }}>5-point penalty</strong> per wrap).
            </li>
            <li>
              <strong style={{ color: 'var(--neon-cyan)' }}>Difficulty Score Multipliers</strong>: Harder game modes reward more points per eat:
              <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <li><strong style={{ color: '#ffffff' }}>EASY</strong>: 1.0x score multiplier</li>
                <li><strong style={{ color: '#ffffff' }}>MEDIUM</strong>: 1.5x score multiplier</li>
                <li><strong style={{ color: '#ffffff' }}>HARD</strong>: 2.0x score multiplier</li>
                <li><strong style={{ color: 'var(--neon-gold)' }}>VIBE</strong>: 2.5x score multiplier (due to dynamic speed escalation)</li>
              </ul>
            </li>
            <li>
              <strong style={{ color: 'var(--neon-gold)' }}>Dual-Food Challenge</strong>: Every 3-5 normal eats triggers a dual-choice event. A low-score green food (+10 pts) spawns nearby, and a high-score golden food (+30 pts) spawns as far away as possible. Eating either food removes the other item immediately.
            </li>
            <li>
              <strong style={{ color: 'var(--neon-pink)' }}>Aegis Halo Shield</strong>: When collected, provides a defensive barrier with <strong style={{ color: 'var(--neon-pink)' }}>5 charges</strong>. It absorbs up to 5 wall crashes (allowing border wrapping) or self-intersections before expiring.
            </li>
            <li>
              <strong style={{ color: 'var(--neon-gold)' }}>Ouroboros Cycle</strong>: A cosmic achievement unlocked when the snake length occupies the entire 20x20 space grid (length 400) and suffers a self-collision without an active shield, completing the cycle of eternity.
            </li>
            <li>
              <strong style={{ color: 'var(--neon-emerald)' }}>Ultimate Victory</strong>: If you cover the entire grid space (400 coordinates) and successfully navigate the final movement without self-colliding on the last eat, you win the game and are crowned the Winner of Self Control & Decisions.
            </li>
          </ul>
        </div>

        {/* Section: Audio Settings */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2
            className="font-arcade"
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '6px',
              letterSpacing: '0.05em',
            }}
          >
            🔊 AUDIO SYSTEM OPTIONS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* SFX Block */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '1.1rem', marginTop: '2px', flexShrink: 0 }}>🔊</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--neon-emerald)' }}>
                  SFX (SOUND EFFECTS)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Short audio cues triggered on clicks, eating food, gaining power-ups, leveling up, or crashing. Generates real-time sound waves using oscillators.
                </div>
              </div>
            </div>

            {/* Synth Block */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '1.1rem', marginTop: '2px', flexShrink: 0 }}>🎵</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--neon-purple)' }}>
                  SYNTH (BACKGROUND TRACKS)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  A continuous, live retro-arpeggio synthesizer soundtrack. The track arpeggiates pads and chord progressions, pacing up dynamically as the game speeds up.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Food & Power-up Glossary */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2
            className="font-arcade"
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '6px',
              letterSpacing: '0.05em',
            }}
          >
            🔋 SUBSTANCE INDEX
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Normal Food */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--neon-emerald)',
                  boxShadow: '0 0 10px var(--neon-emerald)',
                  marginTop: '4px',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--neon-emerald)' }}>
                  NORMAL FOOD (+10 PTS)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  The basic energy molecule. Restores standard difficulty speed.
                </div>
              </div>
            </div>

            {/* Golden Shield */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--neon-gold)',
                  boxShadow: '0 0 10px var(--neon-gold)',
                  marginTop: '4px',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--neon-gold)' }}>
                  GOLDEN CHIME (+30 PTS)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Rare high-energy compound spawning at maximum distance during the dual-choice challenge.
                </div>
              </div>
            </div>

            {/* Hyper Drive */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--neon-cyan)',
                  boxShadow: '0 0 10px var(--neon-cyan)',
                  marginTop: '4px',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>
                  HYPER DRIVE (+10 PTS)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Overclocks game ticks (1.8x speed) for 8s.
                </div>
              </div>
            </div>

            {/* Chill Vibe */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--neon-purple)',
                  boxShadow: '0 0 10px var(--neon-purple)',
                  marginTop: '4px',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--neon-purple)' }}>
                  CHILL VIBE (+10 PTS)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Slows speed (0.62x delay multiplier) to ease navigation for 8s.
                </div>
              </div>
            </div>

            {/* Aegis Halo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--neon-pink)',
                  boxShadow: '0 0 10px var(--neon-pink)',
                  marginTop: '4px',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--neon-pink)' }}>
                  AEGIS HALO (+10 PTS)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Provides 5 shield charges. Wall hits wrap safely; self-collisions are absorbed.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Styled Inline Styles for Keyboards */}
      <style>{`
        .key-kbd {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-bottom: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: var(--text-primary);
          display: inline-block;
          font-family: 'Orbitron', monospace;
          font-size: 0.75rem;
          font-weight: bold;
          line-height: 1;
          padding: 4px 8px;
          min-width: 26px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
};
