// ============================================
// SWIPE CONTROLLER — Pointer Events + Orchestration
// ============================================
console.log('🔥 SWIPE-CONTROLLER загружен');

var Swipe = {
    mode: null,
    initialized: false,
    current: null,
    nextCard: null,
    nextNextCard: null,
    startX: 0,
    startY: 0,
    lastPointerX: 0,
    lastPointerTime: 0,
    touchOffsetY: 0,
    cardRect: null,
    raf: null,
    pointerDown: false,

    state: null,
    physics: null,
    velocity: null,
    renderer: null,
    ux: null,

    _move: null,
    _up: null,
    _cancel: null,

    init: function(mode) {
        this.mode = mode;
        this.state = new SwipeMachine();
        this.physics = new PhysicsEngine();
        this.velocity = new VelocityTracker();
        this.renderer = new SwipeRenderer();
        this.ux = SwipeUX;
        this.ux.init(this.renderer);

        this.renderer.injectStyles();
        this.renderer.buildScene();

        var self = this;
        this._move = function(e) { self._handleMove(e); };
        this._up = function() { self._handleUp(); };
        this._cancel = function() { self._handleCancel(); };
        this.initialized = true;
    },

    startWithAnketa: function(anketa, mode) {
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
        var self = this;
        setTimeout(function() { self.ux.showOnboarding(); }, 500);
        this.ux.startIdleTimer();
    },

    _bindPointer: function() {
        this.cardRect = null;
        var self = this;
        this.renderer.activeCard.addEventListener('pointerdown', function(e) { self._handleDown(e); });
    },

    _handleDown: function(e) {
        if (!this.state.is(SwipeState.IDLE)) return;
        if (e.target.closest('button')) return;
        this.ux.resetIdleTimer();
        this.pointerDown = true;
        this.state.set(SwipeState.DRAGGING);
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.velocity.reset();
        this.cardRect = this.renderer.activeCard.getBoundingClientRect();
        this.touchOffsetY = this.startY - this.cardRect.top;
        this.renderer.activeCard.style.transition = 'none';
        this.renderer.activeCard.setPointerCapture(e.pointerId);
        window.addEventListener('pointermove', this._move);
        window.addEventListener('pointerup', this._up);
        window.addEventListener('pointercancel', this._cancel);
    },

    _handleMove: function(e) {
        if (!this.pointerDown) return;
        e.preventDefault();
        this.physics.setTarget(e.clientX - this.startX, e.clientY - this.startY);
        var now = Date.now();
        this.velocity.update(e.clientX, now - this.lastPointerTime);
        this.lastPointerX = e.clientX;
        this.lastPointerTime = now;
        var self = this;
        if (!this.raf) this.raf = requestAnimationFrame(function() { self._loop(); });
    },

    _handleUp: function() {
        if (!this.pointerDown) return;
        this.pointerDown = false;
        this._unbind();
        this.cancelRAF();
        if (this.physics.shouldCommit(this.velocity.vx)) {
            this._throw(this.physics.x > 0 ? 'right' : 'left');
        } else {
            this._reset();
            this.ux.startIdleTimer();
        }
    },

    _handleCancel: function() {
        if (!this.pointerDown) return;
        this.pointerDown = false;
        this._unbind();
        this.cancelRAF();
        this._reset();
    },

    _unbind: function() {
        window.removeEventListener('pointermove', this._move);
        window.removeEventListener('pointerup', this._up);
        window.removeEventListener('pointercancel', this._cancel);
    },

    cancelRAF: function() {
        if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    },

    _loop: function() {
        this.raf = null;
        var result = this.physics.update();
        var x = result.x;
        var y = result.y;
        var rotate = (x / window.innerWidth) * 20 + (this.touchOffsetY / this.cardRect.height - 0.5) * 14;
        this.renderer.renderTransform(this.renderer.activeCard, x, y, rotate);
        var progress = this.physics.getProgress();
        this.renderer.renderProgress(progress, this.physics.x);

        if (this.physics.isAnticipating()) {
            this.renderer.glowLayer.classList.add('anticipating');
        } else {
            this.renderer.glowLayer.classList.remove('anticipating');
        }

        var dock = this.renderer.scene.querySelector('.swipe-dock');
        if (dock) {
            var likeBtn = dock.querySelector('.like-btn');
            var nopeBtn = dock.querySelector('.nope-btn');
            if (this.physics.isDeciding()) {
                if (this.physics.x > 0 && likeBtn) likeBtn.classList.add('decision-active');
                if (this.physics.x < 0 && nopeBtn) nopeBtn.classList.add('decision-active');
            } else {
                if (likeBtn) likeBtn.classList.remove('decision-active');
                if (nopeBtn) nopeBtn.classList.remove('decision-active');
            }
        }

        var self = this;
        if (this.pointerDown || !this.physics.isSettled()) {
            this.raf = requestAnimationFrame(function() { self._loop(); });
        }
    },

    _reset: function() {
        this.state.set(SwipeState.RESETTING);
        this.physics.reset();
        this.renderer.reset();
        this.renderer.activeCard.style.transition = 'transform ' + this.physics.snapBackDuration + 's cubic-bezier(0.175,0.885,0.32,1.275)';
        this._haptic('light');
        var self = this;
        setTimeout(function() { self.state.set(SwipeState.IDLE); }, this.physics.snapBackDuration * 1000);
    },

    _throw: function(direction) {
        this.state.set(SwipeState.THROWING);
        var card = this.renderer.activeCard;
        var self = this;

        if (card) {
            card.classList.add('decision-snap');
            var snapRot = direction === 'right' ? 3 : -3;
            card.style.transform = 'translate3d(0,0,0) rotate(' + snapRot + 'deg) scale(1.03)';
            setTimeout(function() { card.classList.remove('decision-snap'); }, 60);
        }

        setTimeout(function() {
            if (direction === 'right') {
                self.renderer.flash('green');
                self.renderer.pulse('green');
                if (self.renderer.likeBadge) self.renderer.likeBadge.classList.add('spring');
                if (card) self.ux.spawnHeartBurst(card);
                self._haptic('medium');
                if (self.current && self.current.player_id && window.Search) {
                    Search.likePlayer(self.current.player_id, function(data) {
                        if (data && data.status === 'match') {
                            self.ux.showMatchOverlay(self.current.avatar);
                        } else {
                            self._toast('Лайк!');
                        }
                    });
                }
            } else {
                self.renderer.flash('red');
                if (self.renderer.nopeBadge) self.renderer.nopeBadge.classList.add('spring');
                self._haptic('light');
                self._toast('Пропущено');
            }
            self.renderer.fly(card, direction, self.physics);
            setTimeout(function() { self._finish(); }, self.physics.flyDuration * 1000 + 50);
        }, 50);
    },

    _finish: function() {
        if (this.renderer.activeCard) this.renderer.activeCard.style.filter = '';
        this.next();
    },

    next: function() {
        this.ux.resetIdleTimer();
        var id = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp.initDataUnsafe.user.id : null;
        if (window.Search && id) Search.showNextAnketa(id, this.mode);
    },

    like: function() {
        if (!this.state.is(SwipeState.IDLE) || !this.current) return;
        this.physics.x = this.physics.threshold + 40;
        this._throw('right');
    },

    reject: function() {
        if (!this.state.is(SwipeState.IDLE) || !this.current) return;
        this.physics.x = -(this.physics.threshold + 40);
        this._throw('left');
    },

    _haptic: function(s) {
        try {
            var w = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
            if (w && w.HapticFeedback) w.HapticFeedback.impactOccurred(s || 'light');
        } catch(e) {}
    },

    _toast: function(msg) {
        var old = document.querySelector('.swipe-toast');
        if (old) old.remove();
        var t = document.createElement('div');
        t.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;z-index:10000;';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() {
            t.style.opacity = '0';
            t.style.transition = 'opacity 0.3s';
            setTimeout(function() { t.remove(); }, 300);
        }, 1500);
    },

    _showBackArrow: function() {
        var a = document.querySelector('.back-arrow-swipe');
        if (a) a.style.display = 'flex';
    },

    _hideBackArrow: function() {
        var a = document.querySelector('.back-arrow-swipe');
        if (a) a.style.display = 'none';
    },

    exitSwipeMode: function() {
        this.ux.resetIdleTimer();
        this.cancelRAF();
        this._unbind();
        this._hideBackArrow();
        this.current = null;
    }
};

window.Swipe = Swipe;
console.log('✅ SWIPE-CONTROLLER готов');
