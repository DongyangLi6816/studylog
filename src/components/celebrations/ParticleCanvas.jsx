import { useEffect, useRef } from 'react';

function makeParticle(type, ox, oy, colors) {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const angle = Math.random() * Math.PI * 2;

  if (type === 'ribbon') {
    const speed = 150 + Math.random() * 250;
    return {
      type, color,
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 150,
      w: 4 + Math.random() * 4,
      h: 30 + Math.random() * 30,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 5,
      sineAmp: 20 + Math.random() * 40,
      sineFreq: 1.5 + Math.random() * 2,
      sinePhase: Math.random() * Math.PI * 2,
      lifetime: 1.8 + Math.random() * 0.4,
    };
  }

  if (type === 'streamer') {
    const speed = 200 + Math.random() * 350;
    return {
      type, color,
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 100,
      w: 3 + Math.random() * 2,
      h: 10 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 12,
      lifetime: 1.2 + Math.random() * 0.5,
    };
  }

  // confetti (Tier 2 / 3)
  const speed = 200 + Math.random() * 400;
  return {
    type: 'confetti', color,
    x: ox, y: oy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 250,
    size: 6 + Math.random() * 8,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 8,
    lifetime: 2.5 + Math.random() * 1,
    isCircle: Math.random() < 0.3,
  };
}

// groups: [{ type: 'ribbon'|'streamer'|'confetti', count: number, colors: string[] }]
// origin: { x, y } in pixels — defaults to top-center of viewport
// duration: ms before calling onDone
export default function ParticleCanvas({ groups, duration = 2000, origin, onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const ox = origin ? origin.x : W / 2;
    const oy = origin ? origin.y : H * 0.2;

    const particles = [];
    for (const { type, count, colors } of groups) {
      for (let i = 0; i < count; i++) {
        particles.push(makeParticle(type, ox, oy, colors));
      }
    }

    const start = performance.now();
    let prev = start;
    let raf;

    const tick = (now) => {
      const elapsed = now - start;
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        // Physics
        const drag = p.type === 'ribbon'
          ? Math.pow(0.985, dt * 60)
          : p.type === 'streamer'
            ? Math.pow(0.97, dt * 60)
            : Math.pow(0.99, dt * 60);
        const gravity = p.type === 'ribbon' ? 500 : p.type === 'streamer' ? 700 : 600;
        p.vx *= drag;
        p.vy += gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.rotSpeed * dt;

        // Fade out over last 35% of each particle's lifetime
        const t = elapsed / 1000;
        const lifeT = t / p.lifetime;
        if (lifeT >= 1) continue;

        const fadeStart = 0.65;
        const alpha = lifeT > fadeStart
          ? 1 - (lifeT - fadeStart) / (1 - fadeStart)
          : 1;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;

        if (p.type === 'ribbon') {
          // Sine wave offset simulates 3D curl as ribbon falls
          const sineX = p.sineAmp * Math.sin(p.sineFreq * t + p.sinePhase);
          ctx.translate(p.x + sineX, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.type === 'streamer') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          if (p.isCircle) {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
        }

        ctx.restore();
      }

      if (elapsed < duration + 300) {
        raf = requestAnimationFrame(tick);
      } else {
        onDone?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
    />
  );
}
