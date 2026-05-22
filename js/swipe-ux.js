// ============================================
// SWIPE UX — Onboarding + Idle + Match + Effects v2
// ============================================
console.log('🔥 SWIPE-UX v2 загружен');

var SwipeUX = {
    renderer: null,
    matchOverlay: null,
    onboardingOverlay: null,
    _idleTimer: null,

    init: function(renderer) {
        this.renderer = renderer;
        this.injectStyles();
    },

    injectStyles: function() {
        if (document.getElementById('swipe-ux-v2-styles')) return;
        var s = document.createElement('style');
        s.id = 'swipe-ux-v2-styles';
        s.textContent = `
            /* ===== ОНБОРДИНГ ===== */
            .swipe-onboarding {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                z-index: 50; pointer-events: none;
                background: rgba(0,0,0,0.65);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                gap: 24px;
                opacity: 0; transition: opacity 0.4s ease;
            }
            .swipe-onboarding.show { opacity: 1; }
            
            .swipe-onboarding-text {
                color: #fff; font-size: 17px; font-weight: 700;
                text-align: center; line-height: 1.6;
                text-shadow: 0 2px 8px rgba(0,0,0,0.5);
            }
            
            .swipe-onboarding-zones {
                display: flex; gap: 60px;
            }
            
            .swipe-onboarding-zone {
                padding: 12px 24px; border-radius: 14px;
                font-size: 22px; font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 2px 8px rgba(0,0,0,0.5);
            }
            .swipe-onboarding-zone.nope {
                color: #FF4D6D;
                border: 3px solid #FF4D6D;
                background: rgba(255,77,109,0.1);
                transform: rotate(-12deg);
            }
            .swipe-onboarding-zone.like {
                color: #34FF8A;
                border: 3px solid #34FF8A;
                background: rgba(52,255,138,0.1);
                transform: rotate(12deg);
            }
            
            /* ===== МЭТЧ ОВЕРЛЕЙ ===== */
            @keyframes matchFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes matchBounce {
                0% { transform: scale(0); }
                50% { transform: scale(1.15); }
                100% { transform: scale(1); }
            }
            
            @keyframes matchPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .match-overlay {
                position: fixed; inset: 0; z-index: 100;
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                gap: 16px;
                background: rgba(0,0,0,0.94);
                animation: matchFadeIn 0.3s ease;
            }
            
            .match-avatars {
                display: flex; gap: 16px; align-items: center;
            }
            
            .match-avatar {
                width: 80px; height: 80px; border-radius: 50%;
                background-size: cover; background-position: center;
                border: 2px solid #FF5500;
            }
            .match-avatar-left {
                animation: matchBounce 0.6s cubic-bezier(0.22,0.61,0.36,1);
            }
            .match-avatar-right {
                background: linear-gradient(145deg, #1c1c24, #16161c);
                animation: matchBounce 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.2s both;
            }
            
            .match-icon {
                animation: matchBounce 0.6s cubic-bezier(0.22,0.61,0.36,1) 0.1s both;
            }
            .match-icon svg {
                width: 48px; height: 48px;
                stroke: #FF5500; fill: none;
                stroke-width: 1.5;
            }
            
            .match-title {
                font-size: 34px; font-weight: 900; color: #fff;
                letter-spacing: 2px;
                animation: matchPulse 1.5s ease-in-out infinite;
            }
            
            .match-subtitle {
                font-size: 15px; color: rgba(255,255,255,0.5);
                text-align: center; line-height: 1.4;
            }
            .match-subtitle b { color: #FF5500; font-weight: 700; }
            
            .match-btn {
                margin-top: 8px;
                padding: 16px 48px;
                border-radius: 16px;
                border: none;
                background: linear-gradient(135deg, #FF5500, #FF6B20);
                color: #fff;
                font-size: 16px; font-weight: 700;
                cursor: pointer;
                letter-spacing: 0.5px;
                box-shadow: 0 8px 25px rgba(255,85,0,0.4);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .match-btn:active {
                transform: scale(0.95);
                box-shadow: 0 4px 15px rgba(255,85,0,0.3);
            }
            
            .match-timer {
                font-size: 12px; color: rgba(255,255,255,0.25);
                margin-top: 4px;
            }
        `;
        document.head.appendChild(s);
    },

    showOnboarding: function() {
        if (localStorage.getItem('swipe_onboarding_seen')) return;
        
        var overlay = document.createElement('div');
        overlay.className = 'swipe-onboarding';
        overlay.innerHTML = `
            <div class="swipe-onboarding-text">
                Свайп влево — пропустить<br>
                Свайп вправо — лайк
            </div>
            <div class="swipe-onboarding-zones">
                <div class="swipe-onboarding-zone nope">SKIP</div>
                <div class="swipe-onboarding-zone like">LIKE</div>
            </div>
        `;
        
        this.renderer.scene.appendChild(overlay);
        this.onboardingOverlay = overlay;

        var self = this;
        requestAnimationFrame(function() { overlay.classList.add('show'); });

        var card = this.renderer.activeCard;
        if (card) {
            card.style.transition = 'transform 0.6s cubic-bezier(0.22,0.61,0.36,1)';
            setTimeout(function() { card.style.transform = 'translate3d(50px,0,0) rotate(10deg)'; }, 200);
            setTimeout(function() { card.style.transform = 'translate3d(0,0,0) rotate(0deg)'; }, 900);
            setTimeout(function() { card.style.transform = 'translate3d(-50px,0,0) rotate(-10deg)'; }, 1300);
            setTimeout(function() { card.style.transform = 'translate3d(0,0,0) rotate(0deg)'; }, 2000);
        }

        setTimeout(function() {
            overlay.classList.remove('show');
            setTimeout(function() { overlay.remove(); }, 400);
            localStorage.setItem('swipe_onboarding_seen', 'true');
        }, 3000);
    },

    startIdleTimer: function() {
        clearTimeout(this._idleTimer);
        var self = this;
        this._idleTimer = setTimeout(function() {
            var card = self.renderer.activeCard;
            if (card) {
                card.classList.add('wiggle');
                setTimeout(function() { card.classList.remove('wiggle'); }, 3000);
            }
        }, 18000);
    },

    resetIdleTimer: function() {
        clearTimeout(this._idleTimer);
    },

    spawnHeartBurst: function(card) {
        var emojis = ['❤️', '💕', '💖', '💘', '💝', '✨'];
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        
        for (var i = 0; i < 12; i++) {
            var particle = document.createElement('div');
            particle.className = 'swipe-heart-particle';
            particle.textContent = emojis[i % emojis.length];
            var angle = (Math.PI * 2 * i) / 12;
            var distance = 80 + Math.random() * 120;
            var bx = Math.cos(angle) * distance;
            var by = Math.sin(angle) * distance - 50;
            particle.style.setProperty('--bx', bx + 'px');
            particle.style.setProperty('--by', by + 'px');
            particle.style.left = cx + 'px';
            particle.style.top = cy + 'px';
            particle.style.animationDelay = (i * 0.04) + 's';
            particle.style.fontSize = (16 + Math.random() * 12) + 'px';
            document.body.appendChild(particle);
            setTimeout(function() { particle.remove(); }, 900);
        }
    },

    showMatchOverlay: function(avatar) {
        if (this.matchOverlay) this.matchOverlay.remove();
        
        var bg = avatar ? 'url(' + avatar + ')' : 'linear-gradient(145deg,#1c1c24,#16161c)';
        
        this.matchOverlay = document.createElement('div');
        this.matchOverlay.className = 'match-overlay';
        this.matchOverlay.innerHTML = `
            <div class="match-avatars">
                <div class="match-avatar match-avatar-left" style="background:${bg};background-size:cover;"></div>
                <div class="match-icon">
                    <svg viewBox="0 0 24 24">
                        <use href="#icon-match"/>
                    </svg>
                </div>
                <div class="match-avatar match-avatar-right"></div>
            </div>
            <div class="match-title">IT'S A MATCH!</div>
            <div class="match-subtitle">
                Вы нашли друг друга!<br>
                Проверьте <b>Telegram</b> — бот пришлёт контакт
            </div>
            <button class="match-btn" onclick="this.closest('.match-overlay').remove();Swipe.next();">
                Продолжить свайп
            </button>
            <div class="match-timer">Автозакрытие через 5 сек</div>
        `;
        
        document.body.appendChild(this.matchOverlay);
        
        var overlay = this.matchOverlay;
        setTimeout(function() { 
            if (overlay && overlay.parentNode) overlay.remove(); 
        }, 5000);
    }
};

console.log('✅ SWIPE-UX v2 готов');
