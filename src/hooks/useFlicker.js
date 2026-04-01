import { useState, useEffect } from 'react';

export function useFlicker(on) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (!on) { setOpacity(0); return; }
    let timer;
    const run = () => {
      timer = setTimeout(() => {
        setOpacity(Math.random() * 0.06 + 0.01);
        setTimeout(() => { setOpacity(0); run(); }, 80 + Math.random() * 120);
      }, 3000 + Math.random() * 8000);
    };
    run();
    return () => clearTimeout(timer);
  }, [on]);

  return opacity;
}
