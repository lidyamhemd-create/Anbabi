export const PARTICLE_COUNTS = {
  rain: 200, leaves: 35, dust: 50, motes: 40, embers: 70, petals: 40, none: 0,
};

export function spawnParticle(type, w, h, init) {
  switch (type) {
    case 'rain':
      return {
        x: Math.random() * w * 1.2 - w * 0.1,
        y: init ? Math.random() * h : Math.random() * h * -0.5,
        len: Math.random() * 22 + 8,
        speed: Math.random() * 18 + 22,
        op: Math.random() * 0.35 + 0.08,
        lw: Math.random() * 0.9 + 0.2,
      };
    case 'leaves':
      return {
        x: Math.random() * w, y: init ? Math.random() * h : -20,
        rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 2.5,
        sz: Math.random() * 13 + 5, vy: Math.random() * 1.2 + 0.4,
        vx: (Math.random() - 0.5) * 1.2, sa: Math.random() * 35 + 8,
        sf: Math.random() * 1.2 + 0.4, sp: Math.random() * Math.PI * 2,
        hue: Math.random() * 40 + 8, sat: 60 + Math.random() * 30,
        lit: 35 + Math.random() * 20, op: Math.random() * 0.55 + 0.3,
      };
    case 'dust':
      return {
        x: Math.random() * w, y: init ? Math.random() * h : h + 10,
        sz: Math.random() * 1.8 + 0.4, vy: -(Math.random() * 0.25 + 0.08),
        vx: (Math.random() - 0.5) * 0.2, op: Math.random() * 0.2 + 0.04,
        tp: Math.random() * Math.PI * 2, ts: Math.random() * 2.5 + 0.8,
      };
    case 'motes':
      return {
        x: Math.random() * w, y: init ? Math.random() * h : h + 10,
        sz: Math.random() * 2.2 + 0.5, vy: -(Math.random() * 0.15 + 0.05),
        vx: (Math.random() - 0.5) * 0.1, op: Math.random() * 0.25 + 0.04,
        ph: Math.random() * Math.PI * 2, fr: Math.random() * 1.5 + 0.3,
      };
    case 'embers':
      return {
        x: Math.random() * w, y: h + 10,
        vx: (Math.random() - 0.5) * 2.5, vy: -(Math.random() * 4 + 1.5),
        life: 0, maxLife: Math.random() * 120 + 60,
        sz: Math.random() * 2.5 + 0.8,
        col: Math.random() > 0.5 ? '#f07020' : '#f8c030',
      };
    case 'petals':
      return {
        x: Math.random() * w, y: init ? Math.random() * h : -10,
        rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 1.2,
        pw: Math.random() * 8 + 3, ph2: Math.random() * 5 + 2,
        vy: Math.random() * 0.7 + 0.3, vx: (Math.random() - 0.5) * 0.8,
        sa: Math.random() * 25 + 8, sf: Math.random() * 0.8 + 0.3,
        sp: Math.random() * Math.PI * 2, op: Math.random() * 0.5 + 0.25,
        hue: Math.random() * 30 + 340,
      };
    default:
      return {};
  }
}

export function initParticles(type, w, h) {
  const n = PARTICLE_COUNTS[type] || 0;
  return Array.from({ length: n }, () => spawnParticle(type, w, h, true));
}

export function tickParticles(type, particles, ctx, w, h, dt, t) {
  ctx.clearRect(0, 0, w, h);
  if (!particles.length || type === 'none') return;

  if (type === 'rain') {
    ctx.save();
    for (const p of particles) {
      p.x += p.speed * 0.18 * dt; p.y += p.speed * dt;
      if (p.y > h + p.len) Object.assign(p, spawnParticle('rain', w, h, false));
      ctx.beginPath();
      ctx.strokeStyle = `rgba(170,205,255,${p.op})`;
      ctx.lineWidth = p.lw;
      ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.len * 0.18, p.y + p.len);
      ctx.stroke();
    }
    ctx.restore();

  } else if (type === 'leaves') {
    for (const p of particles) {
      const sw = Math.sin(t * p.sf + p.sp) * p.sa * 0.015;
      p.x += (p.vx + sw) * dt * 60; p.y += p.vy * dt * 60; p.rot += p.rs * dt;
      if (p.y > h + 30) Object.assign(p, spawnParticle('leaves', w, h, false));
      if (p.x < -60) p.x = w + 60;
      if (p.x > w + 60) p.x = -60;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.op;
      ctx.fillStyle = `hsl(${p.hue},${p.sat}%,${p.lit}%)`;
      ctx.beginPath(); ctx.ellipse(0, 0, p.sz, p.sz * 0.52, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
    }

  } else if (type === 'dust') {
    for (const p of particles) {
      p.x += p.vx * dt * 60; p.y += p.vy * dt * 60; p.tp += p.ts * dt;
      if (p.y < -10) Object.assign(p, spawnParticle('dust', w, h, false));
      ctx.beginPath();
      ctx.fillStyle = `rgba(175,140,235,${p.op * (0.7 + Math.sin(p.tp) * 0.3)})`;
      ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fill();
    }

  } else if (type === 'motes') {
    for (const p of particles) {
      p.x += (p.vx + Math.sin(t * p.fr + p.ph) * 0.08) * dt * 60;
      p.y += p.vy * dt * 60; p.ph += p.fr * dt * 0.5;
      if (p.y < -10) Object.assign(p, spawnParticle('motes', w, h, false));
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz * 2.5);
      g.addColorStop(0, `rgba(100,220,170,${p.op * (0.7 + Math.sin(p.ph * 2) * 0.3)})`);
      g.addColorStop(1, 'rgba(100,220,170,0)');
      ctx.beginPath(); ctx.fillStyle = g;
      ctx.arc(p.x, p.y, p.sz * 2.5, 0, Math.PI * 2); ctx.fill();
    }

  } else if (type === 'embers') {
    ctx.save();
    for (const p of particles) {
      p.life++;
      if (p.life > p.maxLife) Object.assign(p, spawnParticle('embers', w, h, false));
      p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
      p.vy += 0.03 * dt * 60; p.vx += (Math.random() - 0.5) * 0.04;
      ctx.globalAlpha = (1 - p.life / p.maxLife) * 0.75;
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

  } else if (type === 'petals') {
    for (const p of particles) {
      p.x += (p.vx + Math.sin(t * p.sf + p.sp) * p.sa * 0.01) * dt * 60;
      p.y += p.vy * dt * 60; p.rot += p.rs * dt;
      if (p.y > h + 20) Object.assign(p, spawnParticle('petals', w, h, false));
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.op;
      ctx.fillStyle = `hsla(${p.hue},70%,75%,1)`;
      ctx.beginPath(); ctx.ellipse(0, 0, p.pw, p.ph2, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
    }
  }
}
