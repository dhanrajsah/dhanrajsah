/* ═══════════════════════════════════════════════════════════════════════════
   PROJECT TITAN — UPGRADED PREMIUM INTERACTION ENGINE
   ★ PREMIUM GLSL SHADER: Multi-pass metaball aurora with domain warping,
     iridescent color science, and deep chromatic aberration
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mouse = { x: 0, y: 0, nx: 0.5, ny: 0.5 };
    let lenis = null;

    /* ═══════════════════════════════════════════════════════════════════
       1. ★ PREMIUM GLSL SHADER — "Obsidian Aurora"
       Multi-layer domain warping with iridescent color science,
       chromatic aberration, soft metaball blobs, and deep vignette.
       Reacts fluidly to u_mouse position.
       ═══════════════════════════════════════════════════════════════════ */
    const GLSLBackground = (() => {
        const canvas = document.getElementById('glCanvas');
        if (!canvas) return { init() {} };
        let gl, program, uTime, uMouse, uRes, t0;

        const VS = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;

        /* ── The Premium Fragment Shader ────────────────────────────── */
        const FS = `
precision highp float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

/* ── Smooth-step hash for noise ─────────────────────────────── */
vec2 hash(vec2 p){
    p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
    return -1.0+2.0*fract(sin(p)*43758.5453123);
}

/* ── Gradient noise (Perlin-style) ──────────────────────────── */
float gnoise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(dot(hash(i+vec2(0,0)),f-vec2(0,0)),
                   dot(hash(i+vec2(1,0)),f-vec2(1,0)),u.x),
               mix(dot(hash(i+vec2(0,1)),f-vec2(0,1)),
                   dot(hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);
}

/* ── FBM with rotation per octave for richer detail ─────────── */
float fbm(vec2 p){
    float v=0.0, a=0.5;
    mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
    for(int i=0;i<7;i++){
        v+=a*gnoise(p);
        p=rot*p*2.0+vec2(100.0);
        a*=0.5;
    }
    return v;
}

/* ── Domain warping: feed noise back into itself ────────────── */
float warpedFbm(vec2 p, float t, vec2 m){
    // First warp pass influenced by mouse
    vec2 q=vec2(fbm(p+vec2(0.0,0.0)+m*0.3),
                fbm(p+vec2(5.2,1.3)));
    // Second warp pass influenced by time
    vec2 r=vec2(fbm(p+4.0*q+vec2(1.7,9.2)+t*0.15),
                fbm(p+4.0*q+vec2(8.3,2.8)+t*0.12));
    return fbm(p+4.0*r);
}

/* ── Soft metaball blob field ───────────────────────────────── */
float metaballs(vec2 uv, float t, vec2 m){
    float v=0.0;
    // 5 organic blobs drifting in slow orbits
    vec2 b1=vec2(0.35+0.2*sin(t*0.3),0.4+0.15*cos(t*0.4));
    vec2 b2=vec2(0.65+0.2*cos(t*0.25),0.6+0.2*sin(t*0.35));
    vec2 b3=vec2(0.5+0.25*sin(t*0.2+2.0),0.3+0.2*cos(t*0.3+1.0));
    vec2 b4=vec2(0.3+0.15*cos(t*0.35+4.0),0.7+0.1*sin(t*0.28));
    vec2 b5=m; // one blob tracks the mouse
    v+=0.015/dot(uv-b1,uv-b1);
    v+=0.012/dot(uv-b2,uv-b2);
    v+=0.010/dot(uv-b3,uv-b3);
    v+=0.008/dot(uv-b4,uv-b4);
    v+=0.018/dot(uv-b5,uv-b5);
    return v;
}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution;
    float aspect=u_resolution.x/u_resolution.y;
    vec2 uvA=vec2(uv.x*aspect,uv.y); // aspect-corrected
    float t=u_time*0.08;
    vec2 m=vec2(u_mouse.x*aspect,u_mouse.y);

    /* ── Layer 1: Domain-warped FBM noise field ───────────── */
    float warp=warpedFbm(uvA*2.5, u_time, u_mouse);

    /* ── Layer 2: Metaball energy field ───────────────────── */
    float meta=metaballs(uv, u_time*0.5, u_mouse);
    meta=smoothstep(0.8,3.5,meta); // threshold into soft shapes

    /* ── Iridescent Color Science ─────────────────────────── */
    // Base palette: deep indigo → violet → rose → teal
    // Each channel reads warped noise at slightly different offset
    // for natural chromatic aberration

    float n1=warpedFbm(uvA*2.5+0.0,  u_time, u_mouse);
    float n2=warpedFbm(uvA*2.5+0.15, u_time, u_mouse);
    float n3=warpedFbm(uvA*2.5+0.30, u_time, u_mouse);

    // Color mapping with rich palette
    vec3 c1=vec3(0.06,0.02,0.18);  // deep midnight
    vec3 c2=vec3(0.25,0.12,0.55);  // violet
    vec3 c3=vec3(0.48,0.20,0.65);  // orchid
    vec3 c4=vec3(0.15,0.40,0.55);  // teal
    vec3 c5=vec3(0.70,0.25,0.50);  // rose

    // Mix color layers based on warped noise
    vec3 col=mix(c1,c2,smoothstep(-0.3,0.3,n1));
    col=mix(col,c3,smoothstep(0.0,0.6,n2));
    col=mix(col,c4,smoothstep(0.1,0.5,n3)*0.4);
    col=mix(col,c5,smoothstep(0.2,0.7,warp)*0.3);

    // Add metaball glow
    col+=meta*vec3(0.20,0.10,0.40);

    // Chromatic aberration: shift R and B by warped value
    float aberration=warp*0.015;
    float rShift=warpedFbm(uvA*2.5+aberration, u_time, u_mouse);
    float bShift=warpedFbm(uvA*2.5-aberration, u_time, u_mouse);
    col.r=mix(col.r,smoothstep(-0.2,0.5,rShift)*0.45,0.3);
    col.b=mix(col.b,smoothstep(-0.1,0.6,bShift)*0.55,0.3);

    // Mouse proximity highlight: soft bloom near cursor
    float mouseDist=length(uv-u_mouse);
    float mouseGlow=exp(-mouseDist*mouseDist*8.0)*0.12;
    col+=mouseGlow*vec3(0.4,0.3,0.8);

    /* ── Overall intensity control ────────────────────────── */
    col*=0.55; // Keep it dark and premium, not garish

    /* ── Deep cinematic vignette ──────────────────────────── */
    float vig=1.0-smoothstep(0.2,1.5,length((uv-0.5)*vec2(aspect,1.0))*1.3);
    col*=vig;

    /* ── Film grain for texture ──────────────────────────── */
    float grain=fract(sin(dot(uv*u_time,vec2(12.9898,78.233)))*43758.5453);
    col+=grain*0.012;

    gl_FragColor=vec4(col,1.0);
}`;

        function mkShader(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
            return s;
        }

        function init() {
            gl = canvas.getContext('webgl', { alpha: false, antialias: false });
            if (!gl) return;
            const vs = mkShader(gl.VERTEX_SHADER, VS), fs = mkShader(gl.FRAGMENT_SHADER, FS);
            if (!vs || !fs) return;
            program = gl.createProgram();
            gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(program)); return; }
            gl.useProgram(program);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
            const pos = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
            uTime = gl.getUniformLocation(program, 'u_time');
            uMouse = gl.getUniformLocation(program, 'u_mouse');
            uRes = gl.getUniformLocation(program, 'u_resolution');
            t0 = performance.now();
            resize();
            window.addEventListener('resize', resize);
            render();
        }

        function resize() {
            const dpr = Math.min(window.devicePixelRatio, 1.5);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
        }

        function render() {
            if (!gl || !program) return;
            gl.uniform1f(uTime, (performance.now() - t0) / 1000);
            gl.uniform2f(uMouse, mouse.nx, mouse.ny);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        }
        return { init };
    })();

    /* ═══════════════════════════════════════════════════════════════════
       2. LENIS SMOOTH SCROLL
       ═══════════════════════════════════════════════════════════════════ */
    const LenisInit = (() => {
        function init() {
            if (typeof Lenis === 'undefined') return;
            lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                lenis.on('scroll', ScrollTrigger.update);
                gsap.ticker.add(time => lenis.raf(time * 1000));
                gsap.ticker.lagSmoothing(0);
            } else {
                (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
            }
        }
        return { init };
    })();

    /* ═══════════════════════════════════════════════════════════════════
       3. CHARACTER-LEVEL SPLIT + GSAP KINETIC REVEAL
       ═══════════════════════════════════════════════════════════════════ */
    const KineticType = (() => {
        function splitIntoChars(el) {
            const text = el.textContent; el.textContent = ''; el.setAttribute('aria-label', text);
            for (let i = 0; i < text.length; i++) {
                const span = document.createElement('span');
                span.className = 'split-char'; span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
                span.style.display = 'inline-block'; span.setAttribute('aria-hidden', 'true');
                el.appendChild(span);
            }
            return el.querySelectorAll('.split-char');
        }
        function init() {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
            gsap.registerPlugin(ScrollTrigger);
            document.querySelectorAll('[data-anim="chars"]').forEach(el => {
                const chars = splitIntoChars(el);
                gsap.fromTo(chars, { y: '110%', rotationZ: 5, opacity: 0 }, {
                    y: '0%', rotationZ: 0, opacity: 1, duration: 1.4, stagger: 0.02, ease: 'expo.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
                });
                el.style.opacity = '1'; el.style.transform = 'none';
            });
            document.querySelectorAll('[data-anim="fade"]').forEach((el, i) => {
                gsap.fromTo(el, { opacity: 0, y: 60 + (i % 3) * 20 }, {
                    opacity: 1, y: 0, duration: 1.2, delay: (i % 4) * 0.06, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
                });
            });
            document.querySelectorAll('.sec-heading').forEach(h => {
                gsap.to(h, { y: -25, ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
            });
        }
        return { init };
    })();

    /* ═══════════════════════════════════════════════════════════════════
       4. MAGNETIC 3D TILT + DYNAMIC GLARE
       ═══════════════════════════════════════════════════════════════════ */
    const MagneticTilt = (() => {
        function init() {
            if (isTouch) return;
            document.querySelectorAll('.mag-card').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const r = card.getBoundingClientRect();
                    const x = e.clientX - r.left, y = e.clientY - r.top;
                    const rx = ((y - r.height / 2) / (r.height / 2)) * -7;
                    const ry = ((x - r.width / 2) / (r.width / 2)) * 7;
                    if (typeof gsap !== 'undefined') gsap.to(card, { rotateX: rx, rotateY: ry, scale: 1.025, duration: 0.4, ease: 'power2.out', transformPerspective: 1000, transformOrigin: 'center center' });
                    card.style.setProperty('--mx', (x / r.width) * 100 + '%');
                    card.style.setProperty('--my', (y / r.height) * 100 + '%');
                });
                card.addEventListener('mouseleave', () => {
                    if (typeof gsap !== 'undefined') gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1,0.4)' });
                });
            });
        }
        return { init };
    })();

    /* ═══════════════════════════════════════════════════════════════════
       5. MAGNETIC BUTTONS
       ═══════════════════════════════════════════════════════════════════ */
    const MagneticBtns = (() => {
        function init() {
            if (isTouch) return;
            document.querySelectorAll('.mag-btn').forEach(btn => {
                btn.addEventListener('mousemove', e => {
                    const r = btn.getBoundingClientRect();
                    if (typeof gsap !== 'undefined') gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.25, duration: 0.3, ease: 'power2.out' });
                });
                btn.addEventListener('mouseleave', () => {
                    if (typeof gsap !== 'undefined') gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
                });
            });
        }
        return { init };
    })();

    /* ═══════════════════════════════════════════════════════════════════
       6. GHOST CURSOR
       ═══════════════════════════════════════════════════════════════════ */
    const GhostCursor = (() => {
        const dot = document.getElementById('gcDot'), ring = document.getElementById('gcRing'), label = document.getElementById('gcLabel');
        if (!dot || !ring || isTouch) { if (dot) dot.style.display = 'none'; if (ring) ring.style.display = 'none'; return { init() {} }; }
        function init() {
            if (typeof gsap !== 'undefined') {
                const xD = gsap.quickTo(dot, 'left', { duration: 0.12, ease: 'power2.out' });
                const yD = gsap.quickTo(dot, 'top', { duration: 0.12, ease: 'power2.out' });
                const xR = gsap.quickTo(ring, 'left', { duration: 0.45, ease: 'power3.out' });
                const yR = gsap.quickTo(ring, 'top', { duration: 0.45, ease: 'power3.out' });
                window.addEventListener('mousemove', e => { xD(e.clientX); yD(e.clientY); xR(e.clientX); yR(e.clientY); });
            }
            document.querySelectorAll('a,button,input,textarea,.mag-btn').forEach(el => {
                el.addEventListener('mouseenter', () => { if (typeof gsap !== 'undefined') { gsap.to(ring, { width: 72, height: 72, borderColor: 'rgba(124,92,252,0.5)', backgroundColor: 'rgba(124,92,252,0.05)', duration: 0.3 }); gsap.to(dot, { scale: 0.4, duration: 0.3 }); } });
                el.addEventListener('mouseleave', () => { if (typeof gsap !== 'undefined') { gsap.to(ring, { width: 48, height: 48, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'transparent', borderRadius: '50%', duration: 0.3 }); gsap.to(dot, { scale: 1, duration: 0.3 }); } if (label) { label.style.opacity = '0'; label.style.fontSize = '0'; } ring.classList.remove('pill'); });
            });
            document.querySelectorAll('[data-cursor-text]').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    if (label) { label.textContent = el.getAttribute('data-cursor-text'); label.style.opacity = '1'; label.style.fontSize = '0.55rem'; }
                    ring.classList.add('pill');
                    if (typeof gsap !== 'undefined') { gsap.to(ring, { width: 90, height: 40, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, duration: 0.4 }); gsap.to(dot, { scale: 0, duration: 0.3 }); }
                });
                el.addEventListener('mouseleave', () => {
                    if (label) { label.style.opacity = '0'; label.style.fontSize = '0'; } ring.classList.remove('pill');
                    if (typeof gsap !== 'undefined') { gsap.to(ring, { width: 48, height: 48, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'transparent', borderRadius: '50%', duration: 0.3 }); gsap.to(dot, { scale: 1, duration: 0.3 }); }
                });
            });
        }
        return { init };
    })();

    /* ═══════════════════════════════════════════════════════════════════
       7. IMAGE DISPLACEMENT — Liquid Ripple + RGB Split
       ═══════════════════════════════════════════════════════════════════ */
    const ImageDisplace = (() => {
        function init() {
            if (isTouch) return;
            document.querySelectorAll('[data-displace]').forEach(wrap => {
                const img = wrap.querySelector('img'), cvs = wrap.querySelector('.displace-canvas');
                if (!img || !cvs) return;
                const ctx = cvs.getContext('2d');
                let isHovering = false, hoverTime = 0, localMouse = { x: 0.5, y: 0.5 }, imgLoaded = false, animFrame;
                function onLoad() { imgLoaded = true; cvs.width = img.naturalWidth || 400; cvs.height = img.naturalHeight || 400; }
                if (img.complete && img.naturalWidth > 0) onLoad(); else img.addEventListener('load', onLoad);
                function draw() {
                    if (!imgLoaded) return;
                    const w = cvs.width, h = cvs.height;
                    ctx.clearRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
                    if (!isHovering) { hoverTime *= 0.92; if (hoverTime < 0.01) { cvs.style.opacity = '0'; img.style.opacity = '1'; return; } } else { hoverTime = Math.min(hoverTime + 0.04, 1); }
                    const src = ctx.getImageData(0, 0, w, h), sd = src.data, out = ctx.createImageData(w, h), od = out.data;
                    const t = performance.now() * 0.003, intensity = hoverTime * 12;
                    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
                        const nx = x / w, ny = y / h, dx = nx - localMouse.x, dy = ny - localMouse.y, dist = Math.sqrt(dx * dx + dy * dy);
                        const ripple = Math.sin(dist * 30 - t * 2) * intensity * Math.exp(-dist * 4);
                        const sx = Math.max(0, Math.min(w - 1, Math.round(x + ripple * dx * 20)));
                        const sy = Math.max(0, Math.min(h - 1, Math.round(y + ripple * dy * 20)));
                        const ro = Math.round(ripple * 1.5);
                        const sxR = Math.max(0, Math.min(w - 1, sx + ro)), sxB = Math.max(0, Math.min(w - 1, sx - ro));
                        const idx = (y * w + x) * 4;
                        od[idx] = sd[(sy * w + sxR) * 4]; od[idx + 1] = sd[(sy * w + sx) * 4 + 1]; od[idx + 2] = sd[(sy * w + sxB) * 4 + 2]; od[idx + 3] = sd[(sy * w + sx) * 4 + 3];
                    }
                    ctx.putImageData(out, 0, 0); animFrame = requestAnimationFrame(draw);
                }
                wrap.addEventListener('mouseenter', () => { isHovering = true; cvs.style.opacity = '1'; img.style.opacity = '0'; cancelAnimationFrame(animFrame); draw(); });
                wrap.addEventListener('mousemove', e => { const r = wrap.getBoundingClientRect(); localMouse.x = (e.clientX - r.left) / r.width; localMouse.y = (e.clientY - r.top) / r.height; });
                wrap.addEventListener('mouseleave', () => { isHovering = false; draw(); });
            });
        }
        return { init };
    })();

    /* ═══════════════════════════════════════════════════════════════════
       8–12. NAV, BTT, SKILL MODAL, CONTACT FORM, PRELOADER
       ═══════════════════════════════════════════════════════════════════ */
    const Nav = (() => {
        function init() {
            const nb = document.getElementById('navbar'), tg = document.getElementById('navToggle'), mn = document.getElementById('navMenu');
            if (!tg || !mn) return;
            tg.addEventListener('click', () => { const ex = tg.getAttribute('aria-expanded') === 'true'; tg.setAttribute('aria-expanded', String(!ex)); mn.classList.toggle('active'); const l = tg.querySelectorAll('span'); if (!ex) { l[0].style.transform = 'translateY(8px) rotate(45deg)'; l[1].style.opacity = '0'; l[2].style.transform = 'translateY(-8px) rotate(-45deg)'; } else { l[0].style.transform = 'none'; l[1].style.opacity = '1'; l[2].style.transform = 'none'; } });
            document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', () => { mn.classList.remove('active'); tg.setAttribute('aria-expanded', 'false'); const l = tg.querySelectorAll('span'); l[0].style.transform = 'none'; l[1].style.opacity = '1'; l[2].style.transform = 'none'; }));
            window.addEventListener('scroll', () => { if (nb) nb.classList.toggle('scrolled', window.scrollY > 60); });
        }
        return { init };
    })();
    const BTT = (() => { function init() { const b = document.getElementById('backToTop'); if (!b) return; window.addEventListener('scroll', () => b.classList.toggle('visible', window.scrollY > 500)); b.addEventListener('click', () => { if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' }); }); } return { init }; })();
    const SkillModal = (() => {
        const data = { 'web-dev': { t: 'Web Development', i: '<i class="fa-solid fa-code"></i>', d: 'I design and build responsive, visually appealing, and user-friendly websites using modern web technologies. I focus on clean layouts, efficient coding practices, and intuitive navigation to create websites that provide an excellent user experience. My expertise includes HTML, CSS, JavaScript, and creating dynamic, interactive web applications that work seamlessly across all devices.' }, 'programming': { t: 'Programming (C Language)', i: '<i class="fa-solid fa-laptop-code"></i>', d: 'I have learned the fundamentals of programming through C, developing strong problem-solving skills and logical thinking. I apply these skills to small projects, algorithm practice, and computational tasks, which helps me understand programming concepts more deeply. This foundational knowledge enables me to approach complex problems systematically and develop efficient solutions.' }, 'computer-science': { t: 'Computer Science Fundamentals', i: '<i class="fa-solid fa-microchip"></i>', d: 'I have studied core concepts in computer science including algorithms, data structures, and basic computing principles. This knowledge forms the foundation for my programming and web development projects. Understanding these fundamentals allows me to write more efficient code, optimize performance, and tackle complex technical challenges with confidence.' }, 'business': { t: 'Business & Economics', i: '<i class="fa-solid fa-chart-line"></i>', d: 'Being a student of business economics, I understand key concepts in finance, accounting, and market operations. This knowledge allows me to approach projects with a practical perspective, combining technical skills with business awareness. I can analyze market trends, understand financial statements, and make informed decisions that bridge the gap between technology and business strategy.' }, 'accounting': { t: 'Accounting Basics', i: '<i class="fa-solid fa-calculator"></i>', d: 'I have practical knowledge of accounting principles, bookkeeping, and financial analysis, which strengthens my understanding of business processes and supports my analytical skills. This expertise helps me manage finances effectively, prepare accurate reports, and understand the financial health of organizations. My accounting knowledge complements my technical abilities perfectly.' }, 'content': { t: 'Content Creation', i: '<i class="fa-solid fa-pen-nib"></i>', d: 'I enjoy creating educational and informative content, particularly for my project Silent Voice Nepal. This includes writing articles, creating social media posts, and sharing knowledge with a wider audience to promote awareness on social and educational topics. My content creation skills help me communicate complex ideas clearly and engage audiences effectively across multiple platforms.' }, 'communication': { t: 'Communication & Teamwork', i: '<i class="fa-solid fa-people-group"></i>', d: 'I am skilled in effective communication, collaboration, and leadership. I value working in teams, sharing ideas, and managing projects efficiently, which ensures that all tasks are completed with high quality. My ability to communicate clearly, listen actively, and work collaboratively makes me an effective team member and leader in any project or organization.' } };
        const ov = document.getElementById('skillModal'), tEl = document.getElementById('mTitle'), dEl = document.getElementById('mDesc'), iEl = document.getElementById('mIcon'), cls = ov ? ov.querySelector('.modal-x') : null;
        function open(k) { const s = data[k]; if (!s || !ov) return; tEl.textContent = s.t; dEl.textContent = s.d; iEl.innerHTML = s.i; ov.classList.add('active'); document.body.style.overflow = 'hidden'; }
        function close() { if (!ov) return; ov.classList.remove('active'); document.body.style.overflow = ''; }
        function init() { if (!ov) return; document.querySelectorAll('.skill-card').forEach(c => { const b = c.querySelector('.sk-btn'); if (b) b.addEventListener('click', () => { const k = c.getAttribute('data-skill'); if (k) open(k); }); }); if (cls) cls.addEventListener('click', close); ov.addEventListener('click', e => { if (e.target === ov) close(); }); document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }); }
        return { init };
    })();
    const ContactForm = (() => {
        function init() {
            const form = document.getElementById('contactForm'), btn = document.getElementById('submitBtn'); if (!form) return;
            form.addEventListener('submit', async e => {
                e.preventDefault(); if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...'; }
                const n = document.getElementById('name'), em = document.getElementById('email'), m = document.getElementById('message');
                const text = `New Portfolio Message:\n\nName: ${n ? n.value : ''}\nEmail: ${em ? em.value : ''}\nMessage: ${m ? m.value : ''}`;
                try { const r = await fetch('https://api.telegram.org/bot7594325949:AAH6hgwJiv77PeUw4-s4VzIWbOghUtpQGmE/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: '6085885404', text }) }); if (r.ok) { alert('Thank you! Your message has been sent successfully.'); form.reset(); } else alert('Telegram API Error. Please check your Bot Token.'); } catch (err) { alert('Connection error! Please check your internet.'); }
                finally { if (btn) { btn.disabled = false; btn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>'; } }
            });
        }
        return { init };
    })();
    const Preloader = (() => { function init() { const p = document.getElementById('preloader'); if (!p) return; window.addEventListener('load', () => { setTimeout(() => { p.classList.add('hidden'); setTimeout(() => p.remove(), 800); }, 500); }); } return { init }; })();

    /* ── Global Mouse ──────────────────────────────────────────────── */
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.nx = e.clientX / window.innerWidth; mouse.ny = 1.0 - (e.clientY / window.innerHeight); });

    /* ── Bootstrap ─────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        Preloader.init(); GLSLBackground.init(); LenisInit.init(); Nav.init(); BTT.init();
        GhostCursor.init(); MagneticTilt.init(); MagneticBtns.init(); KineticType.init();
        ImageDisplace.init(); SkillModal.init(); ContactForm.init();
    });
})();
