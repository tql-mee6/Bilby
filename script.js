/**
 * BILBY LANDING — кинематографичная версия
 */
document.addEventListener("DOMContentLoaded", () => {

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. ПРОГРЕСС-БАР
    const progressBar = document.getElementById('progress-bar');
    window.addEventListener('scroll', () => {
        if (!progressBar) return;
        const doc = document.documentElement;
        const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
        progressBar.style.width = pct + '%';
    }, { passive: true });

    // 2. ПОСИМВОЛЬНАЯ АНИМАЦИЯ ЗАГОЛОВКА
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && !reducedMotion) {
        const text = heroTitle.textContent.trim();
        heroTitle.textContent = '';
        [...text].forEach((ch, i) => {
            const span = document.createElement('span');
            span.className = 'letter';
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            span.style.animationDelay = `${0.15 + i * 0.09}s`;
            heroTitle.appendChild(span);
        });
    }

    // 3. ПЫЛЬ ПУСТЫНИ
    const canvas = document.getElementById('dust-canvas');
    if (canvas && !reducedMotion) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        function createParticles() {
            const count = Math.min(60, Math.floor(window.innerWidth / 25));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2.2 + 0.5,
                speedX: (Math.random() - 0.3) * 0.4,
                speedY: (Math.random() - 0.5) * 0.25,
                opacity: Math.random() * 0.5 + 0.1,
                phase: Math.random() * Math.PI * 2
            }));
        }
        createParticles();
        window.addEventListener('resize', createParticles);

        (function animateDust() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const t = Date.now() / 1000;
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY + Math.sin(t + p.phase) * 0.15;
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 74, 5, ${p.opacity * (0.7 + 0.3 * Math.sin(t * 2 + p.phase))})`;
                ctx.fill();
            });
            requestAnimationFrame(animateDust);
        })();
    }

    // 4. СЧЁТЧИКИ
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 1800;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.innerText = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
            else el.innerText = target;
        }
        requestAnimationFrame(tick);
    }

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

    // 5. REVEAL-АНИМАЦИИ
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.closest('.character-grid, .authors-grid')) {
                el.style.transitionDelay = `${(i % 3) * 0.12}s`;
            }
            el.classList.add('active');
            obs.unobserve(el);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 6. АКТИВНЫЙ ПУНКТ МЕНЮ
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [...navLinks].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

    const navSpy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = '#' + entry.target.id;
            navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => navSpy.observe(s));

    // 7. ПАРАЛЛАКС
    const heroBg = document.getElementById('hero-bg-layer');
    const plotNumbers = document.querySelectorAll('.plot-number-bg');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (heroBg && y < window.innerHeight) {
            heroBg.style.transform = `translateY(${y * 0.25}px)`;
        }
        plotNumbers.forEach(num => {
            const rect = num.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const offset = (rect.top - window.innerHeight / 2) * 0.12;
                num.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
            }
        });
    }, { passive: true });

    // 8. МАГНИТНЫЕ КНОПКИ
    document.querySelectorAll('.btn').forEach(btn => {
        if (reducedMotion) return;
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // 9. НАВИГАЦИЯ + МОБИЛЬНОЕ МЕНЮ
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        document.body.style.overflow = 'auto';
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const spans = mobileMenuBtn.querySelectorAll('span');
            const active = mobileMenu.classList.contains('active');
            spans[0].style.transform = active ? 'translateY(8px) rotate(45deg)' : 'none';
            spans[1].style.opacity = active ? '0' : '1';
            spans[2].style.transform = active ? 'translateY(-8px) rotate(-45deg)' : 'none';
            document.body.style.overflow = active ? 'hidden' : 'auto';
        });
        mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
    }

    // 10. РЕДАКТИРУЕМОЕ МНЕНИЕ
    const opinionText = document.getElementById('user-opinion-text');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const saveStatus = document.getElementById('save-status');

    const defaultText = opinionText ? opinionText.innerText.trim() : '';
    const STORAGE_KEY = 'bilbyUserOpinion';

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && opinionText) opinionText.innerText = saved;
    } catch (e) {
        console.warn('LocalStorage недоступен.', e);
    }

    function exitEditMode() {
        opinionText.contentEditable = 'false';
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        resetBtn.classList.add('hidden');
    }

    if (editBtn && opinionText) {
        editBtn.addEventListener('click', () => {
            opinionText.contentEditable = 'true';
            opinionText.focus();
            editBtn.classList.add('hidden');
            saveBtn.classList.remove('hidden');
            resetBtn.classList.remove('hidden');
        });
    }

    if (saveBtn && opinionText) {
        saveBtn.addEventListener('click', () => {
            const current = opinionText.innerText.trim();
            if (current.length < 5) {
                saveStatus.innerText = 'Текст слишком короткий.';
                saveStatus.style.color = 'var(--danger)';
                return;
            }
            try {
                localStorage.setItem(STORAGE_KEY, current);
                saveStatus.innerText = '✓ Мнение сохранено!';
                saveStatus.style.color = 'var(--success)';
                exitEditMode();
                setTimeout(() => { saveStatus.innerText = ''; }, 3000);
            } catch (e) {
                saveStatus.innerText = 'Ошибка сохранения.';
                saveStatus.style.color = 'var(--danger)';
            }
        });

        opinionText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') saveBtn.click();
            if (e.key === 'Escape') exitEditMode();
        });
    }

    if (resetBtn && opinionText) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Вернуть исходный текст автора?')) {
                opinionText.innerText = defaultText;
                try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
                exitEditMode();
                saveStatus.innerText = 'Текст сброшен.';
                saveStatus.style.color = 'var(--accent)';
                setTimeout(() => { saveStatus.innerText = ''; }, 3000);
            }
        });
    }

    // 11. 3D-НАКЛОН КАРТОЧЕК
    document.querySelectorAll('.char-card').forEach(card => {
        if (reducedMotion) return;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform =
                `perspective(1000px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });
    });

    // 12. СВЕЧЕНИЕ ВИДЕО
    const mainVideo = document.getElementById('main-video');
    if (mainVideo) {
        const container = mainVideo.closest('.video-container');
        mainVideo.addEventListener('play', () => container.classList.add('playing'));
        mainVideo.addEventListener('pause', () => container.classList.remove('playing'));
        mainVideo.addEventListener('ended', () => container.classList.remove('playing'));
    }
});
