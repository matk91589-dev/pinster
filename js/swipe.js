// ============================================
// СВАЙП-КАРТОЧКИ - ФИНАЛЬНАЯ ВЕРСИЯ (ВСЕ СЦЕНАРИИ)
// ============================================

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
    hasMoved: false,
    
    // Константы
    SWIPE_THRESHOLD: 100,
    VELOCITY_THRESHOLD: 0.4,
    ANIMATION_DURATION: 350,
    MATCH_TIMEOUT: 40,
    
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
        
        console.log('🔄 Перезапуск поиска, причина:', reason, 'режим:', savedMode);
        
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
                    const eloInput = document.getElementById('faceitELOInput');
                    const ageInput = document.getElementById('faceitAgeValue');
                    if (eloInput) eloInput.value = savedRank;
                    if (ageInput) ageInput.value = savedAge;
                } else if (savedMode === 'PREMIER') {
                    const ratingInput = document.getElementById('premierRatingInput');
                    const ageInput = document.getElementById('premierAgeValue');
                    if (ratingInput) ratingInput.value = savedRank;
                    if (ageInput) ageInput.value = savedAge;
                } else if (savedMode === 'PRIME') {
                    const rankSelect = document.getElementById('primeRankSelect');
                    const ageInput = document.getElementById('primeAgeValue');
                    if (rankSelect) rankSelect.value = savedRank;
                    if (ageInput) ageInput.value = savedAge;
                } else if (savedMode === 'PUBLIC') {
                    const rankSelect = document.getElementById('publicRankSelect');
                    const ageInput = document.getElementById('publicAgeValue');
                    if (rankSelect) rankSelect.value = savedRank;
                    if (ageInput) ageInput.value = savedAge;
                }
                
                Search.forceStopAndStart(savedMode, savedRank);
            }
        }, 200);
    },

    goToMainScreen(reason = 'timeout') {
        console.log('🏠 Возврат на главную, причина:', reason);
        
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
        console.log('🔥 Swipe.init() with mode:', mode);
        
        this.mode = mode;
        this.card = document.getElementById('swipeCard');
        this.container = document.getElementById('swipeContainer');
        this.hint = document.getElementById('swipeHint');
        this.loading = document.getElementById('swipeLoading');
        this.labelLeft = document.getElementById('swipeLabelLeft');
        this.labelRight = document.getElementById('swipeLabelRight');
        this.timerElement = document.getElementById('swipeTimer');
        
        if (!this.card) {
            console.error('❌ Swipe card not found!');
            return;
        }
        
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
        
        console.log('✅ Swipe.init() завершён');
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
        }).catch(err => {
            this.showToastMessage('Ошибка копирования', true);
        });
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
            waitingContent.style.visibility = 'hidden';
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
        window.addEventListener('scroll', () => this.updateButtonsPosition());
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
        
        this.skipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onSideButtonClick('skip');
        });
        
        this.inviteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onSideButtonClick('invite');
        });
        
        setTimeout(() => {
            if (this.skipBtn) {
                this.skipBtn.classList.add('visible');
                this.skipBtn.style.display = 'flex';
            }
            if (this.inviteBtn) {
                this.inviteBtn.classList.add('visible');
                this.inviteBtn.style.display = 'flex';
            }
            this.updateButtonsPosition();
        }, 50);
    },
    
    updateButtonsPosition() {
        if (!this.skipBtn || !this.inviteBtn || !this.card) return;
        if (this.isWaitingMode) return;
        
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
        
        const availableLeft = cardLeft;
        const availableRight = screenWidth - cardRight;
        
        let leftOffset = desiredOffset;
        if (availableLeft < desiredOffset) {
            leftOffset = Math.max(availableLeft - MIN_VISIBLE_OFFSET, MIN_VISIBLE_OFFSET);
            if (leftOffset < MIN_VISIBLE_OFFSET) {
                btnWidth = Math.min(btnWidth, availableLeft - 5);
                leftOffset = Math.max(btnWidth * 0.4, MIN_VISIBLE_OFFSET);
            }
        }
        
        let rightOffset = desiredOffset;
        if (availableRight < desiredOffset) {
            rightOffset = Math.max(availableRight - MIN_VISIBLE_OFFSET, MIN_VISIBLE_OFFSET);
            if (rightOffset < MIN_VISIBLE_OFFSET) {
                btnWidth = Math.min(btnWidth, availableRight - 5);
                rightOffset = Math.max(btnWidth * 0.4, MIN_VISIBLE_OFFSET);
            }
        }
        
        if (screenWidth < 400) {
            btnWidth = Math.min(btnWidth, 44);
            btnHeight = Math.min(btnHeight, 100);
            leftOffset = Math.max(leftOffset, 12);
            rightOffset = Math.max(rightOffset, 12);
        }
        
        if (screenWidth < 340) {
            btnWidth = Math.min(btnWidth, 38);
            btnHeight = Math.min(btnHeight, 90);
            leftOffset = Math.max(leftOffset, 10);
            rightOffset = Math.max(rightOffset, 10);
        }
        
        this.skipBtn.style.width = btnWidth + 'px';
        this.skipBtn.style.height = btnHeight + 'px';
        this.skipBtn.style.minHeight = btnHeight + 'px';
        this.skipBtn.style.top = '50%';
        this.skipBtn.style.transform = 'translateY(-50%)';
        this.skipBtn.style.left = '-' + leftOffset + 'px';
        
        this.inviteBtn.style.width = btnWidth + 'px';
        this.inviteBtn.style.height = btnHeight + 'px';
        this.inviteBtn.style.minHeight = btnHeight + 'px';
        this.inviteBtn.style.top = '50%';
        this.inviteBtn.style.transform = 'translateY(-50%)';
        this.inviteBtn.style.right = '-' + rightOffset + 'px';
        
        const iconSize = Math.min(btnWidth * 0.55, 22);
        const allSvgs = document.querySelectorAll('.swipe-side-btn svg');
        allSvgs.forEach(svg => {
            svg.style.width = iconSize + 'px';
            svg.style.height = iconSize + 'px';
        });
    },
    
    onSideButtonClick(action) {
        if (this.isWaitingMode) return;
        
        if (action === 'skip') {
            this.showToastMessage('Вы отклонили', false);
            this.animateAndReject();
        } else if (action === 'invite') {
            this.showToastMessage('Вы приняли', false);
            this.animateAndAccept();
        }
    },
    
    animateAndAccept() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = 'transform ' + this.ANIMATION_DURATION + 'ms cubic-bezier(0.34, 1.2, 0.64, 1)';
        this.cardWrapper.style.transform = 'translateX(200%) rotate(15deg) scale(0.85)';
        setTimeout(() => {
            if (this.cardWrapper) {
                this.cardWrapper.style.transition = '';
                this.cardWrapper.style.transform = '';
            }
            this.acceptPlayer();
        }, this.ANIMATION_DURATION);
    },
    
    animateAndReject() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = 'transform ' + this.ANIMATION_DURATION + 'ms cubic-bezier(0.34, 1.2, 0.64, 1)';
        this.cardWrapper.style.transform = 'translateX(-200%) rotate(-15deg) scale(0.85)';
        setTimeout(() => {
            if (this.cardWrapper) {
                this.cardWrapper.style.transition = '';
                this.cardWrapper.style.transform = '';
            }
            this.rejectPlayer();
        }, this.ANIMATION_DURATION);
    },
    
    resetCardPosition() {
        if (!this.cardWrapper) return;
        this.cardWrapper.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1)';
        this.cardWrapper.style.transform = 'translateX(0) rotate(0deg) scale(1)';
        this.currentX = 0;
        setTimeout(() => { if (this.cardWrapper) this.cardWrapper.style.transition = ''; }, 300);
    },
    
    adjustCardSize() {
        if (!this.card || this.isWaitingMode) return;
        if (this.cardWrapper) {
            this.cardWrapper.style.marginLeft = 'auto';
            this.cardWrapper.style.marginRight = 'auto';
        }
        this.updateButtonsPosition();
    },
    
    showWaitingMode() {
        const swipeContent = document.getElementById('swipeModeContent');
        const waitingContent = document.getElementById('waitingModeContent');
        
        if (!swipeContent || !waitingContent) return;
        
        swipeContent.style.display = 'none';
        swipeContent.style.visibility = 'hidden';
        
        waitingContent.classList.add('active');
        waitingContent.style.visibility = 'visible';
        
        // 🔥 КАРТОЧКА СТАТИЧНАЯ - УБИРАЕМ ВОЗМОЖНОСТЬ DRAG
        if (this.card) {
            this.card.style.position = 'relative';
            this.card.style.display = 'block';
            this.card.style.visibility = 'visible';
            this.card.style.opacity = '1';
            this.card.style.pointerEvents = 'none'; // 🔥 ОТКЛЮЧАЕМ ВЗАИМОДЕЙСТВИЕ
        }
        
        if (this.cardWrapper) {
            this.cardWrapper.style.pointerEvents = 'none'; // 🔥 ОТКЛЮЧАЕМ DRAG
        }
        
        if (this.skipBtn) {
            this.skipBtn.style.display = 'none';
            this.skipBtn.style.visibility = 'hidden';
            this.skipBtn.style.pointerEvents = 'none';
        }
        if (this.inviteBtn) {
            this.inviteBtn.style.display = 'none';
            this.inviteBtn.style.visibility = 'hidden';
            this.inviteBtn.style.pointerEvents = 'none';
        }
        
        if (this.timerElement) this.timerElement.style.display = 'none';
        
        this.isWaitingMode = true;
        
        // 🔥 ПОКАЗЫВАЕМ СТРЕЛКУ НАЗАД
        setTimeout(() => this.showBackArrow(), 50);
        
        setTimeout(() => {
            this.loadSelfAvatar();
            this.loadTeammateAvatar();
        }, 50);
    },
    
    loadSelfAvatar() {
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (!telegram_id) return;
        const selfAvatarContainer = document.querySelector('.waiting-self-avatar .tg-avatar-svg');
        if (!selfAvatarContainer) return;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/profile/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: telegram_id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok' && data.avatar && data.avatar !== 'null' && data.avatar !== '') {
                selfAvatarContainer.innerHTML = '<img src="' + data.avatar + '" alt="avatar">';
            } else {
                selfAvatarContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
            }
        })
        .catch(() => {
            selfAvatarContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
        });
    },
    
    loadTeammateAvatar() {
        const teammateAvatarContainer = document.querySelector('.waiting-teammate-avatar .tg-avatar-svg');
        if (!teammateAvatarContainer) return;
        if (!this.currentPlayer) {
            teammateAvatarContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
            return;
        }
        if (this.currentPlayer.avatar && this.currentPlayer.avatar !== 'null' && this.currentPlayer.avatar !== '') {
            teammateAvatarContainer.innerHTML = '<img src="' + this.currentPlayer.avatar + '" alt="avatar">';
        } else {
            teammateAvatarContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
        }
    },
    
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
            const waitingTimerEl = document.getElementById('waitingTimer');
            if (waitingTimerEl) waitingTimerEl.classList.remove('warning');
        }
    },
    
    startWithOpponent(opponent, matchId, expiresAt, serverTime) {
        this.isWaitingMode = false;
        this.iAccepted = false;
        
        const modeFromOpponent = opponent.mode || 'PREMIER';
        if (!this.isInitialized) this.init(modeFromOpponent);
        if (this.currentMatchId === matchId) return;
        if (this.currentMatchId && this.currentMatchId !== matchId) this.exitSwipeMode('замена мэтча');
        
        this.showToastMessage('Мэтч найден!', false);
        
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
        const expiresAt = this._pendingExpiresAt;
        
        this._pendingOpponent = null;
        this._pendingMatchId = null;
        this._pendingExpiresAt = null;
        
        this.currentMatchId = matchId;
        this.currentPlayer = opponent;
        this.mode = opponent.mode || this.mode;
        
        this.gameCreated = false;
        this.gameCreating = false;
        this.chatLink = null;
        this.inviteLink = null;
        this.iAccepted = false;
        
        if (expiresAt) {
            this.matchExpiresAt = new Date(expiresAt).getTime();
        } else {
            this.matchExpiresAt = Date.now() + (this.MATCH_TIMEOUT * 1000);
        }
        
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
                    }).catch(e => console.error('Ошибка reject по таймеру:', e));
                }
                
                this.goToMainScreen('card_timeout');
                return;
            }
        
            if (timeLeft < 10) this.timerElement.classList.add('warning');
            else this.timerElement.classList.remove('warning');
        };

        updateTimer();
        this.cardTimerInterval = setInterval(updateTimer, 1000);
    },
    
    blockScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        if (this.container) this.container.style.overflow = 'hidden';
        window.addEventListener('scroll', this.preventDefaultScroll, { passive: false });
        document.addEventListener('touchmove', this.preventDefaultScroll, { passive: false });
        document.addEventListener('mousewheel', this.preventDefaultScroll, { passive: false });
    },
    
    unblockScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        if (this.container) this.container.style.overflow = '';
        window.removeEventListener('scroll', this.preventDefaultScroll);
        document.removeEventListener('touchmove', this.preventDefaultScroll);
        document.removeEventListener('mousewheel', this.preventDefaultScroll);
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
        this.card.addEventListener('touchcancel', this.onDragEndBound);
        this.card.addEventListener('mousedown', this.onDragStartBound);
        window.addEventListener('mousemove', this.onDragMoveBound);
        window.addEventListener('mouseup', this.onDragEndBound);
        this.card.addEventListener('dragstart', (e) => e.preventDefault());
    },
    
    getClientX(e) {
        if (e.clientX !== undefined) return e.clientX;
        if (e.touches && e.touches[0]) return e.touches[0].clientX;
        return null;
    },
    
    onDragStart(e) {
        if (this.isWaitingMode) return;
        if (this.skipBtn?.contains(e.target)) return;
        if (this.inviteBtn?.contains(e.target)) return;
        if (e.target.closest('.copy-btn')) return;
        if (!this.card?.contains(e.target)) return;
        
        this.isDragging = true;
        this.hasMoved = false;
        this.startX = this.getClientX(e);
        this.startTime = Date.now();
        if (this.cardWrapper) this.cardWrapper.classList.add('dragging');
        if (this.card) this.card.style.cursor = 'grabbing';
        e.preventDefault();
    },
    
    onDragMove(e) {
        if (!this.isDragging || this.isWaitingMode) return;
        e.preventDefault();
        const clientX = this.getClientX(e);
        if (clientX === null) return;
        this.currentX = clientX;
        const deltaX = this.currentX - this.startX;
        
        if (Math.abs(deltaX) > 5) {
            this.hasMoved = true;
        }
        
        if (!this.hasMoved) return;
        
        const percent = deltaX / 150;
        const rotate = percent * 12;
        const scale = 1 + Math.abs(percent) * 0.05;
        if (this.cardWrapper) {
            this.cardWrapper.style.transition = 'none';
            this.cardWrapper.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg) scale(${scale})`;
        }
        if (deltaX > 0) {
            this.card?.classList.add('swiping-right');
            this.card?.classList.remove('swiping-left');
        } else if (deltaX < 0) {
            this.card?.classList.add('swiping-left');
            this.card?.classList.remove('swiping-right');
        }
    },
    
    onDragEnd(e) {
        if (!this.isDragging || this.isWaitingMode) return;
        this.isDragging = false;
        if (this.card) this.card.style.cursor = 'grab';
        
        if (!this.hasMoved) {
            this.card?.classList.remove('dragging', 'swiping-right', 'swiping-left');
            this.cardWrapper?.classList.remove('dragging');
            return;
        }
        
        const deltaX = this.currentX - this.startX;
        const time = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX / time);
        const isSwipe = Math.abs(deltaX) > this.SWIPE_THRESHOLD || velocity > this.VELOCITY_THRESHOLD;
        
        if (isSwipe && Math.abs(deltaX) > 10) {
            if (deltaX > 0) {
                this.showToastMessage('Вы приняли', false);
                if (this.cardWrapper) {
                    this.cardWrapper.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.34, 1.2, 0.64, 1)`;
                    this.cardWrapper.style.transform = 'translateX(200%) rotate(15deg) scale(0.85)';
                }
                setTimeout(() => {
                    if (this.cardWrapper) { this.cardWrapper.style.transition = ''; this.cardWrapper.style.transform = ''; }
                    this.acceptPlayer();
                }, this.ANIMATION_DURATION);
            } else {
                this.showToastMessage('Вы отклонили', false);
                if (this.cardWrapper) {
                    this.cardWrapper.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.34, 1.2, 0.64, 1)`;
                    this.cardWrapper.style.transform = 'translateX(-200%) rotate(-15deg) scale(0.85)';
                }
                setTimeout(() => {
                    if (this.cardWrapper) { this.cardWrapper.style.transition = ''; this.cardWrapper.style.transform = ''; }
                    this.rejectPlayer();
                }, this.ANIMATION_DURATION);
            }
        } else {
            this.resetCardPosition();
        }
        
        this.card?.classList.remove('dragging', 'swiping-right', 'swiping-left');
        this.cardWrapper?.classList.remove('dragging');
        e.preventDefault();
    },
    
    acceptPlayer() {
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        if (!this.currentMatchId) { this.exitSwipeMode('acceptPlayer: нет matchId'); return; }
        
        this.iAccepted = true;
        
        const remainingTime = this.getTimeLeft();
        
        this.showWaitingMode();
        
        this.startWaitingTimer(remainingTime);
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id, match_id: this.currentMatchId, response: 'accept' })
        })
        .then(res => res.json())
        .then(() => this.startMatchStatusPolling(this.currentMatchId))
        .catch(error => {
            console.error('Accept error:', error);
            this.showToastMessage('Ошибка при принятии', true);
            setTimeout(() => this.exitSwipeMode('acceptError'), 1000);
        });
    },
    
    startMatchStatusPolling(matchId) {
        if (this.matchPolling) clearInterval(this.matchPolling);
        let attempts = 0;
        const MAX_ATTEMPTS = 80;
        
        this.matchPolling = setInterval(async () => {
            attempts++;
            if (attempts > MAX_ATTEMPTS) {
                clearInterval(this.matchPolling);
                this.matchPolling = null;
                this.connectionTimeout();
                return;
            }
            
            try {
                const res = await fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/status/' + matchId);
                const data = await res.json();
                
                console.log('📡 Статус мэтча:', data);
                
                if (data.status === 'both_accepted') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    if (!this.isWaitingMode) {
                        this.showWaitingMode();
                    }
                    this.updateWaitingUI('both_accepted');
                    this.createGame();
                    this.addFriendAfterMatch();
                } else if (data.status === 'rejected') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    console.log('🔥 Тиммейт отклонил мэтч!');
                    this.handleRejection();
                } else if (data.status === 'expired') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.handleTeammateTimeout();
                } else if (data.status === 'not_found') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    console.log('🔥 Мэтч удалён!');
                    this.showToastMessage('Тиммейт отклонил — вы снова в поиске', true);
                    this.restartSearch('match_not_found');
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000);
    },
    
    updateWaitingUI(status) {
        const statusEl = document.getElementById('waitingStatus');
        const line = document.querySelector('.waiting-line');
        const teammateAvatar = document.querySelector('.waiting-teammate-avatar');
        
        if (status === 'both_accepted') {
            this.stopWaitingTimer();
            
            if (teammateAvatar) {
                teammateAvatar.classList.add('matched');
                teammateAvatar.classList.remove('searching');
            }
            if (line) {
                line.classList.add('matched');
            }
            
            if (statusEl) { 
                statusEl.innerHTML = 'Мэтч создан!'; 
                statusEl.classList.add('active'); 
            }
            
            const chatButton = document.getElementById('waitingChatButton');
            
            // 🔥 БЕРЁМ chatLink ИЗ localStorage ЕСЛИ ЕЩЁ НЕТ В this.chatLink
            const link = this.chatLink || localStorage.getItem('currentChatLink');
            
            console.log('🔗 chatLink в updateWaitingUI:', link);
            
            if (chatButton && link) {
                chatButton.classList.remove('disabled');
                chatButton.classList.add('active');
                chatButton.disabled = false;
                chatButton.style.pointerEvents = 'auto';
                chatButton.style.opacity = '1';
                chatButton.style.background = '#FF5500';
                
                // 🔥 УСТАНАВЛИВАЕМ ОБРАБОТЧИК
                chatButton.onclick = (e) => {
                    e.preventDefault();
                    this.openChatLink();
                };
            } else {
                console.log('⏳ chatLink ещё не получен, ждём...');
                // 🔥 ЕСЛИ chatLink ЕЩЁ НЕТ — ПРОБУЕМ КАЖДЫЕ 500мс
                const checkInterval = setInterval(() => {
                    const updatedLink = this.chatLink || localStorage.getItem('currentChatLink');
                    if (updatedLink) {
                        clearInterval(checkInterval);
                        if (chatButton) {
                            chatButton.classList.remove('disabled');
                            chatButton.classList.add('active');
                            chatButton.disabled = false;
                            chatButton.style.pointerEvents = 'auto';
                            chatButton.style.opacity = '1';
                            chatButton.style.background = '#FF5500';
                            chatButton.onclick = (e) => {
                                e.preventDefault();
                                this.openChatLink();
                            };
                        }
                    }
                }, 500);
                
                // Останавливаем проверку через 10 секунд
                setTimeout(() => clearInterval(checkInterval), 10000);
            }
            
            this.showToastMessage('Мэтч создан!', false);
        }
    },
    
    async addFriendAfterMatch() {
        if (!this.currentPlayer) return;
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (!telegram_id) return;
        try {
            await fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/friends/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id, friend_player_id: this.currentPlayer.player_id })
            });
        } catch (error) {}
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
        
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        
        this.showToastMessage('Вы вернулись в поиск', false);
        this.restartSearch('reject');
    },
    
   createGame() {
        if (this.gameCreating) return;
        if (!this.currentMatchId) return;
        this.gameCreating = true;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ match_id: this.currentMatchId })
        })
        .then(res => res.json())
        .then(data => {
            console.log('📦 Ответ createGame:', data);
            
            // 🔥 ЕСЛИ ЕСТЬ chat_link — АКТИВИРУЕМ
            if (data.chat_link) {
                this.chatLink = data.chat_link;
                this.inviteLink = data.invite_link;
                localStorage.setItem('currentChatLink', data.chat_link);
                if (data.invite_link) localStorage.setItem('currentInviteLink', data.invite_link);
                this.updateWaitingChatButton(true, data.chat_link, data.invite_link);
                this.gameCreated = true;
            }
            // 🔥 ЕСЛИ ИГРА УЖЕ СУЩЕСТВУЕТ — ПРОБУЕМ ПОЛУЧИТЬ ССЫЛКУ ЧЕРЕЗ API
            else if (data.already_exists) {
                console.log('🔄 Игра уже существует, получаем ссылку...');
                // Ждём и пробуем получить chat_link из localStorage или повторным запросом
                this.retryGetChatLink();
            }
            // 🔥 В ОСТАЛЬНЫХ СЛУЧАЯХ — НЕ ДЕЛАЕМ КНОПКУ СЕРОЙ!
            else {
                console.log('⏳ chat_link ещё не готов, ждём...');
                this.retryGetChatLink();
            }
        })
        .catch(error => {
            console.error('❌ Ошибка createGame:', error);
            // НЕ ВЫЗЫВАЕМ updateWaitingChatButton(false)!
            this.retryGetChatLink();
        })
        .finally(() => {
            setTimeout(() => this.gameCreating = false, 3000);
        });
    },
    
    // 🔥 НОВАЯ ФУНКЦИЯ ДЛЯ ПОВТОРНЫХ ПОПЫТОК
    retryGetChatLink() {
        let attempts = 0;
        const maxAttempts = 20;
        
        const checkLink = () => {
            attempts++;
            
            // Проверяем localStorage
            const savedLink = localStorage.getItem('currentChatLink');
            if (savedLink) {
                console.log('✅ Нашли chat_link в localStorage:', savedLink);
                this.chatLink = savedLink;
                this.updateWaitingChatButton(true, savedLink, null);
                this.gameCreated = true;
                return;
            }
            
            // Проверяем this.chatLink
            if (this.chatLink) {
                console.log('✅ chat_link уже есть:', this.chatLink);
                this.updateWaitingChatButton(true, this.chatLink, this.inviteLink);
                this.gameCreated = true;
                return;
            }
            
            if (attempts < maxAttempts) {
                setTimeout(checkLink, 500);
            } else {
                console.log('❌ Не удалось получить chat_link после 10 секунд');
                // ТОЛЬКО ТОГДА ДЕЛАЕМ СЕРОЙ
                this.updateWaitingChatButton(false);
            }
        };
        
        setTimeout(checkLink, 500);
    },
    
    updateWaitingChatButton(active, chatLink, inviteLink) {
        let button = document.getElementById('waitingChatButton');
        if (!button) return;
        button.textContent = 'Перейти в чат';
        if (active && chatLink) {
            button.classList.remove('disabled');
            button.classList.add('active');
            button.disabled = false;
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
            button.style.background = '#FF5500';
            this.chatLink = chatLink;
            this.inviteLink = inviteLink;
            button.onclick = (e) => { e.preventDefault(); this.openChatLink(); };
        } else {
            button.classList.remove('active');
            button.classList.add('disabled');
            button.disabled = true;
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
            button.onclick = null;
        }
    },
    
    openChatLink() {
        let chatLink = this.chatLink || localStorage.getItem('currentChatLink');
        let inviteLink = this.inviteLink || localStorage.getItem('currentInviteLink');
        if (chatLink) {
            const tg = window.Telegram?.WebApp;
            if (inviteLink) {
                if (tg?.openTelegramLink) { tg.openTelegramLink(inviteLink); setTimeout(() => tg.openTelegramLink(chatLink), 1500); }
                else { window.open(inviteLink, '_blank'); setTimeout(() => window.open(chatLink, '_blank'), 1500); }
            } else {
                if (tg?.openTelegramLink) tg.openTelegramLink(chatLink);
                else window.open(chatLink, '_blank');
            }
        } else {
            this.showToastMessage('Ссылка на чат не найдена', true);
        }
    },
    
    showPlayer(player) {
        this.currentPlayer = player;
        
        const playerIdEl = document.getElementById('swipePlayerId');
        const playerNickEl = document.getElementById('swipePlayerNick');
        const ratingEl = document.getElementById('swipeRatingValue');
        const rankEl = document.getElementById('swipeRank');
        const ageEl = document.getElementById('swipeAge');
        const styleEl = document.getElementById('swipeStyle');
        const commentEl = document.getElementById('swipeComment');
        
        // 🔥 МЕНЯЕМ ЛЕЙБЛ В ЗАВИСИМОСТИ ОТ РЕЖИМА
        const rankLabel = document.querySelector('.swipe-stats-row .swipe-stat-item:first-child .swipe-stat-label');
        if (rankLabel) {
            const modeUpper = this.mode ? this.mode.toUpperCase() : '';
            if (modeUpper === 'FACEIT') {
                rankLabel.textContent = 'FACEIT ELO';
            } else if (modeUpper === 'PREMIER') {
                rankLabel.textContent = 'CS RATING';
            } else {
                rankLabel.textContent = 'РАНГ';
            }
        }
        
        if (playerIdEl) playerIdEl.textContent = player.player_id || '';
        if (playerNickEl) playerNickEl.textContent = player.nick || '';
        if (ratingEl) {
            const trust = player.trust_rating || 0;
            ratingEl.textContent = (trust > 0 ? '+' : '') + trust;
            ratingEl.style.color = trust > 0 ? '#4CAF50' : trust < 0 ? '#FF3B30' : '';
        }
        
        const modeFromDB = this.mode ? this.mode.toUpperCase() : null;
        if (rankEl) {
            if (modeFromDB === 'FACEIT' || modeFromDB === 'PREMIER') {
                rankEl.textContent = player.rating || '0';
            } else {
                rankEl.textContent = abbreviateRank(player.rank || '—');
            }
        }
        if (ageEl) ageEl.textContent = player.age ? player.age + ' лет' : '';
        if (styleEl) styleEl.textContent = player.style === 'fan' ? 'Fan' : 'Tryhard';
        
        // 🔥 STEAM ССЫЛКА С КНОПКОЙ КОПИРОВАНИЯ
        const steamContainer = document.querySelector('.swipe-steam-container');
        if (steamContainer) {
            const steamValue = player.steam_link || 'Не указана';
            steamContainer.innerHTML = '';
            
            const label = document.createElement('div');
            label.className = 'swipe-link-label';
            label.textContent = 'Ссылка Steam';
            steamContainer.appendChild(label);
            
            const wrapper = document.createElement('div');
            wrapper.className = 'link-with-copy';
            
            const linkEl = document.createElement('div');
            linkEl.className = 'swipe-link-value';
            linkEl.textContent = steamValue;
            linkEl.style.cssText = `
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            `;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/>
                </svg>
            `;
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                this.copyToClipboard(steamValue, copyBtn);
            };
            
            wrapper.appendChild(linkEl);
            wrapper.appendChild(copyBtn);
            steamContainer.appendChild(wrapper);
        }
        
        // 🔥 FACEIT ССЫЛКА С КНОПКОЙ КОПИРОВАНИЯ
        const faceitContainer = document.querySelector('.swipe-faceit-container');
        if (faceitContainer) {
            const faceitValue = player.faceit_link || 'Не указана';
            faceitContainer.innerHTML = '';
            
            const label = document.createElement('div');
            label.className = 'swipe-link-label';
            label.textContent = 'Ссылка Faceit';
            faceitContainer.appendChild(label);
            
            const wrapper = document.createElement('div');
            wrapper.className = 'link-with-copy';
            
            const linkEl = document.createElement('div');
            linkEl.className = 'swipe-link-value';
            linkEl.textContent = faceitValue;
            linkEl.style.cssText = `
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            `;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/>
                </svg>
            `;
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                this.copyToClipboard(faceitValue, copyBtn);
            };
            
            wrapper.appendChild(linkEl);
            wrapper.appendChild(copyBtn);
            faceitContainer.appendChild(wrapper);
        }
        
        if (commentEl) commentEl.textContent = player.comment || '';
        
        this.updateAvatar(player);
        this.updateLinksVisibility();
        setTimeout(() => this.adjustCardSize(), 50);
    },
    
    updateAvatar(player) {
        const avatarContainer = document.querySelector('#swipeCard .swipe-avatar .tg-avatar-svg');
        if (!avatarContainer) return;
        const hasAvatar = player.avatar && player.avatar !== 'null' && player.avatar !== '';
        if (hasAvatar) {
            avatarContainer.innerHTML = '<img src="' + player.avatar + '" alt="avatar" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:50%;">';
        } else {
            avatarContainer.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="display:block; margin:auto;"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
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
        const hintShown = localStorage.getItem('swipeHintShown');
        if (!hintShown) {
            this.hint.classList.remove('fade-out');
            setTimeout(() => this.hint.classList.add('fade-out'), 3000);
            localStorage.setItem('swipeHintShown', 'true');
        } else {
            this.hint.classList.add('fade-out');
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
        this.matchPolling = null;
        
        const statusEl = document.getElementById('waitingStatus');
        if (statusEl) { statusEl.innerHTML = 'Время истекло'; statusEl.style.color = '#FF3B30'; }
        
        // 🔥 ТОСТ: ВРЕМЯ ВЫШЛО - ВЫ СНОВА В ПОИСКЕ
        this.showToastMessage('Время вышло — вы снова в поиске', true);
        
        // 🔥 ВОЗВРАЩАЕМ В ПОИСК
        const savedMode = this.mode;
        this.exitSwipeMode('connectionTimeout');
        
        setTimeout(() => {
            if (typeof Search !== 'undefined' && savedMode) {
                const modeTitle = document.getElementById('searchModeTitle');
                if (modeTitle) modeTitle.textContent = savedMode;
                Search.forceStopAndStart(savedMode, this.currentPlayer?.rating || this.currentPlayer?.rank || '');
            }
        }, 300);
    },
    
    handleTeammateTimeout() {
        console.log('⏰ Тиммейт не ответил');
        this.showToastMessage('Тиммейт не ответил — вы снова в поиске', true);
        this.restartSearch('teammate_timeout');
    },
    
    handleRejection() {
        console.log('❌ Тиммейт отклонил');
        this.showToastMessage('Тиммейт отклонил — вы снова в поиске', true);
        this.restartSearch('rejected_by_teammate');
    },
    
    exitSwipeMode(reason) {
        console.log('🔄 Выход из свайпа. Причина:', reason);
        this.unblockScroll();
        this.isWaitingMode = false;
        this.currentMatchId = null;
        this.currentPlayer = null;
        this.matchExpiresAt = null;
        this.gameCreated = false;
        this.gameCreating = false;
        this.chatLink = null;
        this.inviteLink = null;
        this.iAccepted = false;
        
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        this.hideBackArrow();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    window.Swipe = Swipe;
    var swipeScreen = document.getElementById('swipeScreen');
    if (swipeScreen) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (swipeScreen.classList.contains('active') && !Swipe.isInitialized) {
                        Swipe.init(Swipe.mode || 'FACEIT');
                    }
                }
            });
        });
        observer.observe(swipeScreen, { attributes: true });
    }
});

if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    setTimeout(() => { if (!Swipe.isInitialized) Swipe.init(Swipe.mode || 'FACEIT'); }, 100);
}
