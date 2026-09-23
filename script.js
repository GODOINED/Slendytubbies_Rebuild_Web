/* ============================================================
   SLENDYTUBBIES REBUILD — main script
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. BACKGROUND VIDEO
    // =========================================================
    const bgVideo = document.getElementById('bgVideo');

    if (bgVideo) {
        bgVideo.addEventListener('loadeddata', () => {
            console.log('✅ Video loaded:', bgVideo.currentSrc);
        });
        bgVideo.addEventListener('error', () => {
            console.error('❌ Video loading error:', bgVideo.error);
        });

        const tryPlay = () => {
            const playPromise = bgVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn('⚠ Autoplay blocked:', err.message);
                    const resume = () => {
                        bgVideo.play().catch(() => {});
                        document.removeEventListener('click', resume);
                        document.removeEventListener('touchstart', resume);
                    };
                    document.addEventListener('click', resume);
                    document.addEventListener('touchstart', resume);
                });
            }
        };

        window.addEventListener('load', tryPlay);
        tryPlay();
    }

    // =========================================================
    // 2. HERO INTRO
    // =========================================================
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 700);

    // =========================================================
    // 3. PARALLAX
    // =========================================================
    const hero       = document.getElementById('hero');
    const heroTitle  = document.getElementById('heroTitle');
    const videoLayer = document.getElementById('parallaxVideo');
    const hasHover   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (hero && heroTitle && videoLayer && hasHover) {
        const VIDEO_AMPLITUDE = 30;
        const TITLE_AMPLITUDE = 22;
        const SMOOTHING       = 0.06;

        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;
        let rafId = null;
        let isAnimating = false;

        const loop = () => {
            currentX += (targetX - currentX) * SMOOTHING;
            currentY += (targetY - currentY) * SMOOTHING;

            videoLayer.style.transform = `translate3d(${currentX * VIDEO_AMPLITUDE}px, ${currentY * VIDEO_AMPLITUDE}px, 0)`;
            heroTitle.style.transform  = `translate3d(${currentX * -TITLE_AMPLITUDE}px, ${currentY * -TITLE_AMPLITUDE}px, 0)`;

            const dx = Math.abs(targetX - currentX);
            const dy = Math.abs(targetY - currentY);

            if (dx > 0.0005 || dy > 0.0005) {
                rafId = requestAnimationFrame(loop);
            } else {
                videoLayer.style.transform = `translate3d(${targetX * VIDEO_AMPLITUDE}px, ${targetY * VIDEO_AMPLITUDE}px, 0)`;
                heroTitle.style.transform  = `translate3d(${targetX * -TITLE_AMPLITUDE}px, ${targetY * -TITLE_AMPLITUDE}px, 0)`;
                rafId = null;
                isAnimating = false;
            }
        };

        const startLoop = () => {
            if (!isAnimating) {
                isAnimating = true;
                rafId = requestAnimationFrame(loop);
            }
        };

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            targetX = (e.clientX - rect.left) / rect.width  - 0.5;
            targetY = (e.clientY - rect.top)  / rect.height - 0.5;
            startLoop();
        });

        hero.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
            startLoop();
        });
    }

    // =========================================================
    // 4. SMOOTH SCROLL TO DOWNLOAD
    // =========================================================
    const mainBtn         = document.getElementById('mainDownload');
    const downloadSection = document.getElementById('downloadSection');

    if (mainBtn && downloadSection) {
        mainBtn.addEventListener('click', () => {
            downloadSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // =========================================================
    // 5. PAUSE VIDEO WHEN NOT VISIBLE
    // =========================================================
    if (bgVideo && hero && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    bgVideo.play().catch(() => {});
                } else {
                    bgVideo.pause();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(hero);
    }

    // =========================================================
    // 6. REVEAL ON SCROLL
    // =========================================================
    const revealItems = document.querySelectorAll('.reveal, .monster-card');

    if ('IntersectionObserver' in window && revealItems.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) =>
                    a.target.getBoundingClientRect().top -
                    b.target.getBoundingClientRect().top
                );

            visible.forEach((entry, i) => {
                const el = entry.target;
                if (!el.classList.contains('monster-card')) {
                    el.style.transitionDelay = `${i * 0.12}s`;
                }
                el.classList.add('visible');
                revealObserver.unobserve(el);
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('visible'));
    }

    // =========================================================
    // 7. FIX: после завершения появления карточки монстра
    //    ставим .intro-done, чтобы monsterGlitchIn больше
    //    не перезапускался при уходе курсора.
    // =========================================================
    document.querySelectorAll('.monster-card').forEach(card => {
        let done = false;
        const markDone = () => {
            if (done) return;
            done = true;
            card.classList.add('intro-done');
        };

        card.addEventListener('animationend', (e) => {
            if (e.animationName === 'monsterGlitchIn') markDone();
        });

        const checkFallback = () => {
            if (card.classList.contains('visible') && !card.classList.contains('intro-done')) {
                markDone();
            }
        };
        const intId = setInterval(() => {
            if (card.classList.contains('intro-done')) {
                clearInterval(intId);
            } else {
                checkFallback();
            }
        }, 400);
    });

    // =========================================================
    // 8. СКРЫТИЕ ПАНЕЛЕЙ ПРИ СКРОЛЛЕ
    // =========================================================
    const heroSection = document.getElementById('hero');

    if (heroSection && 'IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.intersectionRatio < 0.6) {
                    document.body.classList.add('scrolled');
                } else {
                    document.body.classList.remove('scrolled');
                }
            });
        }, {
            threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
        });

        heroObserver.observe(heroSection);
    } else if (heroSection) {
        const onScroll = () => {
            const rect = heroSection.getBoundingClientRect();
            const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
            const ratio = visible / rect.height;
            if (ratio < 0.6) {
                document.body.classList.add('scrolled');
            } else {
                document.body.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

});