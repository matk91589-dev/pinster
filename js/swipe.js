// ============================================
// SWIPE SYSTEM — Pingster v8.0 (4-LAYER ARCHITECTURE)
// ============================================

console.log('🔥 SWIPE.JS v8.0 4-LAYER ARCHITECTURE');

// ============================================
// LAYER 0: STATE MACHINE
// ============================================
const SwipeState = {
    IDLE: 'idle',
    DRAGGING: 'dragging',
    THROWING: 'throwing',
    RESETTING: 'resetting',
};

class SwipeMachine {
    constructor() {
        this.state = SwipeState.IDLE;
        this.listeners = [];
    }

    set(state) {
        if (this.state === state) return;
        const prev = this.state;
        this.state = state;
        this.listeners.forEach(fn => fn(state, prev));
    }

    is(state) { return this.state === state; }
    on(fn) { this.listeners.push(fn); }
}

// ============================================
// LAYER 1: PURE PHYSICS ENGINE
// ============================================
class PhysicsEngine {
    constructor(config = {}) {
        this.x = 0; this.y = 0;
        this.targetX = 0; this.targetY = 0;
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

    applyResistance(v, max) {
        return v / (1 + Math.abs(v) / max);
    }

    setTarget(dx, dy) {
        this.targetX = this.applyResistance(dx, this.resistanceX);
        this.targetY = this.applyResistance(dy, this.resistanceY);
    }

    update() {
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
        return { x: this.x, y: this.y };
    }

    shouldCommit(velocityX) {
        return Math.abs(velocityX) > this.velocityThreshold ||
               Math.abs(this.x) > this.threshold;
    }

    isSettled() {
        return Math.abs(this.targetX - this.x) < 0.3 &&
               Math.abs(this.targetY - this.y) < 0.3;
    }

    reset() {
        this.x = 0; this.y = 0;
        this.targetX = 0; this.targetY = 0;
    }
}

// ============================================
// LAYER 2: VELOCITY TRACKER
// ============================================
class VelocityTracker {
    constructor(smoothing = 0.25) {
        this.lastX = 0;
        this.vx = 0;
        this.smoothing = smoothing;
    }

    update(x, dt) {
        const raw = (x - this.lastX) / Math.max(dt, 1) * 16.67;
        this.vx += (raw - this.vx) * this.smoothing;
        this.lastX = x;
        return this.vx;
    }

    reset() {
        this.vx = 0;
        this.lastX = 0;
    }
}

// ============================================
// LAYER 3: PURE DOM RENDERER
// ============================================
class SwipeRenderer {
    constructor() {
        this.scene = null;
        this.stackContainer = null;
        this.activeCard = null;
        this.bgLayer = null;
        this.glowLayer = null;
        this.likeBadge = null;
        this.nopeBadge = null;
        this.specular = null;
        this.shadowLayer = null;
        this.tiltLight = null;
        this.back1 = null;
        this.back2 = null;
        this.flashEl = null;
        this.pulseEl = null;
        this.matchOverlay = null;

        this.RIBBON_COLORS = {
            faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.18)' },
            premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.18)' },
            prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.10)' },
            public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.10)' },
        };
    }

    injectStyles() {
        if (document.getElementById('swipe-v8-styles')) return;
        const s = document.createElement('style');
        s.id = 'swipe-v8-styles';
        s.textContent = `
            body { overflow: hidden; }
            #swipeScreen { position: fixed; inset: 0; background: #0a0a0f; overflow: hidden; }
            .swipe-bg { position: fixed; inset: 0; background-size: cover; background-position: center; filter: blur(80px); transform: scale(1.2); opacity: 0.16; transition: background-image 0.6s ease; z-index: 0; }
            .swipe-bg-glow { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
            .swipe-stack { position: absolute; top: 45%; left: 50%; width: 88vw; max-width: 380px; height: 460px; transform: translate(-50%,-50%); perspective: 1400px; transform-style: preserve-3d; contain: strict; isolation: isolate; z-index: 1; }
            .swipe-card { position: absolute; inset: 0; border-radius: 20px; overflow: hidden; background-size: cover; background-position: center 25%; will-change: transform, opacity; transform: translate3d(0,0,0); backface-visibility: hidden; isolation: isolate; }
            .swipe-card.back-2 { transform: translate3d(0,22px,0) scale(0.9); opacity: 0.18; z-index: 0; filter: blur(3px); }
            .swipe-card.back-1 { transform: translate3d(0,11px,0) scale(0.95); opacity: 0.48; z-index: 1; filter: blur(1px); }
            .swipe-card.active { transform: translate3d(0,0,0) scale(1); opacity: 1; z-index: 2; }
            .swipe-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 55%; background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%); z-index: 1; pointer-events: none; }
            .swipe-shadow { position: absolute; inset: -20px; border-radius: 30px; background: rgba(0,0,0,0.35); filter: blur(30px); z-index: -1; opacity: 0.6; pointer-events: none; will-change: opacity; }
            .swipe-ribbon { position: absolute; top: 0; left: 0; z-index: 5; padding: 8px 20px 7px 16px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background: rgba(14,14,20,0.9); color: var(--ribbon-color,#FF5500); clip-path: polygon(0 0, 100% 0, 84% 100%, 0 100%); backdrop-filter: blur(10px); }
            .swipe-text { position: absolute; bottom: 75px; left: 20px; right: 20px; z-index: 3; display: flex; flex-direction: column; gap: 4px; }
            .swipe-id { font-size: 10px; font-weight: 600; color: #FF5500; letter-spacing: 1px; text-transform: uppercase; }
            .swipe-nick { font-size: 28px; font-weight: 800; color: #fff; text-shadow: 0 2px 16px rgba(0,0,0,0.8); letter-spacing: -0.5px; }
            .swipe-stats { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.85); display: flex; gap: 10px; flex-wrap: wrap; }
            .swipe-sep { color: rgba(255,255,255,0.4); font-weight: 700; }
            .swipe-about { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .swipe-specular { position: absolute; inset: 0; z-index: 4; pointer-events: none; background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.14) 48%, transparent 72%); opacity: 0; mix-blend-mode: screen; }
            .swipe-tilt-light { position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: 0; mix-blend-mode: soft-light; }
            .swipe-badge { position: absolute; top: 50px; padding: 10px 18px; border-radius: 14px; font-size: 28px; font-weight: 800; z-index: 10; opacity: 0; pointer-events: none; backdrop-filter: blur(14px); box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15); display: flex; align-items: center; gap: 6px; transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
            .swipe-badge.like { right: 24px; border: 2px solid #34FF8A; color: #34FF8A; background: rgba(52,255,138,0.1); transform: rotate(12deg); }
            .swipe-badge.nope { left: 24px; border: 2px solid #FF4D6D; color: #FF4D6D; background: rgba(255,77,109,0.1); transform: rotate(-12deg); }
            .swipe-badge.spring { transform: scale(1.25) !important; }
            .swipe-dock { position: fixed; bottom: 36px; left: 50%; transform: translateX(-50%); display: flex; gap: 24px; padding: 14px 28px; border-radius: 999px; background: rgba(20,20,28,0.9); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 10px 30px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08), inset 0 -1px 0 rgba(0,0,0,.4); z-index: 20; }
            .swipe-dock-btn { width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; background: transparent; }
            .swipe-dock-btn:active { transform: scale(0.85); }
            .swipe-dock-btn.nope-btn { color: rgba(255,255,255,0.5); }
            .swipe-dock-btn.like-btn { color: #FF5500; }
            .swipe-flash { position: fixed; inset: 0; z-index: 50; pointer-events: none; opacity: 0; }
            .swipe-flash.green { background: rgba(52,255,138,0.12); }
            .swipe-flash.red { background: rgba(255,77,109,0.1); }
            .swipe-pulse { position: fixed; top: 50%; left: 50%; width: 180px; height: 180px; border-radius: 50%; z-index: 45; pointer-events: none; opacity: 0; transform: translate(-50%,-50%) scale(0); }
            .swipe-pulse.green { border: 2px solid rgba(52,255,138,0.6); }
            .swipe-pulse.red { border: 2px solid rgba(255,77,109,0.5); }
            .swipe-pulse.fire { animation: pulseFire 0.5s ease-out forwards; }
            @keyframes pulseFire { 0% { transform: translate(-50%,-50%) scale(0.4); opacity: 0.8; } 100% { transform: translate(-50%,-50%) scale(2); opacity: 0; } }
            .swipe-grain { position: fixed; inset: 0; z-index: 5; pointer-events: none; opacity: 0.035; mix-blend-mode: overlay; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
            .back-arrow-swipe { z-index: 30; }
            @keyframes matchHeartPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
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
        const grain = document.createElement('div'); grain.className = 'swipe-grain'; this.scene.appendChild(grain);
        this.flashEl = document.createElement('div'); this.flashEl.className = 'swipe-flash'; this.scene.appendChild(this.flashEl);
        this.pulseEl = document.createElement('div'); this.pulseEl.className = 'swipe-pulse'; this.scene.appendChild(this.pulseEl);
        const dock = document.createElement('div'); dock.className = 'swipe-dock';
        dock.innerHTML = `<button class="swipe-dock-btn nope-btn" onclick="SwipeController.reject()"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><button class="swipe-dock-btn like-btn" onclick="SwipeController.like()"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg></button>`;
        this.scene.appendChild(dock);
    }

    renderTransform(el, x, y, rotate) {
        el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rotate}deg)`;
    }

    renderProgress(progress) {
        if (this.shadowLayer) this.shadowLayer.style.opacity = 0.6 + progress * 0.35;
        if (this.specular) { this.specular.style.opacity = progress * 0.75; this.specular.style.transform = `translateX(${SwipeController.physics.x * 0.1}px)`; }
        if (this.tiltLight) { this.tiltLight.style.opacity = 0.3 + progress * 0.4; this.tiltLight.style.background = `radial-gradient(circle at ${50 + SwipeController.physics.x * 0.05}% ${30 + SwipeController.physics.y * 0.05}%, rgba(255,255,255,0.14), transparent 40%)`; }
        if (this.back1) { this.back1.style.transition = 'none'; this.back1.style.transform = `translate3d(0,${11 - progress * 14}px,0) scale(${0.95 + progress * 0.06})`; this.back1.style.opacity = 0.48 + progress * 0.3; }
        if (this.back2) { this.back2.style.transition = 'none'; this.back2.style.transform = `translate3d(0,${22 - progress * 10}px,0) scale(${0.90 + progress * 0.04})`; this.back2.style.opacity = 0.18 + progress * 0.12; }
        const glowX = 50 + SwipeController.physics.x / 12;
        const rc = this.RIBBON_COLORS[SwipeController.mode] || this.RIBBON_COLORS.faceit;
        this.glowLayer.style.background = `radial-gradient(circle at ${glowX}% 35%, ${rc.glow}, transparent 60%)`;
        const lp = Math.min(Math.max(SwipeController.physics.x / 110, 0), 1);
        const np = Math.min(Math.max(-SwipeController.physics.x / 110, 0), 1);
        if (this.likeBadge) { this.likeBadge.style.opacity = lp; this.likeBadge.style.transform = `scale(${0.8 + lp * 0.3}) rotate(12deg)`; }
        if (this.nopeBadge) { this.nopeBadge.style.opacity = np; this.nopeBadge.style.transform = `scale(${0.8 + np * 0.3}) rotate(-12deg)`; }
        this.bgLayer.style.opacity = Math.min(0.16 + progress * 0.3, 0.45);
    }

    reset(el) {
        el.style.transform = 'translate3d(0,0,0) rotate(0deg)';
        el.style.transition = '';
        el.style.filter = '';
        if (this.likeBadge) { this.likeBadge.style.opacity = '0'; this.likeBadge.style.transform = 'scale(0.8) rotate(12deg)'; this.likeBadge.classList.remove('spring'); }
        if (this.nopeBadge) { this.nopeBadge.style.opacity = '0'; this.nopeBadge.style.transform = 'scale(0.8) rotate(-12deg)'; this.nopeBadge.classList.remove('spring'); }
        if (this.specular) this.specular.style.opacity = '0';
        if (this.shadowLayer) this.shadowLayer.style.opacity = '0.6';
        this.bgLayer.style.opacity = '0.16';
        const rc = this.RIBBON_COLORS[SwipeController.mode] || this.RIBBON_COLORS.faceit;
        this.glowLayer.style.background = `radial-gradient(circle at 50% 30%, ${rc.glow}, transparent 60%)`;
        if (this.back1) { this.back1.style.transition = 'all 0.45s ease'; this.back1.style.transform = 'translate3d(0,11px,0) scale(0.95)'; this.back1.style.opacity = '0.48'; }
        if (this.back2) { this.back2.style.transition = 'all 0.45s ease'; this.back2.style.transform = 'translate3d(0,22px,0) scale(0.9)'; this.back2.style.opacity = '0.18'; }
    }

    fly(el, direction) {
        const p = SwipeController.physics;
        const x = direction === 'right' ? 160 : -160;
        const y = direction === 'right' ? p.throwArcUp : p.throwArcDown;
        const rot = direction === 'right' ? p.throwRotation : -p.throwRotation;
        el.style.transition = `transform ${p.flyDuration}s ${p.flyEasing}, opacity ${p.flyDuration}s ease, filter ${p.flyDuration}s ease`;
        el.style.filter = `blur(${p.throwBlur}px)`;
        el.style.opacity = '0';
        el.style.transform = `translate3d(${x}%,${y}%,0) rotate(${rot}deg) scale(${p.throwScale})`;
        this.bgLayer.style.opacity = '0';
    }

    flash(color) {
        this.flashEl.className = `swipe-flash ${color}`;
        this.flashEl.style.transition = 'none'; this.flashEl.style.opacity = '1';
        requestAnimationFrame(() => { this.flashEl.style.transition = 'opacity 0.15s ease'; this.flashEl.style.opacity = '0'; });
    }

    pulse(color) {
        this.pulseEl.className = `swipe-pulse ${color} fire`;
        void this.pulseEl.offsetWidth;
        this.pulseEl.style.animation = 'none';
        requestAnimationFrame(() => { this.pulseEl.style.animation = 'pulseFire 0.5s ease-out forwards'; });
    }

    showCard(data, mode, nextCard, nextNextCard) {
        const anketaMode = (data.mode || mode || 'faceit').toLowerCase();
        const rc = this.RIBBON_COLORS[anketaMode] || this.RIBBON_COLORS.faceit;
        if (data.avatar && data.avatar !== 'null') this.bgLayer.style.backgroundImage = `url(${data.avatar})`;
        this.glowLayer.style.background = `radial-gradient(circle at 50% 30%, ${rc.glow}, transparent 60%)`;
        this.stackContainer.innerHTML = '';
        if (nextNextCard) this.stackContainer.appendChild(this._makeCard(nextNextCard, mode, 'back-2', rc));
        if (nextCard) this.stackContainer.appendChild(this._makeCard(nextCard, mode, 'back-1', rc));
        this.activeCard = this._makeCard(data, mode, 'active', rc);
        this.specular = this.activeCard.querySelector('.swipe-specular');
        this.shadowLayer = this.activeCard.querySelector('.swipe-shadow');
        this.tiltLight = this.activeCard.querySelector('.swipe-tilt-light');
        this.back1 = this.stackContainer.querySelector('.back-1');
        this.back2 = this.stackContainer.querySelector('.back-2');
        this.likeBadge = document.createElement('div'); this.likeBadge.className = 'swipe-badge like';
        this.likeBadge.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34FF8A" stroke-width="2.5"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg> LIKE`;
        this.activeCard.appendChild(this.likeBadge);
        this.nopeBadge = document.createElement('div'); this.nopeBadge.className = 'swipe-badge nope';
        this.nopeBadge.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4D6D" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> NOPE`;
        this.activeCard.appendChild(this.nopeBadge);
        this.stackContainer.appendChild(this.activeCard);
        this.activeCard.animate([{ transform: 'translate3d(0,20px,0) scale(0.94)', opacity: 0 }, { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(0.22,1,0.36,1)' });
    }

    _makeCard(data, mode, className, rc) {
        const card = document.createElement('div');
        card.className = `swipe-card ${className}`;
        card.style.setProperty('--ribbon-color', rc.color);
        card.style.backgroundImage = (data.avatar && data.avatar !== 'null') ? `url(${data.avatar})` : 'linear-gradient(160deg, #1c1c26, #14141c)';
        const sp = [`<span>${(data.mode || mode || 'faceit').toUpperCase()}</span>`];
        if (data.rank) sp.push(`<span>${data.rank}</span>`);
        if (data.age) sp.push(`<span>${data.age} y.o.</span>`);
        card.innerHTML = `<div class="swipe-shadow"></div><div class="swipe-ribbon">${(data.mode || mode || 'faceit').toUpperCase()}</div><div class="swipe-specular"></div><div class="swipe-tilt-light"></div><div class="swipe-text">${data.player_id ? `<div class="swipe-id">ID ${data.player_id}</div>` : ''}<div class="swipe-nick">${data.nick || 'Player'}</div><div class="swipe-stats">${sp.join(' <span class="swipe-sep">•</span> ')}</div>${data.about ? `<div class="swipe-about">${data.about}</div>` : ''}</div>`;
        return card;
    }

    showMatchOverlay(avatar) {
        if (this.matchOverlay) this.matchOverlay.remove();
        this.matchOverlay = document.createElement('div');
        this.matchOverlay.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(0,0,0,0.92);backdrop-filter:blur(20px);';
        this.matchOverlay.innerHTML = `<div style="display:flex;gap:20px;align-items:center;"><div style="width:80px;height:80px;border-radius:50%;background:${avatar ? `url(${avatar})` : 'linear-gradient(145deg,#1c1c24,#16161c)'};background-size:cover;border:2px solid #FF5500;"></div><div style="font-size:56px;animation:matchHeartPulse 0.8s ease-in-out 3;">❤️</div><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(145deg,#1c1c24,#16161c);border:2px solid #FF5500;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;">?</div></div><div style="font-size:36px;font-weight:800;color:#fff;">IT'S A MATCH!</div><div style="font-size:14px;color:rgba(255,255,255,0.5);">Вы понравились друг другу</div><button onclick="this.parentElement.remove();SwipeController.next();" style="margin-top:12px;padding:16px 48px;border-radius:999px;border:none;background:#FF5500;color:#fff;font-size:16px;font-weight:600;cursor:pointer;">Продолжить</button>`;
        document.body.appendChild(this.matchOverlay);
        setTimeout(() => { if (this.matchOverlay) { this.matchOverlay.remove(); this.matchOverlay = null; } }, 4000);
    }
}

// ============================================
// LAYER 4: CONTROLLER
// ============================================
const SwipeController = {
    mode: null, initialized: false,
    current: null, nextCard: null, nextNextCard: null,
    startX: 0, startY: 0, lastPointerX: 0, lastPointerTime: 0,
    touchOffsetY: 0, cardRect: null,
    raf: null,
    pointerDown: false,

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
        this.state.on((s, prev) => { /* optional logging */ });
        this.initialized = true;
    },

    startWithAnketa(anketa, mode) {
        this.mode = (anketa.mode || mode || 'faceit').toLowerCase();
        if (!this.initialized) this.init(this.mode);
        if (this.current) this.nextCard = this.current;
        this.current = anketa;
        this.physics.reset();
        this.velocity.reset();
        this.state.set(SwipeState.IDLE);
        this.renderer.showCard(anketa, this.mode, this.nextCard, this.nextNextCard);
        this._bindPointer();
        this._showBackArrow();
    },

    _bindPointer() {
        this.cardRect = null;
        this.renderer.activeCard.addEventListener('pointerdown', (e) => this._handleDown(e));
    },

    _handleDown(e) {
        if (e.target.closest('button')) return;
        this.pointerDown = true;
        this.state.set(SwipeState.DRAGGING);
        this.startX = e.clientX; this.startY = e.clientY;
        this.lastPointerX = e.clientX; this.lastPointerTime = Date.now();
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
        if (!this.pointerDown) return;
        e.preventDefault();
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        this.physics.setTarget(dx, dy);
        const now = Date.now();
        this.velocity.update(e.clientX, now - this.lastPointerTime);
        this.lastPointerX = e.clientX;
        this.lastPointerTime = now;
        if (!this.raf) this.raf = requestAnimationFrame(() => this._loop());
    },

    _handleUp() {
        if (!this.pointerDown) return;
        this.pointerDown = false;
        this._unbind();
        this.cancelRAF();
        if (this.physics.shouldCommit(this.velocity.vx)) {
            this._throw(this.physics.x > 0 ? 'right' : 'left');
        } else {
            this._reset();
        }
    },

    _handleCancel() {
        if (!this.pointerDown) return;
        this.pointerDown = false;
        this._unbind();
        this.cancelRAF();
        this._reset();
    },

    _unbind() {
        window.removeEventListener('pointermove', this._move);
        window.removeEventListener('pointerup', this._up);
        window.removeEventListener('pointercancel', this._cancel);
    },

    cancelRAF() { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; } },

    _loop() {
        this.raf = null;
        const { x, y } = this.physics.update();
        const rotate = (x / window.innerWidth) * 20 + (this.touchOffsetY / this.cardRect.height - 0.5) * 14;
        this.renderer.renderTransform(this.renderer.activeCard, x, y, rotate);
        const progress = Math.min(Math.abs(x) / this.physics.threshold, 1);
        this.renderer.renderProgress(progress);
        if (this.pointerDown || !this.physics.isSettled()) {
            this.raf = requestAnimationFrame(() => this._loop());
        }
    },

    _reset() {
        this.state.set(SwipeState.RESETTING);
        this.physics.reset();
        this.renderer.reset(this.renderer.activeCard);
        this.renderer.activeCard.style.transition = `transform ${this.physics.snapBackDuration}s cubic-bezier(0.175,0.885,0.32,1.275)`;
        this._haptic('light');
    },

    _throw(direction) {
        this.state.set(SwipeState.THROWING);
        if (direction === 'right') {
            this.renderer.flash('green');
            this.renderer.pulse('green');
            if (this.renderer.likeBadge) this.renderer.likeBadge.classList.add('spring');
            this._haptic('medium');
            if (this.current?.player_id && window.Search) {
                Search.likePlayer(this.current.player_id, (data) => {
                    data?.status === 'match' ? this.renderer.showMatchOverlay(this.current?.avatar) : this._toast('👍 Лайк!');
                });
            }
        } else {
            this.renderer.flash('red');
            if (this.renderer.nopeBadge) this.renderer.nopeBadge.classList.add('spring');
            this._haptic('light');
            this._toast('Пропущено');
        }
        this.renderer.fly(this.renderer.activeCard, direction);
        setTimeout(() => { this._finish(); }, this.physics.flyDuration * 1000 + 50);
    },

    _finish() {
        if (this.renderer.activeCard) {
            this.renderer.activeCard.style.filter = '';
            this.renderer.activeCard.style.transition = '';
        }
        this.next();
    },

    next() {
        const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (window.Search && id) Search.showNextAnketa(id, this.mode);
    },

    like() { if (!this.current) return; this.physics.x = this.physics.threshold + 40; this._throw('right'); },
    reject() { if (!this.current) return; this.physics.x = -(this.physics.threshold + 40); this._throw('left'); },

    _haptic(s) { try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(s || 'light'); } catch(e) {} },
    _toast(msg) {
        const old = document.querySelector('.swipe-toast'); if (old) old.remove();
        const t = document.createElement('div'); t.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;z-index:10000;'; t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 1500);
    },

    _showBackArrow() { const a = document.querySelector('.back-arrow-swipe'); if (a) a.style.display = 'flex'; },
    _hideBackArrow() { const a = document.querySelector('.back-arrow-swipe'); if (a) a.style.display = 'none'; },
    exitSwipeMode() { this.cancelRAF(); this._unbind(); this._hideBackArrow(); this.current = null; }
};

// ============================================
// PUBLIC API
// ============================================
window.Swipe = SwipeController;
console.log('✅ Swipe v8.0 4-LAYER ARCHITECTURE готов');
