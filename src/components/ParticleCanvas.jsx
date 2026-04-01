import { useEffect, useRef } from 'react';
import { ATMOSPHERES } from '../atmospheres/definitions.js';
import { initParticles, tickParticles } from '../atmospheres/particles.js';

export function ParticleCanvas({ atmosphereKey }) {
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const particleType = ATMOSPHERES[atmosphereKey].particles;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = initParticles(particleType, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let last = performance.now();
    let t = 0;

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      tickParticles(
        particleType,
        particlesRef.current,
        canvas.getContext('2d'),
        canvas.width, canvas.height,
        dt, t
      );
      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [atmosphereKey]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
      }}
    />
  );
}
