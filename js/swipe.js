// ============================================
// СВАЙП-КАРТОЧКИ - СТАТИЧНЫЕ КНОПКИ ПО БОКАМ
// ============================================

const Swipe = {
    // Элементы DOM
    card: null,
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
    SWIPE_THRESHOLD: 120,
    VELOCITY_THRESHOLD: 0.5,
    ANIMATION_DURATION: 250,
    
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
    
    init(mode) {
        console.log('🔥 Swipe.init() with mode:', mode);
        
        this.mode = mode;
        this.card = document.getElementById('swipeCard');
        this.container = document.getElementById('swipeContainer');
        this.hint = document.getElementById('swipeHint');
        this.loading = document.getElementById('swipeLoading');
        this.labelLeft = document.getElementById('swipeLabelLeft');
        this.labelRight = document.getElementById('swipeLabelRight');
        
        this.createSideButtons();
        
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
    },
    
    createSideButtons() {
        console.log('🔨 createSideButtons() ВЫЗВАН');
        
        // Удаляем старые, если есть
        if (this.skipBtn && this.skipBtn.parentNode) this.skipBtn.parentNode.remove();
        if (this.inviteBtn && this.inviteBtn.parentNode) this.inviteBtn.parentNode.remove();
        
        const container = document.getElementById('swipeContainer');
        if (!container) {
            console.error('❌ swipeContainer не найден');
            return;
        }
        
        // Левая кнопка SKIP
        const leftWrapper = document.createElement('div');
        leftWrapper.className = 'swipe-side-btn skip-btn';
        leftWrapper.innerHTML = `
            <div class="swipe-side-btn-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="#FF5E5E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        `;
        
        // Правая кнопка INVITE
        const rightWrapper = document.createElement('div');
        rightWrapper.className = 'swipe-side-btn invite-btn';
        rightWrapper.innerHTML = `
            <div class="swipe-side-btn-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        `;
        
        container.appendChild(leftWrapper);
        container.appendChild(rightWrapper);
        
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
        
        this.skipBtn.addEventListener('mousedown', () => this.pulseButton(this.skipBtn));
        this.skipBtn.addEventListener('touchstart', () => this.pulseButton(this.skipBtn));
        this.inviteBtn.addEventListener('mousedown', () => this.pulseButton(this.inviteBtn));
        this.inviteBtn.addEventListener('touchstart', () => this.pulseButton(this.inviteBtn));
        
        console.log('✅ Кнопки созданы');
        
        setTimeout(() => {
            if (this.skipBtn) this.skipBtn.classList.add('visible');
            if (this.inviteBtn) this.inviteBtn.classList.add('visible');
        }, 50);
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
        if (!this.card) return;
        
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.3, 1)`;
        this.card.style.transform = `translateX(200%) rotate(12deg) scale(0.9)`;
        
        setTimeout(() => {
            this.acceptPlayer();
        }, this.ANIMATION_DURATION);
    },
    
    animateAndReject() {
        if (!this.card) return;
        
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.3, 1)`;
        this.card.style.transform = `translateX(-200%) rotate(-12deg) scale(0.9)`;
        
        setTimeout(() => {
            this.rejectPlayer();
        }, this.ANIMATION_DURATION);
    },
    
    adjustCardSize() {
        if (!this.card || this.isConnectionMode) return;
        this.card.style.marginLeft = 'auto';
        this.card.style.marginRight = 'auto';
    },
    
    adjustConnectionCardSize() {
        const connectionCard = document.querySelector('#connectionScreen .conn-swipe-card');
        if (!connectionCard) return;
        
        // Просто центрируем карточку, не копируем лишние стили
        connectionCard.style.marginLeft = 'auto';
        connectionCard.style.marginRight = 'auto';
        
        console.log('📐 Карточка ожидания центрирована');
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
        if (this.currentMatchId === matchId) {
            console.log('⚠️ startWithOpponent: уже показываем этот матч, игнорируем');
            return;
        }
        if (this.currentMatchId && this.currentMatchId !== matchId) {
            console.warn('⚠️ startWithOpponent: заменяем текущий матч', this.currentMatchId, 'на', matchId);
            this.exitSwipeMode('замена матча');
        }

        console.log('🔄 Swipe.startWithOpponent() вызван');
        
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
                console.log('⏳ Карточка еще не готова, ждем 50ms...');
                setTimeout(checkCard, 50);
                return;
            }
            
            console.log('✅ Карточка найдена, продолжаем');
            this._executeStartWithOpponent();
        };
        
        checkCard();
    },
    
    _executeStartWithOpponent() {
        const opponent = this._pendingOpponent;
        const matchId = this._pendingMatchId;
        const expiresAt = this._pendingExpiresAt;
        const serverTime = this._pendingServerTime;
        
        this._pendingOpponent = null;
        this._pendingMatchId = null;
        this._pendingExpiresAt = null;
        this._pendingServerTime = null;
        
        this.currentMatchId = matchId;
        this.currentPlayer = opponent;
        this.isConnectionMode = false;
        this.mode = opponent.mode;
        
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
            console.warn('⚠️ Время на принятие истекло');
            this.exitSwipeMode('timeout_accept');
            return;
        }
        
        if (this.loading) this.loading.classList.remove('active');
        
        this.card.style.transition = 'none';
        this.card.style.transform = 'translateX(0) rotate(0) scale(1)';
        this.card.style.opacity = '1';
        this.card.classList.remove('both-accepted', 'rejected', 'right-swipe', 'left-swipe', 'accept-overlay', 'reject-overlay');
        
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
                this.exitSwipeMode('таймер истек на карточке');
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
            console.error('❌ Cannot setup listeners: card not found');
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
        
        console.log('✅ Обработчики событий свайпа установлены');
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
        
        const target = e.target;
        if (!this.card.contains(target)) return;
        
        this.isDragging = true;
        this.startX = this.getClientX(e);
        this.startTime = Date.now();
        
        this.card.classList.add('dragging');
        this.card.style.transition = 'none';
        this.card.style.cursor = 'grabbing';
        
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
        
        this.card.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg) scale(${scale})`;
        
        if (deltaX > 0) {
            this.card.classList.add('swiping-right');
            this.card.classList.remove('swiping-left');
        } else if (deltaX < 0) {
            this.card.classList.add('swiping-left');
            this.card.classList.remove('swiping-right');
        }
    },
    
    onDragEnd(e) {
        if (!this.isDragging || this.isConnectionMode) return;
        
        this.isDragging = false;
        this.card.style.cursor = 'grab';
        
        const deltaX = this.currentX - this.startX;
        const time = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX / time);
        
        const isSwipe = Math.abs(deltaX) > this.SWIPE_THRESHOLD || velocity > this.VELOCITY_THRESHOLD;
        
        if (isSwipe && Math.abs(deltaX) > 10) {
            if (window.Settings && window.Settings.swipe) window.Settings.swipe();
            
            this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.3, 1)`;
            
            if (deltaX > 0) {
                this.card.style.transform = `translateX(200%) rotate(12deg) scale(0.9)`;
                setTimeout(() => {
                    this.acceptPlayer();
                }, this.ANIMATION_DURATION);
            } else {
                this.card.style.transform = `translateX(-200%) rotate(-12deg) scale(0.9)`;
                setTimeout(() => {
                    this.rejectPlayer();
                }, this.ANIMATION_DURATION);
            }
        } else {
            this.resetCardPosition();
        }
        
        this.card.classList.remove('dragging', 'swiping-right', 'swiping-left');
        
        e.preventDefault();
    },
    
    resetCardPosition() {
        this.card.style.transition = `transform 0.3s ease`;
        this.card.style.transform = 'translateX(0) rotate(0deg) scale(1)';
        this.currentX = 0;
        
        setTimeout(() => {
            this.card.style.transition = '';
        }, 300);
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
        this.card.style.transition = 'opacity 0.2s ease';
        this.card.style.opacity = '0';
        
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
        console.log('🔄 Запускаем polling статуса матча для ID:', matchId);
        
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
                const res = await fetch(`https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/status/${matchId}`);
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
                console.error('❌ Error in match polling:', error);
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
                timerElement.innerHTML = `0с`;
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
            
            timerElement.innerHTML = `${timeLeft}с`;
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
        
        // Устанавливаем ник тиммейта
        const teammateNickEl = document.querySelector('#connectionScreen .conn-teammate-nick');
        if (teammateNickEl) teammateNickEl.textContent = this.currentPlayer?.nick || 'Игрок';
        
        // Устанавливаем аватар тиммейта
        const teammateAvatar = document.querySelector('#connectionScreen .conn-teammate-avatar .tg-avatar-svg');
        if (teammateAvatar && this.currentPlayer?.avatar) {
            teammateAvatar.innerHTML = `<img src="${this.currentPlayer.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        } else if (teammateAvatar) {
            teammateAvatar.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>`;
        }
        
        // Устанавливаем аватар текущего пользователя
        const selfAvatar = document.querySelector('#connectionScreen .conn-self-avatar .tg-avatar-svg');
        if (selfAvatar) {
            const myAvatar = localStorage.getItem('pingster_avatar') || (window.Profile && Profile.savedAvatarUrl);
            if (myAvatar) {
                selfAvatar.innerHTML = `<img src="${myAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            } else {
                selfAvatar.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/><path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/></svg>`;
            }
        }
        
        // Настраиваем размеры аватарок
        const selfAvatarContainer = document.querySelector('#connectionScreen .conn-self-avatar');
        const teammateAvatarContainer = document.querySelector('#connectionScreen .conn-teammate-avatar');
        
        if (selfAvatarContainer) {
            selfAvatarContainer.style.width = '70px';
            selfAvatarContainer.style.height = '70px';
            selfAvatarContainer.style.border = '2px solid var(--border-color)';
            selfAvatarContainer.style.filter = 'grayscale(0)';
            selfAvatarContainer.style.opacity = '1';
        }
        
        if (teammateAvatarContainer) {
            teammateAvatarContainer.classList.remove('connected');
            teammateAvatarContainer.style.width = '70px';
            teammateAvatarContainer.style.height = '70px';
            teammateAvatarContainer.style.border = '2px solid var(--border-color)';
            teammateAvatarContainer.style.filter = 'grayscale(0.5)';
            teammateAvatarContainer.style.opacity = '0.8';
            teammateAvatarContainer.style.transform = 'scale(1)';
        }
        
        // Настраиваем линию соединения
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
        
        // Статус
        const statusEl = document.querySelector('#connectionScreen .conn-status');
        if (statusEl) {
            statusEl.innerHTML = 'ожидание тиммейта...';
            statusEl.classList.remove('active');
            statusEl.style.color = 'var(--text-secondary)';
            statusEl.style.fontSize = '14px';
        }
        
        this.updateChatButton(false);
        this.startConnectionTimer();
        
        // Центрируем карточку
        setTimeout(() => this.adjustConnectionCardSize(), 50);
        
        console.log('✅ Экран соединения показан');
    },
    
    updateChatButton(active, chatLink = null, inviteLink = null) {
        console.log('🔘 updateChatButton called, active:', active, 'chatLink:', chatLink);
        
        let button = document.querySelector('#connectionScreen .conn-chat-button');
        if (!button) {
            button = document.querySelector('.tg-chat-button');
        }
        const buttonText = document.getElementById('tgChatButtonText');
        
        if (!button) {
            console.error('❌ Кнопка чата не найдена в DOM!');
            return;
        }
        
        console.log('✅ Кнопка чата найдена, текущие классы:', button.className);
        
        button.style.display = 'flex';
        if (buttonText) buttonText.textContent = 'Перейти в чат';
        
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
            if (data.status === 'ok' && data.chat_link) {
                this.updateChatButton(true, data.chat_link, data.invite_link);
                this.gameCreated = true;
                setTimeout(() => this.adjustConnectionCardSize(), 50);
            } else {
                this.updateChatButton(false);
            }
        })
        .catch(error => {
            console.error('Error creating game:', error);
            this.updateChatButton(false);
        })
        .finally(() => {
            setTimeout(() => { this.gameCreating = false; }, 3000);
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
            avatarContainer.innerHTML = `<img src="${player.avatar}" alt="avatar" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:50%;">`;
        } else {
            avatarContainer.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:auto;">
                <circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/>
                <path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/>
            </svg>`;
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
        
        if (this.card) {
            this.card.removeEventListener('touchstart', this.onDragStartBound);
            this.card.removeEventListener('touchmove', this.onDragMoveBound);
            this.card.removeEventListener('touchend', this.onDragEndBound);
            this.card.removeEventListener('touchcancel', this.onDragEndBound);
            this.card.removeEventListener('mousedown', this.onDragStartBound);
        }
        
        window.removeEventListener('mousemove', this.onDragMoveBound);
        window.removeEventListener('mouseup', this.onDragEndBound);
        
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
        
        if (this.skipBtn && this.skipBtn.parentNode) this.skipBtn.parentNode.remove();
        if (this.inviteBtn && this.inviteBtn.parentNode) this.inviteBtn.parentNode.remove();
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
    
    exitSwipeMode(reason = 'неизвестно') {
        console.log(`🔄 Выход из режима свайпа. Причина: ${reason}`);
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Swipe: DOM загружен');
    window.Swipe = Swipe;
    
    window.addEventListener('resize', () => {
        if (Swipe.card && !Swipe.isConnectionMode) Swipe.adjustCardSize();
        if (Swipe.isConnectionMode) Swipe.adjustConnectionCardSize();
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (Swipe.card && !Swipe.isConnectionMode) Swipe.adjustCardSize();
            if (Swipe.isConnectionMode) Swipe.adjustConnectionCardSize();
        }, 200);
    });
});

if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    setTimeout(() => Swipe.init(), 100);
}
