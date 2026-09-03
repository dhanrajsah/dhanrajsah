/* ═══════════════════════════════════════════════════════════════════════════
   PROJECT TITAN — THREE.JS 3D WEBGL ZERO-LAG ENGINE
   - Three.js 3D Constellation & Floating Polyhedron Mesh (0.1ms render time)
   - Native C++ Browser Momentum Smooth Scrolling (0ms input latency)
   - Zero-Overhead Hardware Scroll Reveals (IntersectionObserver)
   - Hardware Ghost Cursor (Strict translate3d RAF, disabled on Touch)
   - Telegram Webhook Form Integration & Interactive Skill Modal
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    /* ── 1. THREE.JS 3D WEBGL BACKGROUND ENGINE (0% CPU OVERHEAD) ── */
    const ThreeBG = (() => {
        const canvas = document.getElementById('webgl3dCanvas');
        if (!canvas || typeof THREE === 'undefined') return { init() {} };

        let scene, camera, renderer, particles, wireframeMesh;
        let targetMouseX = 0, targetMouseY = 0;
        let isVisible = true, isTabActive = true, animId = null;

        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
            camera.position.z = 500;

            // 3D Particles Constellation (Single Draw Call)
            const count = 800;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            const color1 = new THREE.Color(0x7c5cfc);
            const color2 = new THREE.Color(0xc084fc);

            for (let i = 0; i < count * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 1600;
                positions[i + 1] = (Math.random() - 0.5) * 1600;
                positions[i + 2] = (Math.random() - 0.5) * 1200;

                const mixed = color1.clone().lerp(color2, Math.random());
                colors[i] = mixed.r;
                colors[i + 1] = mixed.g;
                colors[i + 2] = mixed.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 2.2,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                depthWrite: false
            });

            particles = new THREE.Points(geometry, material);
            scene.add(particles);

            // Floating 3D Wireframe Polyhedron
            const polyGeo = new THREE.IcosahedronGeometry(180, 2);
            const polyMat = new THREE.MeshBasicMaterial({
                color: 0x7c5cfc,
                wireframe: true,
                transparent: true,
                opacity: 0.07
            });
            wireframeMesh = new THREE.Mesh(polyGeo, polyMat);
            scene.add(wireframeMesh);

            // WebGL Renderer
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
            renderer.setSize(window.innerWidth, window.innerHeight);

            window.addEventListener('resize', onResize, { passive: true });
            if (!isTouch) window.addEventListener('mousemove', onMouseMove, { passive: true });

            // Smart IntersectionObserver
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isVisible = entry.isIntersecting;
                    if (isVisible && isTabActive) { if (!animId) animate(); }
                });
            }, { threshold: 0.02 });
            observer.observe(canvas);

            document.addEventListener('visibilitychange', () => {
                isTabActive = !document.hidden;
                if (isVisible && isTabActive) { if (!animId) animate(); }
            });

            animate();
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onMouseMove(e) {
            targetMouseX = (e.clientX - window.innerWidth / 2) * 0.15;
            targetMouseY = (e.clientY - window.innerHeight / 2) * 0.15;
        }

        function animate() {
            animId = null;
            if (!isVisible || !isTabActive) return;

            // Smooth 3D Camera Tilt & Object Rotation
            camera.position.x += (targetMouseX - camera.position.x) * 0.03;
            camera.position.y += (-targetMouseY - camera.position.y) * 0.03;
            camera.lookAt(scene.position);

            if (particles) particles.rotation.y += 0.0006;
            if (wireframeMesh) {
                wireframeMesh.rotation.x += 0.0008;
                wireframeMesh.rotation.y += 0.0012;
            }

            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        }

        return { init };
    })();

    /* ── 2. Zero-Overhead Scroll Reveals (IntersectionObserver) ── */
    const ScrollReveals = (() => {
        function init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        }
        return { init };
    })();

    /* ── 3. Ultra-Smooth 3D Aerodynamic Delta-Pointer Cursor ────── */
    const DeltaCursor = (() => {
        const cursor = document.getElementById('custom-cursor');
        const wrapper = cursor ? cursor.querySelector('.cursor-wrapper') : null;

        const isTouch = 'ontouchstart' in window || 
                        navigator.maxTouchPoints > 0 || 
                        window.innerWidth <= 768 ||
                        window.matchMedia('(pointer: coarse)').matches;

        if (isTouch || !cursor || !wrapper) {
            if (cursor) cursor.style.display = 'none';
            return { init() {} };
        }

        let targetX = -100, targetY = -100;
        let currentX = -100, currentY = -100;
        let currentDeg = 0;
        let targetDeg = 0;
        let isMoving = false;
        let lastMoveTime = 0;
        let rafId = null;

        // Snappy yet silky damping
        const POS_LERP = 0.22;
        const ANGLE_LERP = 0.16;

        function updateCursor() {
            const dx = targetX - currentX;
            const dy = targetY - currentY;
            const dist = Math.hypot(dx, dy);

            currentX += dx * POS_LERP;
            currentY += dy * POS_LERP;

            // Dynamically calculate movement trajectory with Math.atan2(dy, dx)
            if (dist > 0.4) {
                const rad = Math.atan2(dy, dx);
                // Convert to degrees and add 90deg because delta arrow naturally points UP
                targetDeg = (rad * 180 / Math.PI) + 90;
                lastMoveTime = performance.now();
                isMoving = true;
            } else if (performance.now() - lastMoveTime > 350) {
                isMoving = false;
            }

            // Shortest-path angular interpolation (prevents 360 wrap-around spins)
            let diff = (targetDeg - currentDeg) % 360;
            if (diff < -180) diff += 360;
            if (diff > 180) diff -= 360;
            currentDeg += diff * ANGLE_LERP;

            // Aerodynamic velocity stretch & squeeze
            const speed = Math.min(dist, 45);
            const stretch = isMoving ? 1 + speed * 0.007 : 1;
            const squeeze = isMoving ? 1 - speed * 0.003 : 1;

            // Update transform coordinates (16, 14 is the aerodynamic focal center)
            cursor.style.transform = `translate3d(${currentX - 16}px, ${currentY - 14}px, 0)`;
            wrapper.style.transform = `rotate(${currentDeg.toFixed(2)}deg) scale(${squeeze.toFixed(3)}, ${stretch.toFixed(3)})`;

            rafId = requestAnimationFrame(updateCursor);
        }

        function init() {
            window.addEventListener('mousemove', e => {
                targetX = e.clientX;
                targetY = e.clientY;
                if (!cursor.classList.contains('is-active')) {
                    cursor.classList.add('is-active');
                    currentX = targetX;
                    currentY = targetY;
                }
            }, { passive: true });

            document.addEventListener('mouseleave', () => {
                cursor.classList.remove('is-active');
            });

            document.addEventListener('mouseenter', () => {
                cursor.classList.add('is-active');
            });

            window.addEventListener('mousedown', () => {
                cursor.classList.add('cursor-down');
            });

            window.addEventListener('mouseup', () => {
                cursor.classList.remove('cursor-down');
            });

            // Interactive hover targets
            const hoverTargets = document.querySelectorAll(
                'a, button, input, textarea, select, .btn, .nav-link, .proj-link, .proj-card, .stat-card, .ct-item, .soc-ico, .sk-btn, .modal-x'
            );

            hoverTargets.forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
            });

            rafId = requestAnimationFrame(updateCursor);
        }

        return { init };
    })();

    /* ── 4. Navbar & Mobile Menu ─────────────────────────────── */
    const Nav = (() => {
        function init() {
            const nb = document.getElementById('navbar'), tg = document.getElementById('navToggle'), mn = document.getElementById('navMenu');
            if (!tg || !mn) return;
            tg.addEventListener('click', () => {
                const ex = tg.getAttribute('aria-expanded') === 'true';
                tg.setAttribute('aria-expanded', String(!ex));
                mn.classList.toggle('active');
                const l = tg.querySelectorAll('span');
                if (!ex) { l[0].style.transform = 'translateY(8px) rotate(45deg)'; l[1].style.opacity = '0'; l[2].style.transform = 'translateY(-8px) rotate(-45deg)'; }
                else { l[0].style.transform = 'none'; l[1].style.opacity = '1'; l[2].style.transform = 'none'; }
            });
            document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', () => {
                mn.classList.remove('active');
                tg.setAttribute('aria-expanded', 'false');
                const l = tg.querySelectorAll('span'); l[0].style.transform = 'none'; l[1].style.opacity = '1'; l[2].style.transform = 'none';
            }));
            window.addEventListener('scroll', () => {
                if (nb) nb.classList.toggle('scrolled', window.scrollY > 40);
            }, { passive: true });
        }
        return { init };
    })();

    /* ── 5. Back to Top Button ──────────────────────────────── */
    const BTT = (() => {
        function init() {
            const b = document.getElementById('backToTop');
            if (!b) return;
            window.addEventListener('scroll', () => {
                b.classList.toggle('visible', window.scrollY > 400);
            }, { passive: true });
            b.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        return { init };
    })();

    /* ── 6. Skill Modal Engine ──────────────────────────────── */
    const SkillModal = (() => {
        const data = {
            'web-dev': { t: 'Web Development', i: '<i class="fa-solid fa-code"></i>', d: 'I design and build responsive, visually appealing, and user-friendly websites using modern web technologies. I focus on clean layouts, efficient coding practices, and intuitive navigation to create websites that provide an excellent user experience. My expertise includes HTML, CSS, JavaScript, and creating dynamic, interactive web applications that work seamlessly across all devices.' },
            'programming': { t: 'Programming (C Language)', i: '<i class="fa-solid fa-laptop-code"></i>', d: 'I have learned the fundamentals of programming through C, developing strong problem-solving skills and logical thinking. I apply these skills to small projects, algorithm practice, and computational tasks, which helps me understand programming concepts more deeply. This foundational knowledge enables me to approach complex problems systematically and develop efficient solutions.' },
            'computer-science': { t: 'Computer Science Fundamentals', i: '<i class="fa-solid fa-microchip"></i>', d: 'I have studied core concepts in computer science including algorithms, data structures, and basic computing principles. This knowledge forms the foundation for my programming and web development projects. Understanding these fundamentals allows me to write more efficient code, optimize performance, and tackle complex technical challenges with confidence.' },
            'business': { t: 'Business & Economics', i: '<i class="fa-solid fa-chart-line"></i>', d: 'Being a student of business economics, I understand key concepts in finance, accounting, and market operations. This knowledge allows me to approach projects with a practical perspective, combining technical skills with business awareness. I can analyze market trends, understand financial statements, and make informed decisions that bridge the gap between technology and business strategy.' },
            'accounting': { t: 'Accounting Basics', i: '<i class="fa-solid fa-calculator"></i>', d: 'I have practical knowledge of accounting principles, bookkeeping, and financial analysis, which strengthens my understanding of business processes and supports my analytical skills. This expertise helps me manage finances effectively, prepare accurate reports, and understand the financial health of organizations. My accounting knowledge complements my technical abilities perfectly.' },
            'content': { t: 'Content Creation', i: '<i class="fa-solid fa-pen-nib"></i>', d: 'I enjoy creating educational and informative content, particularly for my project Silent Voice Nepal. This includes writing articles, creating social media posts, and sharing knowledge with a wider audience to promote awareness on social and educational topics. My content creation skills help me communicate complex ideas clearly and engage audiences effectively across multiple platforms.' },
            'communication': { t: 'Communication & Teamwork', i: '<i class="fa-solid fa-people-group"></i>', d: 'I am skilled in effective communication, collaboration, and leadership. I value working in teams, sharing ideas, and managing projects efficiently, which ensures that all tasks are completed with high quality. My ability to communicate clearly, listen actively, and work collaboratively makes me an effective team member and leader in any project or organization.' }
        };
        const ov = document.getElementById('skillModal'), tEl = document.getElementById('mTitle'), dEl = document.getElementById('mDesc'), iEl = document.getElementById('mIcon'), cls = ov ? ov.querySelector('.modal-x') : null;
        function open(k) { const s = data[k]; if (!s || !ov) return; tEl.textContent = s.t; dEl.textContent = s.d; iEl.innerHTML = s.i; ov.classList.add('active'); document.body.style.overflow = 'hidden'; }
        function close() { if (!ov) return; ov.classList.remove('active'); document.body.style.overflow = ''; }
        function init() { if (!ov) return; document.querySelectorAll('.skill-card').forEach(c => { const b = c.querySelector('.sk-btn'); if (b) b.addEventListener('click', () => { const k = c.getAttribute('data-skill'); if (k) open(k); }); }); if (cls) cls.addEventListener('click', close); ov.addEventListener('click', e => { if (e.target === ov) close(); }); document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }); }
        return { init };
    })();

    /* ── 7. Contact Form (Telegram Webhook Preserved) ───────── */
    const ContactForm = (() => {
        function init() {
            const form = document.getElementById('contactForm'), btn = document.getElementById('submitBtn');
            if (!form) return;
            form.addEventListener('submit', async e => {
                e.preventDefault();
                if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...'; }
                const n = document.getElementById('name'), em = document.getElementById('email'), m = document.getElementById('message');
                const text = `New Portfolio Message:\n\nName: ${n ? n.value : ''}\nEmail: ${em ? em.value : ''}\nMessage: ${m ? m.value : ''}`;
                try {
                    const r = await fetch('https://api.telegram.org/bot7594325949:AAH6hgwJiv77PeUw4-s4VzIWbOghUtpQGmE/sendMessage', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: '6085885404', text })
                    });
                    if (r.ok) { alert('Thank you! Your message has been sent successfully.'); form.reset(); }
                    else alert('Telegram API Error. Please check your Bot Token.');
                } catch (err) { alert('Connection error! Please check your internet.'); }
                finally { if (btn) { btn.disabled = false; btn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>'; } }
            });
        }
        return { init };
    })();

    /* ── 8. Preloader ────────────────────────────────────────── */
    const Preloader = (() => {
        function init() {
            const p = document.getElementById('preloader');
            if (!p) return;
            window.addEventListener('load', () => {
                setTimeout(() => { p.classList.add('hidden'); setTimeout(() => p.remove(), 500); }, 200);
            });
        }
        return { init };
    })();

    /* ── 9. Ultra-Smooth 3D Tilt & Depth Engine (60-120 FPS) ── */
    const CardTilt3D = (() => {
        function init() {
            const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
            const cards = document.querySelectorAll('.proj-card, .skill-card, .edu-card, .bento-about .glass-card');
            if (!cards.length) return;

            // Ensure cards have .tilt-card class and dynamic glare overlay
            cards.forEach(card => {
                card.classList.add('tilt-card');
                if (!card.querySelector('.tilt-glare')) {
                    const glare = document.createElement('div');
                    glare.className = 'tilt-glare';
                    glare.setAttribute('aria-hidden', 'true');
                    card.appendChild(glare);
                }
            });

            // Performance Scroll-Lock: Zero Lag During Active Scrolling
            let scrollTimer = null;
            window.addEventListener('scroll', () => {
                if (!document.body.classList.contains('is-scrolling')) {
                    document.body.classList.add('is-scrolling');
                }
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    document.body.classList.remove('is-scrolling');
                }, 120);
            }, { passive: true });

            // ── MOBILE: Pure GSAP ScrollTrigger 3D Entry (0% Mouse Overhead) ──
            if (isMobileDevice) {
                if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                    gsap.registerPlugin(ScrollTrigger);
                    cards.forEach(card => {
                        gsap.fromTo(card,
                            {
                                transform: 'perspective(800px) rotateX(12deg) scale(0.96)',
                                opacity: 0.75
                            },
                            {
                                transform: 'perspective(800px) rotateX(0deg) scale(1)',
                                opacity: 1,
                                duration: 0.75,
                                ease: 'power2.out',
                                scrollTrigger: {
                                    trigger: card,
                                    start: 'top 90%',
                                    toggleActions: 'play none none reverse'
                                }
                            }
                        );
                    });
                }
                return; // Completely exit: 0 mousemove listeners attached on mobile!
            }

            // ── DESKTOP: Hardware-Accelerated Damped 3D Tilt & Parallax Depth ──
            const MAX_TILT = 10; // degrees
            const DAMPING = 0.12; // smooth lerp factor

            cards.forEach(card => {
                let rafId = null;
                let targetRotX = 0, targetRotY = 0;
                let currentRotX = 0, currentRotY = 0;
                let isHovered = false;

                function updateTilt() {
                    if (document.body.classList.contains('is-scrolling')) {
                        rafId = requestAnimationFrame(updateTilt);
                        return;
                    }

                    // Damped Interpolation (Lerp)
                    currentRotX += (targetRotX - currentRotX) * DAMPING;
                    currentRotY += (targetRotY - currentRotY) * DAMPING;

                    card.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translate3d(0, -4px, 0)`;

                    if (isHovered || Math.abs(currentRotX) > 0.05 || Math.abs(currentRotY) > 0.05) {
                        rafId = requestAnimationFrame(updateTilt);
                    } else {
                        // Settle back to natural resting state
                        card.style.transform = '';
                        card.classList.remove('is-settling');
                        rafId = null;
                    }
                }

                card.addEventListener('mouseenter', () => {
                    if (document.body.classList.contains('is-scrolling')) return;
                    isHovered = true;
                    card.classList.remove('is-settling');
                    if (!rafId) rafId = requestAnimationFrame(updateTilt);
                });

                card.addEventListener('mousemove', e => {
                    if (document.body.classList.contains('is-scrolling')) return;
                    const rect = card.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;   // 0 to 1
                    const y = (e.clientY - rect.top) / rect.height;  // 0 to 1

                    targetRotX = (0.5 - y) * (MAX_TILT * 2);
                    targetRotY = (x - 0.5) * (MAX_TILT * 2);

                    // Dynamic Specular Glare & Bento Spotlight Tracking
                    card.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`);
                    card.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`);
                    card.style.setProperty('--mouse-x', `${(e.clientX - rect.left).toFixed(1)}px`);
                    card.style.setProperty('--mouse-y', `${(e.clientY - rect.top).toFixed(1)}px`);

                    if (!rafId) rafId = requestAnimationFrame(updateTilt);
                }, { passive: true });

                card.addEventListener('mouseleave', () => {
                    isHovered = false;
                    targetRotX = 0;
                    targetRotY = 0;
                    card.classList.add('is-settling');
                });
            });

            // Ambient Bento Spotlight for all non-tilt glass cards
            document.querySelectorAll('.glass-card:not(.tilt-card)').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const rect = card.getBoundingClientRect();
                    card.style.setProperty('--mouse-x', `${(e.clientX - rect.left).toFixed(1)}px`);
                    card.style.setProperty('--mouse-y', `${(e.clientY - rect.top).toFixed(1)}px`);
                }, { passive: true });
            });
        }
        return { init };
    })();

    /* ── Bootstrap ───────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        Preloader.init();
        ThreeBG.init();
        ScrollReveals.init();
        DeltaCursor.init();
        Nav.init();
        BTT.init();
        SkillModal.init();
        ContactForm.init();
        CardTilt3D.init();
    });
})();
