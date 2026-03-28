// ============================================
// СВАЙП-КАРТОЧКИ - С ДОБАВЛЕНИЕМ В ДРУЗЬЯ
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
    
    init(mode) {
        console.log('🔥 Swipe.init() with mode:', mode);
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
    
    // Просто центрирование — все размеры задаёт CSS
    adjustCardSize() {
        if (!this.card || this.isConnectionMode) return;
        this.card.style.marginLeft = 'auto';
        this.card.style.marginRight = 'auto';
    },
    
    adjustConnectionCardSize() {
        const connectionCard = document.getElementById('connectionCard');
        if (!connectionCard || !this.isConnectionMode) return;
        connectionCard.style.marginLeft = 'auto';
        connectionCard.style.marginRight = 'auto';
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
        
        // Центрируем карточку
        setTimeout(() => this.adjustCardSize(), 50);
        
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
        
        // Touch события для мобильных устройств
        this.card.addEventListener('touchstart', this.onDragStartBound, { passive: false });
        this.card.addEventListener('touchmove', this.onDragMoveBound, { passive: false });
        this.card.addEventListener('touchend', this.onDragEndBound);
        this.card.addEventListener('touchcancel', this.onDragEndBound);
        
        // Pointer события для десктопа
        this.card.addEventListener('pointerdown', this.onDragStartBound);
        this.card.addEventListener('pointermove', this.onDragMoveBound);
        this.card.addEventListener('pointerup', this.onDragEndBound);
        this.card.addEventListener('pointercancel', this.onDragEndBound);
        
        // Блокируем dragstart
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
        if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
        return null;
    },
    
    onDragStart(e) {
        if (this.isConnectionMode) return;
        
        // Проверяем, что клик именно по карточке или её содержимому
        const target = e.target;
        if (!this.card.contains(target)) return;
        
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
        if (clientX === null) return;
        
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
            if (window.Settings && window.Settings.swipe) window.Settings.swipe();
            
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
        const connectionLine = document.querySelector('.connection-line');
        const teammateAvatar = document.querySelector('.teammate-avatar');
        const connectionTimer = document.getElementById('connectionTimer');
        
        if (status === 'both_accepted') {
            if (statusEl) {
                statusEl.innerHTML = 'Матч создан';
                statusEl.classList.add('active');
            }
            if (teammateAvatar) teammateAvatar.classList.add('connected');
            if (connectionLine) connectionLine.classList.add('connected');
            if (connectionTimer) connectionTimer.classList.remove('warning');
            if (window.Settings && window.Settings.success) window.Settings.success();
        } else if (status === 'rejected') {
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
        
        if (this.labelLeft) this.labelLeft.style.display = 'none';
        if (this.labelRight) this.labelRight.style.display = 'none';
        if (this.hint) this.hint.style.display = 'none';
        
        document.getElementById('swipeScreen').classList.remove('active');
        document.getElementById('connectionScreen').classList.add('active');
        
        document.getElementById('teammateNick').textContent = this.currentPlayer?.nick || '';
        
        const teammateInfo = document.querySelector('.teammate-info');
        if (teammateInfo && this.currentPlayer) {
            teammateInfo.setAttribute('data-player-id', this.currentPlayer.player_id || '');
        }
        
        const teammateAvatar = document.querySelector('.teammate-avatar .tg-avatar-svg');
        if (teammateAvatar && this.currentPlayer?.avatar) {
            teammateAvatar.innerHTML = `<img src="${this.currentPlayer.avatar}" class="teammate-avatar-img" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
        
        const selfAvatar = document.querySelector('.self-avatar .tg-avatar-svg');
        if (selfAvatar) {
            const myAvatar = localStorage.getItem('pingster_avatar') || (window.Profile && Profile.savedAvatarUrl);
            if (myAvatar) {
                selfAvatar.innerHTML = `<img src="${myAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }
        }
        
        document.querySelector('.teammate-avatar')?.classList.remove('connected');
        document.querySelector('.connection-line')?.classList.remove('connected');
        
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.innerHTML = 'Ожидание тиммейта';
            statusEl.classList.remove('active');
            statusEl.style.color = '';
        }
        
        this.updateChatButton(false);
        this.startConnectionTimer();
        setTimeout(() => this.adjustConnectionCardSize(), 50);
    },
    
    updateChatButton(active, chatLink = null, inviteLink = null) {
        const button = document.getElementById('tgChatButton');
        const buttonText = document.getElementById('tgChatButtonText');
        
        if (!button || !buttonText) return;
        
        button.style.display = 'flex';
        buttonText.textContent = 'Перейти в чат';
        
        if (active && chatLink) {
            button.classList.remove('disabled');
            button.classList.add('active');
            button.disabled = false;
            
            this.chatLink = chatLink;
            this.inviteLink = inviteLink;
            localStorage.setItem('currentChatLink', chatLink);
            if (inviteLink) localStorage.setItem('currentInviteLink', inviteLink);
            
            button.onclick = () => this.openChatLink();
        } else {
            button.classList.remove('active');
            button.classList.add('disabled');
            button.disabled = true;
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
                if (tg?.openTelegramLink) tg.openTelegramLink(chatLink);
                else window.open(chatLink, '_blank');
            }
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
            
            this.updateLinksVisibility();
            setTimeout(() => this.adjustCardSize(), 50);
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
            this.card.removeEventListener('pointerdown', this.onDragStartBound);
            this.card.removeEventListener('pointermove', this.onDragMoveBound);
            this.card.removeEventListener('pointerup', this.onDragEndBound);
            this.card.removeEventListener('pointercancel', this.onDragEndBound);
        }
        
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        this.gameCreated = false;
        this.gameCreating = false;
        this.chatLink = null;
        this.inviteLink = null;
    },
    
    connectionTimeout() {
        if (this.matchPolling) {
            clearInterval(this.matchPolling);
            this.matchPolling = null;
        }
        
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.innerHTML = 'Время истекло';
            statusEl.style.color = '#FF3B30';
        }
        
        setTimeout(() => this.exitSwipeMode('connectionTimeout'), 2000);
    },
    
    handleRejection() {
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.matchPolling) clearInterval(this.matchPolling);
        
        const statusEl = document.getElementById('connectionStatus');
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
