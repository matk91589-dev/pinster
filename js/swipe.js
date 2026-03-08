// ============================================
// СВАЙП-КАРТОЧКИ с автодоводкой и соединением в карточке
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
    
    // Переменные для drag
    isDragging: false,
    startX: 0,
    currentX: 0,
    initialX: 0,
    
    // Константы
    SWIPE_THRESHOLD: 0.25,
    MAX_ROTATE: 6,
    ANIMATION_DURATION: 250,
    AUTO_COMPLETE_DURATION: 300,
    MIN_THRESHOLD_PX: 150,
    
    // Данные
    currentPlayer: null,
    currentMatchId: null,
    playersQueue: [],
    mode: 'PREMIER',
    isInitialized: false,
    connectionTimer: null,
    cardTimerInterval: null,
    connectionEndTime: null,
    isConnectionMode: false,
    matchExpiresAt: null,
    serverTime: null,
    matchPolling: null,
    gameCreated: false,
    matchDuration: null,        // длительность матча в мс
    matchStartTime: null,       // точное время старта по серверу
    
    init(mode) {
        console.log('Swipe.init() with mode:', mode);
        
        this.mode = mode || 'PREMIER';
        this.card = document.getElementById('swipeCard');
        this.container = document.getElementById('swipeContainer');
        this.hint = document.getElementById('swipeHint');
        this.loading = document.getElementById('swipeLoading');
        this.labelLeft = document.getElementById('swipeLabelLeft');
        this.labelRight = document.getElementById('swipeLabelRight');
        
        if (!this.card) {
            console.error('Swipe card not found!');
            return;
        }
        
        this.blockScroll();
        this.showHintOnce();
        this.loadNextPlayer();
        
        if (!this.isInitialized) {
            this.setupEventListeners();
            this.isInitialized = true;
        }
        
        console.log('✅ Swipe инициализирован');
    },
    
    startWithOpponent(opponent, matchId, expiresAt, serverTime) {
        console.log('🔄 Swipe.startWithOpponent() вызван');
        
        this.currentMatchId = matchId;
        this.currentPlayer = opponent;
        this.isConnectionMode = false;
        this.mode = opponent.mode || 'PREMIER';
        this.gameCreated = false;
        
        if (serverTime) {
            this.serverTime = new Date(serverTime).getTime();
        }
        
        if (expiresAt) {
            if (typeof expiresAt === 'string') {
                this.matchExpiresAt = new Date(expiresAt).getTime();
            }
        }
        
        // Вычисляем точную длительность матча
        if (this.matchExpiresAt && this.serverTime) {
            this.matchDuration = this.matchExpiresAt - this.serverTime;
            this.matchStartTime = this.serverTime; // время старта по серверу
            console.log(`📊 Длительность матча: ${this.matchDuration/1000}с`);
            console.log(`📊 Старт по серверу: ${new Date(this.matchStartTime).toLocaleString()}`);
        }
        
        this.card = document.getElementById('swipeCard');
        this.container = document.getElementById('swipeContainer');
        this.hint = document.getElementById('swipeHint');
        this.loading = document.getElementById('swipeLoading');
        this.labelLeft = document.getElementById('swipeLabelLeft');
        this.labelRight = document.getElementById('swipeLabelRight');
        
        if (!this.card) {
            console.error('❌ Swipe card not found in startWithOpponent!');
            return;
        }
        
        this.card.style.transition = 'none';
        this.card.style.transform = 'translateX(0) rotate(0) scale(1)';
        this.card.style.opacity = '1';
        this.card.classList.remove('both-accepted', 'rejected', 'right-swipe', 'left-swipe');
        
        this.showPlayer(opponent);
        this.startCardTimer();
        this.blockScroll();
        this.showHintOnce();
        
        if (!this.isInitialized) {
            this.setupEventListeners();
            this.isInitialized = true;
        }
        
        console.log('✅ Swipe готов с оппонентом:', opponent.nick);
    },
    
    // ИСПРАВЛЕННЫЙ МЕТОД: идеально синхронизированный таймер
    startCardTimer() {
        console.log('⏱️ Запуск таймера на карточке');
        
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        
        const timerElement = document.getElementById('swipeTimer');
        if (!timerElement) return;
        
        if (!this.matchDuration) {
            console.warn('⚠️ Нет данных для таймера');
            timerElement.innerHTML = '30с';
            return;
        }
        
        // Вычисляем смещение времени клиента относительно сервера
        const clientTimeOffset = Date.now() - (this.serverTime || Date.now());
        
        const updateTimer = () => {
            // Текущее время с учетом серверной синхронизации
            const now = Date.now() - clientTimeOffset;
            
            // Сколько прошло с момента старта матча
            const elapsed = now - this.matchStartTime;
            
            // Осталось времени
            const timeLeft = Math.max(0, Math.floor((this.matchDuration - elapsed) / 1000));
            
            if (timeLeft <= 0) {
                timerElement.innerHTML = '0с';
                timerElement.classList.add('warning');
                clearInterval(this.cardTimerInterval);
                this.cardTimerInterval = null;
                return;
            }
            
            if (timeLeft < 10) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
            }
            
            timerElement.innerHTML = timeLeft + 'с';
        };
        
        // Первое обновление через небольшую задержку для точности
        setTimeout(() => {
            updateTimer();
            this.cardTimerInterval = setInterval(updateTimer, 1000);
        }, 100 - (Date.now() % 1000)); // синхронизация с началом секунды
    },
    
    blockScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.touchAction = 'none';
        
        if (this.container) {
            this.container.style.overflow = 'hidden';
            this.container.style.touchAction = 'none';
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
        document.body.style.touchAction = '';
        
        if (this.container) {
            this.container.style.overflow = '';
            this.container.style.touchAction = '';
        }
        
        window.removeEventListener('scroll', this.preventDefaultScroll);
        document.removeEventListener('touchmove', this.preventDefaultScroll);
        document.removeEventListener('mousewheel', this.preventDefaultScroll);
    },
    
    setupEventListeners() {
        this.onDragStartBound = this.onDragStart.bind(this);
        this.onDragMoveBound = this.onDragMove.bind(this);
        this.onDragEndBound = this.onDragEnd.bind(this);
        
        this.card.addEventListener('pointerdown', this.onDragStartBound);
        this.card.addEventListener('pointermove', this.onDragMoveBound);
        this.card.addEventListener('pointerup', this.onDragEndBound);
        this.card.addEventListener('pointercancel', this.onDragEndBound);
        this.card.addEventListener('dragstart', (e) => e.preventDefault());
        console.log('✅ Обработчики событий установлены');
    },
    
    preventScroll(e) {
        e.preventDefault();
        return false;
    },
    
    getClientX(e) {
        return e.clientX ?? e.touches?.[0]?.clientX;
    },
    
    onDragStart(e) {
        if (this.isConnectionMode) return;
        
        this.isDragging = true;
        this.startX = this.getClientX(e);
        this.initialX = this.currentX || 0;
        
        this.card.style.transition = 'none';
        this.card.style.cursor = 'grabbing';
        this.card.style.transform = 'scale(1.02)';
        this.card.classList.remove('right-swipe', 'left-swipe');
        
        e.preventDefault();
    },
    
    onDragMove(e) {
        if (!this.isDragging || this.isConnectionMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const clientX = this.getClientX(e);
        if (!clientX) return;
        
        const deltaX = clientX - this.startX;
        this.currentX = this.initialX + deltaX;
        
        const maxDistance = window.innerWidth * 0.5;
        this.currentX = Math.max(-maxDistance, Math.min(maxDistance, this.currentX));
        
        const threshold = Math.min(window.innerWidth * this.SWIPE_THRESHOLD, this.MIN_THRESHOLD_PX);
        const progress = Math.min(Math.abs(this.currentX) / threshold, 1);
        const rotate = (this.currentX / maxDistance) * this.MAX_ROTATE;
        
        this.card.style.transform = `translateX(${this.currentX}px) rotate(${rotate}deg) scale(1.02)`;
        
        if (this.currentX > 0) {
            this.card.classList.add('right-swipe');
            this.card.classList.remove('left-swipe');
            if (this.labelRight) this.labelRight.style.opacity = progress * 0.9;
            if (this.labelLeft) this.labelLeft.style.opacity = 0;
        } else if (this.currentX < 0) {
            this.card.classList.add('left-swipe');
            this.card.classList.remove('right-swipe');
            if (this.labelLeft) this.labelLeft.style.opacity = progress * 0.9;
            if (this.labelRight) this.labelRight.style.opacity = 0;
        }
    },
    
    onDragEnd(e) {
        if (!this.isDragging || this.isConnectionMode) return;
        
        this.isDragging = false;
        this.card.style.cursor = 'grab';
        
        const threshold = Math.min(window.innerWidth * this.SWIPE_THRESHOLD, this.MIN_THRESHOLD_PX);
        
        if (Math.abs(this.currentX) > threshold) {
            this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
            
            if (this.currentX > 0) {
                this.card.style.transform = `translateX(200%) rotate(8deg) scale(1)`;
                setTimeout(() => {
                    this.acceptPlayer();
                }, this.ANIMATION_DURATION);
            } else {
                this.card.style.transform = `translateX(-200%) rotate(-8deg) scale(1)`;
                setTimeout(() => {
                    this.rejectPlayer();
                }, this.ANIMATION_DURATION);
            }
        } else {
            this.resetCardPosition();
        }
        
        e.preventDefault();
    },
    
    resetCardPosition() {
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
        this.card.style.transform = 'translateX(0) rotate(0) scale(1)';
        this.currentX = 0;
        
        if (this.labelLeft) this.labelLeft.style.opacity = 0;
        if (this.labelRight) this.labelRight.style.opacity = 0;
        
        this.card.classList.remove('right-swipe', 'left-swipe');
        
        setTimeout(() => {
            this.card.style.transition = 'none';
        }, this.ANIMATION_DURATION);
    },
    
    acceptPlayer() {
        console.log('✅ Принят игрок:', this.currentPlayer);
        console.log('🎯 matchId:', this.currentMatchId);
        
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        
        if (!this.currentMatchId) {
            console.error('❌ Нет currentMatchId!');
            this.exitSwipeMode();
            return;
        }
        
        this.card.style.transition = 'opacity 0.2s ease';
        this.card.style.opacity = '0';
        
        setTimeout(() => {
            this.showConnectionMode();
        }, 200);
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                match_id: this.currentMatchId,
                response: 'accept'
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('📦 Accept response:', data);
            
            this.startMatchStatusPolling(this.currentMatchId);
            
            if (data.both_accepted) {
                console.log('🎉 Оба приняли (мгновенно)!');
            } else if (data.status === 'rejected') {
                console.log('❌ Отклонено');
                this.handleRejection();
            } else if (data.status === 'waiting') {
                console.log('⏳ Ожидаем ответа');
                this.startSyncedTimer();
            } else if (data.status === 'already_responded') {
                console.log('⚠️ Уже ответили, проверяем статус через polling');
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            setTimeout(() => {
                this.exitConnectionMode();
                this.loadNextPlayer();
            }, 1000);
        });
    },
    
    startMatchStatusPolling(matchId) {
        console.log('🔄 Запускаем polling статуса матча для ID:', matchId);
        
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        this.matchPolling = setInterval(async () => {
            try {
                const res = await fetch(`https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/status/${matchId}`);
                const data = await res.json();
                
                console.log('📦 Polling status response:', data);
                
                if (data.status === 'both_accepted') {
                    console.log('🎉 Оба приняли (через polling)!');
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.handleBothAccepted();
                }
                
                if (data.status === 'rejected' || data.status === 'expired') {
                    console.log(`❌ Матч ${data.status}`);
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    
                    if (data.status === 'rejected') {
                        this.handleRejection();
                    } else if (data.status === 'expired') {
                        this.connectionTimeout();
                    }
                }
                
            } catch (error) {
                console.error('❌ Error in match polling:', error);
            }
        }, 2000);
    },
    
    rejectPlayer() {
        console.log('❌ Пропущен игрок:', this.currentPlayer);
        console.log('🎯 matchId:', this.currentMatchId);
        
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
            fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: telegram_id,
                    match_id: this.currentMatchId,
                    response: 'reject'
                })
            })
            .then(res => res.json())
            .then(data => console.log('📦 Reject response:', data))
            .catch(error => console.error('Error rejecting:', error));
        }
        
        setTimeout(() => {
            this.exitSwipeMode();
        }, 300);
    },
    
    // ИСПРАВЛЕННЫЙ МЕТОД: синхронизированный таймер для экрана соединения
    startSyncedTimer() {
        console.log('⏱️ Запуск синхронизированного таймера (connection mode)');
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        const timerElement = document.getElementById('cardConnectionTimer');
        if (!timerElement) return;
        
        if (!this.matchDuration) {
            console.warn('⚠️ Нет данных для таймера');
            return;
        }
        
        // Используем то же смещение времени, что и для карточки
        const clientTimeOffset = Date.now() - (this.serverTime || Date.now());
        
        const updateTimer = () => {
            const now = Date.now() - clientTimeOffset;
            const elapsed = now - this.matchStartTime;
            const timeLeft = Math.max(0, Math.floor((this.matchDuration - elapsed) / 1000));
            
            if (timeLeft <= 0) {
                timerElement.innerHTML = `
                    <svg class="timer-icon" width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="#B00000" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12" y2="12" stroke="#B00000" stroke-width="2"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="#B00000" stroke-width="2"/>
                    </svg>
                    <span>0с</span>
                `;
                clearInterval(this.connectionTimer);
                this.connectionTimer = null;
                
                if (this.matchPolling) {
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                }
                
                this.connectionTimeout();
                return;
            }
            
            if (timeLeft < 10) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
            }
            
            timerElement.innerHTML = `
                <svg class="timer-icon" width="16" height="16" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="${timeLeft < 10 ? '#B00000' : '#FF5500'}" stroke-width="2"/>
                    <polyline points="12 6 12 12 16 14" stroke="${timeLeft < 10 ? '#B00000' : '#FF5500'}" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>${timeLeft}с</span>
            `;
        };
        
        // Синхронизируем с началом секунды
        setTimeout(() => {
            updateTimer();
            this.connectionTimer = setInterval(updateTimer, 1000);
        }, 100 - (Date.now() % 1000));
    },
    
    showConnectionMode() {
        console.log('🔄 Показываем экран соединения');
        this.isConnectionMode = true;
        
        if (this.labelLeft) this.labelLeft.style.display = 'none';
        if (this.labelRight) this.labelRight.style.display = 'none';
        if (this.hint) this.hint.style.display = 'none';
        
        this.card.style.transition = 'none';
        this.card.style.transform = 'translateX(0) rotate(0) scale(1)';
        this.card.style.opacity = '1';
        
        this.card.innerHTML = this.getConnectionHTML();
        
        const avatars = this.card.querySelectorAll('.connection-avatar');
        avatars.forEach((avatar, index) => {
            avatar.style.opacity = '0';
            avatar.style.transform = 'scale(0.8)';
            setTimeout(() => {
                avatar.style.transition = 'all 0.3s ease';
                avatar.style.opacity = '1';
                avatar.style.transform = 'scale(1)';
            }, 50 + index * 100);
        });
        
        this.setupConnectionMode();
        this.startSyncedTimer();
    },
    
    getConnectionHTML() {
        return `
            <div class="swipe-card-content connection-mode">
                <div class="connection-avatars">
                    <div class="connection-avatar self-avatar">
                        <div class="tg-avatar-svg">
                            <svg viewBox="0 0 24 24" width="35" height="35">
                                <circle cx="12" cy="8" r="4" fill="#FF5500" stroke="#FF5500" stroke-width="2"/>
                                <path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" fill="#FF5500" stroke="#FF5500" stroke-width="2"/>
                            </svg>
                        </div>
                    </div>

                    <div class="connection-line" id="cardConnectionLine">
                        <div class="line-pulse"></div>
                    </div>

                    <div class="connection-avatar teammate-avatar" id="cardTeammateAvatar">
                        <div class="tg-avatar-svg">
                            <svg viewBox="0 0 24 24" width="30" height="30">
                                <circle cx="12" cy="8" r="4" stroke="#9BA1B0" stroke-width="2" fill="none"/>
                                <path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#9BA1B0" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="connection-status" id="cardConnectionStatus">
                    <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#9BA1B0" stroke-width="2"/>
                        <path d="M12 8v4l3 3" stroke="#9BA1B0" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Ожидаем ответа тиммейта...
                </div>

                <div class="teammate-info">
                    <span class="teammate-nick" id="cardTeammateNick">${this.currentPlayer?.nick || 'Игрок'}</span>
                    <span class="teammate-rating" id="cardTeammateRating">
                        ${this.currentPlayer?.rating || '0'}
                        <svg class="heart-icon-small" width="14" height="14" viewBox="0 0 24 24">
                            <path d="M12 21C12 21 4 14 4 8C4 5.79086 5.79086 4 8 4C9.65685 4 11 5.34315 11 7C11 5.34315 12.3431 4 14 4C16.2091 4 18 5.79086 18 8C18 14 12 21 12 21Z" stroke="#FF5500" stroke-width="2" fill="none"/>
                        </svg>
                    </span>
                </div>

                <div class="connection-timer" id="cardConnectionTimer">
                    <svg class="timer-icon" width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="#FF5500" stroke-width="2"/>
                        <polyline points="12 6 12 12 16 14" stroke="#FF5500" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>30с</span>
                </div>
            </div>
        `;
    },
    
    setupConnectionMode() {
        document.getElementById('cardTeammateNick').textContent = this.currentPlayer?.nick || 'Игрок';
        document.getElementById('cardTeammateRating').innerHTML = `
            ${this.currentPlayer?.rating || '0'}
            <svg class="heart-icon-small" width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 21C12 21 4 14 4 8C4 5.79086 5.79086 4 8 4C9.65685 4 11 5.34315 11 7C11 5.34315 12.3431 4 14 4C16.2091 4 18 5.79086 18 8C18 14 12 21 12 21Z" stroke="#FF5500" stroke-width="2" fill="none"/>
            </svg>
        `;
        
        this.card.classList.remove('both-accepted', 'rejected', 'right-swipe', 'left-swipe');
    },
    
    handleBothAccepted() {
        if (this.gameCreated) {
            console.log('⚠️ Игра уже создана, пропускаем');
            return;
        }
        
        console.log('🎉 Оба приняли! Запускаем визуальные изменения');
        
        this.gameCreated = true;
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        this.card.classList.add('both-accepted');
        
        const selfAvatar = document.querySelector('.self-avatar');
        const teammateAvatar = document.querySelector('.teammate-avatar');
        const connectionLine = document.querySelector('.connection-line');
        const statusEl = document.getElementById('cardConnectionStatus');
        const timerEl = document.getElementById('cardConnectionTimer');
        
        if (selfAvatar && teammateAvatar) {
            selfAvatar.style.width = '72px';
            selfAvatar.style.height = '72px';
            teammateAvatar.style.width = '72px';
            teammateAvatar.style.height = '72px';
            teammateAvatar.classList.add('connected');
        }
        
        if (connectionLine) {
            connectionLine.classList.add('connected');
        }
        
        if (timerEl) {
            timerEl.style.opacity = '0';
            timerEl.style.transition = 'opacity 0.3s ease';
        }
        
        if (statusEl) {
            statusEl.innerHTML = `
                <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="2"/>
                    <path d="M8 12L11 15L16 9" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                </svg>
                ✅ Оба приняли приглашение!
            `;
        }
        
        setTimeout(() => {
            if (statusEl) {
                statusEl.innerHTML = `
                    <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="2"/>
                        <path d="M8 12L11 15L16 9" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    🎮 Матч создан!
                `;
            }
            
            this.createGame();
            
        }, 2000);
    },
    
    exitConnectionMode() {
        console.log('🔄 Выход из режима соединения');
        this.isConnectionMode = false;
        
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        if (this.labelLeft) this.labelLeft.style.display = 'block';
        if (this.labelRight) this.labelRight.style.display = 'block';
        if (this.hint) this.hint.style.display = 'block';
        
        this.card.style.transition = 'opacity 0.2s ease';
        this.card.style.opacity = '0';
        
        setTimeout(() => {
            this.exitSwipeMode();
        }, 200);
    },
    
    exitSwipeMode() {
        console.log('🔄 Выход из режима свайпа');
        this.unblockScroll();
        this.isConnectionMode = false;
        this.currentMatchId = null;
        this.currentPlayer = null;
        this.matchExpiresAt = null;
        this.serverTime = null;
        this.matchDuration = null;
        this.matchStartTime = null;
        this.gameCreated = false;
        
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        App.showScreen('mainScreen', true);
    },
    
    getOriginalCardHTML() {
        if (!this.currentPlayer) return '';
        
        return `
            <div class="swipe-label swipe-label-left" id="swipeLabelLeft">SKIP</div>
            <div class="swipe-label swipe-label-right" id="swipeLabelRight">INVITE</div>
            
            <div class="swipe-card-content">
                <div class="swipe-timer" id="swipeTimer">30с</div>
                
                <div class="swipe-player-row">
                    <div class="swipe-avatar">
                        <div class="tg-avatar-svg" style="width: 70px; height: 70px;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="35" height="35">
                                <circle cx="12" cy="8" r="4" stroke="#FF5500" stroke-width="2" fill="none"/>
                                <path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#FF5500" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="swipe-name-block">
                        <div class="swipe-player-id" id="swipePlayerId">${this.currentPlayer.player_id || 'ID'}</div>
                        <div class="swipe-player-nick" id="swipePlayerNick">${this.currentPlayer.nick || 'Игрок'}</div>
                    </div>
                    
                    <div class="swipe-rating-block">
                        <span class="swipe-rating-value" id="swipeRatingValue">${this.currentPlayer.rating || '0'}</span>
                        <span class="heart-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path d="M12 21C12 21 4 14 4 8C4 5.79086 5.79086 4 8 4C9.65685 4 11 5.34315 11 7C11 5.34315 12.3431 4 14 4C16.2091 4 18 5.79086 18 8C18 14 12 21 12 21Z" stroke="#F5F5F5" stroke-width="2" fill="none"/>
                            </svg>
                        </span>
                    </div>
                </div>

                <div class="swipe-rating-line"></div>

                <div class="swipe-stats-row">
                    <div class="swipe-stat-item">
                        <div class="swipe-stat-label">РАНГ</div>
                        <div class="swipe-stat-value" id="swipeRank">${this.currentPlayer.rank || 'Нет'}</div>
                    </div>
                    <div class="swipe-stat-item">
                        <div class="swipe-stat-label">ВОЗРАСТ</div>
                        <div class="swipe-stat-value" id="swipeAge">${this.currentPlayer.age || '?'} лет</div>
                    </div>
                </div>

                <div class="swipe-steam-container">
                    <div class="swipe-link-label">Ссылка Steam</div>
                    <div class="swipe-link-value" id="swipeSteamLink">${this.currentPlayer.steam_link || 'не указана'}</div>
                </div>

                <div class="swipe-faceit-container">
                    <div class="swipe-link-label">Ссылка Faceit</div>
                    <div class="swipe-link-value" id="swipeFaceitLink">${this.currentPlayer.faceit_link || 'не указана'}</div>
                </div>

                <div class="swipe-comment">
                    <div class="swipe-comment-label">Комментарий</div>
                    <div class="swipe-comment-text" id="swipeComment">${this.currentPlayer.comment || 'нет комментария'}</div>
                </div>
            </div>
        `;
    },
    
    connectionTimeout() {
        console.log('⏰ Время истекло');
        
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        this.card.classList.add('rejected');
        const statusEl = document.getElementById('cardConnectionStatus');
        if (statusEl) {
            statusEl.innerHTML = `
                <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#B00000" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="#B00000" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="#B00000" stroke-width="2"/>
                </svg>
                ⏰ Время ожидания истекло
            `;
        }
        
        setTimeout(() => {
            this.exitSwipeMode();
        }, 2000);
    },
    
    handleRejection() {
        console.log('❌ Тиммейт отклонил');
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        this.card.classList.add('rejected');
        const statusEl = document.getElementById('cardConnectionStatus');
        if (statusEl) {
            statusEl.innerHTML = `
                <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#B00000" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="#B00000" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="#B00000" stroke-width="2"/>
                </svg>
                ❌ Тиммейт отклонил приглашение
            `;
        }
        
        setTimeout(() => {
            this.exitSwipeMode();
        }, 2000);
    },
    
    createGame() {
        console.log('Создаем игру для match_id:', this.currentMatchId);
        
        if (!this.currentMatchId) {
            console.log('Нет active match');
            this.exitSwipeMode();
            return;
        }
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                match_id: this.currentMatchId
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Game create response:', data);
            
            if (window.Telegram?.WebApp?.openTelegramLink && data.chat_link) {
                window.Telegram.WebApp.openTelegramLink(data.chat_link);
            }
            
            this.exitSwipeMode();
        })
        .catch(error => {
            console.error('Error creating game:', error);
            this.exitSwipeMode();
        });
    },
    
    loadNextPlayer() {
        if (this.loading) this.loading.classList.add('active');
        
        setTimeout(() => {
            const testPlayer = {
                player_id: Math.floor(10000000 + Math.random() * 90000000),
                nick: 'Player' + Math.floor(Math.random() * 1000),
                rating: Math.floor(1000 + Math.random() * 1500),
                rank: ['Silver 3', 'Gold Nova 2', 'Master Guardian 1', 'Legendary Eagle'][Math.floor(Math.random() * 4)],
                age: Math.floor(16 + Math.random() * 15),
                steam_link: 'steamcommunity.com/id/player' + Math.floor(Math.random() * 1000),
                faceit_link: 'faceit.com/player' + Math.floor(Math.random() * 1000),
                comment: 'ищу норм тиммейтов, без токсиков'
            };
            
            this.showPlayer(testPlayer);
            
            if (this.loading) this.loading.classList.remove('active');
        }, 500);
    },
    
    showPlayer(player) {
        this.currentPlayer = player;
        
        if (!this.isConnectionMode) {
            this.resetCardPosition();
            
            const playerIdEl = document.getElementById('swipePlayerId');
            if (playerIdEl) playerIdEl.textContent = player.player_id || 'ID';
            
            const playerNickEl = document.getElementById('swipePlayerNick');
            if (playerNickEl) playerNickEl.textContent = player.nick || 'Игрок';
            
            const ratingValueEl = document.getElementById('swipeRatingValue');
            if (ratingValueEl) ratingValueEl.textContent = player.rating || '0';
            
            const rankEl = document.getElementById('swipeRank');
            if (rankEl) rankEl.textContent = player.rank || 'Нет';
            
            const ageEl = document.getElementById('swipeAge');
            if (ageEl) ageEl.textContent = (player.age || '?') + ' лет';
            
            const steamLinkEl = document.getElementById('swipeSteamLink');
            if (steamLinkEl) steamLinkEl.textContent = player.steam_link || 'не указана';
            
            const faceitLinkEl = document.getElementById('swipeFaceitLink');
            if (faceitLinkEl) faceitLinkEl.textContent = player.faceit_link || 'не указана';
            
            const commentEl = document.getElementById('swipeComment');
            if (commentEl) commentEl.textContent = player.comment || 'нет комментария';
            
            this.updateLinksVisibility();
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
            setTimeout(() => {
                this.hint.classList.add('fade-out');
            }, 3000);
            localStorage.setItem('swipeHintShown', 'true');
        } else {
            this.hint.classList.add('fade-out');
        }
    },
    
    startSwipe(mode) {
        console.log('Swipe.startSwipe() called with mode:', mode);
        this.mode = mode || 'PREMIER';
        this.playersQueue = [];
        this.isConnectionMode = false;
        
        this.blockScroll();
        
        if (this.card) {
            this.loadNextPlayer();
        } else {
            this.init(mode);
        }
    },
    
    destroy() {
        this.unblockScroll();
        
        if (this.card) {
            this.card.removeEventListener('pointerdown', this.onDragStartBound);
            this.card.removeEventListener('pointermove', this.onDragMoveBound);
            this.card.removeEventListener('pointerup', this.onDragEndBound);
            this.card.removeEventListener('pointercancel', this.onDragEndBound);
        }
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        this.gameCreated = false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Swipe: DOM загружен');
    window.Swipe = Swipe;
});

if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    console.log('Swipe экран уже активен, инициализируем');
    setTimeout(() => Swipe.init(), 100);
}
