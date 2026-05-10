// ============================================
// SWIPE UX — Onboarding + Idle + Match + Effects
// ============================================
console.log('🔥 SWIPE-UX загружен');

var SwipeUX = {
    renderer: null,
    matchOverlay: null,
    onboardingOverlay: null,
    _idleTimer: null,

    init: function(renderer) {
        this.renderer = renderer;
    },

    showOnboarding: function() {
        if (localStorage.getItem('swipe_onboarding_seen')) return;
        var overlay = document.createElement('div');
        overlay.className = 'swipe-onboarding';
        overlay.innerHTML = '<div class="swipe-onboarding-text">Swipaй влево — пропустить<br>Swipaй вправо — лайк</div><div class="swipe-onboarding-zones"><div class="swipe-onboarding-zone nope">NOPE</div><div class="swipe-onboarding-zone like">LIKE</div></div>';
        this.renderer.scene.appendChild(overlay);
        this.onboardingOverlay = overlay;

        var self = this;
        requestAnimationFrame(function() { overlay.classList.add('show'); });

        var card = this.renderer.activeCard;
        if (card) {
            card.style.transition = 'transform 0.6s cubic-bezier(0.22,0.61,0.36,1)';
            setTimeout(function() { card.style.transform = 'translate3d(40px,0,0) rotate(8deg)'; }, 200);
            setTimeout(function() { card.style.transform = 'translate3d(0,0,0) rotate(0deg)'; }, 900);
            setTimeout(function() { card.style.transform = 'translate3d(-40px,0,0) rotate(-8deg)'; }, 1300);
            setTimeout(function() { card.style.transform = 'translate3d(0,0,0) rotate(0deg)'; }, 2000);
        }

        setTimeout(function() {
            overlay.classList.remove('show');
            setTimeout(function() { overlay.remove(); }, 300);
            localStorage.setItem('swipe_onboarding_seen', 'true');
        }, 2800);
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
        for (var i = 0; i < 10; i++) {
            var particle = document.createElement('div');
            particle.className = 'swipe-heart-particle';
            particle.textContent = emojis[i % emojis.length];
            var angle = (Math.PI * 2 * i) / 10;
            var distance = 80 + Math.random() * 100;
            var bx = Math.cos(angle) * distance;
            var by = Math.sin(angle) * distance - 60;
            particle.style.setProperty('--bx', bx + 'px');
            particle.style.setProperty('--by', by + 'px');
            particle.style.left = cx + 'px';
            particle.style.top = cy + 'px';
            particle.style.animationDelay = (i * 0.03) + 's';
            document.body.appendChild(particle);
            setTimeout(function() { particle.remove(); }, 900);
        }
    },

    showMatchOverlay: function(avatar) {
        if (this.matchOverlay) this.matchOverlay.remove();
        var bg = avatar ? 'url(' + avatar + ')' : 'linear-gradient(145deg,#1c1c24,#16161c)';
        this.matchOverlay = document.createElement('div');
        this.matchOverlay.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(0,0,0,0.92);';
        this.matchOverlay.innerHTML = '<div style="display:flex;gap:20px;align-items:center;"><div style="width:80px;height:80px;border-radius:50%;background:' + bg + ';background-size:cover;border:2px solid #FF5500;"></div><div style="font-size:56px;">❤️</div><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(145deg,#1c1c24,#16161c);border:2px solid #FF5500;"></div></div><div style="font-size:36px;font-weight:800;color:#fff;">ITS A MATCH!</div><button onclick="this.parentElement.remove();Swipe.next();" style="margin-top:12px;padding:16px 48px;border-radius:999px;border:none;background:#FF5500;color:#fff;font-size:16px;font-weight:600;cursor:pointer;">Продолжить</button>';
        document.body.appendChild(this.matchOverlay);
        var overlay = this.matchOverlay;
        setTimeout(function() { if (overlay) overlay.remove(); }, 4000);
    }
};

console.log('✅ SWIPE-UX готов');
