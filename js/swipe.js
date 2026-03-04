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
    SWIPE_THRESHOLD: 0.25, // 25% ширины экрана
    MAX_ROTATE: 6, // УМЕНЬШИЛИ с 8 до 6 градусов
    ANIMATION_DURATION: 250,
    AUTO_COMPLETE_DURATION: 300,
    MIN_THRESHOLD_PX: 150, // минимальный порог в пикселях
    
    // Данные
    currentPlayer: null,
    currentMatchId: null,
    playersQueue: [],
    mode: 'PREMIER',
    isInitialized: false,
    connectionTimer: null,
    connectionEndTime: null,
    isConnectionMode: false,
    
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
        
        // Устанавливаем обработчики
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
    
    // Унифицированное получение координат для ПК и мобильных
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
        
        const clientX = this.getClientX(e);
        if (!clientX) return;
        
        const deltaX = clientX - this.startX;
        this.currentX = this.initialX + deltaX;
        
        const maxDistance = window.innerWidth * 0.5;
        this.currentX = Math.max(-maxDistance, Math.min(maxDistance, this.currentX));
        
        // Динамический порог
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
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
        
        const threshold = Math.min(window.innerWidth * this.SWIPE_THRESHOLD, this.MIN_THRESHOLD_PX);
        
        if (Math.abs(this.currentX) > threshold) {
            // АВТОДОВОДКА - УМЕНЬШИЛИ УГОЛ с 12 до 8 градусов
            this.autoComplete = true;
            
            if (this.currentX > 0) {
                this.card.style.transform = `translateX(200%) rotate(8deg) scale(1)`;
                setTimeout(() => {
                    this.autoComplete = false;
                    this.acceptPlayer();
                }, this.ANIMATION_DURATION);
            } else {
                this.card.style.transform = `translateX(-200%) rotate(-8deg) scale(1)`;
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
        
        this.currentMatchId = Math.floor(100000 + Math.random() * 900000);
        
        // Плавное исчезновение старого контента
        this.card.style.opacity = '0';
        
        setTimeout(() => {
            this.showConnectionMode();
        }, 200);
        
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
                this.handleBothAccepted();
            } else if (data.status === 'rejected') {
                this.handleRejection();
            } else {
                console.log('Ожидаем ответа');
                this.startConnectionTimer();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setTimeout(() => {
                this.exitConnectionMode();
                this.loadNextPlayer();
            }, 1000);
        });
    },
    
    rejectPlayer() {
        console.log('❌ Пропущен игрок:', this.currentPlayer);
        this.loadNextPlayer();
    },
    
    showConnectionMode() {
        this.isConnectionMode = true;
        
        // Прячем лейблы
        if (this.labelLeft) this.labelLeft.style.display = 'none';
        if (this.labelRight) this.labelRight.style.display = 'none';
        if (this.hint) this.hint.style.display = 'none';
        
        // Возвращаем карточку в центр
        this.card.style.transition = 'none';
        this.card.style.transform = 'translateX(0) rotate(0) scale(1)';
        this.card.style.opacity = '1';
        
        // Меняем содержимое с анимацией появления
        this.card.innerHTML = this.getConnectionHTML();
        
        // Анимация появления аватарок
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
                    <span class="teammate-nick" id="cardTeammateNick">${this.currentPlayer.nick}</span>
                    <span class="teammate-rating" id="cardTeammateRating">
                        ${this.currentPlayer.rating}
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
        document.getElementById('cardTeammateNick').textContent = this.currentPlayer.nick;
        document.getElementById('cardTeammateRating').innerHTML = `
            ${this.currentPlayer.rating}
            <svg class="heart-icon-small" width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 21C12 21 4 14 4 8C4 5.79086 5.79086 4 8 4C9.65685 4 11 5.34315 11 7C11 5.34315 12.3431 4 14 4C16.2091 4 18 5.79086 18 8C18 14 12 21 12 21Z" stroke="#FF5500" stroke-width="2" fill="none"/>
            </svg>
        `;
        
        this.card.classList.remove('both-accepted', 'rejected', 'right-swipe', 'left-swipe');
    },
    
    exitConnectionMode() {
        this.isConnectionMode = false;
        
        if (this.labelLeft) this.labelLeft.style.display = 'block';
        if (this.labelRight) this.labelRight.style.display = 'block';
        if (this.hint) this.hint.style.display = 'block';
        
        this.card.style.opacity = '0';
        
        setTimeout(() => {
            this.card.innerHTML = this.getOriginalCardHTML();
            this.card.style.opacity = '1';
        }, 200);
    },
    
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
    
    startConnectionTimer() {
        const timerElement = document.getElementById('cardConnectionTimer');
        if (!timerElement) return;
        
        this.connectionEndTime = Date.now() + 30000;
        
        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((this.connectionEndTime - now) / 1000));
            
            if (diff <= 0) {
                timerElement.innerHTML = `
                    <svg class="timer-icon" width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="#B00000" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12" y2="12" stroke="#B00000" stroke-width="2"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="#B00000" stroke-width="2"/>
                    </svg>
                    <span>0с</span>
                `;
                clearInterval(this.connectionTimer);
                this.connectionTimeout();
                return;
            }
            
            timerElement.innerHTML = `
                <svg class="timer-icon" width="16" height="16" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#FF5500" stroke-width="2"/>
                    <polyline points="12 6 12 12 16 14" stroke="#FF5500" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>${diff}с</span>
            `;
        };
        
        updateTimer();
        this.connectionTimer = setInterval(updateTimer, 1000);
    },
    
    connectionTimeout() {
        console.log('⏰ Время истекло');
        
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
            this.exitConnectionMode();
            this.loadNextPlayer();
        }, 2000);
    },
    
    handleBothAccepted() {
        console.log('✅ Оба приняли!');
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        this.card.classList.add('both-accepted');
        const statusEl = document.getElementById('cardConnectionStatus');
        if (statusEl) {
            statusEl.innerHTML = `
                <svg class="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#4CAF50" stroke-width="2"/>
                    <path d="M8 12L11 15L16 9" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                </svg>
                ✅ Тиммейт принял приглашение!
            `;
        }
        
        setTimeout(() => {
            this.createGame();
        }, 1500);
    },
    
    handleRejection() {
        console.log('❌ Тиммейт отклонил');
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
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
            this.exitConnectionMode();
            this.loadNextPlayer();
        }, 2000);
    },
    
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('Swipe: DOM загружен');
    window.Swipe = Swipe;
});

if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    console.log('Swipe экран уже активен, инициализируем');
    setTimeout(() => Swipe.init(), 100);
}
