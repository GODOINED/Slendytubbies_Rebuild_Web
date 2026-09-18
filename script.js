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
    // 2. SMOOTH SCROLL TO DOWNLOAD
    // =========================================================
    const mainBtn         = document.getElementById('mainDownload');
    const downloadSection = document.getElementById('downloadSection');

    if (mainBtn && downloadSection) {
        mainBtn.addEventListener('click', () => {
            downloadSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // =========================================================
    // 3. PAUSE VIDEO WHEN NOT VISIBLE
    // =========================================================
    const hero = document.getElementById('hero');

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
    // 4. BUTTON FADE IN
    // =========================================================
    if (mainBtn) {
        mainBtn.style.opacity = '0';
        mainBtn.style.transform = 'translateY(20px)';

        setTimeout(() => {
            mainBtn.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
            mainBtn.style.opacity = '1';
            mainBtn.style.transform = 'translateY(0)';
        }, 400);
    }

    // =========================================================
    // 5. REVEAL ON SCROLL — плавное каскадное появление
    // =========================================================
    const revealItems = document.querySelectorAll('.reveal');

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
                el.style.transitionDelay = `${i * 0.1}s`;
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

});