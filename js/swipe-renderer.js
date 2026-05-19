// ============================================
// SWIPE RENDERER — v8 CENTERED VIEWPORT
// ============================================
console.log('🔥 SWIPE-RENDERER v8 загружен');

var SwipeRenderer = function() {
    this.scene = null;
    this.stackContainer = null;
    this.activeCard = null;
    this.bgLayer = null;
    this.glowLayer = null;
    this.likeBadge = null;
    this.skipBadge = null;
    this.back1 = null;
    this.back2 = null;
    this.flashEl = null;
    this.pulseEl = null;
    this.cardWrapper = null;
    this.skipBtn = null;
    this.likeBtn = null;

    this.RIBBON_COLORS = {
        faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' },
        public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' }
    };
};

SwipeRenderer.prototype.injectStyles = function() {
    if (document.getElementById('swipe-v19-styles')) return;
    var s = document.createElement('style');
    s.id = 'swipe-v19-styles';
    s.textContent = '';

    // === VIEWPORT ===
    s.textContent += ':root{--tg-height:100vh}';
    s.textContent += 'html{background:#0a0a0f;overscroll-behavior:none;height:100vh}';
    s.textContent += 'body{background:#0a0a0f;overscroll-behavior:none;height:100vh}';
    s.textContent += '#swipeScreen{position:fixed;top:0;left:0;right:0;bottom:0;height:var(--tg-height);background:#0a0a0f;overflow:hidden;padding:0;margin:0}';
    s.textContent += '#swipeContainer{position:fixed;top:0;left:0;right:0;bottom:0;height:var(--tg-height);overflow:visible;padding:0;margin:0}';

    // === BACKGROUND ===
    s.textContent += '.swipe-bg{position:fixed;top:0;left:0;right:0;bottom:0;background-size:cover;background-position:center;filter:blur(80px);transform:scale(1.2);opacity:0.12;transition:background-image 0.6s ease;z-index:0}';
    s.textContent += '.swipe-bg-glow{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;pointer-events:none;transition:opacity 0.3s ease}';
    s.textContent += '.swipe-bg-glow.anticipating{opacity:1.5!important}';

    // === STACK — ЦЕНТРИРУЕТСЯ ЧЕРЕЗ JS ===
    s.textContent += '.swipe-stack{position:absolute;top:0;left:50%;width:min(92vw,420px);height:460px;transform:translateX(-50%);perspective:1400px;transform-style:preserve-3d;isolation:isolate;z-index:1;overflow:visible}';

    // === ОБЁРТКА ===
    s.textContent += '.swipe-card-wrapper{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:visible}';

    // === КАРТОЧКА ===
    s.textContent += '.swipe-card{position:relative;width:100%;aspect-ratio:16/20;max-height:460px;border-radius:18px;overflow:visible;background-color:#0a0a0f;background-size:cover;background-position:center 20%;background-repeat:no-repeat;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;box-shadow:0 10px 40px rgba(0,0,0,0.5);will-change:transform;transform:translate3d(0,0,0);backface-visibility:hidden;touch-action:none;flex-shrink:0}';
    s.textContent += '.swipe-card.back-2{transform:translate3d(0,22px,0) scale(0.9);opacity:0.15;z-index:0;filter:blur(4px)}';
    s.textContent += '.swipe-card.back-1{transform:translate3d(0,11px,0) scale(0.95);opacity:0.40;z-index:1;filter:blur(2px)}';
    s.textContent += '.swipe-card.active{transform:translate3d(0,0,0) scale(1);opacity:1;z-index:2}';
    s.textContent += '.swipe-card.decision-snap{transition:transform 0.06s ease!important}';

    // === ГРАДИЕНТ ===
    s.textContent += '.swipe-card.filled::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:55%;background:linear-gradient(to top,rgba(0,0,0,0.99) 0%,rgba(0,0,0,0.96) 20%,rgba(0,0,0,0.85) 45%,rgba(0,0,0,0.50) 72%,rgba(0,0,0,0.10) 100%);z-index:1;pointer-events:none;border-radius:0 0 18px 18px}';

    // === RIBBON ===
    s.textContent += '.swipe-ribbon{position:absolute;top:0;left:0;z-index:6;padding:7px 18px 6px 14px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:var(--ribbon-bg,rgba(18,18,24,0.95));color:var(--ribbon-color,#FF5500);border-radius:18px 0 10px 0;border-bottom:1px solid var(--ribbon-color,#FF5500);border-right:1px solid var(--ribbon-color,#FF5500)}';

    // === ТЕКСТ ===
    s.textContent += '.swipe-text{position:relative;z-index:2;display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:3px;margin-bottom:20px;width:100%}';
    s.textContent += '.swipe-id{font-size:10px;font-weight:700;color:#FF5500;text-transform:uppercase}';
    s.textContent += '.swipe-nick{font-size:28px;font-weight:900;color:#FFF;text-shadow:0 2px 14px rgba(0,0,0,0.7),0 8px 28px rgba(0,0,0,0.6)}';
    s.textContent += '.swipe-stats{font-size:14px;font-weight:700;color:rgba(255,255,255,0.9);display:flex;align-items:center;gap:8px;text-shadow:0 1px 4px rgba(0,0,0,0.6)}';
    s.textContent += '.swipe-sep{color:rgba(255,255,255,0.5)}';
    s.textContent += '.swipe-about{font-size:14px;color:rgba(255,255,255,0.85);line-height:1.5;margin-top:8px;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.6)}';

    // === КНОПКА ПРОФИЛЯ ===
    s.textContent += '.swipe-profile-btn{position:absolute;left:12px;right:12px;bottom:6px;z-index:5;height:42px;border-radius:11px;border:none;background:linear-gradient(135deg,#FF5500,#FF6B20);color:#fff;font-size:13px;font-weight:600;cursor:pointer;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.25),0 2px 6px rgba(0,0,0,0.25)}';

    // === BADGES ===
    s.textContent += '.swipe-badge{position:absolute;top:35%;padding:10px 18px;border-radius:14px;font-size:28px;font-weight:800;z-index:10;opacity:0;pointer-events:none;text-shadow:0 2px 8px rgba(0,0,0,0.5)}';
    s.textContent += '.swipe-badge.like{right:12px;color:#34FF8A;transform:translateY(-50%)}';
    s.textContent += '.swipe-badge.skip{left:12px;color:#FF4D6D;transform:translateY(-50%)}';

    // === КНОПКИ ПО БОКАМ ===
    s.textContent += '.swipe-side-btns{position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);pointer-events:none;z-index:25}';
    s.textContent += '.swipe-side-btn{position:absolute;top:50%;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;pointer-events:auto;box-shadow:0 4px 16px rgba(0,0,0,0.5)}';
    s.textContent += '.swipe-side-btn:active{transform:translateY(-50%) scale(0.85)!important}';
    s.textContent += '.swipe-side-btn.skip-btn{left:-56px;transform:translateY(-50%);background:rgba(15,15,20,0.9);color:#FF4D6D}';
    s.textContent += '.swipe-side-btn.skip-btn:active{background:#FF4D6D;color:#fff}';
    s.textContent += '.swipe-side-btn.like-btn{right:-56px;transform:translateY(-50%);background:rgba(15,15,20,0.9);color:#FF5500}';
    s.textContent += '.swipe-side-btn.like-btn:active{background:#FF5500;color:#fff}';
    s.textContent += '.swipe-side-btn.decision-active{transform:translateY(-50%) scale(1.2)!important}';
    s.textContent += '.swipe-side-btn.skip-btn.decision-active{background:#FF4D6D!important;color:#fff!important;box-shadow:0 0 30px rgba(255,77,109,0.6)!important}';
    s.textContent += '.swipe-side-btn.like-btn.decision-active{background:#FF5500!important;color:#fff!important;box-shadow:0 0 30px rgba(255,85,0,0.6)!important}';

    // === FLASH / PULSE ===
    s.textContent += '.swipe-flash{position:fixed;top:0;left:0;right:0;bottom:0;z-index:50;pointer-events:none;opacity:0}';
    s.textContent += '.swipe-pulse{position:fixed;top:50%;left:50%;width:180px;height:180px;border-radius:50%;z-index:45;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(0)}';
    s.textContent += '.swipe-pulse.fire{animation:pulseFire 0.5s ease-out forwards}';
    s.textContent += '@keyframes pulseFire{0%{transform:translate(-50%,-50%) scale(0.4);opacity:0.8}100%{transform:translate(-50%,-50%) scale(2);opacity:0}}';

    // === BACK ARROW ===
    s.textContent += '.back-arrow-swipe{z-index:30;position:absolute;top:16px;left:16px}';

    // === HEART ===
    s.textContent += '.swipe-heart-particle{position:absolute;top:50%;left:50%;font-size:20px;pointer-events:none;z-index:20;animation:heartBurst 0.8s ease-out forwards}';
    s.textContent += '@keyframes heartBurst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--bx),var(--by)) scale(0);opacity:0}}';

    // === ONBOARDING ===
    s.textContent += '.swipe-onboarding{position:fixed;top:0;left:0;right:0;bottom:0;z-index:50;pointer-events:none;background:rgba(0,0,0,0.55);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease}';
    s.textContent += '.swipe-onboarding.show{opacity:1}';
    s.textContent += '.swipe-onboarding-zones{display:flex;width:100%;justify-content:space-between;padding:0 20px;position:absolute;top:50%;transform:translateY(-50%)}';
    s.textContent += '.swipe-onboarding-zone{padding:16px 20px;border-radius:16px;font-size:16px;font-weight:700}';
    s.textContent += '.swipe-onboarding-zone.skip{background:rgba(255,77,109,0.2);border:2px solid #FF4D6D;color:#FF4D6D}';
    s.textContent += '.swipe-onboarding-zone.like{background:rgba(52,255,138,0.2);border:2px solid #34FF8A;color:#34FF8A}';
    s.textContent += '.swipe-onboarding-text{position:absolute;top:25%;color:rgba(255,255,255,0.8);font-size:13px;text-align:center;font-weight:500}';

    // === WIGGLE ===
    s.textContent += '@keyframes idleWiggle{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}25%{transform:translate3d(0,0,0) rotate(2deg)}75%{transform:translate3d(0,0,0) rotate(-2deg)}}';
    s.textContent += '.swipe-card.wiggle{animation:idleWiggle 1.5s ease-in-out 2}';

    document.head.appendChild(s);
};

SwipeRenderer.prototype.initViewport = function() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.setBackgroundColor('#0a0a0f');
        window.Telegram.WebApp.setHeaderColor('#0a0a0f');
        var tgHeight = window.Telegram.WebApp.viewportStableHeight;
        if (tgHeight) {
            document.documentElement.style.setProperty('--tg-height', tgHeight + 'px');
        }
    }
    document.documentElement.style.height = '100vh';
    document.documentElement.style.background = '#0a0a0f';
    document.body.style.height = '100vh';
    document.body.style.background = '#0a0a0f';
    document.body.style.overscrollBehavior = 'none';
};

// 🔥 ЦЕНТРИРОВАНИЕ ПО ВИДИМОЙ ОБЛАСТИ
SwipeRenderer.prototype.centerStack = function() {
    var h = (window.Telegram && window.Telegram.WebApp)
        ? window.Telegram.WebApp.viewportStableHeight
        : window.innerHeight;
    var cardH = 460;
    var top = (h - cardH) / 2;
    if (this.stackContainer) {
        this.stackContainer.style.top = top + 'px';
    }
};

SwipeRenderer.prototype.buildScene = function() {
    this.initViewport();

    var container = document.getElementById('swipeContainer');
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;overflow:visible;padding:0!important;margin:0!important;';

    var swipeScreen = document.getElementById('swipeScreen');
    if (swipeScreen) { swipeScreen.style.padding = '0'; swipeScreen.style.margin = '0'; }

    this.scene = container;
    this.bgLayer = document.createElement('div'); this.bgLayer.className = 'swipe-bg'; this.scene.appendChild(this.bgLayer);
    this.glowLayer = document.createElement('div'); this.glowLayer.className = 'swipe-bg-glow'; this.scene.appendChild(this.glowLayer);
    this.stackContainer = document.createElement('div'); this.stackContainer.className = 'swipe-stack'; this.scene.appendChild(this.stackContainer);
    this.flashEl = document.createElement('div'); this.flashEl.className = 'swipe-flash'; this.scene.appendChild(this.flashEl);
    this.pulseEl = document.createElement('div'); this.pulseEl.className = 'swipe-pulse'; this.scene.appendChild(this.pulseEl);

    this.centerStack();
    var self = this;
    window.addEventListener('resize', function() { self.centerStack(); });
};

SwipeRenderer.prototype.showCard = function(data, mode, nextCard, nextNextCard) {
    var anketaMode = (data.mode || mode || 'faceit').toLowerCase();
    var rc = this.RIBBON_COLORS[anketaMode] || this.RIBBON_COLORS.faceit;

    if (data.avatar && data.avatar !== 'null') { this.bgLayer.style.backgroundImage = 'url(' + data.avatar + ')'; }
    this.glowLayer.style.background = 'radial-gradient(circle at 50% 30%, ' + rc.glow + ', transparent 60%)';
    this.stackContainer.innerHTML = '';

    if (nextNextCard) { this.stackContainer.appendChild(this.makeCardElement(nextNextCard, mode, 'back-2', rc)); }
    if (nextCard) { this.stackContainer.appendChild(this.makeCardElement(nextCard, mode, 'back-1', rc)); }

    var wrapper = document.createElement('div'); wrapper.className = 'swipe-card-wrapper'; this.cardWrapper = wrapper;
    this.activeCard = this.makeCardElement(data, mode, 'active', rc);
    wrapper.appendChild(this.activeCard);

    var sideBtns = document.createElement('div'); sideBtns.className = 'swipe-side-btns';
    sideBtns.innerHTML = '<button class="swipe-side-btn skip-btn" id="swipeSkipBtn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><button class="swipe-side-btn like-btn" id="swipeLikeBtn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21s-7-4.35-9.33-8.28C.36 8.94 2.4 4 6.72 4c2.28 0 3.72 1.44 5.28 3.12C13.56 5.44 15 4 17.28 4c4.32 0 6.36 4.94 4.05 8.72C19 16.65 12 21 12 21z"/></svg></button>';
    wrapper.appendChild(sideBtns);

    this.skipBtn = sideBtns.querySelector('#swipeSkipBtn');
    this.likeBtn = sideBtns.querySelector('#swipeLikeBtn');
    var self = this;
    this.skipBtn.onclick = function(e) { e.stopPropagation(); Swipe.reject(); };
    this.likeBtn.onclick = function(e) { e.stopPropagation(); Swipe.like(); };

    this.back1 = this.stackContainer.querySelector('.back-1');
    this.back2 = this.stackContainer.querySelector('.back-2');

    this.likeBadge = document.createElement('div'); this.likeBadge.className = 'swipe-badge like'; this.likeBadge.innerHTML = 'LIKE'; this.activeCard.appendChild(this.likeBadge);
    this.skipBadge = document.createElement('div'); this.skipBadge.className = 'swipe-badge skip'; this.skipBadge.innerHTML = 'SKIP'; this.activeCard.appendChild(this.skipBadge);

    this.stackContainer.appendChild(wrapper);
    this.centerStack();

    this.activeCard.animate([
        { transform: 'translate3d(0,20px,0) scale(0.98)', opacity: 0 },
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }
    ], { duration: 350, easing: 'cubic-bezier(0.22,0.61,0.36,1)' });
};

SwipeRenderer.prototype.makeCardElement = function(data, mode, className, rc) {
    var card = document.createElement('div'); card.className = 'swipe-card ' + className;
    card.style.setProperty('--ribbon-color', rc.color); card.style.setProperty('--ribbon-bg', rc.bg);

    if (data.avatar && data.avatar !== 'null') { card.style.backgroundImage = 'url(' + data.avatar + ')'; }
    else { card.style.background = 'linear-gradient(150deg, #16161c 0%, #111117 65%, #14141a 100%)'; }

    var modeName = (data.mode || mode || 'faceit').toLowerCase();
    var sp = []; sp.push('<span>' + modeName.toUpperCase() + '</span>');
    if (data.rank) { var rankText = data.rank; if (modeName === 'faceit') rankText = rankText + ' elo'; else if (modeName === 'premier') rankText = rankText + ' rating'; sp.push('<span>' + rankText + '</span>'); }
    if (data.age) sp.push('<span>' + data.age + ' y.o.</span>');

    var isFaceitPremier = modeName === 'faceit' || modeName === 'premier';
    var buttonText = isFaceitPremier ? 'Открыть Faceit' : 'Открыть Steam';
    var profileLink = isFaceitPremier ? (data.faceit_link || '#') : (data.steam_link || '#');

    var html = '';
    html += '<div class="swipe-ribbon">' + modeName.toUpperCase() + '</div>';
    html += '<div class="swipe-text">';
    if (data.player_id) html += '<div class="swipe-id">ID ' + data.player_id + '</div>';
    html += '<div class="swipe-nick">' + (data.nick || 'Player') + '</div>';
    html += '<div class="swipe-stats">' + sp.join(' <span class="swipe-sep">•</span> ') + '</div>';
    if (data.about) html += '<div class="swipe-about">' + data.about + '</div>';
    html += '</div>';
    html += '<button class="swipe-profile-btn" onclick="event.stopPropagation();SwipeRenderer.prototype.openProfileLink(\'' + profileLink + '\')">' + buttonText + '</button>';

    card.innerHTML = html; return card;
};

SwipeRenderer.prototype.openProfileLink = function(link) {
    if (!link || link === '#' || link === '') return;
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) window.Telegram.WebApp.openLink(link);
    else window.open(link, '_blank');
};

SwipeRenderer.prototype.renderTransform = function(el, x, y, rotate) {
    if (this.cardWrapper) { this.cardWrapper.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + rotate + 'deg)'; this.cardWrapper.style.transition = 'none'; }
};

SwipeRenderer.prototype.renderProgress = function(progress, physicsX) {
    var self = this;
    if (self.back1) { self.back1.style.transition = 'none'; self.back1.style.transform = 'translate3d(' + (progress * 8) + 'px,' + (11 - progress * 16) + 'px,0) scale(' + (0.95 + progress * 0.06) + ') rotate(' + (progress * 2 * (physicsX > 0 ? 1 : -1)) + 'deg)'; self.back1.style.opacity = 0.40 + progress * 0.35; }
    if (self.back2) { self.back2.style.transition = 'none'; self.back2.style.transform = 'translate3d(' + (progress * 4) + 'px,' + (22 - progress * 12) + 'px,0) scale(' + (0.9 + progress * 0.04) + ') rotate(' + (progress * 1.5 * (physicsX > 0 ? 1 : -1)) + 'deg)'; self.back2.style.opacity = 0.15 + progress * 0.15; }
    var lp = Math.min(Math.max(physicsX / 110, 0), 1); var sp = Math.min(Math.max(-physicsX / 110, 0), 1);
    if (self.likeBadge) { self.likeBadge.style.opacity = lp; self.likeBadge.style.transform = 'translateY(-50%) scale(' + (0.8 + lp * 0.3) + ')'; }
    if (self.skipBadge) { self.skipBadge.style.opacity = sp; self.skipBadge.style.transform = 'translateY(-50%) scale(' + (0.8 + sp * 0.3) + ')'; }
};

SwipeRenderer.prototype.reset = function() {
    if (this.cardWrapper) { this.cardWrapper.style.transform = 'translate3d(0,0,0) rotate(0deg)'; this.cardWrapper.style.transition = ''; }
    if (this.likeBadge) this.likeBadge.style.opacity = '0';
    if (this.skipBadge) this.skipBadge.style.opacity = '0';
    if (this.back1) { this.back1.style.transition = 'all 0.45s ease'; this.back1.style.transform = 'translate3d(0,11px,0) scale(0.95)'; this.back1.style.opacity = '0.40'; }
    if (this.back2) { this.back2.style.transition = 'all 0.45s ease'; this.back2.style.transform = 'translate3d(0,22px,0) scale(0.9)'; this.back2.style.opacity = '0.15'; }
    this.glowLayer.classList.remove('anticipating');
    if (this.skipBtn) this.skipBtn.classList.remove('decision-active');
    if (this.likeBtn) this.likeBtn.classList.remove('decision-active');
};

SwipeRenderer.prototype.fly = function(el, direction, physics) {
    var p = physics;
    var screenW = window.innerWidth;
    var x = direction === 'right' ? screenW * 1.4 : -screenW * 1.4;
    var y = direction === 'right' ? p.throwArcUp : p.throwArcDown;
    var rot = direction === 'right' ? p.throwRotation : -p.throwRotation;
    if (this.cardWrapper) {
        this.cardWrapper.style.transition = 'transform ' + p.flyDuration + 's ' + p.flyEasing + ', opacity ' + p.flyDuration + 's ease, filter ' + p.flyDuration + 's ease';
        this.cardWrapper.style.filter = 'blur(' + p.throwBlur + 'px)';
        this.cardWrapper.style.opacity = '0';
        this.cardWrapper.style.transform = 'translate3d(' + x + 'px,' + y + '%,0) rotate(' + rot + 'deg) scale(' + p.throwScale + ')';
    }
};

SwipeRenderer.prototype.flash = function(color) { this.flashEl.className = 'swipe-flash ' + color; this.flashEl.style.transition = 'none'; this.flashEl.style.opacity = '1'; var el = this.flashEl; requestAnimationFrame(function() { el.style.transition = 'opacity 0.15s ease'; el.style.opacity = '0'; }); };
SwipeRenderer.prototype.pulse = function(color) { this.pulseEl.className = 'swipe-pulse ' + color + ' fire'; void this.pulseEl.offsetWidth; this.pulseEl.style.animation = 'none'; var el = this.pulseEl; requestAnimationFrame(function() { el.style.animation = 'pulseFire 0.5s ease-out forwards'; }); };

console.log('✅ SWIPE-RENDERER v8 готов');
