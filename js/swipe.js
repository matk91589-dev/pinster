// ============================================
// СВАЙП-КАРТОЧКИ - ДИНАМИЧЕСКИЕ КНОПКИ С ЭКРАНОМ ОЖИДАНИЯ
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
    isConnectionMode: false,
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
        
        this.createCardWrapper();
        
        if (!this.card) {
            console.error('❌ Swipe card not found!');
            return;
        }
        
        this.blockScroll();
        this.showHintOnce();
        
        if (this.loading) this.loading.classList.add('active');
        
        if (!this.isInitialized) {
            this.setupEventListeners();
            this.isInitialized = true;
        }
        
        this.initResizeObserver();
        
        console.log('✅ Swipe.init() завершён, isInitialized:', this.isInitialized);
    },
    
    initResizeObserver() {
        console.log('📏 Инициализация ResizeObserver');
        if (this.resizeObserver) this.resizeObserver.disconnect();
        
        this.resizeObserver = new ResizeObserver(() => {
            this.updateButtonsPosition();
            if (this.isConnectionMode) {
                this.syncCardsHeight();
            }
        });
        
        if (this.card) this.resizeObserver.observe(this.card);
        if (this.cardWrapper) this.resizeObserver.observe(this.cardWrapper);
        
        window.addEventListener('resize', () => {
            console.log('📱 Window resize');
            this.updateButtonsPosition();
            if (this.isConnectionMode) {
                setTimeout(() => this.syncCardsHeight(), 50);
            }
        });
        
        window.addEventListener('orientationchange', () => {
            console.log('🔄 Orientation change');
            setTimeout(() => {
                if (this.isConnectionMode) {
                    this.syncCardsHeight();
                }
            }, 200);
        });
        
        window.addEventListener('scroll', () => this.updateButtonsPosition());
    },
    
    syncCardsHeight() {
        const swipeCard = document.querySelector('.swipe-card');
        const connCard = document.querySelector('#connectionScreen .conn-swipe-card');
        
        if (!swipeCard || !connCard) {
            console.log('⚠️ Карточки не найдены для синхронизации высоты');
            return;
        }
        
        const swipeHeight = swipeCard.offsetHeight;
        
        if (swipeHeight === 0) {
            console.log('⚠️ Высота карточки свайпа 0, пробуем позже');
            setTimeout(() => this.syncCardsHeight(), 100);
            return;
        }
        
        connCard.style.height = swipeHeight + 'px';
        connCard.style.minHeight = swipeHeight + 'px';
        
        console.log('✅ Синхронизирована высота карточек:', swipeHeight + 'px');
    },
    
    createCardWrapper() {
        console.log('🔨 createCardWrapper() ВЫЗВАН');
        
        const originalCard = document.getElementById('swipeCard');
        if (!originalCard) {
            console.error('❌ swipeCard не найден');
            return;
        }
        
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
        
        console.log('✅ Обёртка создана');
    },
    
    createSideButtonsInWrapper() {
        console.log('🔨 createSideButtonsInWrapper() ВЫЗВАН');
        
        if (!this.cardWrapper) return;
        
        const oldBtns = this.cardWrapper.querySelectorAll('.swipe-side-btn');
        oldBtns.forEach(btn => btn.remove());
        
        const leftWrapper = document.createElement('div');
        leftWrapper.className = 'swipe-side-btn skip-btn';
        leftWrapper.innerHTML = '<div class="swipe-side-btn-inner"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#FF5E5E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        
        const rightWrapper = document.createElement('div');
        rightWrapper.className = 'swipe-side-btn invite-btn';
        rightWrapper.innerHTML = '<div class="swipe-side-btn-inner"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        
        this.cardWrapper.appendChild(leftWrapper);
        this.cardWrapper.appendChild(rightWrapper);
        
        this.skipBtn = leftWrapper;
        this.inviteBtn = rightWrapper;
        
        this.skipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🖱️ Нажата кнопка SKIP');
            this.onSideButtonClick('skip');
        });
        
        this.inviteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🖱️ Нажата кнопка INVITE');
            this.onSideButtonClick('invite');
        });
        
        this.skipBtn.addEventListener('mousedown', () => this.pulseButton(this.skipBtn));
        this.skipBtn.addEventListener('touchstart', () => this.pulseButton(this.skipBtn));
        this.inviteBtn.addEventListener('mousedown', () => this.pulseButton(this.inviteBtn));
        this.inviteBtn.addEventListener('touchstart', () => this.pulseButton(this.inviteBtn));
        
        console.log('✅ Кнопки созданы');
        
        setTimeout(() => {
            if (this.skipBtn) this.skipBtn.classList.add('visible');
            if (this.inviteBtn) this.inviteBtn.classList.add('visible');
            this.updateButtonsPosition();
        }, 50);
    },
    
    updateButtonsPosition() {
        if (!this.skipBtn || !this.inviteBtn || !this.card) return;
        
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
        
        if (screenWidth < 300) {
            btnWidth = Math.min(btnWidth, 34);
            btnHeight = Math.min(btnHeight, 80);
            leftOffset = Math.max(leftOffset, 8);
            rightOffset = Math.max(rightOffset, 8);
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
    
    pulseButton(btn) {
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 200);
    },
    
    onSideButtonClick(action) {
        if (this.isConnectionMode) return;
        
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
            this.acceptPlayer();
        }, this.ANIMATION_DURATION);
    },
    
    animateAndReject() {
        if (!this.cardWrapper) return;
        
        this.cardWrapper.style.transition = 'transform ' + this.ANIMATION_DURATION + 'ms cubic-bezier(0.34, 1.2, 0.64, 1)';
        this.cardWrapper.style.transform = 'translateX(-200%) rotate(-15deg) scale(0.85)';
        
        setTimeout(() => {
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
        if (!this.card || this.isConnectionMode) return;
        if (this.cardWrapper) {
            this.cardWrapper.style.marginLeft = 'auto';
            this.cardWrapper.style.marginRight = 'auto';
        }
        this.updateButtonsPosition();
    },
    
    startSwipeHint() {
        if (!this.skipBtn || !this.inviteBtn) return;
        
        if (this.hintRunId) clearTimeout(this.hintRunId);
        if (this.hintInterval) clearInterval(this.hintInterval);
        
        const animateHint = () => {
            if (this.isConnectionMode) return;
            
            this.skipBtn.classList.add('hint-glow');
            setTimeout(() => {
                if (this.isConnectionMode) return;
                this.skipBtn.classList.remove('hint-glow');
                this.inviteBtn.classList.add('hint-glow');
                setTimeout(() => {
                    if (this.isConnectionMode) return;
                    this.inviteBtn.classList.remove('hint-glow');
                }, 800);
            }, 800);
        };
        
        this.hintRunId = setTimeout(() => {
            animateHint();
            this.hintInterval = setInterval(() => {
                if (!this.isDragging && !this.isConnectionMode && this.currentMatchId) {
                    animateHint();
                }
            }, 8000);
        }, 1000);
    },
    
    startWithOpponent(opponent, matchId, expiresAt, serverTime) {
        console.log('🔄 Swipe.startWithOpponent() вызван, mode:', this.mode);
        
        if (!this.isInitialized) {
            console.log('⚠️ Swipe не инициализирован, вызываем init()');
            this.init(opponent.mode || 'FACEIT');
        }
        
        if (this.currentMatchId === matchId) {
            console.log('⚠️ уже показываем этот матч');
            return;
        }
        if (this.currentMatchId && this.currentMatchId !== matchId) {
            console.warn('⚠️ заменяем матч', this.currentMatchId, 'на', matchId);
            this.exitSwipeMode('замена матча');
        }
        
        this._pendingOpponent = opponent;
        this._pendingMatchId = matchId;
        this._pendingExpiresAt = expiresAt;
        this._pendingServerTime = serverTime;
        
        this._waitForCardAndStart();
    },
    
    _waitForCardAndStart() {
        const checkCard = () => {
            this.card = document.getElementById('swipeCard');
            this.container = document.getElementById('swipeContainer');
            this.hint = document.getElementById('swipeHint');
            this.loading = document.getElementById('swipeLoading');
            this.labelLeft = document.getElementById('swipeLabelLeft');
            this.labelRight = document.getElementById('swipeLabelRight');
            
            if (!this.card) {
                console.log('⏳ Ждем карточку...');
                setTimeout(checkCard, 50);
                return;
            }
            
            console.log('✅ Карточка найдена');
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
        this._pendingServerTime = null;
        
        this.currentMatchId = matchId;
        this.currentPlayer = opponent;
        this.isConnectionMode = false;
        this.mode = opponent.mode || this.mode;
        
        this.gameCreated = false;
        this.gameCreating = false;
        this.chatLink = null;
        this.inviteLink = null;
        
        if (expiresAt) {
            if (typeof expiresAt === 'string') {
                this.matchExpiresAt = new Date(expiresAt).getTime();
            } else {
                this.matchExpiresAt = expiresAt;
            }
        }
        
        const timeLeft = this.getTimeLeft();
        
        if (timeLeft <= 0) {
            console.warn('⚠️ Время истекло');
            this.exitSwipeMode('timeout_accept');
            return;
        }
        
        if (this.loading) this.loading.classList.remove('active');
        
        this.resetCardPosition();
        
        this.showPlayer(opponent);
        this.startCardTimer();
        this.blockScroll();
        this.showHintOnce();
        
        if (!this.isInitialized) {
            this.setupEventListeners();
            this.isInitialized = true;
        }
        
        setTimeout(() => this.startSwipeHint(), 300);
        setTimeout(() => this.adjustCardSize(), 50);
        
        if (this.skipBtn) this.skipBtn.classList.add('visible');
        if (this.inviteBtn) this.inviteBtn.classList.add('visible');
        
        setTimeout(() => this.updateButtonsPosition(), 100);
        
        console.log('✅ Swipe готов с оппонентом:', opponent.nick);
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
        
        const timerElement = document.getElementById('swipeTimer');
        if (!timerElement) return;
        
        const updateTimer = () => {
            const timeLeft = this.getTimeLeft();
            timerElement.innerHTML = timeLeft + 'с';
            
            if (timeLeft <= 0) {
                timerElement.classList.add('warning');
                clearInterval(this.cardTimerInterval);
                this.cardTimerInterval = null;
                this.exitSwipeMode('таймер истек');
                return;
            }
            
            if (timeLeft < 10) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
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
        if (!this.card) {
            console.error('❌ Card not found');
            return;
        }
        
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
        
        console.log('✅ Обработчики свайпа установлены');
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
        if (this.isConnectionMode) return;
        
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
        if (!this.isDragging || this.isConnectionMode) return;
        
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
        if (!this.isDragging || this.isConnectionMode) return;
        
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
                    this.acceptPlayer();
                }, this.ANIMATION_DURATION);
            } else {
                if (this.cardWrapper) {
                    this.cardWrapper.style.transition = 'transform ' + this.ANIMATION_DURATION + 'ms cubic-bezier(0.34, 1.2, 0.64, 1)';
                    this.cardWrapper.style.transform = 'translateX(-200%) rotate(-15deg) scale(0.85)';
                }
                setTimeout(() => {
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
        console.log('✅ Принят игрок:', this.currentPlayer);
        
        if (window.Settings && window.Settings.success) window.Settings.success();
        
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        
        if (!this.currentMatchId) {
            console.error('❌ Нет currentMatchId!');
            this.exitSwipeMode('acceptPlayer: нет matchId');
            return;
        }
        
        this.showConnectionMode();
        if (this.card) this.card.style.opacity = '0';
        
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
            console.log('📦 Accept response:', data);
            this.startMatchStatusPolling(this.currentMatchId);
        })
        .catch(error => {
            console.error('❌ Error:', error);
            setTimeout(() => {
                this.exitConnectionMode();
            }, 1000);
        });
    },
    
    startMatchStatusPolling(matchId) {
        console.log('🔄 Запускаем polling для ID:', matchId);
        
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
                    this.updateConnectionUI('both_accepted');
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
                console.error('❌ Polling error:', error);
            }
        }, 1500);
    },
    
    updateConnectionUI(status) {
        const statusEl = document.getElementById('connectionStatus');
        const connectionLine = document.querySelector('#connectionScreen .conn-line');
        const teammateAvatar = document.querySelector('#connectionScreen .conn-teammate-avatar');
        const connectionTimer = document.getElementById('connectionTimer');
        
        if (status === 'both_accepted') {
            if (teammateAvatar) {
                teammateAvatar.classList.add('connected');
                teammateAvatar.style.width = '70px';
                teammateAvatar.style.height = '70px';
                teammateAvatar.style.filter = 'grayscale(0)';
                teammateAvatar.style.opacity = '1';
                teammateAvatar.style.transform = 'scale(1)';
                teammateAvatar.style.transition = 'all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)';
            }
            
            if (connectionLine) {
                connectionLine.classList.add('connected');
                connectionLine.style.background = 'var(--accent)';
                const linePulse = connectionLine.querySelector('.conn-line-pulse');
                if (linePulse) linePulse.style.display = 'none';
            }
            
            if (statusEl) {
                statusEl.innerHTML = 'матч создан';
                statusEl.classList.add('active');
                statusEl.style.color = 'var(--accent)';
            }
            
            if (connectionTimer) {
                connectionTimer.classList.remove('warning');
            }
            
            if (this.connectionTimer) {
                clearInterval(this.connectionTimer);
                this.connectionTimer = null;
            }
            
            if (window.Settings && window.Settings.success) window.Settings.success();
        } else if (status === 'rejected') {
            if (statusEl) {
                statusEl.innerHTML = 'тиммейт отклонил';
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
            const response = await fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/friends/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: telegram_id,
                    friend_player_id: this.currentPlayer.player_id
                })
            });
            
            const data = await response.json();
            console.log('📦 Добавление в друзья:', data);
        } catch (error) {
            console.error('❌ Ошибка добавления в друзья:', error);
        }
    },
    
    rejectPlayer() {
        console.log('❌ Пропущен игрок:', this.currentPlayer);
        
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
        
        if (this.currentMatchId) {
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: telegram_id,
                    match_id: this.currentMatchId,
                    response: 'reject'
                })
            })
            .then(res => res.json())
            .catch(error => console.error('Error rejecting:', error));
        }
        
        setTimeout(() => {
            this.exitSwipeMode('rejectPlayer');
        }, 300);
    },
    
    startConnectionTimer() {
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        const timerElement = document.getElementById('connectionTimer');
        if (!timerElement) return;
        
        const updateTimer = () => {
            const timeLeft = this.getTimeLeft();
            
            if (timeLeft <= 0) {
                timerElement.innerHTML = '0с';
                clearInterval(this.connectionTimer);
                this.connectionTimer = null;
                if (this.matchPolling) {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                }
                this.connectionTimeout();
                return;
            }
            
            if (timeLeft < 10) timerElement.classList.add('warning');
            else timerElement.classList.remove('warning');
            
            timerElement.innerHTML = timeLeft + 'с';
        };
        
        updateTimer();
        this.connectionTimer = setInterval(updateTimer, 1000);
    },
    
    showConnectionMode() {
        console.log('🔄 Показываем экран соединения');
        this.isConnectionMode = true;
        
        if (this.skipBtn) this.skipBtn.style.display = 'none';
        if (this.inviteBtn) this.inviteBtn.style.display = 'none';
        if (this.labelLeft) this.labelLeft.style.display = 'none';
        if (this.labelRight) this.labelRight.style.display = 'none';
        if (this.hint) this.hint.style.display = 'none';
        
        document.getElementById('swipeScreen').classList.remove('active');
        document.getElementById('connectionScreen').classList.add('active');
        
        const teammateNickEl = document.querySelector('#connectionScreen .conn-teammate-nick');
        if (teammateNickEl) teammateNickEl.textContent = this.currentPlayer?.nick || 'Игрок';
        
        const teammateAvatar = document.querySelector('#connectionScreen .conn-teammate-avatar .tg-avatar-svg');
        if (teammateAvatar && this.currentPlayer?.avatar) {
            teammateAvatar.innerHTML = '<img src="' + this.currentPlayer.avatar + '" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">';
        } else if (teammateAvatar) {
            teammateAvatar.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
        }
        
        const selfAvatar = document.querySelector('#connectionScreen .conn-self-avatar .tg-avatar-svg');
        if (selfAvatar) {
            const myAvatar = localStorage.getItem('pingster_avatar') || (window.Profile && Profile.savedAvatarUrl);
            if (myAvatar) {
                selfAvatar.innerHTML = '<img src="' + myAvatar + '" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">';
            } else {
                selfAvatar.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>';
            }
        }
        
        const connectionLine = document.querySelector('#connectionScreen .conn-line');
        if (connectionLine) {
            connectionLine.classList.remove('connected');
            connectionLine.style.background = 'var(--border-color)';
            connectionLine.style.width = '60px';
            connectionLine.style.height = '2px';
            const linePulse = connectionLine.querySelector('.conn-line-pulse');
            if (linePulse) {
                linePulse.style.animation = 'connPulse 1.5s infinite';
            }
        }
        
        const statusEl = document.querySelector('#connectionScreen .conn-status');
        if (statusEl) {
            statusEl.innerHTML = 'ожидание тиммейта...';
            statusEl.classList.remove('active');
            statusEl.style.color = 'var(--text-secondary)';
            statusEl.style.fontSize = '14px';
        }
        
        this.updateChatButton(false);
        this.startConnectionTimer();
        
        // Синхронизируем высоту после рендера
        setTimeout(() => {
            console.log('📐 Синхронизация высоты карточек (первая)');
            this.syncCardsHeight();
        }, 150);
        
        setTimeout(() => {
            console.log('📐 Синхронизация высоты карточек (вторая)');
            this.syncCardsHeight();
        }, 500);
        
        setTimeout(() => {
            console.log('📐 Синхронизация высоты карточек (третья)');
            this.syncCardsHeight();
        }, 1000);
        
        console.log('✅ Экран соединения показан');
    },
    
    updateChatButton(active, chatLink, inviteLink) {
        console.log('🔘 updateChatButton called, active:', active, 'chatLink:', chatLink);
        
        let button = document.querySelector('#connectionScreen .conn-chat-button');
        if (!button) {
            button = document.querySelector('.tg-chat-button');
        }
        
        if (!button) {
            console.error('❌ Кнопка чата не найдена в DOM!');
            return;
        }
        
        console.log('✅ Кнопка чата найдена, текущие классы:', button.className);
        
        button.style.display = 'flex';
        button.textContent = 'Перейти в чат';
        
        if (active && chatLink) {
            button.classList.remove('disabled');
            button.classList.add('active');
            button.disabled = false;
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
            button.style.background = '#FF5500';
            button.style.border = 'none';
            button.style.color = 'white';
            
            this.chatLink = chatLink;
            this.inviteLink = inviteLink;
            localStorage.setItem('currentChatLink', chatLink);
            if (inviteLink) localStorage.setItem('currentInviteLink', inviteLink);
            
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 Кнопка чата нажата, открываем:', chatLink);
                this.openChatLink();
            };
            
            // После активации кнопки синхронизируем высоту
            setTimeout(() => {
                console.log('📐 Синхронизация после активации кнопки');
                this.syncCardsHeight();
            }, 50);
            
            console.log('✅ Кнопка чата АКТИВИРОВАНА');
            console.log('✅ Ссылка чата:', chatLink);
        } else {
            button.classList.remove('active');
            button.classList.add('disabled');
            button.disabled = true;
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
            button.onclick = null;
            console.log('❌ Кнопка чата деактивирована');
        }
    },
    
    openChatLink() {
        let chatLink = this.chatLink || localStorage.getItem('currentChatLink');
        let inviteLink = this.inviteLink || localStorage.getItem('currentInviteLink');
        
        console.log('🔗 openChatLink вызван, chatLink:', chatLink, 'inviteLink:', inviteLink);
        
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
            console.log('✅ Открываем ссылку чата:', chatLink);
        } else {
            console.error('❌ Ссылка не найдена');
            alert('Ссылка на чат не найдена');
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
            console.log('📦 Game create response:', data);
            if (data.status === 'ok' && data.chat_link) {
                console.log('🔗 Получена ссылка чата:', data.chat_link);
                
                this.chatLink = data.chat_link;
                this.inviteLink = data.invite_link;
                localStorage.setItem('currentChatLink', data.chat_link);
                if (data.invite_link) localStorage.setItem('currentInviteLink', data.invite_link);
                
                this.updateChatButton(true, data.chat_link, data.invite_link);
                
                this.gameCreated = true;
                
                // После создания игры синхронизируем высоту
                setTimeout(() => {
                    console.log('📐 Синхронизация после создания игры');
                    this.syncCardsHeight();
                }, 100);
            } else {
                console.warn('⚠️ Нет chat_link в ответе');
                this.updateChatButton(false);
            }
        })
        .catch(error => {
            console.error('Error creating game:', error);
            this.updateChatButton(false);
        })
        .finally(() => {
            setTimeout(() => { 
                this.gameCreating = false;
                this.syncCardsHeight();
            }, 100);
        });
    },
    
    showPlayer(player) {
        this.currentPlayer = player;
        
        if (!this.isConnectionMode) {
            this.resetCardPosition();
            
            const playerIdEl = document.getElementById('swipePlayerId');
            if (playerIdEl) playerIdEl.textContent = player.player_id || '';
            
            const playerNickEl = document.getElementById('swipePlayerNick');
            if (playerNickEl) playerNickEl.textContent = player.nick || '';
            
            const ratingValueEl = document.getElementById('swipeRatingValue');
            if (ratingValueEl) ratingValueEl.textContent = player.trust_rating || '0';
            
            const modeFromDB = this.mode ? this.mode.toUpperCase() : null;
            
            const statItems = document.querySelectorAll('.swipe-stats-row.three-cols .swipe-stat-item');
            if (statItems && statItems.length >= 3) {
                const rankLabelEl = statItems[0].querySelector('.swipe-stat-label');
                if (rankLabelEl) {
                    if (modeFromDB === 'FACEIT') rankLabelEl.textContent = 'ELO FACEIT';
                    else if (modeFromDB === 'PREMIER') rankLabelEl.textContent = 'CS RATING';
                    else if (modeFromDB === 'PRIME' || modeFromDB === 'PUBLIC') rankLabelEl.textContent = 'РАНГ';
                    else rankLabelEl.textContent = '—';
                }
            }
            
            const rankEl = document.getElementById('swipeRank');
            if (rankEl) {
                if (modeFromDB === 'FACEIT') rankEl.textContent = player.rating ? player.rating : '0';
                else if (modeFromDB === 'PREMIER') rankEl.textContent = player.rating ? player.rating : '0';
                else if (modeFromDB === 'PRIME' || modeFromDB === 'PUBLIC') rankEl.textContent = player.rank || '—';
                else rankEl.textContent = '—';
            }
            
            const ageEl = document.getElementById('swipeAge');
            if (ageEl) ageEl.textContent = player.age ? player.age + ' лет' : '';
            
            const styleEl = document.getElementById('swipeStyle');
            if (styleEl) {
                styleEl.textContent = player.style === 'fan' ? 'Fan' : 'Tryhard';
                styleEl.setAttribute('data-style', player.style || 'fan');
            }
            
            const steamLinkEl = document.getElementById('swipeSteamLink');
            if (steamLinkEl) steamLinkEl.textContent = player.steam_link || '';
            
            const faceitLinkEl = document.getElementById('swipeFaceitLink');
            if (faceitLinkEl) faceitLinkEl.textContent = player.faceit_link || '';
            
            const commentEl = document.getElementById('swipeComment');
            if (commentEl) commentEl.textContent = player.comment || '';
            
            this.updateAvatar(player);
            this.updateLinksVisibility();
            setTimeout(() => this.adjustCardSize(), 50);
        }
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
    
    startSwipe(mode) {
        console.log('Swipe.startSwipe() called with mode:', mode);
        this.mode = mode;
        this.playersQueue = [];
        this.isConnectionMode = false;
        this.blockScroll();
        
        if (this.card) {
            if (this.loading) this.loading.classList.add('active');
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
        
        if (this.hintRunId) {
            clearTimeout(this.hintRunId);
            clearInterval(this.hintInterval);
        }
        
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        this.gameCreated = false;
        this.gameCreating = false;
        this.chatLink = null;
        this.inviteLink = null;
        
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
        
        const statusEl = document.querySelector('#connectionScreen .conn-status');
        if (statusEl) {
            statusEl.innerHTML = 'Время истекло';
            statusEl.style.color = '#FF3B30';
        }
        
        setTimeout(() => this.exitSwipeMode('connectionTimeout'), 2000);
    },
    
    handleRejection() {
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        const statusEl = document.querySelector('#connectionScreen .conn-status');
        if (statusEl) {
            statusEl.innerHTML = 'Тиммейт отклонил';
            statusEl.style.color = '#FF3B30';
        }
        
        if (window.Settings && window.Settings.error) window.Settings.error();
        
        setTimeout(() => this.exitSwipeMode('handleRejection'), 2000);
    },
    
    exitConnectionMode() {
        this.isConnectionMode = false;
        if (this.matchPolling) clearInterval(this.matchPolling);
        if (this.labelLeft) this.labelLeft.style.display = 'block';
        if (this.labelRight) this.labelRight.style.display = 'block';
        if (this.hint) this.hint.style.display = 'block';
        this.exitSwipeMode('exitConnectionMode');
    },
    
    exitSwipeMode(reason) {
        reason = reason || 'неизвестно';
        console.log('🔄 Выход из свайпа. Причина:', reason);
        this.unblockScroll();
        this.isConnectionMode = false;
        this.currentMatchId = null;
        this.currentPlayer = null;
        this.matchExpiresAt = null;
        this.serverTime = null;
        this.gameCreated = false;
        this.gameCreating = false;
        this.chatLink = null;
        this.inviteLink = null;
        
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        document.getElementById('connectionScreen').classList.remove('active');
        if (window.App) App.showScreen('mainScreen', true);
        else window.location.href = '/';
    }
};

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Swipe: DOM загружен');
    window.Swipe = Swipe;
    
    var swipeScreen = document.getElementById('swipeScreen');
    if (swipeScreen) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (swipeScreen.classList.contains('active') && !Swipe.isInitialized) {
                        console.log('🎬 swipeScreen активирован');
                        Swipe.init(Swipe.mode || 'FACEIT');
                    }
                }
            });
        });
        observer.observe(swipeScreen, { attributes: true });
    }
    
    window.addEventListener('resize', function() {
        if (Swipe.card && !Swipe.isConnectionMode) Swipe.adjustCardSize();
        if (Swipe.isConnectionMode) Swipe.syncCardsHeight();
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            if (Swipe.card && !Swipe.isConnectionMode) Swipe.adjustCardSize();
            if (Swipe.isConnectionMode) Swipe.syncCardsHeight();
        }, 200);
    });
});

if (document.getElementById('swipeScreen') && document.getElementById('swipeScreen').classList.contains('active')) {
    setTimeout(function() {
        if (!Swipe.isInitialized) {
            Swipe.init(Swipe.mode || 'FACEIT');
        }
    }, 100);
}
