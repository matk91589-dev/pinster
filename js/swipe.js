// ============================================
// СВАЙП-КАРТОЧКИ - Pingster v2.0 (АНКЕТЫ + ЛАЙКИ)
// ============================================

function abbreviateRank(rank) {
    if (!rank || rank === '—') return '—';
    if (rank.length <= 15) return rank;
    const words = rank.split(' ');
    if (words.length === 1) return rank;
    return words[0] + ' ' + words.slice(1).map(w => w[0] + '.').join('');
}

const Swipe = {
    card: null, cardWrapper: null, container: null, hint: null, loading: null,
    timerElement: null, skipBtn: null, inviteBtn: null,
    
    isDragging: false, startX: 0, currentX: 0, startTime: 0, hasMoved: false,
    SWIPE_THRESHOLD: 100, VELOCITY_THRESHOLD: 0.4, ANIMATION_DURATION: 350,
    
    currentAnketa: null, mode: null, isInitialized: false,
    toastTimeout: null, resizeObserver: null,
    likedPlayerIds: new Set(),
    
    showBackArrow() {
        const arrow = document.querySelector('.back-arrow-swipe');
        if (arrow) { arrow.style.display = 'flex'; arrow.style.visibility = 'visible'; arrow.style.opacity = '1'; arrow.style.pointerEvents = 'auto'; }
    },
    
    hideBackArrow() {
        const arrow = document.querySelector('.back-arrow-swipe');
        if (arrow) { arrow.style.display = 'none'; arrow.style.visibility = 'hidden'; arrow.style.pointerEvents = 'none'; }
    },
    
    showToastMessage(message, isError = false) {
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        const existing = document.querySelector('.profile-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'profile-toast';
        toast.style.cssText = `position:fixed;top:60px;left:50%;transform:translateX(-50%) translateY(-100px);background:${isError?'rgba(255,59,48,0.95)':'rgba(0,0,0,0.85)'};backdrop-filter:blur(10px);color:white;padding:10px 16px;border-radius:30px;font-size:13px;font-weight:500;z-index:10000;transition:transform 0.3s ease;text-align:center;max-width:calc(100vw - 40px);min-width:200px;line-height:1.4;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.3);`;
        toast.textContent = message;
        document.body.appendChild(toast);
        toast.offsetHeight;
        toast.style.transform = 'translateX(-50%) translateY(0)';
        this.toastTimeout = setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(-100px)'; setTimeout(() => toast.remove(), 300); }, 5000);
    },

    goToMainScreen() {
        this.hideBackArrow();
        this.unblockScroll();
        if (window.App) App.showScreen('mainScreen', true);
    },
    
    init(mode) {
        this.mode = mode;
        this.card = document.getElementById('swipeCard');
        this.container = document.getElementById('swipeContainer');
        this.hint = document.getElementById('swipeHint');
        this.loading = document.getElementById('swipeLoading');
        this.timerElement = document.getElementById('swipeTimer');
        
        if (!this.card) return;
        this.card.style.display = 'block';
        this.card.style.visibility = 'visible';
        this.card.style.opacity = '1';
        this.createCardWrapper();
        this.blockScroll();
        this.showHintOnce();
        if (this.loading) this.loading.classList.add('active');
        if (!this.isInitialized) { this.setupEventListeners(); this.isInitialized = true; }
        this.initResizeObserver();
        this.forceShowSwipeMode();
    },
    
    copyToClipboard(text, btnElement) {
        if (!text || text === 'Не указана') return;
        navigator.clipboard.writeText(text).then(() => {
            this.showToastMessage('Скопировано!', false);
            if (btnElement) { btnElement.classList.add('copied'); setTimeout(() => btnElement.classList.remove('copied'), 1500); }
        }).catch(() => this.showToastMessage('Ошибка копирования', true));
    },
    
    forceShowSwipeMode() {
        const swipeScreen = document.getElementById('swipeScreen');
        if (swipeScreen) { swipeScreen.classList.add('active'); swipeScreen.style.display = 'flex'; }
        const waitingContent = document.getElementById('waitingModeContent');
        if (waitingContent) { waitingContent.style.display = 'none'; }
        if (this.card) { this.card.style.display = 'block'; this.card.style.visibility = 'visible'; this.card.style.opacity = '1'; this.card.style.position = 'relative'; }
        if (this.cardWrapper) { this.cardWrapper.style.display = 'inline-block'; this.cardWrapper.style.visibility = 'visible'; this.cardWrapper.style.opacity = '1'; this.cardWrapper.style.pointerEvents = 'auto'; }
        if (this.skipBtn) { this.skipBtn.style.display = 'flex'; this.skipBtn.style.visibility = 'visible'; this.skipBtn.style.pointerEvents = 'auto'; }
        if (this.inviteBtn) { this.inviteBtn.style.display = 'flex'; this.inviteBtn.style.visibility = 'visible'; this.inviteBtn.style.pointerEvents = 'auto'; }
        if (this.timerElement) this.timerElement.style.display = 'none'; // Таймер не нужен в v2.0
        if (this.cardWrapper) { this.cardWrapper.style.transition = ''; this.cardWrapper.style.transform = 'translateX(0) rotate(0deg) scale(1)'; }
        setTimeout(() => this.showBackArrow(), 50);
        setTimeout(() => this.updateButtonsPosition(), 100);
    },
    
    initResizeObserver() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        this.resizeObserver = new ResizeObserver(() => this.updateButtonsPosition());
        if (this.card) this.resizeObserver.observe(this.card);
        if (this.cardWrapper) this.resizeObserver.observe(this.cardWrapper);
        window.addEventListener('resize', () => this.updateButtonsPosition());
    },
    
    createCardWrapper() {
        const originalCard = document.getElementById('swipeCard');
        if (!originalCard) return;
        const oldWrapper = document.querySelector('.swipe-card-wrapper');
        if (oldWrapper) { const parent = oldWrapper.parentNode; const card = oldWrapper.querySelector('.swipe-card'); if (card) { parent.insertBefore(card, oldWrapper); oldWrapper.remove(); } }
        const wrapper = document.createElement('div');
        wrapper.className = 'swipe-card-wrapper';
        wrapper.style.cssText = 'position:relative;display:inline-block;margin:0 auto;overflow:visible;';
        originalCard.parentNode.insertBefore(wrapper, originalCard);
        wrapper.appendChild(originalCard);
        this.cardWrapper = wrapper;
        this.createSideButtonsInWrapper();
    },
    
    createSideButtonsInWrapper() {
        if (!this.cardWrapper) return;
        this.cardWrapper.querySelectorAll('.swipe-side-btn').forEach(b => b.remove());
        
        const leftBtn = document.createElement('div');
        leftBtn.className = 'swipe-side-btn skip-btn';
        leftBtn.innerHTML = '<div class="swipe-side-btn-inner"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#FF5E5E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        
        const rightBtn = document.createElement('div');
        rightBtn.className = 'swipe-side-btn invite-btn';
        rightBtn.innerHTML = '<div class="swipe-side-btn-inner"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        
        this.cardWrapper.appendChild(leftBtn);
        this.cardWrapper.appendChild(rightBtn);
        this.skipBtn = leftBtn;
        this.inviteBtn = rightBtn;
        
        this.skipBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onSideButtonClick('skip'); });
        this.inviteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onSideButtonClick('like'); });
        
        setTimeout(() => { if (this.skipBtn) { this.skipBtn.classList.add('visible'); this.skipBtn.style.display = 'flex'; } if (this.inviteBtn) { this.inviteBtn.classList.add('visible'); this.inviteBtn.style.display = 'flex'; } this.updateButtonsPosition(); }, 50);
    },
    
    updateButtonsPosition() {
        if (!this.skipBtn || !this.inviteBtn || !this.card) return;
        const cardRect = this.card.getBoundingClientRect();
        const cardHeight = cardRect.height, cardWidth = cardRect.width;
        const cardLeft = cardRect.left, cardRight = cardRect.right;
        const screenWidth = window.innerWidth;
        let btnWidth = Math.min(Math.max(cardWidth * 0.1, 38), 56);
        let btnHeight = Math.min(Math.max(cardHeight * 0.55, 85), 140);
        const MIN_VISIBLE = 14;
        let leftOffset = Math.min(btnWidth * 0.65, 32);
        let rightOffset = Math.min(btnWidth * 0.65, 32);
        if (screenWidth < 400) { btnWidth = Math.min(btnWidth, 44); btnHeight = Math.min(btnHeight, 100); leftOffset = Math.max(leftOffset, 12); rightOffset = Math.max(rightOffset, 12); }
        if (screenWidth < 340) { btnWidth = Math.min(btnWidth, 38); btnHeight = Math.min(btnHeight, 90); leftOffset = Math.max(leftOffset, 10); rightOffset = Math.max(rightOffset, 10); }
        
        this.skipBtn.style.cssText = `width:${btnWidth}px;height:${btnHeight}px;min-height:${btnHeight}px;top:50%;transform:translateY(-50%);left:-${leftOffset}px;`;
        this.inviteBtn.style.cssText = `width:${btnWidth}px;height:${btnHeight}px;min-height:${btnHeight}px;top:50%;transform:translateY(-50%);right:-${rightOffset}px;`;
    },
    
    onSideButtonClick(action) {
        if (action === 'skip') { this.showToastMessage('Пропущено', false); this.animateAndReject(); }
        else if (action === 'like') { this.showToastMessage('👍 Лайк!', false); this.animateAndAccept(); }
    },
    
    animateAndAccept() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.34,1.2,0.64,1)`;
        this.cardWrapper.style.transform = 'translateX(200%) rotate(15deg) scale(0.85)';
        setTimeout(() => { if (this.cardWrapper) { this.cardWrapper.style.transition = ''; this.cardWrapper.style.transform = ''; } this.likePlayer(); }, this.ANIMATION_DURATION);
    },
    
    animateAndReject() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.34,1.2,0.64,1)`;
        this.cardWrapper.style.transform = 'translateX(-200%) rotate(-15deg) scale(0.85)';
        setTimeout(() => { if (this.cardWrapper) { this.cardWrapper.style.transition = ''; this.cardWrapper.style.transform = ''; } this.skipPlayer(); }, this.ANIMATION_DURATION);
    },
    
    resetCardPosition() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = 'transform 0.3s cubic-bezier(0.2,0.9,0.4,1)';
        this.cardWrapper.style.transform = 'translateX(0) rotate(0deg) scale(1)';
        this.currentX = 0;
        setTimeout(() => { if (this.cardWrapper) this.cardWrapper.style.transition = ''; }, 300);
    },
    
    // 🔥 НОВАЯ ФУНКЦИЯ: начать просмотр анкеты
    startWithAnketa(anketa, mode) {
        this.mode = mode || anketa.mode;
        if (!this.isInitialized) this.init(this.mode);
        this.currentAnketa = anketa;
        if (this.loading) this.loading.classList.remove('active');
        this.resetCardPosition();
        this.forceShowSwipeMode();
        this.showPlayer(anketa);
        this.blockScroll();
        this.showHintOnce();
    },
    
    // 🔥 ЛАЙК
    likePlayer() {
        if (!this.currentAnketa) return;
        const likedPlayerId = this.currentAnketa.player_id;
        if (!likedPlayerId) return;
        if (this.likedPlayerIds.has(likedPlayerId)) return;
        
        if (typeof Search !== 'undefined' && Search.likePlayer) {
            Search.likePlayer(likedPlayerId, (data) => {
                if (data && data.status === 'match') {
                    this.showToastMessage('❤️ Взаимный мэтч! Проверь бота!', false);
                }
                // Показываем следующую анкету
                this.showNext();
            });
        } else {
            this.showNext();
        }
    },
    
    // 🔥 ПРОПУСТИТЬ
    skipPlayer() {
        this.showNext();
    },
    
    // 🔥 ПОКАЗАТЬ СЛЕДУЮЩУЮ
    showNext() {
        if (typeof Search !== 'undefined') {
            const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            Search.showNextAnketa(telegram_id, this.mode);
        } else {
            this.goToMainScreen();
        }
    },
    
    blockScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        window.addEventListener('scroll', this.preventDefaultScroll, { passive: false });
        document.addEventListener('touchmove', this.preventDefaultScroll, { passive: false });
    },
    
    unblockScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        window.removeEventListener('scroll', this.preventDefaultScroll);
        document.removeEventListener('touchmove', this.preventDefaultScroll);
    },
    
    preventScroll(e) { e.preventDefault(); return false; },
    
    setupEventListeners() {
        if (!this.card) return;
        this.onDragStartBound = this.onDragStart.bind(this);
        this.onDragMoveBound = this.onDragMove.bind(this);
        this.onDragEndBound = this.onDragEnd.bind(this);
        this.card.addEventListener('touchstart', this.onDragStartBound, { passive: false });
        this.card.addEventListener('touchmove', this.onDragMoveBound, { passive: false });
        this.card.addEventListener('touchend', this.onDragEndBound);
        this.card.addEventListener('mousedown', this.onDragStartBound);
        window.addEventListener('mousemove', this.onDragMoveBound);
        window.addEventListener('mouseup', this.onDragEndBound);
        this.card.addEventListener('dragstart', (e) => e.preventDefault());
    },
    
    getClientX(e) { return e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null); },
    
    onDragStart(e) {
        if (this.skipBtn?.contains(e.target) || this.inviteBtn?.contains(e.target)) return;
        if (e.target.closest('.copy-btn')) return;
        if (!this.card?.contains(e.target)) return;
        this.isDragging = true; this.hasMoved = false;
        this.startX = this.getClientX(e); this.startTime = Date.now();
        if (this.cardWrapper) this.cardWrapper.classList.add('dragging');
        e.preventDefault();
    },
    
    onDragMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const clientX = this.getClientX(e);
        if (clientX === null) return;
        this.currentX = clientX;
        const deltaX = this.currentX - this.startX;
        if (Math.abs(deltaX) > 5) this.hasMoved = true;
        if (!this.hasMoved) return;
        const percent = deltaX / 150;
        const rotate = percent * 12;
        const scale = 1 + Math.abs(percent) * 0.05;
        if (this.cardWrapper) { this.cardWrapper.style.transition = 'none'; this.cardWrapper.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg) scale(${scale})`; }
        if (deltaX > 0) { this.card?.classList.add('swiping-right'); this.card?.classList.remove('swiping-left'); }
        else { this.card?.classList.add('swiping-left'); this.card?.classList.remove('swiping-right'); }
    },
    
    onDragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (!this.hasMoved) { this.card?.classList.remove('dragging', 'swiping-right', 'swiping-left'); this.cardWrapper?.classList.remove('dragging'); return; }
        const deltaX = this.currentX - this.startX;
        const time = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX / time);
        const isSwipe = Math.abs(deltaX) > this.SWIPE_THRESHOLD || velocity > this.VELOCITY_THRESHOLD;
        if (isSwipe && Math.abs(deltaX) > 10) {
            if (deltaX > 0) { this.showToastMessage('👍 Лайк!', false); this.animateAndAccept(); }
            else { this.showToastMessage('Пропущено', false); this.animateAndReject(); }
        } else { this.resetCardPosition(); }
        this.card?.classList.remove('dragging', 'swiping-right', 'swiping-left');
        this.cardWrapper?.classList.remove('dragging');
        e.preventDefault();
    },
    
    showPlayer(player) {
        this.currentAnketa = player;
        const playerIdEl = document.getElementById('swipePlayerId');
        const playerNickEl = document.getElementById('swipePlayerNick');
        const ratingEl = document.getElementById('swipeRatingValue');
        const rankEl = document.getElementById('swipeRank');
        const ageEl = document.getElementById('swipeAge');
        const styleEl = document.getElementById('swipeStyle');
        const commentEl = document.getElementById('swipeComment');
        
        if (styleEl) styleEl.style.display = 'none';
        
        const rankLabel = document.querySelector('.swipe-stats-row .swipe-stat-item:first-child .swipe-stat-label');
        if (rankLabel) {
            const modeUpper = (this.mode || '').toUpperCase();
            rankLabel.textContent = modeUpper === 'FACEIT' ? 'FACEIT ELO' : modeUpper === 'PREMIER' ? 'CS RATING' : 'РАНГ';
        }
        
        if (playerIdEl) playerIdEl.textContent = player.player_id || '';
        if (playerNickEl) playerNickEl.textContent = player.nick || '';
        if (ratingEl) { const trust = player.rating || 0; ratingEl.textContent = (trust > 0 ? '+' : '') + trust; ratingEl.style.color = trust > 0 ? '#4CAF50' : trust < 0 ? '#FF3B30' : ''; }
        if (rankEl) rankEl.textContent = player.rank || '—';
        if (ageEl) ageEl.textContent = player.age ? player.age + ' лет' : '';
        if (commentEl) commentEl.textContent = player.about || '';
        
        // Steam
        const steamC = document.querySelector('.swipe-steam-container');
        if (steamC) {
            const val = player.steam_link || 'Не указана';
            steamC.innerHTML = `<div class="swipe-link-label">Ссылка Steam</div><div class="link-with-copy"><div class="swipe-link-value" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${val}</div><button class="copy-btn" onclick="event.stopPropagation();Swipe.copyToClipboard('${val.replace(/'/g, "\\'")}', this)"><svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg></button></div>`;
        }
        // Faceit
        const faceitC = document.querySelector('.swipe-faceit-container');
        if (faceitC) {
            const val = player.faceit_link || 'Не указана';
            faceitC.innerHTML = `<div class="swipe-link-label">Ссылка Faceit</div><div class="link-with-copy"><div class="swipe-link-value" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${val}</div><button class="copy-btn" onclick="event.stopPropagation();Swipe.copyToClipboard('${val.replace(/'/g, "\\'")}', this)"><svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg></button></div>`;
        }
        
        this.updateAvatar(player);
        this.updateLinksVisibility();
    },
    
    updateAvatar(player) {
        const avatarContainer = document.querySelector('#swipeCard .swipe-avatar .tg-avatar-svg');
        if (!avatarContainer) return;
        if (player.avatar && player.avatar !== 'null' && player.avatar !== '') {
            avatarContainer.innerHTML = `<img src="${player.avatar}" alt="avatar" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;">`;
        } else {
            avatarContainer.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="display:block;margin:auto;"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
        }
    },
    
    updateLinksVisibility() {
        const steamC = document.querySelector('.swipe-steam-container');
        const faceitC = document.querySelector('.swipe-faceit-container');
        if (this.mode === 'FACEIT') { if (steamC) steamC.style.display = 'none'; if (faceitC) faceitC.style.display = 'block'; }
        else { if (steamC) steamC.style.display = 'block'; if (faceitC) faceitC.style.display = 'none'; }
    },
    
    showHintOnce() {
        if (!this.hint) return;
        if (!localStorage.getItem('swipeHintShown')) { this.hint.classList.remove('fade-out'); setTimeout(() => this.hint.classList.add('fade-out'), 3000); localStorage.setItem('swipeHintShown', 'true'); }
        else { this.hint.classList.add('fade-out'); }
    },
    
    exitSwipeMode(reason) {
        console.log('🔄 Выход из свайпа:', reason);
        this.unblockScroll();
        this.currentAnketa = null;
        this.hideBackArrow();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Swipe = Swipe;
    const swipeScreen = document.getElementById('swipeScreen');
    if (swipeScreen) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.type === 'attributes' && m.attributeName === 'class' && swipeScreen.classList.contains('active') && !Swipe.isInitialized) {
                    Swipe.init(Swipe.mode || 'FACEIT');
                }
            });
        });
        observer.observe(swipeScreen, { attributes: true });
    }
});

if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    setTimeout(() => { if (!Swipe.isInitialized) Swipe.init(Swipe.mode || 'FACEIT'); }, 100);
}
