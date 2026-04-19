// ============================================
// СВАЙП-КАРТОЧКИ - ФИНАЛЬНАЯ ВЕРСИЯ (ТАЙМЕР 40С + СИНХРОНИЗАЦИЯ)
// ============================================

// 🔥 УМНОЕ СОКРАЩЕНИЕ РАНГОВ
function abbreviateRank(rank) {
    if (!rank || rank === '—') return '—';
    
    const words = rank.split(' ');
    if (words.length === 1) return rank;
    
    if (rank.length <= 15) return rank;
    
    const firstWord = words[0];
    const restAbbr = words.slice(1).map(w => w[0] + '.').join('');
    
    return firstWord + ' ' + restAbbr;
}

const Swipe = {
    // Элементы DOM
    card: null,
    cardWrapper: null,
    container: null,
    hint: null,
    loading: null,
    labelLeft: null,
    labelRight: null,
    timerElement: null,
    
    // Кнопки действия
    skipBtn: null,
    inviteBtn: null,

    // Переменные для drag
    isDragging: false,
    startX: 0,
    currentX: 0,
    startTime: 0,
    
    // Константы
    SWIPE_THRESHOLD: 100,
    VELOCITY_THRESHOLD: 0.4,
    ANIMATION_DURATION: 350,
    MATCH_TIMEOUT: 40, // 🔥 40 СЕКУНД
    
    // Данные
    currentPlayer: null,
    currentMatchId: null,
    playersQueue: [],
    mode: null,
    isInitialized: false,
    connectionTimer: null,
    cardTimerInterval: null,
    isWaitingMode: false,
    matchExpiresAt: null,
    serverTime: null,
    matchPolling: null,
    gameCreated: false,
    gameCreating: false,
    chatLink: null,
    inviteLink: null,
    toastTimeout: null,
    iAccepted: false,
    
    hintRunId: null,
    hintInterval: null,
    resizeObserver: null,
    
    showBackArrow() {
        const arrow = document.querySelector('.back-arrow-swipe');
        if (arrow) {
            arrow.style.display = 'flex';
            arrow.style.visibility = 'visible';
            arrow.style.opacity = '1';
            arrow.style.pointerEvents = 'auto';
        }
    },
    
    hideBackArrow() {
        const arrow = document.querySelector('.back-arrow-swipe');
        if (arrow) {
            arrow.style.display = 'none';
            arrow.style.visibility = 'hidden';
            arrow.style.pointerEvents = 'none';
        }
    },
    
    showToastMessage(message, isError = false) {
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        const existingToast = document.querySelector('.profile-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = 'profile-toast';
        toast.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: ${isError ? 'rgba(255, 59, 48, 0.95)' : 'rgba(0, 0, 0, 0.85)'};
            backdrop-filter: blur(10px);
            color: white;
            padding: 10px 16px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 500;
            z-index: 10000;
            transition: transform 0.3s ease;
            white-space: normal;
            word-break: break-word;
            text-align: center;
            max-width: calc(100vw - 40px);
            width: auto;
            min-width: 200px;
            line-height: 1.4;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        toast.offsetHeight;
        toast.style.transform = 'translateX(-50%) translateY(0)';
        
        this.toastTimeout = setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    restartSearch(reason = 'reject') {
        const savedMode = this.mode;
        const savedRank = this.currentPlayer?.rating || this.currentPlayer?.rank || '';
        const savedAge = this.currentPlayer?.age || '';
        
        this.isWaitingMode = false;
        this.currentMatchId = null;
        this.currentPlayer = null;
        this.matchExpiresAt = null;
        this.iAccepted = false;
        
        this.hideBackArrow();
        this.unblockScroll();
        
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        if (window.App) App.showScreen('searchScreen', true);
        
        setTimeout(() => {
            if (typeof Search !== 'undefined' && savedMode) {
                const modeTitle = document.getElementById('searchModeTitle');
                if (modeTitle) modeTitle.textContent = savedMode;
                
                if (savedMode === 'FACEIT') {
                    document.getElementById('faceitELOInput').value = savedRank;
                    document.getElementById('faceitAgeValue').value = savedAge;
                } else if (savedMode === 'PREMIER') {
                    document.getElementById('premierRatingInput').value = savedRank;
                    document.getElementById('premierAgeValue').value = savedAge;
                } else if (savedMode === 'PRIME') {
                    document.getElementById('primeRankSelect').value = savedRank;
                    document.getElementById('primeAgeValue').value = savedAge;
                } else if (savedMode === 'PUBLIC') {
                    document.getElementById('publicRankSelect').value = savedRank;
                    document.getElementById('publicAgeValue').value = savedAge;
                }
                
                Search.forceStopAndStart(savedMode, savedRank);
            }
        }, 200);
    },

    goToMainScreen(reason = 'timeout') {
        this.isWaitingMode = false;
        this.currentMatchId = null;
        this.currentPlayer = null;
        this.matchExpiresAt = null;
        this.iAccepted = false;
        
        this.hideBackArrow();
        this.unblockScroll();
        
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        if (window.App) App.showScreen('mainScreen', true);
    },
    
    init(mode) {
        this.mode = mode;
        this.card = document.getElementById('swipeCard');
        this.container = document.getElementById('swipeContainer');
        this.hint = document.getElementById('swipeHint');
        this.loading = document.getElementById('swipeLoading');
        this.labelLeft = document.getElementById('swipeLabelLeft');
        this.labelRight = document.getElementById('swipeLabelRight');
        this.timerElement = document.getElementById('swipeTimer');
        
        if (!this.card) return;
        
        this.card.style.display = 'block';
        this.card.style.visibility = 'visible';
        this.card.style.opacity = '1';
        
        this.createCardWrapper();
        this.blockScroll();
        this.showHintOnce();
        
        if (this.loading) this.loading.classList.add('active');
        
        if (!this.isInitialized) {
            this.setupEventListeners();
            this.isInitialized = true;
        }
        
        this.initResizeObserver();
        this.forceShowSwipeMode();
    },
    
    copyToClipboard(text, btnElement) {
        if (!text || text === 'Не указана' || text === '') {
            this.showToastMessage('Нечего копировать', true);
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToastMessage('Скопировано!', false);
            if (btnElement) {
                btnElement.classList.add('copied');
                setTimeout(() => btnElement.classList.remove('copied'), 1500);
            }
        }).catch(() => this.showToastMessage('Ошибка копирования', true));
    },
    
    createLinkWithCopy(text) {
        const wrapper = document.createElement('div');
        wrapper.className = 'link-with-copy';
        
        const valueSpan = document.createElement('div');
        valueSpan.className = 'swipe-link-value';
        valueSpan.textContent = text;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg>';
        copyBtn.onclick = (e) => { e.stopPropagation(); this.copyToClipboard(text, copyBtn); };
        
        wrapper.appendChild(valueSpan);
        wrapper.appendChild(copyBtn);
        return wrapper;
    },
    
    forceShowSwipeMode() {
        const swipeScreen = document.getElementById('swipeScreen');
        if (swipeScreen) {
            swipeScreen.classList.add('active');
            swipeScreen.style.display = 'flex';
        }
        
        const swipeContent = document.getElementById('swipeModeContent');
        const waitingContent = document.getElementById('waitingModeContent');
        
        if (swipeContent) {
            swipeContent.style.display = 'flex';
            swipeContent.style.visibility = 'visible';
        }
        if (waitingContent) {
            waitingContent.classList.remove('active');
            waitingContent.style.display = 'none';
        }
        
        if (this.card) {
            this.card.style.display = 'block';
            this.card.style.visibility = 'visible';
            this.card.style.opacity = '1';
            this.card.style.position = 'relative';
        }
        
        if (this.cardWrapper) {
            this.cardWrapper.style.display = 'inline-block';
            this.cardWrapper.style.visibility = 'visible';
            this.cardWrapper.style.opacity = '1';
            this.cardWrapper.style.pointerEvents = 'auto';
        }
        
        if (this.skipBtn) {
            this.skipBtn.style.display = 'flex';
            this.skipBtn.style.visibility = 'visible';
            this.skipBtn.style.pointerEvents = 'auto';
        }
        if (this.inviteBtn) {
            this.inviteBtn.style.display = 'flex';
            this.inviteBtn.style.visibility = 'visible';
            this.inviteBtn.style.pointerEvents = 'auto';
        }
        
        if (this.timerElement) this.timerElement.style.display = 'flex';
        
        this.isWaitingMode = false;
        
        if (this.cardWrapper) {
            this.cardWrapper.style.transition = '';
            this.cardWrapper.style.transform = 'translateX(0) rotate(0deg) scale(1)';
        }
        
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
        if (oldWrapper) {
            const parent = oldWrapper.parentNode;
            const card = oldWrapper.querySelector('.swipe-card');
            if (card) {
                parent.insertBefore(card, oldWrapper);
                oldWrapper.remove();
            }
        }
        
        const wrapper = document.createElement('div');
        wrapper.className = 'swipe-card-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.margin = '0 auto';
        wrapper.style.overflow = 'visible';
        
        const parent = originalCard.parentNode;
        parent.insertBefore(wrapper, originalCard);
        wrapper.appendChild(originalCard);
        
        this.cardWrapper = wrapper;
        this.createSideButtonsInWrapper();
    },
    
    createSideButtonsInWrapper() {
        if (!this.cardWrapper) return;
        
        const oldBtns = this.cardWrapper.querySelectorAll('.swipe-side-btn');
        oldBtns.forEach(btn => btn.remove());
        
        const leftWrapper = document.createElement('div');
        leftWrapper.className = 'swipe-side-btn skip-btn';
        leftWrapper.innerHTML = '<div class="swipe-side-btn-inner"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#FF5E5E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        
        const rightWrapper = document.createElement('div');
        rightWrapper.className = 'swipe-side-btn invite-btn';
        rightWrapper.innerHTML = '<div class="swipe-side-btn-inner"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        
        this.cardWrapper.appendChild(leftWrapper);
        this.cardWrapper.appendChild(rightWrapper);
        
        this.skipBtn = leftWrapper;
        this.inviteBtn = rightWrapper;
        
        this.skipBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onSideButtonClick('skip'); });
        this.inviteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onSideButtonClick('invite'); });
        
        setTimeout(() => {
            if (this.skipBtn) { this.skipBtn.classList.add('visible'); this.skipBtn.style.display = 'flex'; }
            if (this.inviteBtn) { this.inviteBtn.classList.add('visible'); this.inviteBtn.style.display = 'flex'; }
            this.updateButtonsPosition();
        }, 50);
    },
    
    updateButtonsPosition() {
        if (!this.skipBtn || !this.inviteBtn || !this.card || this.isWaitingMode) return;
        
        const cardRect = this.card.getBoundingClientRect();
        const cardHeight = cardRect.height;
        const cardWidth = cardRect.width;
        const cardLeft = cardRect.left;
        const cardRight = cardRect.right;
        const screenWidth = window.innerWidth;
        
        let btnWidth = Math.min(Math.max(cardWidth * 0.1, 38), 56);
        let btnHeight = Math.min(Math.max(cardHeight * 0.55, 85), 140);
        
        const MIN_VISIBLE_OFFSET = 14;
        let desiredOffset = Math.min(btnWidth * 0.65, 32);
        
        let leftOffset = desiredOffset;
        if (cardLeft < desiredOffset) leftOffset = Math.max(cardLeft - MIN_VISIBLE_OFFSET, MIN_VISIBLE_OFFSET);
        
        let rightOffset = desiredOffset;
        if (screenWidth - cardRight < desiredOffset) rightOffset = Math.max(screenWidth - cardRight - MIN_VISIBLE_OFFSET, MIN_VISIBLE_OFFSET);
        
        if (screenWidth < 400) { btnWidth = 44; btnHeight = 100; leftOffset = 12; rightOffset = 12; }
        if (screenWidth < 340) { btnWidth = 38; btnHeight = 90; leftOffset = 10; rightOffset = 10; }
        
        this.skipBtn.style.width = btnWidth + 'px';
        this.skipBtn.style.height = btnHeight + 'px';
        this.skipBtn.style.top = '50%';
        this.skipBtn.style.transform = 'translateY(-50%)';
        this.skipBtn.style.left = '-' + leftOffset + 'px';
        
        this.inviteBtn.style.width = btnWidth + 'px';
        this.inviteBtn.style.height = btnHeight + 'px';
        this.inviteBtn.style.top = '50%';
        this.inviteBtn.style.transform = 'translateY(-50%)';
        this.inviteBtn.style.right = '-' + rightOffset + 'px';
    },
    
    onSideButtonClick(action) {
        if (this.isWaitingMode) return;
        if (action === 'skip') { this.showToastMessage('Вы отклонили', false); this.animateAndReject(); }
        else if (action === 'invite') { this.showToastMessage('Вы приняли', false); this.animateAndAccept(); }
    },
    
    animateAndAccept() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.34, 1.2, 0.64, 1)`;
        this.cardWrapper.style.transform = 'translateX(200%) rotate(15deg) scale(0.85)';
        setTimeout(() => {
            if (this.cardWrapper) { this.cardWrapper.style.transition = ''; this.cardWrapper.style.transform = ''; }
            this.acceptPlayer();
        }, this.ANIMATION_DURATION);
    },
    
    animateAndReject() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.34, 1.2, 0.64, 1)`;
        this.cardWrapper.style.transform = 'translateX(-200%) rotate(-15deg) scale(0.85)';
        setTimeout(() => {
            if (this.cardWrapper) { this.cardWrapper.style.transition = ''; this.cardWrapper.style.transform = ''; }
            this.rejectPlayer();
        }, this.ANIMATION_DURATION);
    },
    
    resetCardPosition() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1)';
        this.cardWrapper.style.transform = 'translateX(0) rotate(0deg) scale(1)';
        setTimeout(() => { if (this.cardWrapper) this.cardWrapper.style.transition = ''; }, 300);
    },
    
    showWaitingMode() {
        const swipeContent = document.getElementById('swipeModeContent');
        const waitingContent = document.getElementById('waitingModeContent');
        if (!swipeContent || !waitingContent) return;
        
        swipeContent.style.display = 'none';
        waitingContent.classList.add('active');
        waitingContent.style.visibility = 'visible';
        
        if (this.skipBtn) { this.skipBtn.style.display = 'none'; this.skipBtn.style.pointerEvents = 'none'; }
        if (this.inviteBtn) { this.inviteBtn.style.display = 'none'; this.inviteBtn.style.pointerEvents = 'none'; }
        if (this.timerElement) this.timerElement.style.display = 'none';
        
        this.isWaitingMode = true;
        setTimeout(() => this.showBackArrow(), 50);
        // 🔥 ТАЙМЕР ЗАПУСКАЕТСЯ ИЗ acceptPlayer С ОСТАВШИМСЯ ВРЕМЕНЕМ
        setTimeout(() => { this.loadSelfAvatar(); this.loadTeammateAvatar(); }, 50);
    },
    
    loadSelfAvatar() {
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (!telegram_id) return;
        const selfAvatarContainer = document.querySelector('.waiting-self-avatar .tg-avatar-svg');
        if (!selfAvatarContainer) return;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/profile/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok' && data.avatar && data.avatar !== 'null') {
                selfAvatarContainer.innerHTML = `<img src="${data.avatar}" alt="avatar">`;
            }
        })
        .catch(() => {});
    },
    
    loadTeammateAvatar() {
        const teammateAvatarContainer = document.querySelector('.waiting-teammate-avatar .tg-avatar-svg');
        if (!teammateAvatarContainer) return;
        if (this.currentPlayer?.avatar && this.currentPlayer.avatar !== 'null') {
            teammateAvatarContainer.innerHTML = `<img src="${this.currentPlayer.avatar}" alt="avatar">`;
        }
    },
    
    // 🔥 ТАЙМЕР ОЖИДАНИЯ С НАЧАЛЬНЫМ ЗНАЧЕНИЕМ
    startWaitingTimer(initialTime = 40) {
        let timeLeft = initialTime;
        const waitingTimerEl = document.getElementById('waitingTimer');
        if (!waitingTimerEl) return;
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        
        waitingTimerEl.textContent = timeLeft + 'с';
        waitingTimerEl.classList.remove('warning');
        
        this.connectionTimer = setInterval(() => {
            timeLeft--;
            waitingTimerEl.textContent = timeLeft + 'с';
            if (timeLeft <= 10 && timeLeft > 0) waitingTimerEl.classList.add('warning');
            if (timeLeft <= 0) {
                clearInterval(this.connectionTimer);
                this.connectionTimer = null;
                waitingTimerEl.textContent = '0с';
                this.connectionTimeout();
            }
        }, 1000);
    },
    
    stopWaitingTimer() {
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
    },
    
    startWithOpponent(opponent, matchId, expiresAt, serverTime) {
        this.isWaitingMode = false;
        this.iAccepted = false;
        
        const modeFromOpponent = opponent.mode || 'PREMIER';
        if (!this.isInitialized) this.init(modeFromOpponent);
        if (this.currentMatchId === matchId) return;
        
        this.showToastMessage('Матч найден!', false);
        this._pendingOpponent = opponent;
        this._pendingMatchId = matchId;
        this._pendingExpiresAt = expiresAt;
        this._waitForCardAndStart();
    },
    
    _waitForCardAndStart() {
        const checkCard = () => {
            this.card = document.getElementById('swipeCard');
            if (!this.card) { setTimeout(checkCard, 50); return; }
            this._executeStartWithOpponent();
        };
        checkCard();
    },
    
    _executeStartWithOpponent() {
        const opponent = this._pendingOpponent;
        const matchId = this._pendingMatchId;
        
        this._pendingOpponent = null;
        this._pendingMatchId = null;
        
        this.currentMatchId = matchId;
        this.currentPlayer = opponent;
        this.mode = opponent.mode || this.mode;
        this.iAccepted = false;
        
        // 🔥 40 СЕКУНД
        this.matchExpiresAt = Date.now() + (this.MATCH_TIMEOUT * 1000);
        
        if (this.loading) this.loading.classList.remove('active');
        
        this.resetCardPosition();
        this.forceShowSwipeMode();
        this.showPlayer(opponent);
        this.startCardTimer();
        this.blockScroll();
        this.showHintOnce();
        
        this.startMatchStatusPolling(matchId);
        
        setTimeout(() => this.startSwipeHint(), 300);
        setTimeout(() => this.adjustCardSize(), 50);
        setTimeout(() => this.updateButtonsPosition(), 100);
    },
    
    getTimeLeft() {
        if (!this.matchExpiresAt) return this.MATCH_TIMEOUT;
        return Math.max(0, Math.floor((this.matchExpiresAt - Date.now()) / 1000));
    },
    
    startCardTimer() {
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (!this.timerElement) this.timerElement = document.getElementById('swipeTimer');
        if (!this.timerElement) return;

        const updateTimer = () => {
            const timeLeft = this.getTimeLeft();
            this.timerElement.innerHTML = timeLeft + 'с';
        
            if (timeLeft <= 0) {
                this.timerElement.classList.add('warning');
                clearInterval(this.cardTimerInterval);
                this.cardTimerInterval = null;
                
                this.showToastMessage('Вы были неактивны', true);
                
                if (this.currentMatchId) {
                    const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
                    fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ telegram_id, match_id: this.currentMatchId, response: 'reject' })
                    }).catch(e => console.error('Ошибка reject:', e));
                }
                
                this.goToMainScreen('card_timeout');
                return;
            }
        
            this.timerElement.classList.toggle('warning', timeLeft < 10);
        };

        updateTimer();
        this.cardTimerInterval = setInterval(updateTimer, 1000);
    },
    
    blockScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        window.addEventListener('scroll', this.preventDefaultScroll, { passive: false });
        document.addEventListener('touchmove', this.preventDefaultScroll, { passive: false });
    },
    
    unblockScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        window.removeEventListener('scroll', this.preventDefaultScroll);
        document.removeEventListener('touchmove', this.preventDefaultScroll);
    },
    
    preventScroll(e) { e.preventDefault(); },
    
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
    },
    
    getClientX(e) {
        if (e.clientX !== undefined) return e.clientX;
        if (e.touches && e.touches[0]) return e.touches[0].clientX;
        return null;
    },
    
    onDragStart(e) {
        if (this.isWaitingMode) return;
        if (this.skipBtn?.contains(e.target) || this.inviteBtn?.contains(e.target)) return;
        if (!this.card?.contains(e.target)) return;
        
        this.isDragging = true;
        this.startX = this.getClientX(e);
        this.startTime = Date.now();
        if (this.cardWrapper) this.cardWrapper.classList.add('dragging');
        e.preventDefault();
    },
    
    onDragMove(e) {
        if (!this.isDragging || this.isWaitingMode) return;
        e.preventDefault();
        const clientX = this.getClientX(e);
        if (clientX === null) return;
        
        const deltaX = clientX - this.startX;
        const rotate = (deltaX / 150) * 12;
        const scale = 1 + Math.abs(deltaX / 150) * 0.05;
        
        if (this.cardWrapper) {
            this.cardWrapper.style.transition = 'none';
            this.cardWrapper.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg) scale(${scale})`;
        }
        
        this.card?.classList.toggle('swiping-right', deltaX > 0);
        this.card?.classList.toggle('swiping-left', deltaX < 0);
    },
    
    onDragEnd(e) {
        if (!this.isDragging || this.isWaitingMode) return;
        this.isDragging = false;
        
        const deltaX = this.currentX - this.startX;
        const velocity = Math.abs(deltaX / (Date.now() - this.startTime));
        const isSwipe = Math.abs(deltaX) > this.SWIPE_THRESHOLD || velocity > this.VELOCITY_THRESHOLD;
        
        if (isSwipe && Math.abs(deltaX) > 10) {
            if (deltaX > 0) {
                this.showToastMessage('Вы приняли', false);
                this.animateAndAccept();
            } else {
                this.showToastMessage('Вы отклонили', false);
                this.animateAndReject();
            }
        } else {
            this.resetCardPosition();
        }
        
        this.card?.classList.remove('dragging', 'swiping-right', 'swiping-left');
        this.cardWrapper?.classList.remove('dragging');
    },
    
    // 🔥 acceptPlayer С СИНХРОНИЗАЦИЕЙ ТАЙМЕРА
    acceptPlayer() {
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        if (!this.currentMatchId) return;
        
        this.iAccepted = true;
        
        // 🔥 СОХРАНЯЕМ ОСТАВШЕЕСЯ ВРЕМЯ
        const remainingTime = this.getTimeLeft();
        
        this.showWaitingMode();
        
        // 🔥 ЗАПУСКАЕМ ТАЙМЕР ОЖИДАНИЯ С ОСТАВШИМСЯ ВРЕМЕНЕМ
        this.startWaitingTimer(remainingTime);
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id, match_id: this.currentMatchId, response: 'accept' })
        })
        .then(() => this.startMatchStatusPolling(this.currentMatchId))
        .catch(error => {
            this.showToastMessage('Ошибка при принятии', true);
            setTimeout(() => this.exitSwipeMode('acceptError'), 1000);
        });
    },
    
    startMatchStatusPolling(matchId) {
        if (this.matchPolling) clearInterval(this.matchPolling);
        let attempts = 0;
        const MAX_ATTEMPTS = 80; // 🔥 40 сек / 0.5 сек = 80
        
        this.matchPolling = setInterval(async () => {
            attempts++;
            if (attempts > MAX_ATTEMPTS) {
                clearInterval(this.matchPolling);
                this.matchPolling = null;
                this.connectionTimeout();
                return;
            }
            
            try {
                const res = await fetch(`https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/status/${matchId}`);
                const data = await res.json();
                
                if (data.status === 'both_accepted') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    if (!this.isWaitingMode) this.showWaitingMode();
                    this.updateWaitingUI('both_accepted');
                    this.createGame();
                } else if (data.status === 'rejected') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.handleRejection();
                } else if (data.status === 'expired' || data.status === 'not_found') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.showToastMessage('Тиммейт отклонил — вы снова в поиске', true);
                    this.restartSearch('match_expired');
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000);
    },
    
    updateWaitingUI(status) {
        if (status === 'both_accepted') {
            this.stopWaitingTimer();
            document.querySelector('.waiting-teammate-avatar')?.classList.add('connected');
            document.querySelector('.waiting-line')?.classList.add('connected');
            const statusEl = document.getElementById('waitingStatus');
            if (statusEl) { statusEl.innerHTML = 'Матч создан!'; statusEl.classList.add('active'); }
            
            const chatButton = document.getElementById('waitingChatButton');
            if (chatButton && this.chatLink) {
                chatButton.classList.remove('disabled');
                chatButton.classList.add('active');
                chatButton.disabled = false;
            }
            this.showToastMessage('Матч создан!', false);
        }
    },
    
    rejectPlayer() {
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (this.currentMatchId) {
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id, match_id: this.currentMatchId, response: 'reject' })
            }).catch(e => console.error('Error rejecting:', e));
        }
        
        this.showToastMessage('Вы вернулись в поиск', false);
        this.restartSearch('reject');
    },
    
    createGame() {
        if (this.gameCreating || !this.currentMatchId) return;
        this.gameCreating = true;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ match_id: this.currentMatchId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok' && data.chat_link) {
                this.chatLink = data.chat_link;
                localStorage.setItem('currentChatLink', data.chat_link);
                this.updateWaitingChatButton(true, data.chat_link);
            }
        })
        .catch(() => {})
        .finally(() => { setTimeout(() => this.gameCreating = false, 3000); });
    },
    
    updateWaitingChatButton(active, chatLink) {
        let button = document.getElementById('waitingChatButton');
        if (!button) return;
        button.textContent = 'Перейти в чат';
        if (active && chatLink) {
            button.classList.remove('disabled');
            button.classList.add('active');
            button.disabled = false;
            button.style.background = '#FF5500';
            this.chatLink = chatLink;
            button.onclick = (e) => { e.preventDefault(); this.openChatLink(); };
        }
    },
    
    openChatLink() {
        const chatLink = this.chatLink || localStorage.getItem('currentChatLink');
        if (chatLink) {
            const tg = window.Telegram?.WebApp;
            if (tg?.openTelegramLink) tg.openTelegramLink(chatLink);
            else window.open(chatLink, '_blank');
        }
    },
    
    showPlayer(player) {
        this.currentPlayer = player;
        
        document.getElementById('swipePlayerId').textContent = player.player_id || '';
        document.getElementById('swipePlayerNick').textContent = player.nick || '';
        
        const ratingEl = document.getElementById('swipeRatingValue');
        if (ratingEl) {
            const trust = player.trust_rating || 0;
            ratingEl.textContent = (trust > 0 ? '+' : '') + trust;
            ratingEl.style.color = trust > 0 ? '#4CAF50' : trust < 0 ? '#FF3B30' : '';
        }
        
        const rankEl = document.getElementById('swipeRank');
        if (rankEl) {
            const modeFromDB = this.mode?.toUpperCase();
            if (modeFromDB === 'FACEIT' || modeFromDB === 'PREMIER') {
                rankEl.textContent = player.rating || '0';
            } else {
                rankEl.textContent = abbreviateRank(player.rank || '—');
            }
        }
        
        document.getElementById('swipeAge').textContent = player.age ? player.age + ' лет' : '';
        document.getElementById('swipeStyle').textContent = player.style === 'fan' ? 'Fan' : 'Tryhard';
        document.getElementById('swipeComment').textContent = player.comment || '';
        
        this.updateAvatar(player);
        this.updateLinksVisibility();
        setTimeout(() => this.adjustCardSize(), 50);
    },
    
    updateAvatar(player) {
        const avatarContainer = document.querySelector('#swipeCard .swipe-avatar .tg-avatar-svg');
        if (!avatarContainer) return;
        if (player.avatar && player.avatar !== 'null') {
            avatarContainer.innerHTML = `<img src="${player.avatar}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
    },
    
    updateLinksVisibility() {
        const steamContainer = document.querySelector('.swipe-steam-container');
        const faceitContainer = document.querySelector('.swipe-faceit-container');
        if (this.mode === 'FACEIT') {
            if (steamContainer) steamContainer.style.display = 'none';
            if (faceitContainer) faceitContainer.style.display = 'block';
        } else {
            if (steamContainer) steamContainer.style.display = 'block';
            if (faceitContainer) faceitContainer.style.display = 'none';
        }
    },
    
    showHintOnce() {
        if (!this.hint) return;
        if (!localStorage.getItem('swipeHintShown')) {
            this.hint.classList.remove('fade-out');
            setTimeout(() => this.hint.classList.add('fade-out'), 3000);
            localStorage.setItem('swipeHintShown', 'true');
        }
    },
    
    startSwipeHint() {
        if (!this.skipBtn || !this.inviteBtn || this.isWaitingMode) return;
        if (this.hintRunId) clearTimeout(this.hintRunId);
        if (this.hintInterval) clearInterval(this.hintInterval);
        
        const animateHint = () => {
            if (this.isWaitingMode) return;
            this.skipBtn.classList.add('hint-glow');
            setTimeout(() => {
                if (this.isWaitingMode) return;
                this.skipBtn.classList.remove('hint-glow');
                this.inviteBtn.classList.add('hint-glow');
                setTimeout(() => { if (!this.isWaitingMode) this.inviteBtn.classList.remove('hint-glow'); }, 800);
            }, 800);
        };
        
        this.hintRunId = setTimeout(() => {
            animateHint();
            this.hintInterval = setInterval(() => {
                if (!this.isDragging && !this.isWaitingMode && this.currentMatchId) animateHint();
            }, 8000);
        }, 1000);
    },
    
    connectionTimeout() {
        if (this.matchPolling) clearInterval(this.matchPolling);
        this.showToastMessage('Время ожидания истекло', true);
        setTimeout(() => this.exitSwipeMode('connectionTimeout'), 2000);
    },
    
    handleRejection() {
        this.showToastMessage('Тиммейт отклонил — вы снова в поиске', true);
        this.restartSearch('rejected_by_teammate');
    },
    
    exitSwipeMode(reason) {
        this.unblockScroll();
        this.isWaitingMode = false;
        this.currentMatchId = null;
        this.currentPlayer = null;
        this.matchExpiresAt = null;
        this.iAccepted = false;
        
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        this.hideBackArrow();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Swipe = Swipe;
    const swipeScreen = document.getElementById('swipeScreen');
    if (swipeScreen) {
        new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    if (swipeScreen.classList.contains('active') && !Swipe.isInitialized) {
                        Swipe.init(Swipe.mode || 'FACEIT');
                    }
                }
            });
        }).observe(swipeScreen, { attributes: true });
    }
    if (document.getElementById('swipeScreen')?.classList.contains('active')) {
        setTimeout(() => { if (!Swipe.isInitialized) Swipe.init(Swipe.mode || 'FACEIT'); }, 100);
    }
});
