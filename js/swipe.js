// ============================================
// SWIPE SYSTEM — v9.0 ONBOARDING + IDLE HINT
// ============================================

console.log('🔥 SWIPE.JS v9.0 ONBOARDING');

const SwipeState = { IDLE: 'idle', DRAGGING: 'dragging', THROWING: 'throwing', RESETTING: 'resetting' };

class SwipeMachine {
    constructor() { this.state = SwipeState.IDLE; this.listeners = []; }
    set(state) { if (this.state === state) return; const prev = this.state; this.state = state; this.listeners.forEach(fn => fn(state, prev)); }
    is(state) { return this.state === state; }
    on(fn) { this.listeners.push(fn); }
}

class PhysicsEngine {
    constructor(config = {}) {
        this.x = 0; this.y = 0; this.targetX = 0; this.targetY = 0;
        this.smoothing = config.smoothing || 0.18;
        this.resistanceX = config.resistanceX || 240;
        this.resistanceY = config.resistanceY || 130;
        this.throwArcUp = config.throwArcUp ?? -8;
        this.throwArcDown = config.throwArcDown ?? 5;
        this.throwRotation = config.throwRotation ?? 25;
        this.throwScale = config.throwScale ?? 0.88;
        this.throwBlur = config.throwBlur ?? 5;
        this.flyDuration = config.flyDuration ?? 0.55;
        this.flyEasing = config.flyEasing || 'cubic-bezier(0.19,1,0.22,1)';
        this.snapBackDuration = config.snapBackDuration ?? 0.65;
        this.threshold = config.threshold ?? 100;
        this.velocityThreshold = config.velocityThreshold ?? 10;
    }
    applyResistance(v, max) { return v / (1 + Math.abs(v) / max); }
    setTarget(dx, dy) { this.targetX = this.applyResistance(dx, this.resistanceX); this.targetY = this.applyResistance(dy, this.resistanceY); }
    update() { this.x += (this.targetX - this.x) * this.smoothing; this.y += (this.targetY - this.y) * this.smoothing; return { x: this.x, y: this.y }; }
    shouldCommit(velocityX) { return Math.abs(velocityX) > this.velocityThreshold || Math.abs(this.x) > this.threshold; }
    isSettled() { return Math.abs(this.targetX - this.x) < 0.3 && Math.abs(this.targetY - this.y) < 0.3; }
    reset() { this.x = 0; this.y = 0; this.targetX = 0; this.targetY = 0; }
}

class VelocityTracker {
    constructor(smoothing = 0.25) { this.lastX = 0; this.vx = 0; this.smoothing = smoothing; }
    update(x, dt) { const raw = (x - this.lastX) / Math.max(dt, 1) * 16.67; this.vx += (raw - this.vx) * this.smoothing; this.lastX = x; return this.vx; }
    reset() { this.vx = 0; this.lastX = 0; }
}

class SwipeRenderer {
    constructor() {
        this.scene = null; this.stackContainer = null; this.activeCard = null;
        this.bgLayer = null; this.glowLayer = null;
        this.likeBadge = null; this.nopeBadge = null;
        this.shadowLayer = null;
        this.back1 = null; this.back2 = null;
        this.flashEl = null; this.pulseEl = null; this.matchOverlay = null;
        this.onboardingOverlay = null;
        this.idleHint = null;
        this.RIBBON_COLORS = {
            faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
            premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
            prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' },
            public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' },
        };
    }

    injectStyles() {
        if (document.getElementById('swipe-v9-styles')) return;
        const s = document.createElement('style');
        s.id = 'swipe-v9-styles';
        s.textContent = `
            #swipeScreen { position: fixed; inset: 0; background: #0a0a0f; overflow: hidden; padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }
            .swipe-bg { position: fixed; inset: 0; background-size: cover; background-position: center; filter: blur(80px); transform: scale(1.2); opacity: 0.16; transition: background-image 0.6s ease; z-index: 0; }
            .swipe-bg-glow { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
            .swipe-stack {
                position: absolute; top: 50%; left: 50%;
                width: 88vw; max-width: 380px; height: 460px; max-height: calc(100vh - 180px);
                transform: translate(-50%, -50%);
                perspective: 1400px; transform-style: preserve-3d;
                contain: layout paint style; isolation: isolate; z-index: 1;
            }
            .swipe-card {
                position: absolute; inset: 0; border-radius: 18px; overflow: hidden;
                background-color: #0a0a0f; background-size: cover; background-position: center 20%;
                display: flex; flex-direction: column; justify-content: flex-end; padding: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06);
                will-change: transform; transform: translate3d(0,0,0); backface-visibility: hidden;
                touch-action: none;
            }
            .swipe-card.back-2 { transform: translate3d(0,22px,0) scale(0.9); opacity: 0.18; z-index: 0; filter: blur(3px); }
            .swipe-card.back-1 { transform: translate3d(0,11px,0) scale(0.95); opacity: 0.48; z-index: 1; filter: blur(1px); }
            .swipe-card.active { transform: translate3d(0,0,0) scale(1); opacity: 1; z-index: 2; }
            .swipe-card.filled::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 65%; background: linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 50%, transparent 100%); z-index: 1; pointer-events: none; }
            .swipe-ribbon { position: absolute; top: 0; left: 0; z-index: 5; padding: 7px 18px 6px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: var(--ribbon-bg, rgba(18,18,24,0.92)); color: var(--ribbon-color, #FF5500); border-radius: 18px 0 10px 0; border-bottom: 1px solid var(--ribbon-color, #FF5500); border-right: 1px solid var(--ribbon-color, #FF5500); }
            .swipe-text { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; margin-bottom: 56px; width: 100%; }
            .swipe-id { font-size: 10px; font-weight: 600; color: #FF5500; text-transform: uppercase; }
            .swipe-nick { font-size: 28px; font-weight: 800; color: #FFFFFF; text-shadow: 0 2px 12px rgba(0,0,0,0.7); }
            .swipe-stats { font-size: 14px; color: #FFFFFF; display: flex; gap: 10px; flex-wrap: wrap; }
            .swipe-sep { color: rgba(255,255,255,0.6); }
            .swipe-about { font-size: 14px; color: #FFFFFF; line-height: 1.5; }
            .swipe-badge { position: absolute; top: 50px; padding: 10px 18px; border-radius: 14px; font-size: 28px; font-weight: 800; z-index: 10; opacity: 0; pointer-events: none; display: flex; align-items: center; gap: 6px; }
            .swipe-badge.like { right: 24px; border: 2px solid #34FF8A; color: #34FF8A; background: rgba(52,255,138,0.15); transform: rotate(12deg); }
            .swipe-badge.nope { left: 24px; border: 2px solid #FF4D6D; color: #FF4D6D; background: rgba(255,77,109,0.15); transform: rotate(-12deg); }
            .swipe-dock { position: fixed; bottom: 36px; left: 50%; transform: translateX(-50%); display: flex; gap: 24px; padding: 14px 28px; border-radius: 999px; background: rgba(20,20,28,0.9); border: 1px solid rgba(255,255,255,0.06); z-index: 20; }
            .swipe-dock-btn { width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer; background: transparent; display: flex; align-items: center; justify-content: center; }
            .swipe-dock-btn.nope-btn { color: rgba(255,255,255,0.5); }
            .swipe-dock-btn.like-btn { color: #FF5500; }
            .swipe-flash { position: fixed; inset: 0; z-index: 50; pointer-events: none; opacity: 0; }
            .swipe-pulse { position: fixed; top: 50%; left: 50%; width: 180px; height: 180px; border-radius: 50%; z-index: 45; pointer-events: none; opacity: 0; transform: translate(-50%,-50%) scale(0); }
            .swipe-pulse.fire { animation: pulseFire 0.5s ease-out forwards; }
            @keyframes pulseFire { 0% { transform: translate(-50%,-50%) scale(0.4); opacity: 0.8; } 100% { transform: translate(-50%,-50%) scale(2); opacity: 0; } }
            .back-arrow-swipe { z-index: 30; }

            /* 🔥 ONBOARDING OVERLAY */
            .swipe-onboarding {
                position: fixed; inset: 0; z-index: 50; pointer-events: none;
                background: rgba(0,0,0,0.55);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s ease;
            }
            .swipe-onboarding.show { opacity: 1; }
            .swipe-onboarding-zones {
                display: flex; width: 100%; justify-content: space-between; padding: 0 20px;
                position: absolute; top: 50%; transform: translateY(-50%);
            }
            .swipe-onboarding-zone {
                padding: 16px 20px; border-radius: 16px; font-size: 16px; font-weight: 700;
                backdrop-filter: blur(10px);
            }
            .swipe-onboarding-zone.nope { background: rgba(255,77,109,0.2); border: 2px solid #FF4D6D; color: #FF4D6D; }
            .swipe-onboarding-zone.like { background: rgba(52,255,138,0.2); border: 2px solid #34FF8A; color: #34FF8A; }
            .swipe-onboarding-text {
                position: absolute; top: 25%; color: rgba(255,255,255,0.8); font-size: 13px;
                text-align: center; font-weight: 500;
            }

            /* 🔥 IDLE HINT */
            .swipe-idle-hint {
                position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);
                color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500;
                opacity: 0; transition: opacity 0.3s ease; z-index: 3;
            }
            .swipe-idle-hint.show { opacity: 1; }
            @keyframes idleWiggle {
                0%,100% { transform: translate3d(0,0,0) rotate(0deg); }
                25% { transform: translate3d(0,0,0) rotate(2deg); }
                75% { transform: translate3d(0,0,0) rotate(-2deg); }
            }
            .swipe-card.wiggle { animation: idleWiggle 1.5s ease-in-out 2; }
        `;
        document.head.appendChild(s);
    }

    buildScene() {
        const container = document.getElementById('swipeContainer');
        if (!container) return;
        container.innerHTML = '';
        container.style.cssText = 'position:fixed;inset:0;overflow:hidden;';
        this.scene = container;
        this.bgLayer = document.createElement('div'); this.bgLayer.className = 'swipe-bg'; this.scene.appendChild(this.bgLayer);
        this.glowLayer = document.createElement('div'); this.glowLayer.className = 'swipe-bg-glow'; this.scene.appendChild(this.glowLayer);
        this.stackContainer = document.createElement('div'); this.stackContainer.className = 'swipe-stack'; this.scene.appendChild(this.stackContainer);
        this.flashEl = document.createElement('div'); this.flashEl.className = 'swipe-flash'; this.scene.appendChild(this.flashEl);
        this.pulseEl = document.createElement('div'); this.pulseEl.className = 'swipe-pulse'; this.scene.appendChild(this.pulseEl);
        const dock = document.createElement('div'); dock.className = 'swipe-dock';
        dock.innerHTML = `<button class="swipe-dock-btn nope-btn" onclick="Swipe.reject()"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><button class="swipe-dock-btn like-btn" onclick="Swipe.like()"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg></button>`;
        this.scene.appendChild(dock);
    }

    showOnboarding() {
        if (localStorage.getItem('swipe_onboarding_seen')) return;
        const overlay = document.createElement('div');
        overlay.className = 'swipe-onboarding';
        overlay.innerHTML = `
            <div class="swipe-onboarding-text">Свайпай влево — пропустить<br>Свайпай вправо — лайк</div>
            <div class="swipe-onboarding-zones">
                <div class="swipe-onboarding-zone nope">❌ NOPE</div>
                <div class="swipe-onboarding-zone like">❤️ LIKE</div>
            </div>`;
        this.scene.appendChild(overlay);
        this.onboardingOverlay = overlay;

        requestAnimationFrame(() => overlay.classList.add('show'));

        // Анимация карточки
        const card = this.activeCard;
        if (card) {
            card.style.transition = 'transform 0.6s cubic-bezier(0.22,0.61,0.36,1)';
            setTimeout(() => { card.style.transform = 'translate3d(40px,0,0) rotate(8deg)'; }, 200);
            setTimeout(() => { card.style.transform = 'translate3d(0,0,0) rotate(0deg)'; }, 900);
            setTimeout(() => { card.style.transform = 'translate3d(-40px,0,0) rotate(-8deg)'; }, 1300);
            setTimeout(() => { card.style.transform = 'translate3d(0,0,0) rotate(0deg)'; }, 2000);
        }

        setTimeout(() => {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
            localStorage.setItem('swipe_onboarding_seen', 'true');
        }, 2800);
    },

    startIdleTimer() {
        clearTimeout(this._idleTimer);
        this._idleTimer = setTimeout(() => this.showIdleHint(), 18000);
    },

    showIdleHint() {
        if (this.state.is(SwipeState.DRAGGING) || this.state.is(SwipeState.THROWING)) return;
        const card = this.activeCard;
        if (card) {
            card.classList.add('wiggle');
            setTimeout(() => card.classList.remove('wiggle'), 3000);
        }
    },

    resetIdleTimer() {
        clearTimeout(this._idleTimer);
    },

    showCard(data, mode, nextCard, nextNextCard) {
        const anketaMode = (data.mode || mode || 'faceit').toLowerCase();
        const rc = this.RIBBON_COLORS[anketaMode] || this.RIBBON_COLORS.faceit;
        if (data.avatar && data.avatar !== 'null') this.bgLayer.style.backgroundImage = `url(${data.avatar})`;
        this.glowLayer.style.background = `radial-gradient(circle at 50% 30%, ${rc.glow}, transparent 60%)`;
        this.stackContainer.innerHTML = '';
        if (nextNextCard) this.stackContainer.appendChild(this._makeCard(nextNextCard, mode, 'back-2', rc));
        if (nextCard) this.stackContainer.appendChild(this._makeCard(nextCard, mode, 'back-1', rc));
        this.activeCard = this._makeCard(data, mode, 'active', rc);
        this.shadowLayer = this.activeCard.querySelector('.swipe-shadow');
        this.back1 = this.stackContainer.querySelector('.back-1');
        this.back2 = this.stackContainer.querySelector('.back-2');
        this.likeBadge = document.createElement('div'); this.likeBadge.className = 'swipe-badge like'; this.likeBadge.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34FF8A" stroke-width="2.5"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg> LIKE`;
        this.activeCard.appendChild(this.likeBadge);
        this.nopeBadge = document.createElement('div'); this.nopeBadge.className = 'swipe-badge nope'; this.nopeBadge.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4D6D" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> NOPE`;
        this.activeCard.appendChild(this.nopeBadge);
        this.stackContainer.appendChild(this.activeCard);
        this.activeCard.animate([{ transform: 'translate3d(0,16px,0) scale(0.985)', opacity: 0 }, { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }], { duration: 400, easing: 'cubic-bezier(0.22,0.61,0.36,1)' });
        // Показываем онбординг после появления карточки
        setTimeout(() => this.showOnboarding(), 500);
        // Запускаем idle таймер
        this.startIdleTimer();
    },

    _makeCard(data, mode, className, rc) {
        const card = document.createElement('div');
        card.className = `swipe-card ${className}`;
        card.style.setProperty('--ribbon-color', rc.color); card.style.setProperty('--ribbon-bg', rc.bg);
        card.style.backgroundImage = (data.avatar && data.avatar !== 'null') ? `url(${data.avatar})` : '';
        if (!card.style.backgroundImage) card.style.background = 'linear-gradient(150deg, #16161c 0%, #111117 65%, #14141a 100%)';
        const sp = [`<span>${(data.mode || mode || 'faceit').toUpperCase()}</span>`];
        if (data.rank) sp.push(`<span>${data.rank}</span>`);
        if (data.age) sp.push(`<span>${data.age} y.o.</span>`);
        card.innerHTML = `<div class="swipe-ribbon">${(data.mode || mode || 'faceit').toUpperCase()}</div><div class="swipe-text">${data.player_id ? `<div class="swipe-id">ID ${data.player_id}</div>` : ''}<div class="swipe-nick">${data.nick || 'Player'}</div><div class="swipe-stats">${sp.join(' <span class="swipe-sep">•</span> ')}</div>${data.about ? `<div class="swipe-about">${data.about}</div>` : ''}</div>`;
        return card;
    }

    renderTransform(el, x, y, rotate) { el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rotate}deg)`; }
    renderProgress(progress) {
        if (this.back1) {
            this.back1.style.transition = 'none';
            const y1 = 11 - progress * 14;
            const s1 = 0.95 + progress * 0.06;
            this.back1.style.transform = `translate3d(0,${y1}px,0) scale(${s1})`;
            this.back1.style.opacity = 0.48 + progress * 0.3;
        }
        if (this.back2) {
            this.back2.style.transition = 'none';
            const y2 = 22 - progress * 10;
            const s2 = 0.9 + progress * 0.04;
            this.back2.style.transform = `translate3d(0,${y2}px,0) scale(${s2})`;
            this.back2.style.opacity = 0.18 + progress * 0.12;
        }
        const lp = Math.min(Math.max(Swipe.physics.x / 110, 0), 1);
        const np = Math.min(Math.max(-Swipe.physics.x / 110, 0), 1);
        if (this.likeBadge) {
            this.likeBadge.style.opacity = lp;
            const ls = 0.8 + lp * 0.3;
            this.likeBadge.style.transform = `scale(${ls}) rotate(12deg)`;
        }
        if (this.nopeBadge) {
            this.nopeBadge.style.opacity = np;
            const ns = 0.8 + np * 0.3;
            this.nopeBadge.style.transform = `scale(${ns}) rotate(-12deg)`;
        }
    },
    reset() {
        if (this.activeCard) { this.activeCard.style.transform = 'translate3d(0,0,0) rotate(0deg)'; this.activeCard.style.transition = ''; }
        if (this.likeBadge) { this.likeBadge.style.opacity = '0'; this.likeBadge.classList.remove('spring'); }
        if (this.nopeBadge) { this.nopeBadge.style.opacity = '0'; this.nopeBadge.classList.remove('spring'); }
        if (this.back1) { this.back1.style.transition = 'all 0.45s ease'; this.back1.style.transform = 'translate3d(0,11px,0) scale(0.95)'; this.back1.style.opacity = '0.48'; }
        if (this.back2) { this.back2.style.transition = 'all 0.45s ease'; this.back2.style.transform = 'translate3d(0,22px,0) scale(0.9)'; this.back2.style.opacity = '0.18'; }
    }
    fly(el, direction) {
        const p = Swipe.physics;
        const x = direction === 'right' ? 160 : -160;
        const rot = direction === 'right' ? p.throwRotation : -p.throwRotation;
        el.style.transition = `transform ${p.flyDuration}s ${p.flyEasing}, opacity ${p.flyDuration}s ease, filter ${p.flyDuration}s ease`;
        el.style.filter = `blur(${p.throwBlur}px)`; el.style.opacity = '0';
        el.style.transform = `translate3d(${x}%,${direction==='right'?p.throwArcUp:p.throwArcDown}%,0) rotate(${rot}deg) scale(${p.throwScale})`;
    }
    flash(color) { this.flashEl.className = `swipe-flash ${color}`; this.flashEl.style.transition = 'none'; this.flashEl.style.opacity = '1'; requestAnimationFrame(() => { this.flashEl.style.transition = 'opacity 0.15s ease'; this.flashEl.style.opacity = '0'; }); }
    pulse(color) { this.pulseEl.className = `swipe-pulse ${color} fire`; void this.pulseEl.offsetWidth; this.pulseEl.style.animation = 'none'; requestAnimationFrame(() => { this.pulseEl.style.animation = 'pulseFire 0.5s ease-out forwards'; }); }
    showMatchOverlay(avatar) {
        if (this.matchOverlay) this.matchOverlay.remove();
        this.matchOverlay = document.createElement('div');
        this.matchOverlay.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(0,0,0,0.92);';
        this.matchOverlay.innerHTML = `<div style="display:flex;gap:20px;align-items:center;"><div style="width:80px;height:80px;border-radius:50%;background:${avatar?`url(${avatar})`:'linear-gradient(145deg,#1c1c24,#16161c)'};background-size:cover;border:2px solid #FF5500;"></div><div style="font-size:56px;animation:matchHeartPulse 0.8s ease-in-out 3;">❤️</div><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(145deg,#1c1c24,#16161c);border:2px solid #FF5500;"></div></div><div style="font-size:36px;font-weight:800;color:#fff;">IT'S A MATCH!</div><button onclick="this.parentElement.remove();Swipe.next();" style="margin-top:12px;padding:16px 48px;border-radius:999px;border:none;background:#FF5500;color:#fff;font-size:16px;font-weight:600;cursor:pointer;">Продолжить</button>`;
        document.body.appendChild(this.matchOverlay);
        setTimeout(() => { if (this.matchOverlay) { this.matchOverlay.remove(); this.matchOverlay = null; } }, 4000);
    }
}

// ============================================
// CONTROLLER
// ============================================
const Swipe = {
    mode: null, initialized: false,
    current: null, nextCard: null, nextNextCard: null,
    startX: 0, startY: 0, lastPointerX: 0, lastPointerTime: 0,
    touchOffsetY: 0, cardRect: null,
    raf: null, pointerDown: false,
    _idleTimer: null,

    state: new SwipeMachine(),
    physics: new PhysicsEngine(),
    velocity: new VelocityTracker(),
    renderer: new SwipeRenderer(),

    _move: null, _up: null, _cancel: null,

    init(mode) {
        this.mode = mode;
        this.renderer.injectStyles();
        this.renderer.buildScene();
        this._move = (e) => this._handleMove(e);
        this._up = () => this._handleUp();
        this._cancel = () => this._handleCancel();
        this.initialized = true;
    },

    startWithAnketa(anketa, mode) {
        this.mode = (anketa.mode || mode || 'faceit').toLowerCase();
        if (!this.initialized) this.init(this.mode);
        if (this.current) this.nextCard = this.current;
        this.current = anketa;
        this.physics.reset(); this.velocity.reset();
        this.state.set(SwipeState.IDLE);
        this.renderer.showCard(anketa, this.mode, this.nextCard, this.nextNextCard);
        this._bindPointer(); this._showBackArrow();
    },

    _bindPointer() { this.cardRect = null; this.renderer.activeCard.addEventListener('pointerdown', (e) => this._handleDown(e)); },

    _handleDown(e) {
        if (e.target.closest('button')) return;
        this.renderer.resetIdleTimer();
        this.pointerDown = true; this.state.set(SwipeState.DRAGGING);
        this.startX = e.clientX; this.startY = e.clientY;
        this.velocity.reset();
        this.cardRect = this.renderer.activeCard.getBoundingClientRect();
        this.touchOffsetY = this.startY - this.cardRect.top;
        this.renderer.activeCard.style.transition = 'none';
        this.renderer.activeCard.setPointerCapture(e.pointerId);
        window.addEventListener('pointermove', this._move);
        window.addEventListener('pointerup', this._up);
        window.addEventListener('pointercancel', this._cancel);
    },

    _handleMove(e) {
        if (!this.pointerDown) return; e.preventDefault();
        this.physics.setTarget(e.clientX - this.startX, e.clientY - this.startY);
        const now = Date.now(); this.velocity.update(e.clientX, now - this.lastPointerTime);
        this.lastPointerX = e.clientX; this.lastPointerTime = now;
        if (!this.raf) this.raf = requestAnimationFrame(() => this._loop());
    },

    _handleUp() {
        if (!this.pointerDown) return; this.pointerDown = false; this._unbind(); this.cancelRAF();
        if (this.physics.shouldCommit(this.velocity.vx)) this._throw(this.physics.x > 0 ? 'right' : 'left');
        else { this._reset(); this.renderer.startIdleTimer(); }
    },

    _handleCancel() { if (!this.pointerDown) return; this.pointerDown = false; this._unbind(); this.cancelRAF(); this._reset(); },
    _unbind() { window.removeEventListener('pointermove', this._move); window.removeEventListener('pointerup', this._up); window.removeEventListener('pointercancel', this._cancel); },
    cancelRAF() { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; } },

    _loop() {
        this.raf = null;
        const { x, y } = this.physics.update();
        const rotate = (x / window.innerWidth) * 20 + (this.touchOffsetY / this.cardRect.height - 0.5) * 14;
        this.renderer.renderTransform(this.renderer.activeCard, x, y, rotate);
        this.renderer.renderProgress(Math.min(Math.abs(x) / this.physics.threshold, 1));
        if (this.pointerDown || !this.physics.isSettled()) this.raf = requestAnimationFrame(() => this._loop());
    },

    _reset() {
        this.state.set(SwipeState.RESETTING); this.physics.reset(); this.renderer.reset();
        this.renderer.activeCard.style.transition = `transform ${this.physics.snapBackDuration}s cubic-bezier(0.175,0.885,0.32,1.275)`;
        this._haptic('light');
    },

    _throw(direction) {
        this.state.set(SwipeState.THROWING);
        if (direction === 'right') {
            this.renderer.flash('green'); this.renderer.pulse('green');
            if (this.renderer.likeBadge) this.renderer.likeBadge.classList.add('spring');
            this._haptic('medium');
            if (this.current?.player_id && window.Search) Search.likePlayer(this.current.player_id, (data) => { data?.status === 'match' ? this.renderer.showMatchOverlay(this.current?.avatar) : this._toast('👍 Лайк!'); });
        } else {
            this.renderer.flash('red');
            if (this.renderer.nopeBadge) this.renderer.nopeBadge.classList.add('spring');
            this._haptic('light'); this._toast('Пропущено');
        }
        this.renderer.fly(this.renderer.activeCard, direction);
        setTimeout(() => this._finish(), this.physics.flyDuration * 1000 + 50);
    },

    _finish() { if (this.renderer.activeCard) { this.renderer.activeCard.style.filter = ''; } this.next(); },
    next() { this.renderer.resetIdleTimer(); const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id; if (window.Search && id) Search.showNextAnketa(id, this.mode); },
    like() { if (!this.current) return; this.physics.x = this.physics.threshold + 40; this._throw('right'); },
    reject() { if (!this.current) return; this.physics.x = -(this.physics.threshold + 40); this._throw('left'); },

    _haptic(s) { try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(s || 'light'); } catch(e) {} },
    _toast(msg) { const old = document.querySelector('.swipe-toast'); if (old) old.remove(); const t = document.createElement('div'); t.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;z-index:10000;'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 1500); },
    _showBackArrow() { const a = document.querySelector('.back-arrow-swipe'); if (a) a.style.display = 'flex'; },
    _hideBackArrow() { const a = document.querySelector('.back-arrow-swipe'); if (a) a.style.display = 'none'; },
    exitSwipeMode() { this.renderer.resetIdleTimer(); this.cancelRAF(); this._unbind(); this._hideBackArrow(); this.current = null; }
};

window.Swipe = Swipe;
console.log('✅ Swipe v9.0 ONBOARDING + IDLE HINT готов');
