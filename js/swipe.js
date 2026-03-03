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
    
    // Переменные для drag
    isDragging: false,
    startX: 0,
    currentX: 0,
    initialX: 0,
    
    // Константы
    SWIPE_THRESHOLD: 0.3, // 30% ширины экрана (меньше для удобства)
    MAX_ROTATE: 8,
    ANIMATION_DURATION: 250,
    AUTO_COMPLETE_DURATION: 300,
    
    // Данные
    currentPlayer: null,
    currentMatchId: null,
    playersQueue: [],
    mode: 'PREMIER',
    isInitialized: false,
    connectionTimer: null,
    connectionEndTime: null,
    isConnectionMode: false, // режим соединения (карточка трансформирована)
    
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
        
        // Показываем подсказку
        this.showHintOnce();
        
        // Загружаем первого игрока
        this.loadNextPlayer();
        
        // Устанавливаем обработчики, если еще не установлены
        if (!this.isInitialized) {
            this.setupEventListeners();
            this.isInitialized = true;
        }
        
        console.log('✅ Swipe инициализирован');
    },
    
    setupEventListeners() {
        this.card.addEventListener('pointerdown', this.onDragStart.bind(this));
        this.card.addEventListener('pointermove', this.onDragMove.bind(this));
        this.card.addEventListener('pointerup', this.onDragEnd.bind(this));
        this.card.addEventListener('pointercancel', this.onDragEnd.bind(this));
        this.card.addEventListener('dragstart', (e) => e.preventDefault());
        console.log('✅ Обработчики событий установлены');
    },
    
    onDragStart(e) {
        if (this.isConnectionMode) return; // Не даем свайпать в режиме соединения
        
        this.isDragging = true;
        this.startX = e.clientX;
        this.initialX = this.currentX || 0;
        
        this.card.style.transition = 'none';
        this.card.style.cursor = 'grabbing';
        this.card.classList.remove('right-swipe', 'left-swipe');
        
        e.preventDefault();
    },
    
    onDragMove(e) {
        if (!this.isDragging || this.isConnectionMode) return;
        
        e.preventDefault();
        
        const deltaX = e.clientX - this.startX;
        this.currentX = this.initialX + deltaX;
        
        const maxDistance = window.innerWidth * 0.5;
        this.currentX = Math.max(-maxDistance, Math.min(maxDistance, this.currentX));
        
        const progress = Math.min(Math.abs(this.currentX) / (window.innerWidth * this.SWIPE_THRESHOLD), 1);
        const rotate = (this.currentX / maxDistance) * this.MAX_ROTATE;
        
        this.card.style.transform = `translateX(${this.currentX}px) rotate(${rotate}deg)`;
        
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
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.3, 1)`;
        
        const threshold = window.innerWidth * this.SWIPE_THRESHOLD;
        
        if (Math.abs(this.currentX) > threshold) {
            // АВТОДОВОДКА - карточка сама улетает
            this.autoComplete = true;
            
            if (this.currentX > 0) {
                this.card.style.transform = `translateX(200%) rotate(15deg)`;
                setTimeout(() => {
                    this.autoComplete = false;
                    this.acceptPlayer();
                }, this.ANIMATION_DURATION);
            } else {
                this.card.style.transform = `translateX(-200%) rotate(-15deg)`;
                setTimeout(() => {
                    this.autoComplete = false;
                    this.rejectPlayer();
                }, this.ANIMATION_DURATION);
            }
        } else {
            this.resetCardPosition();
        }
    },
    
    resetCardPosition() {
        this.card.style.transform = 'translateX(0) rotate(0)';
        this.currentX = 0;
        
        if (this.labelLeft) this.labelLeft.style.opacity = 0;
        if (this.labelRight) this.labelRight.style.opacity = 0;
        
        this.card.classList.remove('right-swipe', 'left-swipe');
        
        setTimeout(() => {
            this.card.style.transition = 'none';
        }, this.ANIMATION_DURATION);
    },
    
    // Принятие игрока (свайп вправо)
    acceptPlayer() {
        console.log('✅ Принят игрок (свайп вправо):', this.currentPlayer);
        
        // Сохраняем ID мэтча
        this.currentMatchId = Math.floor(100000 + Math.random() * 900000);
        
        // Трансформируем карточку в режим соединения
        this.showConnectionMode();
        
        // Отправляем запрос на сервер
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                match_id: this.currentMatchId,
                response: 'accept'
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Accept response:', data);
            
            if (data.both_accepted) {
                // Оба приняли
                this.handleBothAccepted();
            } else if (data.status === 'rejected') {
                // Тиммейт отклонил
                this.handleRejection();
            } else {
                // Ждем ответа
                console.log('Ожидаем ответа тиммейта');
                this.startConnectionTimer();
            }
        })
        .catch(error => {
            console.error('Error accepting match:', error);
            setTimeout(() => {
                this.exitConnectionMode();
                this.loadNextPlayer();
            }, 1000);
        });
    },
    
    // Пропуск игрока (свайп влево)
    rejectPlayer() {
        console.log('❌ Пропущен игрок (свайп влево):', this.currentPlayer);
        this.loadNextPlayer();
    },
    
    // Трансформация карточки в режим соединения
    showConnectionMode() {
        this.isConnectionMode = true;
        
        // Прячем лейблы свайпа
        if (this.labelLeft) this.labelLeft.style.display = 'none';
        if (this.labelRight) this.labelRight.style.display = 'none';
        
        // Прячем подсказку
        if (this.hint) this.hint.style.display = 'none';
        
        // Возвращаем карточку в центр с анимацией
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms ease`;
        this.card.style.transform = 'translateX(0) rotate(0)';
        
        // Меняем содержимое карточки на режим соединения
        setTimeout(() => {
            this.card.innerHTML = this.getConnectionHTML();
            this.setupConnectionMode();
        }, this.ANIMATION_DURATION);
    },
    
    // HTML для режима соединения
    getConnectionHTML() {
        return `
            <div class="swipe-card-content connection-mode">
                <!-- Контейнер с аватарками -->
                <div class="connection-avatars">
                    <!-- Твоя аватарка (яркая) -->
                    <div class="connection-avatar self-avatar">
                        <div class="tg-avatar-svg">
                            <svg viewBox="0 0 24 24" width="35" height="35">
                                <circle cx="12" cy="8" r="4" fill="#FF5500" stroke="#FF5500" stroke-width="2"/>
                                <path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" fill="#FF5500" stroke="#FF5500" stroke-width="2"/>
                            </svg>
                        </div>
                    </div>

                    <!-- Линия соединения -->
                    <div class="connection-line" id="cardConnectionLine">
                        <div class="line-pulse"></div>
                    </div>

                    <!-- Аватарка тиммейта -->
                    <div class="connection-avatar teammate-avatar" id="cardTeammateAvatar">
                        <div class="tg-avatar-svg">
                            <svg viewBox="0 0 24 24" width="30" height="30">
                                <circle cx="12" cy="8" r="4" stroke="#9BA1B0" stroke-width="2" fill="none"/>
                                <path d="M6 16c0-2.5 3-3 6-3s6 .5 6 3" stroke="#9BA1B0" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Статус -->
                <div class="connection-status" id="cardConnectionStatus">
                    Ожидаем ответа тиммейта...
                </div>

                <!-- Информация о тиммейте -->
                <div class="teammate-info">
                    <span class="teammate-nick" id="cardTeammateNick">${this.currentPlayer.nick}</span>
                    <span class="teammate-rating" id="cardTeammateRating">${this.currentPlayer.rating} ❤️</span>
                </div>

                <!-- Таймер -->
                <div class="connection-timer" id="cardConnectionTimer">⏳ 30с</div>
            </div>
        `;
    },
    
    // Настройка режима соединения
    setupConnectionMode() {
        // Заполняем данные
        document.getElementById('cardTeammateNick').textContent = this.currentPlayer.nick;
        document.getElementById('cardTeammateRating').textContent = this.currentPlayer.rating + ' ❤️';
        
        // Сбрасываем классы
        this.card.classList.remove('both-accepted', 'rejected', 'right-swipe', 'left-swipe');
        
        // Обновляем статус
        document.getElementById('cardConnectionStatus').textContent = 'Ожидаем ответа тиммейта...';
    },
    
    // Выход из режима соединения
    exitConnectionMode() {
        this.isConnectionMode = false;
        
        // Возвращаем лейблы
        if (this.labelLeft) this.labelLeft.style.display = 'block';
        if (this.labelRight) this.labelRight.style.display = 'block';
        if (this.hint) this.hint.style.display = 'block';
        
        // Восстанавливаем исходный HTML карточки
        this.card.innerHTML = this.getOriginalCardHTML();
    },
    
    // Оригинальный HTML карточки
    getOriginalCardHTML() {
        return `
            <div class="swipe-label swipe-label-left" id="swipeLabelLeft">SKIP</div>
            <div class="swipe-label swipe-label-right" id="swipeLabelRight">INVITE</div>
            
            <div class="swipe-card-content">
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
                        <div class="swipe-player-id" id="swipePlayerId">${this.currentPlayer.player_id}</div>
                        <div class="swipe-player-nick" id="swipePlayerNick">${this.currentPlayer.nick}</div>
                    </div>
                    
                    <div class="swipe-rating-block">
                        <span class="swipe-rating-value" id="swipeRatingValue">${this.currentPlayer.rating}</span>
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
                        <div class="swipe-stat-value" id="swipeRank">${this.currentPlayer.rank}</div>
                    </div>
                    <div class="swipe-stat-item">
                        <div class="swipe-stat-label">ВОЗРАСТ</div>
                        <div class="swipe-stat-value" id="swipeAge">${this.currentPlayer.age} лет</div>
                    </div>
                </div>

                <div class="swipe-steam-container">
                    <div class="swipe-link-label">Ссылка Steam</div>
                    <div class="swipe-link-value" id="swipeSteamLink">${this.currentPlayer.steam_link}</div>
                </div>

                <div class="swipe-faceit-container">
                    <div class="swipe-link-label">Ссылка Faceit</div>
                    <div class="swipe-link-value" id="swipeFaceitLink">${this.currentPlayer.faceit_link}</div>
                </div>

                <div class="swipe-comment">
                    <div class="swipe-comment-label">Комментарий</div>
                    <div class="swipe-comment-text" id="swipeComment">${this.currentPlayer.comment}</div>
                </div>
            </div>
        `;
    },
    
    // Запуск таймера в карточке
    startConnectionTimer() {
        const timerElement = document.getElementById('cardConnectionTimer');
        if (!timerElement) return;
        
        this.connectionEndTime = Date.now() + 30000;
        
        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((this.connectionEndTime - now) / 1000));
            
            if (diff <= 0) {
                timerElement.textContent = '⏳ 0с';
                clearInterval(this.connectionTimer);
                this.connectionTimeout();
                return;
            }
            
            timerElement.textContent = `⏳ ${diff}с`;
        };
        
        updateTimer();
        this.connectionTimer = setInterval(updateTimer, 1000);
    },
    
    // Таймаут в карточке
    connectionTimeout() {
        console.log('⏰ Время ожидания истекло');
        
        this.card.classList.add('rejected');
        document.getElementById('cardConnectionStatus').textContent = '⏰ Время ожидания истекло';
        
        setTimeout(() => {
            this.exitConnectionMode();
            this.loadNextPlayer();
        }, 2000);
    },
    
    // Обработка случая, когда оба приняли
    handleBothAccepted() {
        console.log('✅ Оба приняли!');
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        this.card.classList.add('both-accepted');
        document.getElementById('cardConnectionStatus').textContent = '✅ Тиммейт принял приглашение!';
        
        setTimeout(() => {
            this.createGame();
        }, 1500);
    },
    
    // Обработка отказа тиммейта
    handleRejection() {
        console.log('❌ Тиммейт отклонил');
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        this.card.classList.add('rejected');
        document.getElementById('cardConnectionStatus').textContent = '❌ Тиммейт отклонил приглашение';
        
        setTimeout(() => {
            this.exitConnectionMode();
            this.loadNextPlayer();
        }, 2000);
    },
    
    // Создание игры
    createGame() {
        console.log('Создаем игру для match_id:', this.currentMatchId);
        
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
            
            this.exitConnectionMode();
            App.showScreen('mainScreen', true);
        })
        .catch(error => {
            console.error('Error creating game:', error);
            this.exitConnectionMode();
            App.showScreen('mainScreen', true);
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
            if (playerIdEl) playerIdEl.textContent = player.player_id;
            
            const playerNickEl = document.getElementById('swipePlayerNick');
            if (playerNickEl) playerNickEl.textContent = player.nick;
            
            const ratingValueEl = document.getElementById('swipeRatingValue');
            if (ratingValueEl) ratingValueEl.textContent = player.rating;
            
            const rankEl = document.getElementById('swipeRank');
            if (rankEl) rankEl.textContent = player.rank;
            
            const ageEl = document.getElementById('swipeAge');
            if (ageEl) ageEl.textContent = player.age + ' лет';
            
            const steamLinkEl = document.getElementById('swipeSteamLink');
            if (steamLinkEl) steamLinkEl.textContent = player.steam_link;
            
            const faceitLinkEl = document.getElementById('swipeFaceitLink');
            if (faceitLinkEl) faceitLinkEl.textContent = player.faceit_link;
            
            const commentEl = document.getElementById('swipeComment');
            if (commentEl) commentEl.textContent = player.comment;
            
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
            }, 2000);
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
        
        if (this.card) {
            this.loadNextPlayer();
        } else {
            this.init(mode);
        }
    },
    
    destroy() {
        if (this.card) {
            this.card.removeEventListener('pointerdown', this.onDragStart);
            this.card.removeEventListener('pointermove', this.onDragMove);
            this.card.removeEventListener('pointerup', this.onDragEnd);
            this.card.removeEventListener('pointercancel', this.onDragEnd);
        }
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
    }
};

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Swipe: DOM загружен');
    window.Swipe = Swipe;
});

if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    console.log('Swipe экран уже активен, инициализируем');
    setTimeout(() => Swipe.init(), 100);
}
