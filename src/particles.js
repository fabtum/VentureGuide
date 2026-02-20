// Enhanced particle/line background with gradient orbs and flowing connections
export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  const PARTICLE_COUNT = 80;
  const CONNECTION_DISTANCE = 160;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.5 + 0.15,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Mouse interaction lines
      const mdx = particles[i].x - mouse.x;
      const mdy = particles[i].y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 200) {
        const alpha = (1 - mdist / 200) * 0.2;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw particles with pulsing
    for (const p of particles) {
      p.pulse += p.pulseSpeed;
      const pulseScale = 1 + Math.sin(p.pulse) * 0.3;
      const r = p.radius * pulseScale;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79, 70, 229, ${p.opacity * (0.7 + Math.sin(p.pulse) * 0.3)})`;
      ctx.fill();

      // Soft glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79, 70, 229, ${p.opacity * 0.05})`;
      ctx.fill();
    }
  }

  function update() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Gentle mouse repulsion
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 120) {
        p.vx += (mdx / mdist) * 0.02;
        p.vy += (mdy / mdist) * 0.02;
      }

      // Damping
      p.vx *= 0.999;
      p.vy *= 0.999;
    }
  }

  function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
}
