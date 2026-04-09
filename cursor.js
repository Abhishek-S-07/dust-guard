/* ============================================================
   DustGuard — Startup Grade Interaction System
   ============================================================ */

(function () {
    'use strict';

    const dot = document.createElement('div');
    dot.className = 'cur-dot';
    document.body.appendChild(dot);

    const ring = document.createElement('div');
    ring.className = 'cur-ring';
    document.body.appendChild(ring);

    const trailCanvas = document.createElement('canvas');
    trailCanvas.className = 'cur-trail';
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
    document.body.appendChild(trailCanvas);
    const ctx = trailCanvas.getContext('2d');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let rx2 = mx, ry2 = my; // second ring for chromatic effect
    let trailPoints = [];
    const MAX_TRAIL = 40;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
    });

    // UPDATED HOVER: Added h1, h2, h3 for magnetic effects
    const HOVER_SEL = 'button, a, .nav-item, .stat-pill, .radar-dot, .panel-card, input, .card-glass, h1, h2, h3, .logo';
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(HOVER_SEL);
        if (target) {
            ring.classList.add('hovering');
            dot.classList.add('hovering');
            if (target.tagName.match(/H[1-3]/)) ring.classList.add('magnetic-text');
        }
    });
    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest(HOVER_SEL);
        if (target) {
            ring.classList.remove('hovering');
            dot.classList.remove('hovering');
            ring.classList.remove('magnetic-text');
        }
    });

    document.addEventListener('mousedown', () => {
        ring.classList.add('clicking');
        dot.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
        ring.classList.remove('clicking');
        dot.classList.remove('clicking');
    });

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animateRing() {
        // Multi-stage lerp for chromatic feel
        rx = lerp(rx, mx, 0.12);
        ry = lerp(ry, my, 0.12);
        rx2 = lerp(rx2, mx, 0.08); 
        ry2 = lerp(ry2, my, 0.08);

        const dist = Math.hypot(rx - mx, ry - my);
        const chromatic = Math.min(dist * 0.15, 8);
        
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        // Apply chromatic offset based on speed
        ring.style.boxShadow = `
            0 0 0 1.5px rgba(0, 225, 255, 0.7),
            ${chromatic}px 0 0 rgba(255, 0, 128, 0.3),
            -${chromatic}px 0 0 rgba(0, 225, 255, 0.2),
            0 0 20px rgba(0, 225, 255, 0.1)
        `;

        requestAnimationFrame(animateRing);
    }

    window.addEventListener('resize', () => {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    });

    function drawTrail() {
        ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        trailPoints.push({ x: mx, y: my });
        if (trailPoints.length > MAX_TRAIL) trailPoints.shift();

        if (trailPoints.length > 2) {
            ctx.beginPath();
            ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
            
            for (let i = 1; i < trailPoints.length; i++) {
                const p = trailPoints[i];
                const pp = trailPoints[i-1];
                const mid = { x: (p.x + pp.x) / 2, y: (p.y + pp.y) / 2 };
                
                const ratio = i / trailPoints.length;
                const weight = ratio * 8;
                
                ctx.quadraticCurveTo(pp.x, pp.y, mid.x, mid.y);
                ctx.lineWidth = weight;
                ctx.strokeStyle = `rgba(0, 225, 255, ${ratio * 0.35})`;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(mid.x, mid.y);
            }
        }
        requestAnimationFrame(drawTrail);
    }

    animateRing();
    drawTrail();

    /* ==========================================================
       2. CLICK SPARKS
    ========================================================== */
    document.addEventListener('click', (e) => spawnSparks(e.clientX, e.clientY));

    function spawnSparks(x, y) {
        const colors = ['#00e1ff', '#ff0080', '#ffffff', '#3b82f6'];
        const count = 15;
        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.5 - 0.25);
            const dist = 30 + Math.random() * 60;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const size = 2 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            spark.style.cssText = `
                left:${x}px; top:${y}px;
                width:${size}px; height:${size}px;
                background:${color};
                box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
                --dx:${dx}px; --dy:${dy}px;
            `;
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 700);
        }
    }

    /* ==========================================================
       3. ADVANCED MAGNETIC INTERACTION
    ========================================================== */
    function applyMagnetic() {
        const magElements = document.querySelectorAll('.btn, .nav-item, h1, .tech-card, .logo');
        magElements.forEach(el => {
            if (el._magnetic) return;
            el._magnetic = true;
            el.addEventListener('mousemove', function (e) {
                const r = this.getBoundingClientRect();
                const strength = this.tagName.match(/H[1-3]/) ? 0.08 : 0.25;
                const dx = (e.clientX - (r.left + r.width / 2)) * strength;
                const dy = (e.clientY - (r.top + r.height / 2)) * strength;
                this.style.transform = `translate(${dx}px, ${dy}px)`;
                
                // If text, pull the ring harder
                if (strength < 0.1) {
                    rx = lerp(rx, e.clientX, 0.1);
                    ry = lerp(ry, e.clientY, 0.1);
                }
            });
            el.addEventListener('mouseleave', function () {
                this.style.transform = '';
            });
        });
    }
    setInterval(applyMagnetic, 1500);

    /* ==========================================================
       4. RIPPLE & AURA
    ========================================================== */
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .btn, .nav-item');
        if (!target) return;
        const r = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `left: ${e.clientX - r.left}px; top: ${e.clientY - r.top}px;`;
        target.style.position = 'relative';
        target.style.overflow = 'hidden';
        target.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });

    const particleCanvas = document.createElement('canvas');
    particleCanvas.className = 'particle-canvas';
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    document.body.appendChild(particleCanvas);
    const pCtx = particleCanvas.getContext('2d');

    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.5 + Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.1 - Math.random() * 0.3,
        alpha: 0.1 + Math.random() * 0.3,
        color: Math.random() > 0.6 ? '0, 225, 255' : '255, 255, 255'
    }));

    function animateParticles() {
        pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.y < -5) p.y = particleCanvas.height + 5;
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            pCtx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            pCtx.fill();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    const aura = document.createElement('div');
    aura.className = 'mouse-aura';
    document.body.appendChild(aura);
    document.addEventListener('mousemove', (e) => {
        aura.style.left = e.clientX + 'px';
        aura.style.top = e.clientY + 'px';
    });

})();

