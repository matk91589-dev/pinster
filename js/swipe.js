// ============================================
// СВАЙП-КАРТОЧКИ - РАБОЧАЯ ВЕРСИЯ
// Время жизни матча = 30 секунд (UTC)
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
    
    // Цвета для подсветки
    BRIGHT_GREEN: 'rgba(76, 175, 80, 0.25)',
    BRIGHT_RED: 'rgba(244, 67, 54, 0.25)',
    
    // Данные
    currentPlayer: null,
    currentMatchId: null,
    playersQueue: [],
    mode: 'PREMIER',
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
    
    init(mode) {
        console.log('🔥 Swipe.init() with mode:', mode);
        
        this.mode = mode || 'PREMIER';
        this.card = document.getElementById('swipeCard');
        this.container = document.getElementById('swipeContainer');
        this.hint = document.getElementById('swipeHint');
        this.loading = document.getElementById('swipeLoading');
        this.labelLeft = document.getElementById('swipeLabelLeft');
        this.labelRight = document.getElementById('swipeLabelRight');
        
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
        console.log('📦 opponent:', opponent);
        console.log('📦 matchId:', matchId);
        console.log('📦 expiresAt:', expiresAt);
        console.log('📦 serverTime:', serverTime);
        
        this.currentMatchId = matchId;
        this.currentPlayer = opponent;
        this.isConnectionMode = false;
        this.mode = opponent.mode || 'PREMIER';
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
            console.log('✅ matchExpiresAt (UTC):', new Date(this.matchExpiresAt).toUTCString());
        }
        
        // ПРОСТОЕ РЕШЕНИЕ: считаем разницу между expires_at и текущим временем
        const clientNow = Date.now();
        const timeLeft = Math.floor((this.matchExpiresAt - clientNow) / 1000);
        
        console.log(`⏰ Текущее время (клиент): ${new Date(clientNow).toLocaleString()}`);
        console.log(`⏰ expires_at (UTC): ${new Date(this.matchExpiresAt).toUTCString()}`);
        console.log(`⏰ Осталось секунд: ${timeLeft}`);
        
        // Если матч истек - выходим
        if (timeLeft <= 0) {
            console.warn('⚠️ Матч истек');
            this.exitSwipeMode('timeLeft <= 0');
            return;
        }
        
        // Если времени больше 60 секунд - обрезаем до 30 (на случай ошибки)
        if (timeLeft > 60) {
            console.warn(`⚠️ Подозрительно много времени: ${timeLeft}с, устанавливаем 30с`);
            // Корректируем expiresAt
            this.matchExpiresAt = clientNow + 30000; // +30 секунд
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
        
        if (this.loading) this.loading.classList.remove('active');
        
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
    
    getTimeLeft() {
        if (!this.matchExpiresAt) {
            return 30;
        }
        
        const clientNow = Date.now();
        const timeLeft = Math.max(0, Math.floor((this.matchExpiresAt - clientNow) / 1000));
        
        // Не даем времени быть больше 30 секунд
        if (timeLeft > 30) {
            return 30;
        }
        
        return timeLeft;
    },
    
    startCardTimer() {
        console.log('⏱️ Запуск таймера на карточке');
        
        if (this.cardTimerInterval) {
            clearInterval(this.cardTimerInterval);
            this.cardTimerInterval = null;
        }
        
        const timerElement = document.getElementById('swipeTimer');
        if (!timerElement) {
            console.warn('⚠️ timerElement не найден');
            return;
        }
        
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
        
        this.card.style.transform = `translateX(${this.currentX}px) rotate(${rotate}deg) scale(${1 + progress * 0.02})`;
        
        if (this.currentX > 0) {
            this.card.classList.add('right-swipe');
            this.card.classList.remove('left-swipe');
            
            this.card.style.background = `linear-gradient(145deg, 
                ${this.BRIGHT_GREEN}, 
                var(--surface) ${Math.min(30 + progress * 40, 70)}%)`;
            
            if (this.labelRight) this.labelRight.style.opacity = progress;
            if (this.labelLeft) this.labelLeft.style.opacity = 0;
            
        } else if (this.currentX < 0) {
            this.card.classList.add('left-swipe');
            this.card.classList.remove('right-swipe');
            
            this.card.style.background = `linear-gradient(145deg, 
                ${this.BRIGHT_RED}, 
                var(--surface) ${Math.min(30 + progress * 40, 70)}%)`;
            
            if (this.labelLeft) this.labelLeft.style.opacity = progress;
            if (this.labelRight) this.labelRight.style.opacity = 0;
        }
    },
    
    onDragEnd(e) {
        if (!this.isDragging || this.isConnectionMode) return;
        
        this.isDragging = false;
        this.card.style.cursor = 'grab';
        
        const threshold = Math.min(window.innerWidth * this.SWIPE_THRESHOLD, this.MIN_THRESHOLD_PX);
        
        if (Math.abs(this.currentX) > threshold) {
            this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.3, 1)`;
            
            if (this.currentX > 0) {
                this.card.style.background = `linear-gradient(145deg, ${this.BRIGHT_GREEN}, var(--surface) 40%)`;
                this.card.style.transform = `translateX(200%) rotate(12deg) scale(0.9)`;
                setTimeout(() => {
                    this.acceptPlayer();
                }, this.ANIMATION_DURATION);
            } else {
                this.card.style.background = `linear-gradient(145deg, ${this.BRIGHT_RED}, var(--surface) 40%)`;
                this.card.style.transform = `translateX(-200%) rotate(-12deg) scale(0.9)`;
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
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.25, 0.8, 0.25, 1), background 0.2s ease`;
        this.card.style.transform = 'translateX(0) rotate(0) scale(1)';
        this.card.style.background = '';
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
            this.exitSwipeMode('acceptPlayer: нет matchId');
            return;
        }
        
        this.card.style.transition = 'opacity 0.2s ease';
        this.card.style.opacity = '0';
        
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
        .then((data) => {
            console.log('📦 Accept response:', data);
            
            setTimeout(() => {
                this.showConnectionMode();
            }, 200);
            
            this.startMatchStatusPolling(this.currentMatchId);
            
            if (data.both_accepted) {
                console.log('🎉 Оба приняли (мгновенно)!');
                clearInterval(this.matchPolling);
                this.matchPolling = null;
                this.handleBothAccepted();
            } else if (data.status === 'rejected') {
                console.log('❌ Отклонено');
                this.handleRejection();
            } else if (data.status === 'waiting') {
                console.log('⏳ Ожидаем ответа');
            } else if (data.status === 'already_responded') {
                console.log('⚠️ Уже ответили, проверяем статус через polling');
            }
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
            this.exitSwipeMode('rejectPlayer');
        }, 300);
    },
    
    startConnectionTimer() {
        console.log('⏱️ Запуск таймера на экране ожидания');
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        const timerElement = document.getElementById('connectionTimer');
        if (!timerElement) return;
        
        const updateTimer = () => {
            const timeLeft = this.getTimeLeft();
            
            if (timeLeft <= 0) {
                timerElement.innerHTML = `
                    <span class="timer-icon">⏳</span> 0с
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
                <span class="timer-icon">⏳</span> ${timeLeft}с
            `;
        };
        
        updateTimer();
        this.connectionTimer = setInterval(updateTimer, 1000);
    },
    
    showConnectionMode() {
        console.log('🔄 Показываем экран соединения');
        this.isConnectionMode = true;
        
        if (this.labelLeft) this.labelLeft.style.display = 'none';
        if (this.labelRight) this.labelRight.style.display = 'none';
        if (this.hint) this.hint.style.display = 'none';
        
        document.getElementById('swipeScreen').classList.remove('active');
        document.getElementById('connectionScreen').classList.add('active');
        
        document.getElementById('teammateNick').textContent = this.currentPlayer?.nick || 'Игрок';
        document.getElementById('teammateRating').innerHTML = `
            ${this.currentPlayer?.rating || '0'}
            <svg class="heart-icon-small" width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 21C12 21 4 14 4 8C4 5.79086 5.79086 4 8 4C9.65685 4 11 5.34315 11 7C11 5.34315 12.3431 4 14 4C16.2091 4 18 5.79086 18 8C18 14 12 21 12 21Z" stroke="#FF5500" stroke-width="2" fill="none"/>
            </svg>
        `;
        document.getElementById('connectionRank').textContent = this.currentPlayer?.rank || 'Нет ранга';
        document.getElementById('connectionAge').textContent = (this.currentPlayer?.age || '?') + ' лет';
        
        this.updateChatButton(false);
        this.startConnectionTimer();
    },
    
    updateChatButton(active, chatLink = null, inviteLink = null) {
        const button = document.getElementById('tgChatButton');
        const buttonText = document.getElementById('tgChatButtonText');
        const tooltip = document.getElementById('connectionTooltip');
        
        if (!button || !buttonText || !tooltip) return;
        
        if (active && chatLink) {
            button.classList.add('active');
            button.disabled = false;
            buttonText.textContent = 'Перейти в чат';
            tooltip.textContent = 'Матч создан';
            tooltip.classList.add('active');
            
            this.chatLink = chatLink;
            this.inviteLink = inviteLink;
            localStorage.setItem('currentChatLink', chatLink);
            if (inviteLink) {
                localStorage.setItem('currentInviteLink', inviteLink);
            }
            
            button.onclick = () => {
                this.openChatLink();
            };
        } else {
            button.classList.remove('active');
            button.disabled = true;
            buttonText.textContent = 'Ожидание тиммейта';
            tooltip.textContent = 'Ожидаем второго игрока';
            tooltip.classList.remove('active');
            
            button.onclick = null;
        }
    },
    
    openChatLink() {
        let chatLink = this.chatLink || localStorage.getItem('currentChatLink');
        let inviteLink = this.inviteLink || localStorage.getItem('currentInviteLink');
        
        console.log('🚀 openChatLink() вызван');
        console.log('📌 chatLink:', chatLink);
        console.log('📌 inviteLink:', inviteLink);
        
        if (chatLink) {
            console.log('✅ Открываем чат:', chatLink);
            
            const tg = window.Telegram?.WebApp;
            
            if (inviteLink) {
                if (tg?.openTelegramLink) {
                    console.log('📱 Открываем invite link через Telegram');
                    tg.openTelegramLink(inviteLink);
                    
                    setTimeout(() => {
                        console.log('⏱️ Открываем тему через 1.5 сек');
                        tg.openTelegramLink(chatLink);
                    }, 1500);
                } else {
                    window.open(inviteLink, '_blank');
                    setTimeout(() => {
                        window.open(chatLink, '_blank');
                    }, 1500);
                }
            } else {
                if (tg?.openTelegramLink) {
                    tg.openTelegramLink(chatLink);
                } else {
                    window.open(chatLink, '_blank');
                }
            }
        } else {
            console.error('❌ Ссылка не найдена');
            alert('Ссылка на чат не найдена');
        }
    },
    
    handleBothAccepted() {
        if (this.gameCreated) {
            console.log('⚠️ Игра уже создана, пропускаем');
            return;
        }
        
        console.log('🎉 Оба приняли! Запускаем визуальные изменения');
        
        this.gameCreated = true;
        
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.innerHTML = `
                <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="2"/>
                    <path d="M8 12L11 15L16 9" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Матч создан
            `;
        }
        
        setTimeout(() => {
            this.createGame();
        }, 500);
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
        
        document.getElementById('connectionScreen').classList.remove('active');
        if (window.App) {
            App.showScreen('mainScreen', true);
        } else {
            window.location.href = '/';
        }
    },
    
    createGame() {
        if (this.gameCreating) {
            console.log('⚠️ Игра уже создается, пропускаем');
            return;
        }
        
        console.log('Создаем игру для match_id:', this.currentMatchId);
        
        if (!this.currentMatchId) {
            console.log('Нет active match');
            this.exitSwipeMode('createGame: нет matchId');
            return;
        }
        
        this.gameCreating = true;
        
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
            
            if (data.status === 'ok' && data.chat_link) {
                this.updateChatButton(true, data.chat_link, data.invite_link);
                
                const statusEl = document.getElementById('connectionStatus');
                if (statusEl) {
                    statusEl.innerHTML = `
                        <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="2"/>
                            <path d="M8 12L11 15L16 9" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Чат готов
                    `;
                }
                
                console.log('✅ Кнопка чата активирована');
                if (data.invite_link) {
                    console.log('🔗 Invite link получен:', data.invite_link);
                }
            } else {
                console.error('createGame error: no chat_link', data);
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
            }, 3000);
        });
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
            
            const styleEl = document.getElementById('swipeStyle');
            if (styleEl) {
                const styleText = player.style === 'fan' ? 'Fan' : 'Tryhard';
                styleEl.textContent = styleText;
                styleEl.setAttribute('data-style', player.style || 'fan');
            }
            
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
            if (this.loading) this.loading.classList.add('active');
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
        this.gameCreating = false;
        this.chatLink = null;
        this.inviteLink = null;
    },
    
    connectionTimeout() {
        console.log('⏰ Время истекло');
        
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        const statusEl = document.getElementById('connectionStatus');
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
            this.exitSwipeMode('connectionTimeout');
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
        
        const statusEl = document.getElementById('connectionStatus');
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
            this.exitSwipeMode('handleRejection');
        }, 2000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Swipe: DOM загружен, версия с 30 секундами');
    window.Swipe = Swipe;
});

if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    console.log('Swipe экран уже активен, инициализируем');
    setTimeout(() => Swipe.init(), 100);
}
