// ============================================
// SWIPE RENDERER — v12 DIAGONAL BADGES + STYLISH BUTTONS
// ============================================
console.log('🔥 SWIPE-RENDERER v12 загружен');

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
    this.backArrow = null;

    this.RIBBON_COLORS = {
        faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' },
        public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' }
    };
};

SwipeRenderer.prototype.injectStyles = function() {
    if (document.getElementById('swipe-v12-styles')) return;
    var s = document.createElement('style');
    s.id = 'swipe-v12-styles';
    s.textContent = `
        :root{--tg-height:100vh}
        html{background:#0a0a0f;overscroll-behavior:none;height:100vh}
        body{background:#0a0a0f;overscroll-behavior:none;height:100vh}
        #swipeScreen{position:fixed;top:0;left:0;right:0;bottom:0;height:var(--tg-height);background:#0a0a0f;overflow:visible;padding:0;margin:0}
        #swipeContainer{position:fixed;top:0;left:0;right:0;bottom:0;height:var(--tg-height);overflow:visible;padding:0;margin:0}
        
        .swipe-card,.swipe-card *,.swipe-text,.swipe-text *,.swipe-nick,.swipe-stats,.swipe-about,.swipe-id{
            -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;
        }

        .swipe-bg{position:fixed;top:0;left:0;right:0;bottom:0;background-size:cover;background-position:center;filter:blur(80px);transform:scale(1.2);opacity:0.12;transition:background-image 0.6s ease;z-index:0}
        .swipe-bg-glow{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;pointer-events:none;transition:opacity 0.3s ease}
        .swipe-bg-glow.anticipating{opacity:1.5!important}

        .swipe-stack{position:absolute;top:0;left:50%;width:380px;height:460px;transform:translateX(-50%);perspective:1400px;transform-style:preserve-3d;isolation:isolate;z-index:1;overflow:visible}
        @media(max-width:420px){.swipe-stack{width:92vw;height:calc(92vw * 1.21)}}

        .swipe-card-wrapper{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:visible}

        .swipe-card{position:relative;width:100%;height:100%;border-radius:18px;overflow:visible;background-color:#0a0a0f;background-size:cover;background-position:center 20%;background-repeat:no-repeat;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;box-shadow:0 10px 40px rgba(0,0,0,0.5);will-change:transform;transform:translate3d(0,0,0);backface-visibility:hidden;touch-action:none;flex-shrink:0}
        .swipe-card.back-2{transform:translate3d(0,22px,0) scale(0.9);opacity:0.15;z-index:0;filter:blur(4px)}
        .swipe-card.back-1{transform:translate3d(0,11px,0) scale(0.95);opacity:0.40;z-index:1;filter:blur(2px)}
        .swipe-card.active{transform:translate3d(0,0,0) scale(1);opacity:1;z-index:2}
        .swipe-card.decision-snap{transition:transform 0.06s ease!important}

        .swipe-card.filled::after{content:'';position:absolute;bottom:0;left:0;right:0;height:55%;background:linear-gradient(to top,rgba(0,0,0,0.99) 0%,rgba(0,0,0,0.96) 20%,rgba(0,0,0,0.85) 45%,rgba(0,0,0,0.50) 72%,rgba(0,0,0,0.10) 100%);z-index:1;pointer-events:none;border-radius:0 0 18px 18px}

        .swipe-ribbon{position:absolute;top:0;left:0;z-index:6;padding:7px 18px 6px 14px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:var(--ribbon-bg,rgba(18,18,24,0.95));color:var(--ribbon-color,#FF5500);border-radius:18px 0 10px 0;border-bottom:1px solid var(--ribbon-color,#FF5500);border-right:1px solid var(--ribbon-color,#FF5500)}

        .swipe-text{position:relative;z-index:2;display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:3px;margin-bottom:20px;width:100%}
        .swipe-id{font-size:10px;font-weight:700;color:#FF5500;text-transform:uppercase}
        .swipe-nick{font-size:28px;font-weight:900;color:#FFF;text-shadow:0 2px 14px rgba(0,0,0,0.7),0 8px 28px rgba(0,0,0,0.6)}
        .swipe-stats{font-size:14px;font-weight:700;color:rgba(255,255,255,0.9);display:flex;align-items:center;gap:8px;text-shadow:0 1px 4px rgba(0,0,0,0.6)}
        .swipe-sep{color:rgba(255,255,255,0.5)}
        .swipe-about{font-size:14px;color:rgba(255,255,255,0.85);line-height:1.5;margin-top:8px;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.6)}

        .swipe-profile-btn{position:absolute;left:12px;right:12px;bottom:6px;z-index:5;height:42px;border-radius:11px;border:none;background:linear-gradient(135deg,#FF5500,#FF6B20);color:#fff;font-size:13px;font-weight:600;cursor:pointer;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.25),0 2px 6px rgba(0,0,0,0.25)}

        /* ===== 🔥 ДИАГОНАЛЬНЫЕ БЕЙДЖИ ===== */
        .swipe-badge{
            position:absolute;top:22%;z-index:10;opacity:0;pointer-events:none;
            font-size:38px;font-weight:900;letter-spacing:3px;
            padding:10px 18px;border-radius:14px;
            text-shadow:0 4px 16px rgba(0,0,0,0.5);
            transition:opacity 0.15s ease;
        }
        .swipe-badge.like{
            right:8%;transform:rotate(18deg);
            color:#34FF8A;
            border:3px solid #34FF8A;
            background:rgba(52,255,138,0.08);
            box-shadow:0 0 30px rgba(52,255,138,0.2),inset 0 0 30px rgba(52,255,138,0.05);
        }
        .swipe-badge.skip{
            left:8%;transform:rotate(-18deg);
            color:#FF4D6D;
            border:3px solid #FF4D6D;
            background:rgba(255,77,109,0.08);
            box-shadow:0 0 30px rgba(255,77,109,0.2),inset 0 0 30px rgba(255,77,109,0.05);
        }

        /* ===== 🔥 СТИЛЬНЫЕ КНОПКИ СНИЗУ (НЕ КРУГЛЫЕ) ===== */
        .swipe-dock{
            position:absolute;bottom:24px;left:50%;transform:translateX(-50%);
            display:flex;gap:20px;z-index:25;pointer-events:none;
        }
        .swipe-dock-btn{
            width:140px;height:52px;border-radius:14px;border:none;
            font-size:15px;font-weight:700;letter-spacing:1px;
            cursor:pointer;pointer-events:auto;
            display:flex;align-items:center;justify-content:center;gap:8px;
            transition:all 0.2s cubic-bezier(0.22,0.61,0.36,1);
            backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
        }
        .swipe-dock-btn:active{transform:scale(0.92)}
        .swipe-dock-btn svg{width:22px;height:22px;flex-shrink:0}

        .swipe-dock-btn.skip-btn{
            background:rgba(255,77,109,0.12);
            border:2px solid rgba(255,77,109,0.35);
            color:#FF4D6D;
            box-shadow:0 4px 15px rgba(255,77,109,0.15);
        }
        .swipe-dock-btn.skip-btn:active{
            background:rgba(255,77,109,0.25);
            border-color:#FF4D6D;
            box-shadow:0 6px 25px rgba(255,77,109,0.3);
        }
        .swipe-dock-btn.skip-btn.decision-active{
            background:rgba(255,77,109,0.3);
            border-color:#FF4D6D;
            transform:scale(1.08);
            box-shadow:0 8px 30px rgba(255,77,109,0.4);
        }

        .swipe-dock-btn.like-btn{
            background:rgba(255,85,0,0.12);
            border:2px solid rgba(255,85,0,0.35);
            color:#FF5500;
            box-shadow:0 4px 15px rgba(255,85,0,0.15);
        }
        .swipe-dock-btn.like-btn:active{
            background:rgba(255,85,0,0.25);
            border-color:#FF5500;
            box-shadow:0 6px 25px rgba(255,85,0,0.3);
        }
        .swipe-dock-btn.like-btn.decision-active{
            background:rgba(255,85,0,0.3);
            border-color:#FF5500;
            transform:scale(1.08);
            box-shadow:0 8px 30px rgba(255,85,0,0.4);
        }
        .swipe-dock-btn.like-btn.liked{
            background:#FF5500;
            border-color:#FF5500;
            color:#fff;
            box-shadow:0 8px 30px rgba(255,85,0,0.5);
        }

        .swipe-flash{position:fixed;top:0;left:0;right:0;bottom:0;z-index:50;pointer-events:none;opacity:0}
        .swipe-pulse{position:fixed;top:50%;left:50%;width:180px;height:180px;border-radius:50%;z-index:45;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(0)}
        .swipe-pulse.fire{animation:pulseFire 0.5s ease-out forwards}
        @keyframes pulseFire{0%{transform:translate(-50%,-50%) scale(0.4);opacity:0.8}100%{transform:translate(-50%,-50%) scale(2);opacity:0}}

        .swipe-back-arrow{position:absolute;top:10px;left:16px;z-index:999;cursor:pointer;display:flex;align-items:center;justify-content:center;width:32px;height:32px;transition:transform 0.15s ease,opacity 0.15s ease}
        .swipe-back-arrow:active{transform:scale(0.85);opacity:0.7}
        .swipe-back-arrow svg{width:28px;height:28px;stroke:#FF5500;stroke-width:2.5;fill:none}

        .swipe-heart-particle{position:absolute;top:50%;left:50%;font-size:20px;pointer-events:none;z-index:20;animation:heartBurst 0.8s ease-out forwards}
        @keyframes heartBurst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--bx),var(--by)) scale(0);opacity:0}}

        .swipe-onboarding{position:fixed;top:0;left:0;right:0;bottom:0;z-index:50;pointer-events:none;background:rgba(0,0,0,0.55);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease}
        .swipe-onboarding.show{opacity:1}

        @keyframes idleWiggle{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}25%{transform:translate3d(0,0,0) rotate(2deg)}75%{transform:translate3d(0,0,0) rotate(-2deg)}}
        .swipe-card.wiggle{animation:idleWiggle 1.5s ease-in-out 2}
    `;
    document.head.appendChild(s);
};

SwipeRenderer.prototype.initViewport = function() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.setBackgroundColor('#0a0a0f');
        window.Telegram.WebApp.setHeaderColor('#0a0a0f');
        var tgHeight = window.Telegram.WebApp.viewportStableHeight;
        if (tgHeight) { document.documentElement.style.setProperty('--tg-height', tgHeight + 'px'); }
    }
    document.documentElement.style.height = '100vh';
    document.documentElement.style.background = '#0a0a0f';
    document.body.style.height = '100vh';
    document.body.style.background = '#0a0a0f';
    document.body.style.overscrollBehavior = 'none';
};

SwipeRenderer.prototype.centerStack = function() {
    var h = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp.viewportStableHeight : window.innerHeight;
    var cardH = 460;
    var top = (h - cardH) / 2 + 30;
    if (top < 60) top = 60;
    if (this.stackContainer) { this.stackContainer.style.top = top + 'px'; }
};

SwipeRenderer.prototype.buildScene = function() {
    this.initViewport();

    var container = document.getElementById('swipeContainer');
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;overflow:visible;padding:0!important;margin:0!important;';

    var swipeScreenEl = document.getElementById('swipeScreen');
    if (swipeScreenEl) {
        swipeScreenEl.style.padding = '0';
        swipeScreenEl.style.margin = '0';
        swipeScreenEl.style.overflow = 'visible';
        
        var oldArrow = swipeScreenEl.querySelector('.swipe-back-arrow');
        if (oldArrow) oldArrow.remove();
        
        this.backArrow = document.createElement('div');
        this.backArrow.className = 'swipe-back-arrow';
        this.backArrow.innerHTML = '<svg viewBox="0 0 24 24"><use href="#icon-arrow"/></svg>';
        this.backArrow.onclick = function() { if (window.App) App.goBack(); };
        swipeScreenEl.appendChild(this.backArrow);
    }

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

    // 🔥 ДИАГОНАЛЬНЫЕ БЕЙДЖИ (появляются только при свайпе)
    this.likeBadge = document.createElement('div'); 
    this.likeBadge.className = 'swipe-badge like'; 
    this.likeBadge.textContent = 'LIKE';
    this.activeCard.appendChild(this.likeBadge);
    
    this.skipBadge = document.createElement('div'); 
    this.skipBadge.className = 'swipe-badge skip'; 
    this.skipBadge.textContent = 'SKIP';
    this.activeCard.appendChild(this.skipBadge);

    this.stackContainer.appendChild(wrapper);

    // 🔥 СТИЛЬНЫЕ КНОПКИ СНИЗУ (dock)
    var oldDock = this.scene.querySelector('.swipe-dock');
    if (oldDock) oldDock.remove();
    
    var dock = document.createElement('div');
    dock.className = 'swipe-dock';
    dock.innerHTML = `
        <button class="swipe-dock-btn skip-btn" id="swipeSkipBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
            </svg>
            SKIP
        </button>
        <button class="swipe-dock-btn like-btn" id="swipeLikeBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            LIKE
        </button>
    `;
    this.scene.appendChild(dock);

    this.skipBtn = dock.querySelector('#swipeSkipBtn');
    this.likeBtn = dock.querySelector('#swipeLikeBtn');
    
    var self = this;
    this.skipBtn.onclick = function(e) { e.stopPropagation(); Swipe.reject(); };
    this.likeBtn.onclick = function(e) {
        e.stopPropagation();
        this.classList.add('liked');
        setTimeout(function() { this.classList.remove('liked'); }.bind(this), 600);
        Swipe.like();
    };

    this.back1 = this.stackContainer.querySelector('.back-1');
    this.back2 = this.stackContainer.querySelector('.back-2');

    this.centerStack();

    // 🔥 Анимация появления
    this.activeCard.style.opacity = '0';
    this.activeCard.style.transform = 'translate3d(0,20px,0) scale(0.98)';
    this.activeCard.style.transition = 'opacity 350ms cubic-bezier(0.22,0.61,0.36,1), transform 350ms cubic-bezier(0.22,0.61,0.36,1)';
    requestAnimationFrame(function() {
        self.activeCard.style.opacity = '1';
        self.activeCard.style.transform = 'translate3d(0,0,0) scale(1)';
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

    var modeName = (data.mode || mode || 'faceit').toLowerCase();
    var sp = []; 
    sp.push('<span>' + modeName.toUpperCase() + '</span>');
    if (data.rank) { 
        var rankText = data.rank; 
        if (modeName === 'faceit') rankText = rankText + ' elo'; 
        else if (modeName === 'premier') rankText = rankText + ' rating'; 
        sp.push('<span>' + rankText + '</span>'); 
    }
    if (data.age) sp.push('<span>' + data.age + ' y.o.</span>');

    var isFaceitPremier = modeName === 'faceit' || modeName === 'premier';
    var buttonText = isFaceitPremier ? 'Открыть Faceit' : 'Открыть Steam';
    var profileLink = isFaceitPremier ? (data.faceit_link || '#') : (data.steam_link || '#');

    var html = '';
    html += '<div class="swipe-ribbon">' + modeName.toUpperCase() + '</div>';
    html += '<div class="swipe-text">';
    if (data.player_id) html += '<div class="swipe-id">ID ' + data.player_id + '</div>';
    html += '<div class="swipe-nick">' + (data.nick || 'Player') + '</div>';
    html += '<div class="swipe-stats">' + sp.join(' <span class="swipe-sep">·</span> ') + '</div>';
    if (data.about) html += '<div class="swipe-about">' + data.about + '</div>';
    html += '</div>';
    html += '<button class="swipe-profile-btn" onclick="event.stopPropagation();SwipeRenderer.prototype.openProfileLink(\'' + profileLink + '\')">' + buttonText + '</button>';

    card.innerHTML = html; 
    return card;
};

SwipeRenderer.prototype.openProfileLink = function(link) {
    if (!link || link === '#' || link === '') return;
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) 
        window.Telegram.WebApp.openLink(link);
    else 
        window.open(link, '_blank');
};

SwipeRenderer.prototype.renderTransform = function(el, x, y, rotate) {
    if (this.cardWrapper) { 
        this.cardWrapper.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + rotate + 'deg)'; 
        this.cardWrapper.style.transition = 'none'; 
    }
};

SwipeRenderer.prototype.renderProgress = function(progress, physicsX) {
    var self = this;
    
    // 🔥 Задние карточки
    if (self.back1) { 
        self.back1.style.transition = 'none'; 
        self.back1.style.transform = 'translate3d(' + (progress * 8) + 'px,' + (11 - progress * 16) + 'px,0) scale(' + (0.95 + progress * 0.06) + ') rotate(' + (progress * 2 * (physicsX > 0 ? 1 : -1)) + 'deg)'; 
        self.back1.style.opacity = 0.40 + progress * 0.35; 
    }
    if (self.back2) { 
        self.back2.style.transition = 'none'; 
        self.back2.style.transform = 'translate3d(' + (progress * 4) + 'px,' + (22 - progress * 12) + 'px,0) scale(' + (0.9 + progress * 0.04) + ') rotate(' + (progress * 1.5 * (physicsX > 0 ? 1 : -1)) + 'deg)'; 
        self.back2.style.opacity = 0.15 + progress * 0.15; 
    }
    
    // 🔥 ДИАГОНАЛЬНЫЕ БЕЙДЖИ
    var lp = Math.min(Math.max(physicsX / 110, 0), 1);
    var sp = Math.min(Math.max(-physicsX / 110, 0), 1);
    if (self.likeBadge) { self.likeBadge.style.opacity = lp; }
    if (self.skipBadge) { self.skipBadge.style.opacity = sp; }
};

SwipeRenderer.prototype.reset = function() {
    if (this.cardWrapper) { 
        this.cardWrapper.style.transform = 'translate3d(0,0,0) rotate(0deg)'; 
        this.cardWrapper.style.transition = ''; 
    }
    if (this.likeBadge) this.likeBadge.style.opacity = '0';
    if (this.skipBadge) this.skipBadge.style.opacity = '0';
    if (this.back1) { 
        this.back1.style.transition = 'all 0.45s ease'; 
        this.back1.style.transform = 'translate3d(0,11px,0) scale(0.95)'; 
        this.back1.style.opacity = '0.40'; 
    }
    if (this.back2) { 
        this.back2.style.transition = 'all 0.45s ease'; 
        this.back2.style.transform = 'translate3d(0,22px,0) scale(0.9)'; 
        this.back2.style.opacity = '0.15'; 
    }
    this.glowLayer.classList.remove('anticipating');
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

console.log('✅ SWIPE-RENDERER v12 готов');
