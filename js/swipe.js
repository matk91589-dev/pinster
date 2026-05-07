// ============================================
// SWIPE SYSTEM — Pingster v6.5 (PRODUCTION PHYSICS)
// ============================================

console.log('🔥 SWIPE.JS v6.5 PRODUCTION PHYSICS');

const Swipe = {
    mode: null, initialized: false,
    current: null, nextCard: null, nextNextCard: null,

    // Drag state
    isDragging: false,
    startX: 0, startY: 0,
    deltaX: 0, deltaY: 0,
    targetX: 0, targetY: 0,
    displayX: 0, displayY: 0,
    touchOffsetY: 0, cardRect: null,

    // Velocity
    lastPointerX: 0, lastPointerTime: 0,
    rawVelocityX: 0,

    // RAF
    raf: null,
    THRESHOLD: 110,

    // DOM
    scene: null, stackContainer: null, activeCard: null,
    likeBadge: null, nopeBadge: null, specular: null, shadowLayer: null,
    dock: null, bgLayer: null, glowLayer: null,

    RIBBON_COLORS: {
        faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.18)' },
        premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.18)' },
        prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.10)' },
        public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.10)' }
    },

    init(mode) {
        this.mode = mode;
        this.injectStyles();
        this.buildScene();
        this.initialized = true;
    },

    injectStyles() {
        if (document.getElementById('swipe-v65-styles')) return;
        const style = document.createElement('style');
        style.id = 'swipe-v65-styles';
        style.textContent = `
            body { overflow: hidden; }
            #swipeScreen { position: fixed; inset: 0; background: #0a0a0f; overflow: hidden; }

            .swipe-bg {
                position: fixed; inset: 0; background-size: cover; background-position: center;
                filter: blur(80px); transform: scale(1.2); opacity: 0.16;
                transition: background-image 0.6s ease; z-index: 0;
            }
            .swipe-bg-glow {
                position: fixed; inset: 0; z-index: 0; pointer-events: none;
            }

            .swipe-stack {
                position: absolute; top: 50%; left: 50%;
                width: 88vw; max-width: 380px; height: 480px;
                transform: translate(-50%, -50%);
                perspective: 1400px; transform-style: preserve-3d;
                contain: strict; isolation: isolate;
                z-index: 1;
            }
            .swipe-card {
                position: absolute; inset: 0;
                border-radius: 20px; overflow: hidden;
                background-size: cover; background-position: center 25%;
                will-change: transform; transform: translate3d(0,0,0);
                backface-visibility: hidden;
                isolation: isolate;
            }
            .swipe-card.back-2 {
                transform: translate3d(0,22px,0) scale(0.9); opacity: 0.18; z-index: 0;
                filter: blur(3px);
            }
            .swipe-card.back-1 {
                transform: translate3d(0,11px,0) scale(0.95); opacity: 0.48; z-index: 1;
                filter: blur(1px);
            }
            .swipe-card.active { transform: translate3d(0,0,0) scale(1); opacity: 1; z-index: 2; }
            .swipe-card::after {
                content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 60%;
                background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%);
                z-index: 1; pointer-events: none;
            }

            .swipe-shadow {
                position: absolute; inset: -20px; border-radius: 30px;
                background: rgba(0,0,0,0.35); filter: blur(30px);
                z-index: -1; opacity: 0.6; pointer-events: none;
                will-change: opacity;
            }

            .swipe-ribbon {
                position: absolute; top: 0; left: 0; z-index: 5;
                padding: 8px 20px 7px 16px;
                font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
                background: rgba(14,14,20,0.9); color: var(--ribbon-color, #FF5500);
                clip-path: polygon(0 0, 100% 0, 84% 100%, 0 100%);
                backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            }

            .swipe-text {
                position: absolute; bottom: 80px; left: 20px; right: 20px; z-index: 3;
                display: flex; flex-direction: column; gap: 4px;
            }
            .swipe-id { font-size: 10px; font-weight: 600; color: #FF5500; letter-spacing: 1px; text-transform: uppercase; }
            .swipe-nick { font-size: 30px; font-weight: 800; color: #fff; text-shadow: 0 2px 16px rgba(0,0,0,0.8); letter-spacing: -0.5px; }
            .swipe-stats { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.85); display: flex; gap: 10px; flex-wrap: wrap; }
            .swipe-sep { color: rgba(255,255,255,0.4); font-weight: 700; }
            .swipe-about { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-top: 6px;
                display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

            .swipe-specular {
                position: absolute; inset: 0; z-index: 4; pointer-events: none;
                background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.14) 48%, transparent 72%);
                opacity: 0; mix-blend-mode: screen;
            }
            .swipe-tilt-light {
                position: absolute; inset: 0; z-index: 3; pointer-events: none;
                background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.14), transparent 40%);
                opacity: 0; mix-blend-mode: soft-light;
            }

            .swipe-badge {
                position: absolute; top: 50px; padding: 10px 18px;
                border-radius: 14px; font-size: 28px; font-weight: 800;
                z-index: 10; opacity: 0; pointer-events: none;
                backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
                display: flex; align-items: center; gap: 6px;
            }
            .swipe-badge.like {
                right: 24px; border: 2px solid #34FF8A; color: #34FF8A;
                background: rgba(52,255,138,0.1); transform: rotate(12deg);
            }
            .swipe-badge.nope {
                left: 24px; border: 2px solid #FF4D6D; color: #FF4D6D;
                background: rgba(255,77,109,0.1); transform: rotate(-12deg);
            }

            .swipe-dock {
                position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
                display: flex; gap: 16px; padding: 14px 20px; border-radius: 999px;
                background: rgba(20,20,28,0.88); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
                border: 1px solid rgba(255,255,255,0.06);
                box-shadow: 0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08), inset 0 -1px 0 rgba(0,0,0,.4);
                z-index: 20;
            }
            .swipe-dock-btn {
                width: 50px; height: 50px; border-radius: 50%; border: none;
                cursor: pointer; transition: all 0.2s ease;
                display: flex; align-items: center; justify-content: center;
                background: transparent;
            }
            .swipe-dock-btn:active { transform: scale(0.88); }
            .swipe-dock-btn.nope-btn { color: rgba(255,255,255,0.5); }
            .swipe-dock-btn.like-btn { color: #FF5500; }
            .swipe-dock-btn.super-btn { color: rgba(123,140,255,0.6); }

            .swipe-grain {
                position: fixed; inset: 0; z-index: 5; pointer-events: none;
                opacity: 0.035; mix-blend-mode: overlay;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            }

            .back-arrow-swipe { z-index: 30; }

            @keyframes matchHeartPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
            @keyframes shockwave { from { transform: scale(0.2); opacity: 0.8; } to { transform: scale(3.5); opacity: 0; } }
        `;
        document.head.appendChild(style);
    },

    buildScene() {
        const container = document.getElementById('swipeContainer');
        if (!container) return;
        container.innerHTML = '';
        container.style.cssText = 'position:fixed;inset:0;overflow:hidden;';
        this.scene = container;

        this.bgLayer = document.createElement('div'); this.bgLayer.className = 'swipe-bg'; this.scene.appendChild(this.bgLayer);
        this.glowLayer = document.createElement('div'); this.glowLayer.className = 'swipe-bg-glow'; this.scene.appendChild(this.glowLayer);

        this.stackContainer = document.createElement('div'); this.stackContainer.className = 'swipe-stack'; this.scene.appendChild(this.stackContainer);

        const grain = document.createElement('div'); grain.className = 'swipe-grain'; this.scene.appendChild(grain);

        this.dock = document.createElement('div'); this.dock.className = 'swipe-dock';
        this.dock.innerHTML = `
            <button class="swipe-dock-btn nope-btn" onclick="Swipe.reject()">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button class="swipe-dock-btn super-btn" onclick="Swipe.superLike()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </button>
            <button class="swipe-dock-btn like-btn" onclick="Swipe.like()">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg>
            </button>
        `;
        this.scene.appendChild(this.dock);
    },

    applyResistance(value, max = 240) {
        return value / (1 + Math.abs(value) / max);
    },

    createCardElement(data, className) {
        const anketaMode = (data.mode || this.mode || 'faceit').toLowerCase();
        const rc = this.RIBBON_COLORS[anketaMode] || this.RIBBON_COLORS.faceit;
        const card = document.createElement('div');
        card.className = `swipe-card ${className}`;
        card.style.setProperty('--ribbon-color', rc.color);
        card.style.backgroundImage = (data.avatar && data.avatar !== 'null')
            ? `url(${data.avatar})` : 'linear-gradient(160deg, #1c1c26, #14141c)';

        const statsParts = [`<span>${anketaMode.toUpperCase()}</span>`];
        if (data.rank) statsParts.push(`<span>${data.rank}</span>`);
        if (data.age) statsParts.push(`<span>${data.age} y.o.</span>`);

        card.innerHTML = `
            <div class="swipe-shadow"></div>
            <div class="swipe-ribbon">${anketaMode.toUpperCase()}</div>
            <div class="swipe-specular"></div>
            <div class="swipe-tilt-light"></div>
            <div class="swipe-text">
                ${data.player_id ? `<div class="swipe-id">ID ${data.player_id}</div>` : ''}
                <div class="swipe-nick">${data.nick || 'Player'}</div>
                <div class="swipe-stats">${statsParts.join(' <span class="swipe-sep">•</span> ')}</div>
                ${data.about ? `<div class="swipe-about">${data.about}</div>` : ''}
            </div>
        `;
        return card;
    },

    animateCardEntry(card) {
        card.animate([
            { transform: 'translate3d(0,30px,0) scale(0.92)', opacity: 0 },
            { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }
        ], { duration: 450, easing: 'cubic-bezier(0.22,1,0.36,1)' });
    },

    show(data) {
        this.current = data;
        this.displayX = 0; this.displayY = 0;
        this.targetX = 0; this.targetY = 0;
        this.deltaX = 0; this.deltaY = 0;
        this.cancelRAF();

        const rc = this.RIBBON_COLORS[(data.mode || this.mode || 'faceit').toLowerCase()] || this.RIBBON_COLORS.faceit;
        if (data.avatar && data.avatar !== 'null') this.bgLayer.style.backgroundImage = `url(${data.avatar})`;
        this.glowLayer.style.background = `radial-gradient(circle at 50% 30%, ${rc.glow}, transparent 60%)`;

        this.stackContainer.innerHTML = '';

        if (this.nextNextCard) this.stackContainer.appendChild(this.createCardElement(this.nextNextCard, 'back-2'));
        if (this.nextCard) {
            this.stackContainer.appendChild(this.createCardElement(this.nextCard, 'back-1'));
            this.nextNextCard = this.nextCard;
        }

        this.activeCard = this.createCardElement(data, 'active');
        this.specular = this.activeCard.querySelector('.swipe-specular');
        this.shadowLayer = this.activeCard.querySelector('.swipe-shadow');

        this.likeBadge = document.createElement('div');
        this.likeBadge.className = 'swipe-badge like';
        this.likeBadge.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34FF8A" stroke-width="2.5"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg> LIKE`;
        this.activeCard.appendChild(this.likeBadge);

        this.nopeBadge = document.createElement('div');
        this.nopeBadge.className = 'swipe-badge nope';
        this.nopeBadge.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4D6D" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> NOPE`;
        this.activeCard.appendChild(this.nopeBadge);

        this.stackContainer.appendChild(this.activeCard);
        this.animateCardEntry(this.activeCard);
        this.bindPointer();
    },

    bindPointer() {
        this.cardRect = null;
        this.activeCard.addEventListener('pointerdown', (e) => this.onDragStart(e));
    },

    onDragStart(e) {
        if (e.target.closest('button')) return;
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.lastPointerX = e.clientX;
        this.lastPointerTime = Date.now();
        this.rawVelocityX = 0;

        this.cardRect = this.activeCard.getBoundingClientRect();
        this.touchOffsetY = this.startY - this.cardRect.top;

        this.activeCard.style.transition = 'none';
        this.activeCard.setPointerCapture(e.pointerId);
        this.activeCard.addEventListener('pointermove', this.onDragMoveBound = (e) => this.onDragMove(e));
        this.activeCard.addEventListener('pointerup', this.onDragEndBound = () => this.onDragEnd());
    },

    onDragMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const rawX = e.clientX - this.startX;
        const rawY = e.clientY - this.startY;

        this.targetX = this.applyResistance(rawX, 240);
        this.targetY = this.applyResistance(rawY, 130);

        const now = Date.now();
        const dt = Math.max(now - this.lastPointerTime, 1);
        this.rawVelocityX = (e.clientX - this.lastPointerX) / dt;
        this.lastPointerX = e.clientX;
        this.lastPointerTime = now;

        if (!this.raf) {
            this.raf = requestAnimationFrame(() => this.renderDrag());
        }
    },

    onDragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.activeCard.removeEventListener('pointermove', this.onDragMoveBound);
        this.activeCard.removeEventListener('pointerup', this.onDragEndBound);
        this.cancelRAF();

        const speed = Math.abs(this.rawVelocityX);
        const totalDelta = Math.abs(this.targetX);

        this.activeCard.style.transition = 'transform 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';

        if (totalDelta > this.THRESHOLD || speed > 0.7) {
            this.targetX > 0 ? this.doLike() : this.doReject();
        } else {
            this.resetCard();
        }
    },

    cancelRAF() {
        if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    },

    // 🔥 SPRING LERP RENDER
    renderDrag() {
        this.raf = null;

        // Spring interpolation
        const lerpFactor = 0.22;
        this.displayX += (this.targetX - this.displayX) * lerpFactor;
        this.displayY += (this.targetY - this.displayY) * lerpFactor;

        this.deltaX = this.displayX;
        this.deltaY = this.displayY;

        const progress = Math.min(Math.abs(this.deltaX) / this.THRESHOLD, 1);
        const rotateStrength = (this.touchOffsetY / this.cardRect.height - 0.5) * 14;
        const rotate = (this.deltaX / window.innerWidth) * 20 + rotateStrength;

        this.activeCard.style.transform = `translate3d(${this.deltaX}px,${this.deltaY}px,0) rotate(${rotate}deg)`;

        // Fake shadow layer
        if (this.shadowLayer) {
            this.shadowLayer.style.opacity = 0.6 + progress * 0.35;
        }

        // Specular
        if (this.specular) {
            this.specular.style.opacity = progress * 0.75;
            this.specular.style.transform = `translateX(${this.deltaX * 0.1}px)`;
        }

        // Tilt light
        const tiltLight = this.activeCard.querySelector('.swipe-tilt-light');
        if (tiltLight) {
            tiltLight.style.opacity = 0.3 + progress * 0.4;
            tiltLight.style.background = `radial-gradient(circle at ${50 + this.deltaX * 0.05}% ${30 + this.deltaY * 0.05}%, rgba(255,255,255,0.14), transparent 40%)`;
        }

        // Reactive stack
        const b1 = this.stackContainer.querySelector('.back-1');
        const b2 = this.stackContainer.querySelector('.back-2');
        if (b1) {
            b1.style.transition = 'none';
            b1.style.transform = `translate3d(0,${11 - progress * 14}px,0) scale(${0.95 + progress * 0.06})`;
            b1.style.opacity = 0.48 + progress * 0.3;
        }
        if (b2) {
            b2.style.transition = 'none';
            b2.style.transform = `translate3d(0,${22 - progress * 10}px,0) scale(${0.90 + progress * 0.04})`;
            b2.style.opacity = 0.18 + progress * 0.12;
        }

        // Dynamic glow
        const glowX = 50 + this.deltaX / 12;
        const rc = this.RIBBON_COLORS[this.mode] || this.RIBBON_COLORS.faceit;
        this.glowLayer.style.background = `radial-gradient(circle at ${glowX}% 35%, ${rc.glow}, transparent 60%)`;

        // Badges
        const likeProgress = Math.min(Math.max(this.deltaX / 110, 0), 1);
        const nopeProgress = Math.min(Math.max(-this.deltaX / 110, 0), 1);
        if (this.likeBadge) {
            this.likeBadge.style.opacity = likeProgress;
            this.likeBadge.style.transform = `scale(${0.8 + likeProgress * 0.3}) rotate(12deg)`;
        }
        if (this.nopeBadge) {
            this.nopeBadge.style.opacity = nopeProgress;
            this.nopeBadge.style.transform = `scale(${0.8 + nopeProgress * 0.3}) rotate(-12deg)`;
        }

        this.bgLayer.style.opacity = Math.min(0.16 + progress * 0.3, 0.45);

        // Continue lerp until settled
        if (this.isDragging || Math.abs(this.targetX - this.displayX) > 0.5 || Math.abs(this.targetY - this.displayY) > 0.5) {
            this.raf = requestAnimationFrame(() => this.renderDrag());
        }
    },

    resetCard() {
        this.targetX = 0; this.targetY = 0; this.displayX = 0; this.displayY = 0;
        this.activeCard.style.transform = 'translate3d(0,0,0) rotate(0deg)';
        if (this.likeBadge) { this.likeBadge.style.opacity = '0'; this.likeBadge.style.transform = 'scale(0.8) rotate(12deg)'; }
        if (this.nopeBadge) { this.nopeBadge.style.opacity = '0'; this.nopeBadge.style.transform = 'scale(0.8) rotate(-12deg)'; }
        if (this.specular) this.specular.style.opacity = '0';
        if (this.shadowLayer) this.shadowLayer.style.opacity = '0.6';
        this.bgLayer.style.opacity = '0.16';
        const rc = this.RIBBON_COLORS[this.mode] || this.RIBBON_COLORS.faceit;
        this.glowLayer.style.background = `radial-gradient(circle at 50% 30%, ${rc.glow}, transparent 60%)`;
        const b1 = this.stackContainer.querySelector('.back-1');
        const b2 = this.stackContainer.querySelector('.back-2');
        if (b1) { b1.style.transition = 'all 0.45s ease'; b1.style.transform = 'translate3d(0,11px,0) scale(0.95)'; b1.style.opacity = '0.48'; }
        if (b2) { b2.style.transition = 'all 0.45s ease'; b2.style.transform = 'translate3d(0,22px,0) scale(0.9)'; b2.style.opacity = '0.18'; }
        this.haptic('light');
    },

    like() { if (!this.current) return; this.targetX = this.THRESHOLD + 40; this.displayX = this.targetX; this.doLike(); },
    doLike() {
        const flyX = this.targetX > 0 ? 160 : -160;
        this.activeCard.style.transition = 'transform 0.55s cubic-bezier(0.19,1,0.22,1), opacity 0.45s ease, filter 0.45s ease';
        this.activeCard.style.filter = 'blur(4px)';
        this.activeCard.style.opacity = '0';
        this.activeCard.style.transform = `translate3d(${flyX}%,${this.targetY * 0.5}px,0) rotate(${flyX > 0 ? 30 : -30}deg) scale(0.88)`;
        if (this.likeBadge) this.likeBadge.style.opacity = '1';
        this.bgLayer.style.opacity = '0';
        this.haptic('medium');
        if (this.current?.player_id && window.Search) {
            Search.likePlayer(this.current.player_id, (data) => {
                data?.status === 'match' ? this.showMatchScreen() : this.showToast('👍 Лайк!');
            });
        }
        setTimeout(() => this.finishSwipe(), 500);
    },

    reject() { if (!this.current) return; this.targetX = -(this.THRESHOLD + 40); this.displayX = this.targetX; this.doReject(); },
    doReject() {
        const flyX = this.targetX < 0 ? -160 : 160;
        this.activeCard.style.transition = 'transform 0.55s cubic-bezier(0.19,1,0.22,1), opacity 0.45s ease, filter 0.45s ease';
        this.activeCard.style.filter = 'blur(4px)';
        this.activeCard.style.opacity = '0';
        this.activeCard.style.transform = `translate3d(${flyX}%,${this.targetY * 0.5}px,0) rotate(${flyX < 0 ? -30 : 30}deg) scale(0.88)`;
        if (this.nopeBadge) this.nopeBadge.style.opacity = '1';
        this.bgLayer.style.opacity = '0';
        this.haptic('light');
        this.showToast('Пропущено');
        setTimeout(() => this.finishSwipe(), 500);
    },

    superLike() {
        if (!this.current) return;
        const wave = document.createElement('div');
        wave.style.cssText = 'position:fixed;top:50%;left:50%;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(123,140,255,0.4),transparent);transform:translate(-50%,-50%);z-index:50;pointer-events:none;animation:shockwave 0.7s ease-out;';
        this.scene.appendChild(wave);
        setTimeout(() => wave.remove(), 700);
        this.scene.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }], { duration: 400 });
        this.activeCard.animate([
            { transform: 'translate3d(0,0,0) scale(1)', offset: 0 },
            { transform: 'translate3d(0,0,0) scale(1.1)', offset: 0.25 },
            { transform: 'translate3d(0,-160%,0) scale(0.82) rotate(5deg)', offset: 1 }
        ], { duration: 700, easing: 'cubic-bezier(0.19,1,0.22,1)' });
        this.activeCard.style.opacity = '0';
        this.haptic('heavy');
        if (this.current?.player_id && window.Search) {
            Search.likePlayer(this.current.player_id, (data) => {
                this.showToast(data?.status === 'match' ? '⭐ Взаимный мэтч!' : '⭐ Super Like!');
            });
        }
        setTimeout(() => this.finishSwipe(), 700);
    },

    finishSwipe() {
        if (this.activeCard) this.activeCard.style.filter = '';
        this.next();
    },

    next() {
        if (window.Search) {
            const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            Search.showNextAnketa(id, this.mode);
        }
    },

    showMatchScreen() {
        this.haptic('notification');
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(0,0,0,0.92);backdrop-filter:blur(20px);';
        overlay.innerHTML = `
            <div style="display:flex;gap:20px;align-items:center;">
                <div style="width:80px;height:80px;border-radius:50%;background:${this.current?.avatar ? `url(${this.current.avatar})` : 'linear-gradient(145deg,#1c1c24,#16161c)'};background-size:cover;border:2px solid #FF5500;"></div>
                <div style="font-size:56px;animation:matchHeartPulse 0.8s ease-in-out 3;">❤️</div>
                <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(145deg,#1c1c24,#16161c);border:2px solid #FF5500;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;">?</div>
            </div>
            <div style="font-size:36px;font-weight:800;color:#fff;letter-spacing:-1px;">IT'S A MATCH!</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.5);">Вы понравились друг другу</div>
            <button onclick="this.parentElement.remove();Swipe.next();" style="margin-top:12px;padding:16px 48px;border-radius:999px;border:none;background:#FF5500;color:#fff;font-size:16px;font-weight:600;cursor:pointer;">Продолжить</button>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => { overlay.remove(); this.next(); }, 4000);
    },

    haptic(style) {
        try {
            const w = window.Telegram?.WebApp;
            if (style === 'notification') w?.HapticFeedback?.notificationOccurred('success');
            else w?.HapticFeedback?.impactOccurred(style || 'light');
        } catch(e) {}
    },

    startWithAnketa(anketa, mode) {
        this.mode = (anketa.mode || mode || 'faceit').toLowerCase();
        if (!this.initialized) this.init(this.mode);
        if (this.current) this.nextCard = this.current;
        this.show(anketa);
        this.showBackArrow();
    },

    showToast(msg) {
        const old = document.querySelector('.swipe-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;font-weight:500;z-index:10000;';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 1500);
    },

    showBackArrow() { const a = document.querySelector('.back-arrow-swipe'); if (a) a.style.display = 'flex'; },
    hideBackArrow() { const a = document.querySelector('.back-arrow-swipe'); if (a) a.style.display = 'none'; },
    exitSwipeMode() { this.cancelRAF(); this.hideBackArrow(); this.current = null; }
};

window.Swipe = Swipe;
console.log('✅ Swipe v6.5 PRODUCTION PHYSICS готов');
