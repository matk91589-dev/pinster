// ============================================
// SWIPE RENDERER — DOM + Styles + Animations
// ============================================
console.log('🔥 SWIPE-RENDERER загружен');

var SwipeRenderer = function() {
    this.scene = null;
    this.stackContainer = null;
    this.activeCard = null;
    this.bgLayer = null;
    this.glowLayer = null;
    this.likeBadge = null;
    this.nopeBadge = null;
    this.back1 = null;
    this.back2 = null;
    this.flashEl = null;
    this.pulseEl = null;

    this.RIBBON_COLORS = {
        faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' },
        public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' }
    };
};

SwipeRenderer.prototype.injectStyles = function() {
    if (document.getElementById('swipe-v10-styles')) return;
    var s = document.createElement('style');
    s.id = 'swipe-v10-styles';
    s.textContent = '';
    s.textContent += '#swipeScreen{position:fixed;inset:0;background:#0a0a0f;overflow:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}';
    s.textContent += '.swipe-bg{position:fixed;inset:0;background-size:cover;background-position:center;filter:blur(80px);transform:scale(1.2);opacity:0.16;transition:background-image 0.6s ease;z-index:0}';
    s.textContent += '.swipe-bg-glow{position:fixed;inset:0;z-index:0;pointer-events:none;transition:opacity 0.3s ease}';
    s.textContent += '.swipe-bg-glow.anticipating{opacity:1.4!important}';
    s.textContent += '.swipe-stack{position:absolute;top:50%;left:50%;width:88vw;max-width:380px;height:460px;max-height:calc(100vh-180px);transform:translate(-50%,-50%);perspective:1400px;transform-style:preserve-3d;contain:layout paint style;isolation:isolate;z-index:1}';
    s.textContent += '.swipe-card{position:absolute;inset:0;border-radius:18px;overflow:hidden;background-color:#0a0a0f;background-size:cover;background-position:center 20%;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.06);will-change:transform;transform:translate3d(0,0,0);backface-visibility:hidden;touch-action:none}';
    s.textContent += '.swipe-card.back-2{transform:translate3d(0,22px,0) scale(0.9);opacity:0.18;z-index:0;filter:blur(3px)}';
    s.textContent += '.swipe-card.back-1{transform:translate3d(0,11px,0) scale(0.95);opacity:0.48;z-index:1;filter:blur(1px)}';
    s.textContent += '.swipe-card.active{transform:translate3d(0,0,0) scale(1);opacity:1;z-index:2}';
    s.textContent += '.swipe-card.decision-snap{transition:transform 0.08s ease!important}';
    s.textContent += '.swipe-card.filled::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:65%;background:linear-gradient(to top,rgba(0,0,0,0.98) 0%,rgba(0,0,0,0.85) 50%,transparent 100%);z-index:1;pointer-events:none}';
    s.textContent += '.swipe-ribbon{position:absolute;top:0;left:0;z-index:5;padding:7px 18px 6px 14px;font-size:11px;font-weight:700;text-transform:uppercase;background:var(--ribbon-bg,rgba(18,18,24,0.92));color:var(--ribbon-color,#FF5500);border-radius:18px 0 10px 0;border-bottom:1px solid var(--ribbon-color,#FF5500);border-right:1px solid var(--ribbon-color,#FF5500)}';
    s.textContent += '.swipe-text{position:relative;z-index:2;display:flex;flex-direction:column;align-items:flex-start;gap:3px;margin-bottom:56px;width:100%}';
    s.textContent += '.swipe-id{font-size:10px;font-weight:600;color:#FF5500;text-transform:uppercase}';
    s.textContent += '.swipe-nick{font-size:28px;font-weight:800;color:#FFF;text-shadow:0 2px 12px rgba(0,0,0,0.7)}';
    s.textContent += '.swipe-stats{font-size:14px;color:#FFF;display:flex;gap:10px;flex-wrap:wrap}';
    s.textContent += '.swipe-sep{color:rgba(255,255,255,0.6)}';
    s.textContent += '.swipe-about{font-size:14px;color:#FFF;line-height:1.5}';
    s.textContent += '.swipe-badge{position:absolute;top:50px;padding:10px 18px;border-radius:14px;font-size:28px;font-weight:800;z-index:10;opacity:0;pointer-events:none;display:flex;align-items:center;gap:6px}';
    s.textContent += '.swipe-badge.like{right:24px;border:2px solid #34FF8A;color:#34FF8A;background:rgba(52,255,138,0.15);transform:rotate(12deg)}';
    s.textContent += '.swipe-badge.nope{left:24px;border:2px solid #FF4D6D;color:#FF4D6D;background:rgba(255,77,109,0.15);transform:rotate(-12deg)}';
    s.textContent += '.swipe-dock{position:fixed;bottom:max(36px,env(safe-area-inset-bottom,20px));left:50%;transform:translateX(-50%);display:flex;gap:24px;padding:14px 28px;border-radius:999px;background:rgba(20,20,28,0.9);border:1px solid rgba(255,255,255,0.06);z-index:20}';
    s.textContent += '.swipe-dock-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:transparent;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;opacity:0.7}';
    s.textContent += '.swipe-dock-btn:active{transform:scale(0.85);opacity:1}';
    s.textContent += '.swipe-dock-btn.nope-btn{color:rgba(255,255,255,0.5)}';
    s.textContent += '.swipe-dock-btn.nope-btn:active{color:#FF4D6D}';
    s.textContent += '.swipe-dock-btn.like-btn{color:#FF5500}';
    s.textContent += '.swipe-dock-btn.like-btn:active{color:#34FF8A}';
    s.textContent += '.swipe-dock-btn.decision-active{opacity:1!important;transform:scale(1.1)!important}';
    s.textContent += '.swipe-flash{position:fixed;inset:0;z-index:50;pointer-events:none;opacity:0}';
    s.textContent += '.swipe-pulse{position:fixed;top:50%;left:50%;width:180px;height:180px;border-radius:50%;z-index:45;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(0)}';
    s.textContent += '.swipe-pulse.fire{animation:pulseFire 0.5s ease-out forwards}';
    s.textContent += '@keyframes pulseFire{0%{transform:translate(-50%,-50%) scale(0.4);opacity:0.8}100%{transform:translate(-50%,-50%) scale(2);opacity:0}}';
    s.textContent += '.back-arrow-swipe{z-index:30;position:absolute;top:max(16px,env(safe-area-inset-top,0px) + 16px);left:16px}';
    document.head.appendChild(s);
};

SwipeRenderer.prototype.buildScene = function() {
    var container = document.getElementById('swipeContainer');
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText = 'position:fixed;inset:0;overflow:hidden;';
    this.scene = container;

    this.bgLayer = document.createElement('div');
    this.bgLayer.className = 'swipe-bg';
    this.scene.appendChild(this.bgLayer);

    this.glowLayer = document.createElement('div');
    this.glowLayer.className = 'swipe-bg-glow';
    this.scene.appendChild(this.glowLayer);

    this.stackContainer = document.createElement('div');
    this.stackContainer.className = 'swipe-stack';
    this.scene.appendChild(this.stackContainer);

    this.flashEl = document.createElement('div');
    this.flashEl.className = 'swipe-flash';
    this.scene.appendChild(this.flashEl);

    this.pulseEl = document.createElement('div');
    this.pulseEl.className = 'swipe-pulse';
    this.scene.appendChild(this.pulseEl);

    var dock = document.createElement('div');
    dock.className = 'swipe-dock';
    dock.innerHTML = '<button class="swipe-dock-btn nope-btn" onclick="Swipe.reject()"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><button class="swipe-dock-btn like-btn" onclick="Swipe.like()"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg></button>';
    this.scene.appendChild(dock);
};

SwipeRenderer.prototype.showCard = function(data, mode, nextCard, nextNextCard) {
    var anketaMode = (data.mode || mode || 'faceit').toLowerCase();
    var rc = this.RIBBON_COLORS[anketaMode] || this.RIBBON_COLORS.faceit;

    if (data.avatar && data.avatar !== 'null') {
        this.bgLayer.style.backgroundImage = 'url(' + data.avatar + ')';
    }
    this.glowLayer.style.background = 'radial-gradient(circle at 50% 30%, ' + rc.glow + ', transparent 60%)';
    this.stackContainer.innerHTML = '';

    if (nextNextCard) {
        this.stackContainer.appendChild(this.makeCardElement(nextNextCard, mode, 'back-2', rc));
    }
    if (nextCard) {
        this.stackContainer.appendChild(this.makeCardElement(nextCard, mode, 'back-1', rc));
    }

    this.activeCard = this.makeCardElement(data, mode, 'active', rc);
    this.back1 = this.stackContainer.querySelector('.back-1');
    this.back2 = this.stackContainer.querySelector('.back-2');

    this.likeBadge = document.createElement('div');
    this.likeBadge.className = 'swipe-badge like';
    this.likeBadge.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34FF8A" stroke-width="2.5"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg> LIKE';
    this.activeCard.appendChild(this.likeBadge);

    this.nopeBadge = document.createElement('div');
    this.nopeBadge.className = 'swipe-badge nope';
    this.nopeBadge.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4D6D" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> NOPE';
    this.activeCard.appendChild(this.nopeBadge);

    this.stackContainer.appendChild(this.activeCard);

    this.activeCard.animate([
        { transform: 'translate3d(0,16px,0) scale(0.985)', opacity: 0 },
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }
    ], {
        duration: 400,
        easing: 'cubic-bezier(0.22,0.61,0.36,1)'
    });
};

SwipeRenderer.prototype.makeCardElement = function(data, mode, className, rc) {
    var card = document.createElement('div');
    card.className = 'swipe-card ' + className;
    card.style.setProperty('--ribbon-color', rc.color);
    card.style.setProperty('--ribbon-bg', rc.bg);

    if (data.avatar && data.avatar !== 'null') {
        card.style.backgroundImage = 'url(' + data.avatar + ')';
    } else {
        card.style.background = 'linear-gradient(150deg, #16161c 0%, #111117 65%, #14141a 100%)';
    }

    var sp = [];
    sp.push('<span>' + (data.mode || mode || 'faceit').toUpperCase() + '</span>');
    if (data.rank) sp.push('<span>' + data.rank + '</span>');
    if (data.age) sp.push('<span>' + data.age + ' y.o.</span>');

    var html = '';
    html += '<div class="swipe-ribbon">' + (data.mode || mode || 'faceit').toUpperCase() + '</div>';
    html += '<div class="swipe-text">';
    if (data.player_id) html += '<div class="swipe-id">ID ' + data.player_id + '</div>';
    html += '<div class="swipe-nick">' + (data.nick || 'Player') + '</div>';
    html += '<div class="swipe-stats">' + sp.join(' <span class="swipe-sep">•</span> ') + '</div>';
    if (data.about) html += '<div class="swipe-about">' + data.about + '</div>';
    html += '</div>';

    card.innerHTML = html;
    return card;
};

SwipeRenderer.prototype.renderTransform = function(el, x, y, rotate) {
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + rotate + 'deg)';
};

SwipeRenderer.prototype.renderProgress = function(progress, physicsX) {
    var self = this;

    if (self.back1) {
        self.back1.style.transition = 'none';
        var y1 = 11 - progress * 16;
        var s1 = 0.95 + progress * 0.06;
        var r1 = progress * 2 * (physicsX > 0 ? 1 : -1);
        self.back1.style.transform = 'translate3d(' + (progress * 8) + 'px,' + y1 + 'px,0) scale(' + s1 + ') rotate(' + r1 + 'deg)';
        self.back1.style.opacity = 0.48 + progress * 0.35;
    }
    if (self.back2) {
        self.back2.style.transition = 'none';
        var y2 = 22 - progress * 12;
        var s2 = 0.9 + progress * 0.04;
        var r2 = progress * 1.5 * (physicsX > 0 ? 1 : -1);
        self.back2.style.transform = 'translate3d(' + (progress * 4) + 'px,' + y2 + 'px,0) scale(' + s2 + ') rotate(' + r2 + 'deg)';
        self.back2.style.opacity = 0.18 + progress * 0.15;
    }

    var lp = Math.min(Math.max(physicsX / 110, 0), 1);
    var np = Math.min(Math.max(-physicsX / 110, 0), 1);
    if (self.likeBadge) {
        self.likeBadge.style.opacity = lp;
        self.likeBadge.style.transform = 'scale(' + (0.8 + lp * 0.3) + ') rotate(12deg)';
    }
    if (self.nopeBadge) {
        self.nopeBadge.style.opacity = np;
        self.nopeBadge.style.transform = 'scale(' + (0.8 + np * 0.3) + ') rotate(-12deg)';
    }
};

SwipeRenderer.prototype.reset = function() {
    if (this.activeCard) {
        this.activeCard.style.transform = 'translate3d(0,0,0) rotate(0deg)';
        this.activeCard.style.transition = '';
    }
    if (this.likeBadge) { this.likeBadge.style.opacity = '0'; this.likeBadge.classList.remove('spring'); }
    if (this.nopeBadge) { this.nopeBadge.style.opacity = '0'; this.nopeBadge.classList.remove('spring'); }
    if (this.back1) {
        this.back1.style.transition = 'all 0.45s ease';
        this.back1.style.transform = 'translate3d(0,11px,0) scale(0.95) rotate(0deg)';
        this.back1.style.opacity = '0.48';
    }
    if (this.back2) {
        this.back2.style.transition = 'all 0.45s ease';
        this.back2.style.transform = 'translate3d(0,22px,0) scale(0.9) rotate(0deg)';
        this.back2.style.opacity = '0.18';
    }
    this.glowLayer.classList.remove('anticipating');
    var dock = this.scene.querySelector('.swipe-dock');
    if (dock) {
        var likeBtn = dock.querySelector('.like-btn');
        var nopeBtn = dock.querySelector('.nope-btn');
        if (likeBtn) likeBtn.classList.remove('decision-active');
        if (nopeBtn) nopeBtn.classList.remove('decision-active');
    }
};

SwipeRenderer.prototype.fly = function(el, direction, physics) {
    var p = physics;
    var x = direction === 'right' ? 160 : -160;
    var y = direction === 'right' ? p.throwArcUp : p.throwArcDown;
    var rot = direction === 'right' ? p.throwRotation : -p.throwRotation;
    el.style.transition = 'transform ' + p.flyDuration + 's ' + p.flyEasing + ', opacity ' + p.flyDuration + 's ease, filter ' + p.flyDuration + 's ease';
    el.style.filter = 'blur(' + p.throwBlur + 'px)';
    el.style.opacity = '0';
    el.style.transform = 'translate3d(' + x + '%,' + y + '%,0) rotate(' + rot + 'deg) scale(' + p.throwScale + ')';
};

SwipeRenderer.prototype.flash = function(color) {
    this.flashEl.className = 'swipe-flash ' + color;
    this.flashEl.style.transition = 'none';
    this.flashEl.style.opacity = '1';
    var el = this.flashEl;
    requestAnimationFrame(function() {
        el.style.transition = 'opacity 0.15s ease';
        el.style.opacity = '0';
    });
};

SwipeRenderer.prototype.pulse = function(color) {
    this.pulseEl.className = 'swipe-pulse ' + color + ' fire';
    void this.pulseEl.offsetWidth;
    this.pulseEl.style.animation = 'none';
    var el = this.pulseEl;
    requestAnimationFrame(function() {
        el.style.animation = 'pulseFire 0.5s ease-out forwards';
    });
};

console.log('✅ SWIPE-RENDERER готов');
