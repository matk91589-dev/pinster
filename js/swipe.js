// ============================================
// СВАЙП-КАРТОЧКИ - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
    
    // ========== ФУНКЦИЯ ДЛЯ АВТО-ПОДГОНА РАЗМЕРА КАРТОЧКИ СВАЙПА ==========
    adjustCardSize() {
        if (!this.card || this.isConnectionMode) return;
        
        // Даем время на отрисовку
        setTimeout(() => {
            // Получаем высоту экрана
            const screenHeight = window.innerHeight;
            
            // Высота header
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 60;
            
            // Высота bottom-nav
            const bottomNav = document.querySelector('.bottom-nav');
            const navHeight = bottomNav ? bottomNav.offsetHeight : 60;
            
            // Высота заголовка свайпа
            const swipeHeader = document.querySelector('.swipe-header');
            const headerTitleHeight = swipeHeader ? swipeHeader.offsetHeight : 80;
            
            // Доступная высота для карточки (с учетом отступов)
            const availableHeight = screenHeight - headerHeight - navHeight - headerTitleHeight - 30;
            
            // Максимальная ширина (не больше 420px)
            const maxWidth = 420;
            
            // Рассчитываем идеальную ширину для 4:3
            let idealWidth = Math.min(maxWidth, window.innerWidth * 0.9);
            
            // Нужная высота для этой ширины
            const neededHeight = idealWidth * 1.33;
            
            console.log(`📐 Подгон карточки свайпа: экран=${screenHeight}, доступно=${availableHeight}, нужно=${neededHeight}, ширина=${idealWidth}`);
            
            // Если нужная высота больше доступной
            if (neededHeight > availableHeight) {
                // Уменьшаем ширину, чтобы вписаться, но не слишком сильно
                const newWidth = Math.max(availableHeight / 1.33, 320); // Минимум 320px
                
                if (newWidth <= maxWidth) {
                    this.card.style.width = newWidth + 'px';
                    this.card.style.maxWidth = newWidth + 'px';
                    this.card.style.margin = '0 auto';
                    console.log(`✅ Карточка свайпа уменьшена до ${newWidth}px`);
                } else {
                    this.card.style.width = maxWidth + 'px';
                    this.card.style.maxWidth = maxWidth + 'px';
                }
            } else {
                // Всё ок, ставим ширину на всю
                this.card.style.width = '100%';
                this.card.style.maxWidth = maxWidth + 'px';
                this.card.style.margin = '0 auto';
            }
            
            // Принудительно центрируем
            this.card.style.marginLeft = 'auto';
            this.card.style.marginRight = 'auto';
        }, 100);
    },
    
    // ========== ФУНКЦИЯ ДЛЯ АВТО-ПОДГОНА РАЗМЕРА КАРТОЧКИ ОЖИДАНИЯ ==========
    adjustConnectionCardSize() {
        const connectionCard = document.getElementById('connectionCard');
        if (!connectionCard || !this.isConnectionMode) return;
        
        setTimeout(() => {
            // Получаем высоту экрана
            const screenHeight = window.innerHeight;
            
            // Высота header
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 60;
            
            // Высота bottom-nav
            const bottomNav = document.querySelector('.bottom-nav');
            const navHeight = bottomNav ? bottomNav.offsetHeight : 60;
            
            // Высота заголовка свайпа (если есть)
            const swipeHeader = document.querySelector('.swipe-header');
            const headerTitleHeight = swipeHeader ? swipeHeader.offsetHeight : 80;
            
            // Доступная высота для карточки
            const availableHeight = screenHeight - headerHeight - navHeight - headerTitleHeight - 30;
            
            // Максимальная ширина
            const maxWidth = 420;
            
            // Рассчитываем идеальную ширину
            let idealWidth = Math.min(maxWidth, window.innerWidth * 0.9);
            
            // Нужная высота для 4:3
            const neededHeight = idealWidth * 1.33;
            
            console.log(`📐 Подгон карточки ожидания: доступно=${availableHeight}, нужно=${neededHeight}`);
            
            if (neededHeight > availableHeight) {
                const newWidth = Math.max(availableHeight / 1.33, 320);
                connectionCard.style.width = newWidth + 'px';
                connectionCard.style.maxWidth = newWidth + 'px';
                connectionCard.style.margin = '0 auto';
                console.log(`✅ Карточка ожидания уменьшена до ${newWidth}px`);
            } else {
                connectionCard.style.width = '100%';
                connectionCard.style.maxWidth = maxWidth + 'px';
                connectionCard.style.margin = '0 auto';
            }
        }, 100);
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
            console.log('✅ matchExpiresAt (timestamp):', this.matchExpiresAt);
        }
        
        // Считаем разницу между expires_at и текущим временем
        const clientNow = Date.now();
        let timeLeft = Math.floor((this.matchExpiresAt - clientNow) / 1000);
        
        console.log(`⏰ clientNow (timestamp): ${clientNow}`);
        console.log(`⏰ expiresAt (timestamp): ${this.matchExpiresAt}`);
        console.log(`⏰ Разница (мс): ${this.matchExpiresAt - clientNow}`);
        console.log(`⏰ Осталось секунд: ${timeLeft}`);
        
        // Если матч истек - выходим
        if (timeLeft <= 0) {
            console.warn('⚠️ Время на принятие истекло');
            this.exitSwipeMode('timeout_accept');
            return;
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
        
        // Таймер на принятие не может быть больше 30 секунд
        return Math.min(timeLeft, 30);
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
    
    // ========== ИСПРАВЛЕННЫЙ acceptPlayer ==========
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
        
        // ========== ШАГ 1: СРАЗУ ПОКАЗЫВАЕМ ЭКРАН ОЖИДАНИЯ ==========
        this.showConnectionMode();
        
        // ========== ШАГ 2: скрываем карточку ==========
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
            
            // ВСЕГДА запускаем polling, он сам разберется
            this.startMatchStatusPolling(this.currentMatchId);
        })
        .catch(error => {
            console.error('❌ Error:', error);
            setTimeout(() => {
                this.exitConnectionMode();
            }, 1000);
        });
    },
    
    // ========== ИСПРАВЛЕННЫЙ POLLING ==========
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
                console.log('⏰ Polling превысил лимит попыток');
                clearInterval(this.matchPolling);
                this.matchPolling = null;
                this.connectionTimeout();
                return;
            }
            
            try {
                const res = await fetch(`https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/status/${matchId}`);
                const data = await res.json();
                
                console.log(`📦 Polling status response (${attempts}):`, data);
                
                if (data.status === 'both_accepted') {
                    console.log('🎉 Оба приняли!');
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    
                    // Обновляем UI
                    this.updateConnectionUI('both_accepted');
                    
                    // Создаем игру
                    this.createGame();
                }
                
                if (data.status === 'rejected') {
                    console.log('❌ Матч отклонен');
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.handleRejection();
                }
                
                if (data.status === 'expired') {
                    console.log('⏰ Матч истек');
                    clearInterval(this.matchPolling);
                    this.matchPolling = null;
                    this.connectionTimeout();
                }
                
            } catch (error) {
                console.error('❌ Error in match polling:', error);
            }
        }, 1500);
    },
    
    // ========== НОВАЯ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ UI ==========
    updateConnectionUI(status) {
        console.log('🔄 Обновляем UI соединения, статус:', status);
        
        if (status === 'both_accepted') {
            // Обновляем статус
            const statusEl = document.getElementById('connectionStatus');
            if (statusEl) {
                statusEl.innerHTML = `
                    <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="2"/>
                        <path d="M8 12L11 15L16 9" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Матч создан!
                `;
            }
            
            // Подсвечиваем аватар тиммейта
            const teammateAvatar = document.querySelector('.teammate-avatar');
            if (teammateAvatar) {
                teammateAvatar.classList.add('connected');
            }
            
            // Линия полностью заполняется
            const connectionLine = document.querySelector('.connection-line');
            if (connectionLine) {
                connectionLine.classList.add('connected');
            }
            
            // Останавливаем таймер
            if (this.connectionTimer) {
                clearInterval(this.connectionTimer);
                this.connectionTimer = null;
            }
            
            // Меняем текст таймера
            const timerElement = document.getElementById('connectionTimer');
            if (timerElement) {
                timerElement.innerHTML = `<span class="timer-icon">✅</span> Готово`;
                timerElement.classList.remove('warning');
            }
        }
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
    
    // ========== ИСПРАВЛЕННЫЙ showConnectionMode ==========
    showConnectionMode() {
        console.log('🔄 Показываем экран соединения');
        this.isConnectionMode = true;
        
        // Скрываем элементы свайпа
        if (this.labelLeft) this.labelLeft.style.display = 'none';
        if (this.labelRight) this.labelRight.style.display = 'none';
        if (this.hint) this.hint.style.display = 'none';
        
        // Сбрасываем статус
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.innerHTML = `
                <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#FF5500" stroke-width="2" stroke-dasharray="2 2"/>
                    <path d="M12 6V12L16 14" stroke="#FF5500" stroke-width="2"/>
                </svg>
                Ожидание игрока...
            `;
        }
        
        // Сбрасываем кнопку чата
        this.updateChatButton(false);
        
        // Сбрасываем аватар тиммейта
        const teammateAvatar = document.querySelector('.teammate-avatar');
        if (teammateAvatar) {
            teammateAvatar.classList.remove('connected');
        }
        
        // Сбрасываем линию соединения
        const connectionLine = document.querySelector('.connection-line');
        if (connectionLine) {
            connectionLine.classList.remove('connected');
        }
        
        // Переключаем экраны
        document.getElementById('swipeScreen').classList.remove('active');
        document.getElementById('connectionScreen').classList.add('active');
        
        // Обновляем данные игрока
        document.getElementById('teammateNick').textContent = this.currentPlayer?.nick || 'Игрок';
        document.getElementById('teammateRating').innerHTML = `
            ${this.currentPlayer?.rating || '0'}
            <svg class="heart-icon-small" width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 21C12 21 4 14 4 8C4 5.79086 5.79086 4 8 4C9.65685 4 11 5.34315 11 7C11 5.34315 12.3431 4 14 4C16.2091 4 18 5.79086 18 8C18 14 12 21 12 21Z" stroke="#FF5500" stroke-width="2" fill="none"/>
            </svg>
        `;
        document.getElementById('connectionRank').textContent = this.currentPlayer?.rank || 'Нет ранга';
        document.getElementById('connectionAge').textContent = (this.currentPlayer?.age || '?') + ' лет';
        
        // Запускаем таймер
        this.startConnectionTimer();
        
        // ВАЖНО: Подгоняем размер карточки ожидания
        this.adjustConnectionCardSize();
    },
    
    // ========== ИСПРАВЛЕННЫЙ updateChatButton ==========
    updateChatButton(active, chatLink = null, inviteLink = null) {
        const button = document.getElementById('tgChatButton');
        const buttonText = document.getElementById('tgChatButtonText');
        const tooltip = document.getElementById('connectionTooltip');
        
        if (!button || !buttonText || !tooltip) return;
        
        button.classList.remove('active');
        button.disabled = true;
        button.onclick = null;
        
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
            buttonText.textContent = 'Ожидание тиммейта';
            tooltip.textContent = 'Ожидаем второго игрока';
            tooltip.classList.remove('active');
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
    
    // ========== ИСПРАВЛЕННЫЙ createGame ==========
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
                if (data.already_exists) {
                    console.log('ℹ️ Игра уже существовала, используем существующую');
                }
                
                this.updateChatButton(true, data.chat_link, data.invite_link);
                
                console.log('✅ Кнопка чата активирована');
                if (data.invite_link) {
                    console.log('🔗 Invite link получен:', data.invite_link);
                }
                
                this.gameCreated = true;
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
            
            // ВАЖНО: После отображения игрока подгоняем размер карточки
            this.adjustCardSize();
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
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Swipe: DOM загружен, финальная версия');
    window.Swipe = Swipe;
    
    // Добавляем слушатели для подгона размера
    window.addEventListener('resize', () => {
        if (Swipe.card && !Swipe.isConnectionMode) {
            Swipe.adjustCardSize();
        }
        if (Swipe.isConnectionMode) {
            Swipe.adjustConnectionCardSize();
        }
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (Swipe.card && !Swipe.isConnectionMode) {
                Swipe.adjustCardSize();
            }
            if (Swipe.isConnectionMode) {
                Swipe.adjustConnectionCardSize();
            }
        }, 200);
    });
});

if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    console.log('Swipe экран уже активен, инициализируем');
    setTimeout(() => Swipe.init(), 100);
}
