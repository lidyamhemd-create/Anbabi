import { useState } from 'react';

export function UploadScreen({ onFile, ready }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') onFile(file);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at 40% 30%, #0d1520 0%, #060a0f 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', color: '#dce4ef', userSelect: 'none',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .uz { transition: all 0.3s; }
        .uz:hover { border-color: #5a7fa0 !important; background: rgba(90,127,160,0.05) !important; transform: scale(1.01); }
        .tag { transition: background 0.2s; }
        .tag:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
          fontSize: '3.5rem', letterSpacing: '0.12em', color: '#c8d8e8',
          textShadow: '0 0 40px rgba(100,160,220,0.25)',
        }}>Atmospheric</div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
          fontSize: '1rem', color: '#607080', letterSpacing: '0.08em', marginTop: '0.4rem',
        }}>a living reading experience</div>
      </div>

      <div
        className="uz"
        onClick={() => document.getElementById('_pf').click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          width: 380, height: 220,
          border: `1.5px dashed ${dragging ? '#6a9fcc' : '#2a3d52'}`,
          borderRadius: 12,
          background: dragging ? 'rgba(80,130,190,0.06)' : 'rgba(255,255,255,0.015)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', gap: '0.75rem',
        }}
      >
        <div style={{ fontSize: '2.8rem', opacity: dragging ? 1 : 0.7 }}>📄</div>
        <div style={{ color: '#7a98b0', fontSize: '0.95rem', letterSpacing: '0.04em' }}>Drop a PDF here</div>
        <div style={{ color: '#3a5060', fontSize: '0.82rem' }}>or click to browse</div>
      </div>

      <input
        id="_pf" type="file" accept=".pdf"
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); }}
      />

      {!ready && (
        <div style={{ marginTop: '1.5rem', color: '#304050', fontSize: '0.8rem', letterSpacing: '0.06em' }}>
          loading pdf engine…
        </div>
      )}

      <div style={{
        display: 'flex', gap: '0.65rem', marginTop: '2.2rem',
        flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480,
      }}>
        {[['⛈', 'Stormy seas'], ['🍂', 'Autumn wind'], ['😨', 'Dark suspense'],
          ['🌙', 'Mysterious'], ['⚡', 'Intense action'], ['🌹', 'Romance']].map(([icon, label]) => (
          <span key={label} className="tag" style={{
            padding: '0.3rem 0.85rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 999, fontSize: '0.8rem', color: '#607080',
          }}>{icon} {label}</span>
        ))}
      </div>

      <div style={{
        marginTop: '2rem', color: '#253545', fontSize: '0.77rem',
        letterSpacing: '0.05em', maxWidth: 320, textAlign: 'center', lineHeight: 1.75,
      }}>
        Claude reads each page and transforms the environment —<br />
        particles, colors, and ambient sound shift with the story.
      </div>
    </div>
  );
}
