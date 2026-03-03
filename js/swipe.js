// ============================================
// СВАЙП-КАРТОЧКИ + ЭКРАН СОЕДИНЕНИЯ
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
    SWIPE_THRESHOLD: 0.35, // 35% ширины экрана
    MAX_ROTATE: 8, // максимальный угол поворота
    ANIMATION_DURATION: 250, // мс
    
    // Данные
    currentPlayer: null,
    currentMatchId: null,
    playersQueue: [],
    mode: 'PREMIER',
    isInitialized: false,
    connectionTimer: null,
    connectionEndTime: null,
    
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
        this.isDragging = true;
        this.startX = e.clientX;
        this.initialX = this.currentX || 0;
        
        this.card.style.transition = 'none';
        this.card.style.cursor = 'grabbing';
        this.card.classList.remove('right-swipe', 'left-swipe');
        
        e.preventDefault();
    },
    
    onDragMove(e) {
        if (!this.isDragging) return;
        
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
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.card.style.cursor = 'grab';
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.3, 1)`;
        
        const threshold = window.innerWidth * this.SWIPE_THRESHOLD;
        
        if (Math.abs(this.currentX) > threshold) {
            if (this.currentX > 0) {
                this.card.style.transform = `translateX(200%) rotate(15deg)`;
                setTimeout(() => this.acceptPlayer(), this.ANIMATION_DURATION);
            } else {
                this.card.style.transform = `translateX(-200%) rotate(-15deg)`;
                setTimeout(() => this.rejectPlayer(), this.ANIMATION_DURATION);
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
        
        // Сохраняем ID мэтча (в реальности придет с сервера)
        this.currentMatchId = Math.floor(100000 + Math.random() * 900000);
        
        // Показываем экран соединения
        this.showConnectionScreen();
        
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
            // В случае ошибки возвращаемся в свайп
            setTimeout(() => {
                App.showScreen('swipeScreen', true);
                this.loadNextPlayer();
            }, 1000);
        });
    },
    
    // Пропуск игрока (свайп влево)
    rejectPlayer() {
        console.log('❌ Пропущен игрок (свайп влево):', this.currentPlayer);
        
        // Просто загружаем следующего игрока
        this.loadNextPlayer();
    },
    
    // Показать экран соединения
    showConnectionScreen() {
        App.showScreen('connectionScreen', true);
        
        // Заполняем данные тиммейта
        document.getElementById('teammateNick').textContent = this.currentPlayer.nick;
        document.getElementById('teammateRating').textContent = this.currentPlayer.rating + ' ❤️';
        
        // Сбрасываем классы
        const screen = document.querySelector('.connection-screen');
        screen.classList.remove('both-accepted', 'rejected');
        
        // Обновляем статус
        document.getElementById('connectionStatus').textContent = 'Ожидаем ответа тиммейта...';
    },
    
    // Запуск таймера на экране соединения
    startConnectionTimer() {
        const timerElement = document.getElementById('connectionTimer');
        if (!timerElement) return;
        
        // 30 секунд от текущего момента
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
    
    // Таймаут на экране соединения
    connectionTimeout() {
        console.log('⏰ Время ожидания истекло');
        
        const screen = document.querySelector('.connection-screen');
        screen.classList.add('rejected');
        document.getElementById('connectionStatus').textContent = '⏰ Время ожидания истекло';
        
        setTimeout(() => {
            App.showScreen('swipeScreen', true);
            this.loadNextPlayer();
        }, 2000);
    },
    
    // Обработка случая, когда оба приняли
    handleBothAccepted() {
        console.log('✅ Оба приняли!');
        
        // Очищаем таймер
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        const screen = document.querySelector('.connection-screen');
        screen.classList.add('both-accepted');
        document.getElementById('connectionStatus').textContent = '✅ Тиммейт принял приглашение!';
        
        setTimeout(() => {
            this.createGame();
        }, 1500);
    },
    
    // Обработка отказа тиммейта
    handleRejection() {
        console.log('❌ Тиммейт отклонил');
        
        // Очищаем таймер
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
        
        const screen = document.querySelector('.connection-screen');
        screen.classList.add('rejected');
        document.getElementById('connectionStatus').textContent = '❌ Тиммейт отклонил приглашение';
        
        setTimeout(() => {
            App.showScreen('swipeScreen', true);
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
            
            // Возвращаемся на главный экран
            App.showScreen('mainScreen', true);
        })
        .catch(error => {
            console.error('Error creating game:', error);
            App.showScreen('mainScreen', true);
        });
    },
    
    loadNextPlayer() {
        if (this.loading) this.loading.classList.add('active');
        
        // Имитация загрузки с сервера
        setTimeout(() => {
            // В реальности здесь будет fetch запрос к /api/swipe/next
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
        
        // Если карточка уже есть, просто загружаем нового игрока
        if (this.card) {
            this.loadNextPlayer();
        } else {
            // Если нет - инициализируем
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

// Также можно инициализировать если экран уже активен
if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    console.log('Swipe экран уже активен, инициализируем');
    setTimeout(() => Swipe.init(), 100);
}
