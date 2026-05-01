// ============================================
// SWIPE SYSTEM — Pingster v2.0 (PREMIUM)
// ============================================

const Swipe = {
    card: null,
    wrapper: null,
    isDragging: false,
    startX: 0,
    currentX: 0,
    startTime: 0,

    THRESHOLD: 110,
    VELOCITY: 0.45,
    ANIM: 320,

    current: null,
    mode: null,
    initialized: false,

    init(mode) {
        this.mode = mode;
        this.card = document.getElementById('swipeCard');
        if (!this.card) return;

        this.createWrapper();
        this.bind();
        this.initialized = true;
    },

    createWrapper() {
        if (this.wrapper) return;

        const w = document.createElement('div');
        w.className = 'swipe-card-wrapper';
        this.card.parentNode.insertBefore(w, this.card);
        w.appendChild(this.card);

        this.wrapper = w;
        this.createButtons();
    },

    createButtons() {
        const left = document.createElement('div');
        const right = document.createElement('div');

        left.className = 'swipe-side-btn skip-btn';
        right.className = 'swipe-side-btn invite-btn';

        left.innerHTML = '←';
        right.innerHTML = '→';

        this.wrapper.appendChild(left);
        this.wrapper.appendChild(right);

        left.onclick = () => this.reject();
        right.onclick = () => this.like();
    },

    bind() {
        this.card.addEventListener('touchstart', e => this.start(e), { passive: false });
        this.card.addEventListener('touchmove', e => this.move(e), { passive: false });
        this.card.addEventListener('touchend', e => this.end(e));

        this.card.addEventListener('mousedown', e => this.start(e));
        window.addEventListener('mousemove', e => this.move(e));
        window.addEventListener('mouseup', e => this.end(e));
    },

    getX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    },

    start(e) {
        if (e.target.closest('.copy-btn')) return;

        this.isDragging = true;
        this.startX = this.getX(e);
        this.startTime = Date.now();
        this.wrapper.style.transition = 'none';
    },

    move(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        const x = this.getX(e);
        const dx = x - this.startX;

        this.currentX = dx;

        const rotate = dx * 0.08;
        const scale = 1 - Math.min(Math.abs(dx) / 1000, 0.05);

        this.wrapper.style.transform =
            `translateX(${dx}px) rotate(${rotate}deg) scale(${scale})`;

        this.card.classList.toggle('swiping-right', dx > 0);
        this.card.classList.toggle('swiping-left', dx < 0);
    },

    end() {
        if (!this.isDragging) return;

        this.isDragging = false;

        const time = Date.now() - this.startTime;
        const velocity = Math.abs(this.currentX / time);

        if (
            Math.abs(this.currentX) > this.THRESHOLD ||
            velocity > this.VELOCITY
        ) {
            this.currentX > 0 ? this.like() : this.reject();
        } else {
            this.reset();
        }

        this.card.classList.remove('swiping-left', 'swiping-right');
    },

    like() {
        this.animate(1);

        if (this.current && this.current.player_id && window.Search) {
            Search.likePlayer(this.current.player_id, (data) => {
                if (data && data.status === 'match') {
                    this.showToastMessage('❤️ Взаимный мэтч! Проверь бота!', false);
                } else {
                    this.showToastMessage('👍 Лайк!', false);
                }
            });
        }

        setTimeout(() => this.next(), this.ANIM);
    },

    reject() {
        this.animate(-1);
        this.showToastMessage('Пропущено', false);

        setTimeout(() => this.next(), this.ANIM);
    },

    animate(dir) {
        this.wrapper.style.transition =
            `transform ${this.ANIM}ms cubic-bezier(.22,.61,.36,1)`;

        this.wrapper.style.transform =
            `translateX(${dir * 180}%) rotate(${dir * 14}deg) scale(0.9)`;
    },

    reset() {
        this.wrapper.style.transition =
            'transform 0.28s cubic-bezier(.2,.8,.2,1)';

        this.wrapper.style.transform =
            'translateX(0) rotate(0) scale(1)';
    },

    next() {
        this.reset();

        if (window.Search) {
            const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            Search.showNextAnketa(id, this.mode);
        }
    },

    startWithAnketa(anketa, mode) {
        this.mode = mode || anketa.mode;
        if (!this.initialized) this.init(this.mode);
        this.show(anketa);
    },

    show(data) {
        this.current = data;

        // АВАТАРКА КАК ФОН КАРТОЧКИ
        const card = document.getElementById('swipeCard');
        if (card) {
            if (data.avatar && data.avatar !== 'null' && data.avatar !== '') {
                card.style.backgroundImage = `url(${data.avatar})`;
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
            } else {
                card.style.backgroundImage = '';
                card.style.background = 'var(--surface)';
            }
        }

        // Информация поверх аватарки
        const nickEl = document.getElementById('swipePlayerNick');
        if (nickEl) nickEl.textContent = data.nick || '';

        const rankEl = document.getElementById('swipeRank');
        if (rankEl) rankEl.textContent = data.rank || '—';

        const ageEl = document.getElementById('swipeAge');
        if (ageEl) ageEl.textContent = data.age ? data.age + ' лет' : '';

        const commentEl = document.getElementById('swipeComment');
        if (commentEl) commentEl.textContent = data.about || '';

        const playerIdEl = document.getElementById('swipePlayerId');
        if (playerIdEl) playerIdEl.textContent = data.player_id || '';

        const ratingEl = document.getElementById('swipeRatingValue');
        if (ratingEl) {
            const r = data.trust_rating || data.rating || 0;
            ratingEl.textContent = (r > 0 ? '+' : '') + r;
        }

        this.updateLinks(data);
    },

    updateLinks(data) {
        const steamEl = document.getElementById('swipeSteamLink');
        if (steamEl) steamEl.textContent = data.steam_link || 'Не указана';

        const faceitEl = document.getElementById('swipeFaceitLink');
        if (faceitEl) faceitEl.textContent = data.faceit_link || 'Не указана';
    },

    showToastMessage(message, isError = false) {
        const existing = document.querySelector('.profile-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'profile-toast';
        toast.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isError ? 'rgba(255,59,48,0.95)' : 'rgba(0,0,0,0.85)'};
            backdrop-filter: blur(10px);
            color: white;
            padding: 10px 16px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 500;
            z-index: 10000;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    showBackArrow() {
        const arrow = document.querySelector('.back-arrow-swipe');
        if (arrow) {
            arrow.style.display = 'flex';
            arrow.style.visibility = 'visible';
            arrow.style.opacity = '1';
        }
    },

    hideBackArrow() {
        const arrow = document.querySelector('.back-arrow-swipe');
        if (arrow) {
            arrow.style.display = 'none';
            arrow.style.visibility = 'hidden';
        }
    },

    exitSwipeMode(reason) {
        this.hideBackArrow();
        this.current = null;
    }
};

window.Swipe = Swipe;
