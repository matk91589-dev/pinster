// ============================================
// СВАЙП-КАРТОЧКИ - ФИНАЛЬНАЯ ВЕРСИЯ С ФИКСАМИ
// ============================================

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
    
    hintRunId: null,
    hintInterval: null,
    resizeObserver: null,
    
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
            if (window.Settings && window.Settings.error) window.Settings.error();
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            if (window.Settings && window.Settings.success) window.Settings.success();
            
            if (btnElement) {
                btnElement.classList.add('copied');
                setTimeout(() => btnElement.classList.remove('copied'), 1500);
            }
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            if (window.Settings && window.Settings.error) window.Settings.error();
        });
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
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            this.copyToClipboard(text, copyBtn);
        };
        
        wrapper.appendChild(valueSpan);
        wrapper.appendChild(copyBtn);
        
        return wrapper;
    },
    
    forceShowSwipeMode() {
        console.log('🔧 forceShowSwipeMode()');

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
        
        if (this.timerElement) {
            this.timerElement.style.display = 'flex';
        }
        
        this.isWaitingMode = false;
        
        if (this.cardWrapper) {
            this.cardWrapper.style.transition = '';
            this.cardWrapper.style.transform = 'translateX(0) rotate(0deg) scale(1)';
        }
        
        setTimeout(() => this.updateButtonsPosition(), 100);
    },
    
    initResizeObserver() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        
        this.resizeObserver = new ResizeObserver(() => {
            this.updateButtonsPosition();
        });
        
        if (this.card) this.resizeObserver.observe(this.card);
        if (this.cardWrapper) this.resizeObserver.observe(this.cardWrapper);
        
        window.addEventListener('resize', () => this.updateButtonsPosition());
        window.addEventListener('scroll', () => this.updateButtonsPosition());
    },
    
    createCardWrapper() {
        console.log('🔨 createCardWrapper()');
        
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
            if (window.Settings && window.Settings.error) window.Settings.error();
            this.animateAndReject();
        } else if (action === 'invite') {
            if (window.Settings && window.Settings.swipe) window.Settings.swipe();
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
        
        setTimeout(() => {
            if (this.cardWrapper) this.cardWrapper.style.transition = '';
        }, 300);
    },
    
    adjustCardSize() {
        if (!this.card || this.isWaitingMode) return;
        if (this.cardWrapper) {
            this.cardWrapper.style.marginLeft = 'auto';
            this.cardWrapper.style.marginRight = 'auto';
        }
        this.updateButtonsPosition();
    },
    
    showSwipeMode() {
        console.log('📱 showSwipeMode() called');
        this.forceShowSwipeMode();
    },
    
    showWaitingMode() {
        console.log('⏳ showWaitingMode() called');
        
        const swipeContent = document.getElementById('swipeModeContent');
        const waitingContent = document.getElementById('waitingModeContent');
        
        if (!swipeContent || !waitingContent) {
            console.error('❌ Контент не найден');
            return;
        }
        
        swipeContent.style.display = 'none';
        swipeContent.style.visibility = 'hidden';
        
        waitingContent.classList.add('active');
        waitingContent.style.visibility = 'visible';
        
        if (this.card) {
            this.card.style.position = 'relative';
            this.card.style.display = 'block';
            this.card.style.visibility = 'visible';
            this.card.style.opacity = '1';
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
        
        if (this.timerElement) {
            this.timerElement.style.display = 'none';
        }
        
        this.isWaitingMode = true;
        
        this.startWaitingTimer();
        
        setTimeout(() => {
            this.loadSelfAvatar();
            this.loadTeammateAvatar();
        }, 50);
        
        console.log('✅ Режим ожидания активирован');
    },
    
    loadSelfAvatar() {
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (!telegram_id) return;
        
        const selfAvatarContainer = document.querySelector('.waiting-self-avatar .tg-avatar-svg');
        if (!selfAvatarContainer) return;
        
        console.log('🖼️ Загружаем свой аватар...');
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/profile/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: telegram_id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok' && data.avatar && data.avatar !== 'null' && data.avatar !== '') {
                selfAvatarContainer.innerHTML = '<img src="' + data.avatar + '" alt="avatar">';
                console.log('✅ Свой аватар загружен');
            } else {
                selfAvatarContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
            }
        })
        .catch(error => {
            console.error('❌ Ошибка загрузки аватара:', error);
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
        
        console.log('🖼️ Загружаем аватар тиммейта:', this.currentPlayer.nick);
        
        if (this.currentPlayer.avatar && this.currentPlayer.avatar !== 'null' && this.currentPlayer.avatar !== '') {
            teammateAvatarContainer.innerHTML = '<img src="' + this.currentPlayer.avatar + '" alt="avatar">';
            console.log('✅ Аватар тиммейта загружен');
        } else {
            teammateAvatarContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
        }
    },
    
    startWaitingTimer() {
        let timeLeft = 30;
        const waitingTimerEl = document.getElementById('waitingTimer');
        
        if (!waitingTimerEl) return;
        
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        
        waitingTimerEl.textContent = timeLeft + 'с';
        waitingTimerEl.classList.remove('warning');
        
        this.connectionTimer = setInterval(() => {
            timeLeft--;
            waitingTimerEl.textContent = timeLeft + 'с';
            
            if (timeLeft <= 10 && timeLeft > 0) {
                waitingTimerEl.classList.add('warning');
            }
            
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
            console.log('⏹️ Таймер ожидания остановлен');
            
            const waitingTimerEl = document.getElementById('waitingTimer');
            if (waitingTimerEl) {
                waitingTimerEl.classList.remove('warning');
            }
        }
    },
    
    startSwipeHint() {
        if (!this.skipBtn || !this.inviteBtn) return;
        if (this.isWaitingMode) return;
        
        if (this.hintRunId) clearTimeout(this.hintRunId);
        if (this.hintInterval) clearInterval(this.hintInterval);
        
        const animateHint = () => {
            if (this.isWaitingMode) return;
            
            this.skipBtn.classList.add('hint-glow');
            setTimeout(() => {
                if (this.isWaitingMode) return;
                this.skipBtn.classList.remove('hint-glow');
                this.inviteBtn.classList.add('hint-glow');
                setTimeout(() => {
                    if (this.isWaitingMode) return;
                    this.inviteBtn.classList.remove('hint-glow');
                }, 800);
            }, 800);
        };
        
        this.hintRunId = setTimeout(() => {
            animateHint();
            this.hintInterval = setInterval(() => {
                if (!this.isDragging && !this.isWaitingMode && this.currentMatchId) {
                    animateHint();
                }
            }, 8000);
        }, 1000);
    },
    
    startWithOpponent(opponent, matchId, expiresAt, serverTime) {
        console.log('🎮 startWithOpponent()', opponent, matchId);
        
        this.isWaitingMode = false;
        
        const modeFromOpponent = opponent.mode || 'PREMIER';
        console.log('🔥 Режим из opponent:', modeFromOpponent);
        
        if (!this.isInitialized) {
            this.init(modeFromOpponent);
        }
        
        if (this.currentMatchId === matchId) return;
        if (this.currentMatchId && this.currentMatchId !== matchId) {
            this.exitSwipeMode('замена матча');
        }
        
        this._pendingOpponent = opponent;
        this._pendingMatchId = matchId;
        this._pendingExpiresAt = expiresAt;
        
        this._waitForCardAndStart();
    },
    
    _waitForCardAndStart() {
        const checkCard = () => {
            this.card = document.getElementById('swipeCard');
            
            if (!this.card) {
                console.log('⏳ Ждём появления карточки...');
                setTimeout(checkCard, 50);
                return;
            }
            
            console.log('✅ Карточка найдена, запускаем');
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
        
        this.matchExpiresAt = Date.now() + 30000;
        console.log('⏰ Принудительно ставим 30 секунд');
        
        if (this.loading) this.loading.classList.remove('active');
        
        this.resetCardPosition();
        this.forceShowSwipeMode();
        this.showPlayer(opponent);
        this.startCardTimer();
        this.blockScroll();
        this.showHintOnce();
        
        setTimeout(() => this.startSwipeHint(), 300);
        setTimeout(() => this.adjustCardSize(), 50);
        setTimeout(() => this.updateButtonsPosition(), 100);
    },
    
    getTimeLeft() {
        if (!this.matchExpiresAt) return 30;
        const clientNow = Date.now();
        const timeLeft = Math.max(0, Math.floor((this.matchExpiresAt - clientNow) / 1000));
        return Math.min(timeLeft, 30);
    },
    
    startCardTimer() {
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
    
        if (!this.timerElement) {
            this.timerElement = document.getElementById('swipeTimer');
            if (!this.timerElement) return;
        }
    
        const updateTimer = () => {
            const timeLeft = this.getTimeLeft();
            this.timerElement.innerHTML = timeLeft + 'с';
        
            if (timeLeft <= 0) {
                this.timerElement.classList.add('warning');
                clearInterval(this.cardTimerInterval);
                this.cardTimerInterval = null;
            
                if (typeof Profile !== 'undefined' && Profile.showToast) {
                    Profile.showToast('Время истекло', true);
                }
            
                if (this.currentMatchId) {
                    const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
                    fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            telegram_id: telegram_id,
                            match_id: this.currentMatchId,
                            response: 'reject'
                        })
                    }).catch(e => console.error('Ошибка reject по таймеру:', e));
                }
            
                this.exitSwipeMode('таймер истек');
                return;
            }
        
            if (timeLeft < 10) {
                this.timerElement.classList.add('warning');
            } else {
                this.timerElement.classList.remove('warning');
            }
        };
    
        updateTimer();
        this.cardTimerInterval = setInterval(updateTimer, 1000);
    },
    
    blockScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        
        if (this.container) {
            this.container.style.overflow = 'hidden';
        }
        
        window.addEventListener('scroll', this.preventDefaultScroll, { passive: false });
        document.addEventListener('touchmove', this.preventDefaultScroll, { passive: false });
        document.addEventListener('mousewheel', this.preventDefaultScroll, { passive: false });
    },
    
    unblockScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        
        if (this.container) {
            this.container.style.overflow = '';
        }
        
        window.removeEventListener('scroll', this.preventDefaultScroll);
        document.removeEventListener('touchmove', this.preventDefaultScroll);
        document.removeEventListener('mousewheel', this.preventDefaultScroll);
    },
    
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
    
    preventScroll(e) {
        e.preventDefault();
        return false;
    },
    
    getClientX(e) {
        if (e.clientX !== undefined) return e.clientX;
        if (e.touches && e.touches[0]) return e.touches[0].clientX;
        return null;
    },
    
    onDragStart(e) {
        if (this.isWaitingMode) return;
        
        if (this.hintRunId) {
            clearTimeout(this.hintRunId);
            clearInterval(this.hintInterval);
        }
        if (this.skipBtn) this.skipBtn.classList.remove('hint-glow');
        if (this.inviteBtn) this.inviteBtn.classList.remove('hint-glow');
        
        if (this.skipBtn && this.skipBtn.contains(e.target)) return;
        if (this.inviteBtn && this.inviteBtn.contains(e.target)) return;
        
        const target = e.target;
        if (!this.card || !this.card.contains(target)) return;
        
        this.isDragging = true;
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
        
        const percent = deltaX / 150;
        const rotate = percent * 12;
        const scale = 1 + Math.abs(percent) * 0.05;
        
        if (this.cardWrapper) {
            this.cardWrapper.style.transition = 'none';
            this.cardWrapper.style.transform = 'translateX(' + deltaX + 'px) rotate(' + rotate + 'deg) scale(' + scale + ')';
        }
        
        if (deltaX > 0) {
            if (this.card) this.card.classList.add('swiping-right');
            if (this.card) this.card.classList.remove('swiping-left');
        } else if (deltaX < 0) {
            if (this.card) this.card.classList.add('swiping-left');
            if (this.card) this.card.classList.remove('swiping-right');
        }
    },
    
    onDragEnd(e) {
        if (!this.isDragging || this.isWaitingMode) return;
        
        this.isDragging = false;
        if (this.card) this.card.style.cursor = 'grab';
        
        const deltaX = this.currentX - this.startX;
        const time = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX / time);
        
        const isSwipe = Math.abs(deltaX) > this.SWIPE_THRESHOLD || velocity > this.VELOCITY_THRESHOLD;
        
        if (isSwipe && Math.abs(deltaX) > 10) {
            if (window.Settings && window.Settings.swipe) window.Settings.swipe();
            
            if (deltaX > 0) {
                if (this.cardWrapper) {
                    this.cardWrapper.style.transition = 'transform ' + this.ANIMATION_DURATION + 'ms cubic-bezier(0.34, 1.2, 0.64, 1)';
                    this.cardWrapper.style.transform = 'translateX(200%) rotate(15deg) scale(0.85)';
                }
                setTimeout(() => {
                    if (this.cardWrapper) {
                        this.cardWrapper.style.transition = '';
                        this.cardWrapper.style.transform = '';
                    }
                    this.acceptPlayer();
                }, this.ANIMATION_DURATION);
            } else {
                if (this.cardWrapper) {
                    this.cardWrapper.style.transition = 'transform ' + this.ANIMATION_DURATION + 'ms cubic-bezier(0.34, 1.2, 0.64, 1)';
                    this.cardWrapper.style.transform = 'translateX(-200%) rotate(-15deg) scale(0.85)';
                }
                setTimeout(() => {
                    if (this.cardWrapper) {
                        this.cardWrapper.style.transition = '';
                        this.cardWrapper.style.transform = '';
                    }
                    this.rejectPlayer();
                }, this.ANIMATION_DURATION);
            }
        } else {
            this.resetCardPosition();
        }
        
        if (this.card) {
            this.card.classList.remove('dragging', 'swiping-right', 'swiping-left');
        }
        if (this.cardWrapper) {
            this.cardWrapper.classList.remove('dragging');
        }
        
        e.preventDefault();
    },
    
    acceptPlayer() {
        console.log('✅ acceptPlayer() called');
        
        if (window.Settings && window.Settings.success) window.Settings.success();
        
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        
        if (!this.currentMatchId) {
            this.exitSwipeMode('acceptPlayer: нет matchId');
            return;
        }
        
        this.showWaitingMode();
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                match_id: this.currentMatchId,
                response: 'accept'
            })
        })
        .then(res => res.json())
        .then((data) => {
            this.startMatchStatusPolling(this.currentMatchId);
        })
        .catch(error => {
            console.error('Accept error:', error);
            setTimeout(() => {
                this.exitSwipeMode('acceptError');
            }, 1000);
        });
    },
    
    startMatchStatusPolling(matchId) {
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        let attempts = 0;
        const MAX_ATTEMPTS = 60;
        
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
                
                if (data.status === 'both_accepted') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.updateWaitingUI('both_accepted');
                    this.createGame();
                    this.addFriendAfterMatch();
                }
                
                if (data.status === 'rejected') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.handleRejection();
                }
                
                if (data.status === 'expired') {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.connectionTimeout();
                }
                
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 1500);
    },
    
    updateWaitingUI(status) {
        const statusEl = document.getElementById('waitingStatus');
        const line = document.querySelector('.waiting-line');
        const teammateAvatar = document.querySelector('.waiting-teammate-avatar');
        
        if (status === 'both_accepted') {
            this.stopWaitingTimer();
            
            if (teammateAvatar) teammateAvatar.classList.add('connected');
            if (line) line.classList.add('connected');
            if (statusEl) {
                statusEl.innerHTML = 'Матч создан!';
                statusEl.classList.add('active');
            }
            
            const chatButton = document.getElementById('waitingChatButton');
            if (chatButton && this.chatLink) {
                chatButton.classList.remove('disabled');
                chatButton.classList.add('active');
                chatButton.disabled = false;
            }
            
            if (window.Settings && window.Settings.success) window.Settings.success();
        } else if (status === 'rejected') {
            this.stopWaitingTimer();
            if (statusEl) {
                statusEl.innerHTML = 'Тиммейт отклонил';
                statusEl.style.color = '#FF3B30';
            }
            if (window.Settings && window.Settings.error) window.Settings.error();
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
                body: JSON.stringify({
                    telegram_id: telegram_id,
                    friend_player_id: this.currentPlayer.player_id
                })
            });
        } catch (error) {
            console.error('Ошибка добавления в друзья:', error);
        }
    },
    
    rejectPlayer() {
        console.log('❌ rejectPlayer() called');
        
        if (window.Settings && window.Settings.error) window.Settings.error();
        
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        const savedMode = this.mode;
        
        if (this.currentMatchId) {
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: telegram_id,
                    match_id: this.currentMatchId,
                    response: 'reject'
                })
            }).catch(error => console.error('Error rejecting:', error));
        }
        
        this.unblockScroll();
        this.isWaitingMode = false;
        this.currentMatchId = null;
        this.currentPlayer = null;
        this.matchExpiresAt = null;
        
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        
        // 🔥 ИНТЕРАКТИВНОЕ ОКНО ПРИ ОТКЛОНЕНИИ
        if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'Отклонить тиммейта?',
                message: 'Возвращаем вас в поиск?',
                buttons: [
                    { id: 'cancel', type: 'cancel', text: 'Нет' },
                    { id: 'ok', type: 'default', text: 'Да' }
                ]
            }, (buttonId) => {
                if (buttonId === 'ok') {
                    this.exitSwipeMode('rejectPlayer');
                    setTimeout(() => {
                        if (typeof Search !== 'undefined' && savedMode) {
                            Search.start(savedMode);
                        }
                    }, 300);
                } else {
                    this.exitSwipeMode('rejectPlayer');
                }
            });
        } else {
            const wantSearch = confirm('Отклонить тиммейта? Вернуться в поиск?');
            this.exitSwipeMode('rejectPlayer');
            if (wantSearch) {
                setTimeout(() => {
                    if (typeof Search !== 'undefined' && savedMode) {
                        Search.start(savedMode);
                    }
                }, 300);
            }
        }
    },
    
    createGame() {
        if (this.gameCreating) return;
        if (!this.currentMatchId) {
            this.exitSwipeMode('createGame: нет matchId');
            return;
        }
        
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
                this.inviteLink = data.invite_link;
                localStorage.setItem('currentChatLink', data.chat_link);
                if (data.invite_link) localStorage.setItem('currentInviteLink', data.invite_link);
                this.updateWaitingChatButton(true, data.chat_link, data.invite_link);
                this.gameCreated = true;
            } else {
                this.updateWaitingChatButton(false);
            }
        })
        .catch(error => {
            console.error('Error creating game:', error);
            this.updateWaitingChatButton(false);
        })
        .finally(() => {
            setTimeout(() => { this.gameCreating = false; }, 3000);
        });
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
            
            button.onclick = (e) => {
                e.preventDefault();
                this.openChatLink();
            };
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
                if (tg?.openTelegramLink) {
                    tg.openTelegramLink(inviteLink);
                    setTimeout(() => tg.openTelegramLink(chatLink), 1500);
                } else {
                    window.open(inviteLink, '_blank');
                    setTimeout(() => window.open(chatLink, '_blank'), 1500);
                }
            } else {
                if (tg?.openTelegramLink) {
                    tg.openTelegramLink(chatLink);
                } else {
                    window.open(chatLink, '_blank');
                }
            }
        } else {
            alert('Ссылка на чат не найдена');
        }
    },
    
    showPlayer(player) {
        console.log('👤 showPlayer() ПОЛНЫЙ ОБЪЕКТ:', JSON.parse(JSON.stringify(player)));
        console.log('🔍 steam_link:', player.steam_link);
        console.log('🔍 faceit_link:', player.faceit_link);
        console.log('👤 showPlayer()', player);
        this.currentPlayer = player;
        
        const playerIdEl = document.getElementById('swipePlayerId');
        const playerNickEl = document.getElementById('swipePlayerNick');
        const ratingEl = document.getElementById('swipeRatingValue');
        const rankEl = document.getElementById('swipeRank');
        const ageEl = document.getElementById('swipeAge');
        const styleEl = document.getElementById('swipeStyle');
        const steamLinkEl = document.getElementById('swipeSteamLink');
        const faceitLinkEl = document.getElementById('swipeFaceitLink');
        const commentEl = document.getElementById('swipeComment');
        
        if (playerIdEl) playerIdEl.textContent = player.player_id || '';
        if (playerNickEl) playerNickEl.textContent = player.nick || '';
        if (ratingEl) {
            const trust = player.trust_rating || 0;
            ratingEl.textContent = (trust > 0 ? '+' : '') + trust;
    
            if (trust > 0) {
                ratingEl.style.color = '#4CAF50';
            } else if (trust < 0) {
                ratingEl.style.color = '#FF3B30';
            } else {
                ratingEl.style.color = '';
            }
        }
        
        const modeFromDB = this.mode ? this.mode.toUpperCase() : null;
        
        if (rankEl) {
            if (modeFromDB === 'FACEIT') rankEl.textContent = player.rating || '0';
            else if (modeFromDB === 'PREMIER') rankEl.textContent = player.rating || '0';
            else rankEl.textContent = player.rank || '—';
        }
        
        if (ageEl) ageEl.textContent = player.age ? player.age + ' лет' : '';
        
        if (styleEl) {
            styleEl.textContent = player.style === 'fan' ? 'Fan' : 'Tryhard';
        }
        
        const steamValue = player.steam_link || 'Не указана';
        if (steamLinkEl && steamValue !== 'Не указана' && steamValue !== '') {
            const wrapper = this.createLinkWithCopy(steamValue);
            const parent = steamLinkEl.parentNode;
            steamLinkEl.remove();
            parent.appendChild(wrapper);
        } else if (steamLinkEl) {
            steamLinkEl.textContent = steamValue;
        }
        
        const faceitValue = player.faceit_link || 'Не указана';
        if (faceitLinkEl && faceitValue !== 'Не указана' && faceitValue !== '') {
            const wrapper = this.createLinkWithCopy(faceitValue);
            const parent = faceitLinkEl.parentNode;
            faceitLinkEl.remove();
            parent.appendChild(wrapper);
        } else if (faceitLinkEl) {
            faceitLinkEl.textContent = faceitValue;
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
        
        console.log('🔍 updateLinksVisibility - режим:', this.mode);
        
        if (this.mode === 'FACEIT') {
            if (steamContainer) steamContainer.style.display = 'none';
            if (faceitContainer) faceitContainer.style.display = 'block';
            console.log('🔍 Показываем Faceit блок');
        } else {
            if (steamContainer) steamContainer.style.display = 'block';
            if (faceitContainer) faceitContainer.style.display = 'none';
            console.log('🔍 Показываем Steam блок');
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
    
    startSwipe(mode) {
        this.mode = mode;
        this.playersQueue = [];
        this.isWaitingMode = false;
        this.blockScroll();
        
        if (this.card) {
            if (this.loading) this.loading.classList.add('active');
            this.forceShowSwipeMode();
        } else {
            this.init(mode);
        }
    },
    
    destroy() {
        this.unblockScroll();
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        if (this.card) {
            this.card.removeEventListener('touchstart', this.onDragStartBound);
            this.card.removeEventListener('touchmove', this.onDragMoveBound);
            this.card.removeEventListener('touchend', this.onDragEndBound);
            this.card.removeEventListener('touchcancel', this.onDragEndBound);
            this.card.removeEventListener('mousedown', this.onDragStartBound);
        }
        
        window.removeEventListener('mousemove', this.onDragMoveBound);
        window.removeEventListener('mouseup', this.onDragEndBound);
        window.removeEventListener('resize', this.updateButtonsPosition);
        window.removeEventListener('scroll', this.updateButtonsPosition);
        
        if (this.hintRunId) clearTimeout(this.hintRunId);
        if (this.hintInterval) clearInterval(this.hintInterval);
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        const wrapper = document.querySelector('.swipe-card-wrapper');
        if (wrapper && this.card) {
            const parent = wrapper.parentNode;
            parent.insertBefore(this.card, wrapper);
            wrapper.remove();
        }
    },
    
    connectionTimeout() {
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        const statusEl = document.getElementById('waitingStatus');
        if (statusEl) {
            statusEl.innerHTML = 'Время истекло';
            statusEl.style.color = '#FF3B30';
        }
        
        setTimeout(() => this.exitSwipeMode('connectionTimeout'), 2000);
    },
    
    handleRejection() {
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        const statusEl = document.getElementById('waitingStatus');
        if (statusEl) {
            statusEl.innerHTML = 'Тиммейт отклонил';
            statusEl.style.color = '#FF3B30';
        }
        
        if (window.Settings && window.Settings.error) window.Settings.error();
        
        const savedMode = this.mode;
        
        if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'Тиммейт отклонил',
                message: 'Возвращаем вас в поиск?',
                buttons: [
                    { id: 'cancel', type: 'cancel', text: 'Нет' },
                    { id: 'ok', type: 'default', text: 'Да' }
                ]
            }, (buttonId) => {
                if (buttonId === 'ok') {
                    this.exitSwipeMode('handleRejection');
                    setTimeout(() => {
                        if (typeof Search !== 'undefined' && savedMode) {
                            Search.start(savedMode);
                        }
                    }, 300);
                } else {
                    this.exitSwipeMode('handleRejection');
                }
            });
        } else {
            const wantSearch = confirm('Тиммейт отклонил. Хотите вернуться в поиск?');
            this.exitSwipeMode('handleRejection');
            if (wantSearch) {
                setTimeout(() => {
                    if (typeof Search !== 'undefined' && savedMode) {
                        Search.start(savedMode);
                    }
                }, 300);
            }
        }
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
        
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        if (window.App) App.showScreen('mainScreen', true);
        else window.location.href = '/';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Swipe: DOM загружен');
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

if (document.getElementById('swipeScreen') && document.getElementById('swipeScreen').classList.contains('active')) {
    setTimeout(function() {
        if (!Swipe.isInitialized) {
            Swipe.init(Swipe.mode || 'FACEIT');
        }
    }, 100);
}
