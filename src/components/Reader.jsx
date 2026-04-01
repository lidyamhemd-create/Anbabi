import { useState, useEffect, useRef, useCallback } from 'react';
import { ATMOSPHERES } from '../atmospheres/definitions.js';
import { AudioEngine } from '../audio/AudioEngine.js';
import { useFlicker } from '../hooks/useFlicker.js';
import { useMoodAnalysis } from '../hooks/useMoodAnalysis.js';
import { ParticleCanvas } from './ParticleCanvas.jsx';

export function Reader({ pdfDoc, onClose }) {
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [atm, setAtm]         = useState('neutral');
  const [reason, setReason]   = useState('');
  const [audioOn, setAudioOn] = useState(false);
  const [rendering, setRendering] = useState(false);

  const pdfCanvasRef = useRef(null);
  const audioEngRef  = useRef(new AudioEngine());
  const busyRef      = useRef(false);

  const flicker = useFlicker(atm === 'thriller');
  const { analyzeMood, analyzing } = useMoodAnalysis(
    useCallback((key, rsn) => { setAtm(key); setReason(rsn); }, [])
  );

  useEffect(() => {
    setTotal(pdfDoc.numPages);
    return () => audioEngRef.current.dispose();
  }, [pdfDoc]);

  const renderPage = useCallback(async (num) => {
    if (!pdfDoc || !pdfCanvasRef.current || busyRef.current) return;
    busyRef.current = true;
    setRendering(true);
    try {
      const pg     = await pdfDoc.getPage(num);
      const canvas = pdfCanvasRef.current;
      const maxW   = Math.min(window.innerWidth * 0.60, 760);
      const maxH   = window.innerHeight * 0.78;
      const vp     = pg.getViewport({ scale: 1 });
      const scale  = Math.min(maxW / vp.width, maxH / vp.height);
      const svp    = pg.getViewport({ scale });
      canvas.width  = svp.width;
      canvas.height = svp.height;
      await pg.render({ canvasContext: canvas.getContext('2d'), viewport: svp }).promise;
      setRendering(false);
      const tc   = await pg.getTextContent();
      const text = tc.items.map(i => i.str).join(' ');
      await analyzeMood(text, canvas);
    } catch (e) {
      console.error('Render error:', e);
      setRendering(false);
    } finally {
      busyRef.current = false;
    }
  }, [pdfDoc, analyzeMood]);

  useEffect(() => { if (pdfDoc) renderPage(page); }, [pdfDoc, page, renderPage]);

  useEffect(() => {
    if (audioOn) audioEngRef.current.play(ATMOSPHERES[atm].audio);
  }, [atm, audioOn]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setPage(p => Math.min(total, p + 1));
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   setPage(p => Math.max(1, p - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  const toggleAudio = () => {
    audioEngRef.current.init();
    const next = !audioOn;
    setAudioOn(next);
    audioEngRef.current.vol(next ? 0.45 : 0);
    if (next) audioEngRef.current.play(ATMOSPHERES[atm].audio);
  };

  const A = ATMOSPHERES[atm];

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      background: A.gradient, transition: 'background 2.5s ease',
      fontFamily: "'Cormorant Garamond','Palatino Linotype',serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .btn { transition: all 0.25s; cursor: pointer; }
        .btn:hover:not(:disabled) { background: rgba(255,255,255,0.12) !important; }
        .btn:disabled { opacity: 0.3; cursor: not-allowed; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse-d { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes page-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <ParticleCanvas atmosphereKey={atm} />

      {/* Glow overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: A.glow, transition: 'background 2.5s ease', pointerEvents: 'none' }} />
      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)', pointerEvents: 'none' }} />
      {/* Thriller flicker */}
      {atm === 'thriller' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 4, background: `rgba(255,40,40,${flicker})`, pointerEvents: 'none', transition: 'background 0.05s' }} />
      )}

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '1rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}>
        <button className="btn" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#8090a8', padding: '0.3rem 0.85rem', borderRadius: 6, fontSize: '0.82rem', letterSpacing: '0.05em' }}>← close</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', padding: '0.38rem 1rem', borderRadius: 999, border: `1px solid ${A.border}`, color: A.accent, fontSize: '0.85rem', transition: 'all 1.5s ease', boxShadow: `0 0 20px ${A.glow}` }}>
          {analyzing
            ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: A.accent, display: 'inline-block', animation: 'pulse-d 1s infinite' }} /><span style={{ opacity: 0.7, fontStyle: 'italic', fontSize: '0.8rem' }}>reading atmosphere…</span></>
            : <><span>{A.label}</span>{reason && <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.78rem' }}>· {reason}</span>}</>
          }
        </div>
        <button className="btn" onClick={toggleAudio} style={{ background: audioOn ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${audioOn ? A.border : 'rgba(255,255,255,0.1)'}`, color: audioOn ? A.accent : '#607080', padding: '0.3rem 0.85rem', borderRadius: 6, fontSize: '0.82rem', letterSpacing: '0.05em', transition: 'all 0.3s' }}>
          {audioOn ? '🔊 sound' : '🔇 sound'}
        </button>
      </div>

      {/* Page canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 80 }}>
        {rendering
          ? <div style={{ width: 38, height: 38, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: A.accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          : <div key={page} style={{ animation: 'page-in 0.5s ease' }}>
              <canvas ref={pdfCanvasRef} style={{ display: 'block', borderRadius: 2, filter: A.pageFilter, transition: 'filter 2s ease, box-shadow 2s ease', boxShadow: `0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${A.glow}` }} />
            </div>
        }
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)', padding: '1.4rem 2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <button className="btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#c0ccd8', padding: '0.45rem 1.3rem', borderRadius: 6, fontSize: '0.85rem', letterSpacing: '0.07em' }}>← prev</button>
        <div style={{ color: '#506070', fontSize: '0.82rem', letterSpacing: '0.1em', minWidth: 80, textAlign: 'center', fontStyle: 'italic' }}>{page} / {total}</div>
        <button className="btn" onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page >= total} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#c0ccd8', padding: '0.45rem 1.3rem', borderRadius: 6, fontSize: '0.85rem', letterSpacing: '0.07em' }}>next →</button>
      </div>
    </div>
  );
}
