// ============================================
// СВАЙП-КАРТОЧКИ (Tinder-like для тиммейтов)
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
    MAX_ROTATE: 8, // максимальный угол поворота в градусах
    ANIMATION_DURATION: 250, // мс
    
    // Данные
    currentPlayer: null,
    playersQueue: [],
    mode: 'PREMIER', // текущий режим (FACEIT/PREMIER/etc)
    
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
        
        // Показываем подсказку (только один раз)
        this.showHintOnce();
        
        // Загружаем первого игрока
        this.loadNextPlayer();
        
        // Устанавливаем обработчики событий
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Pointer events (работает и на ПК, и на мобильных)
        this.card.addEventListener('pointerdown', this.onDragStart.bind(this));
        this.card.addEventListener('pointermove', this.onDragMove.bind(this));
        this.card.addEventListener('pointerup', this.onDragEnd.bind(this));
        this.card.addEventListener('pointercancel', this.onDragEnd.bind(this));
        
        // Запрещаем стандартный drag изображений
        this.card.addEventListener('dragstart', (e) => e.preventDefault());
    },
    
    onDragStart(e) {
        // Запоминаем начальную позицию
        this.isDragging = true;
        this.startX = e.clientX;
        this.initialX = this.currentX || 0;
        
        // Убираем transition во время драга
        this.card.style.transition = 'none';
        this.card.style.cursor = 'grabbing';
        
        // Убираем классы фона
        this.card.classList.remove('right-swipe', 'left-swipe');
        
        // Предотвращаем скролл страницы
        e.preventDefault();
    },
    
    onDragMove(e) {
        if (!this.isDragging) return;
        
        // Предотвращаем скролл
        e.preventDefault();
        
        // Вычисляем смещение
        const deltaX = e.clientX - this.startX;
        this.currentX = this.initialX + deltaX;
        
        // Ограничиваем смещение (чтобы карточка не улетала слишком далеко)
        const maxDistance = window.innerWidth * 0.5;
        this.currentX = Math.max(-maxDistance, Math.min(maxDistance, this.currentX));
        
        // Вычисляем прогресс (0-1)
        const progress = Math.min(Math.abs(this.currentX) / (window.innerWidth * this.SWIPE_THRESHOLD), 1);
        
        // Поворот
        const rotate = (this.currentX / maxDistance) * this.MAX_ROTATE;
        
        // Применяем трансформацию
        this.card.style.transform = `translateX(${this.currentX}px) rotate(${rotate}deg)`;
        
        // Меняем фон в зависимости от направления
        if (this.currentX > 0) {
            // Свайп вправо
            this.card.classList.add('right-swipe');
            this.card.classList.remove('left-swipe');
            
            // Показываем лейбл INVITE
            if (this.labelRight) {
                this.labelRight.style.opacity = progress * 0.9;
            }
            if (this.labelLeft) {
                this.labelLeft.style.opacity = 0;
            }
        } else if (this.currentX < 0) {
            // Свайп влево
            this.card.classList.add('left-swipe');
            this.card.classList.remove('right-swipe');
            
            // Показываем лейбл SKIP
            if (this.labelLeft) {
                this.labelLeft.style.opacity = progress * 0.9;
            }
            if (this.labelRight) {
                this.labelRight.style.opacity = 0;
            }
        }
    },
    
    onDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.card.style.cursor = 'grab';
        
        // Возвращаем transition для плавной анимации
        this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms cubic-bezier(0.2, 0.9, 0.3, 1)`;
        
        // Проверяем, превышен ли порог свайпа
        const threshold = window.innerWidth * this.SWIPE_THRESHOLD;
        
        if (Math.abs(this.currentX) > threshold) {
            // Свайп за порог - убираем карточку
            if (this.currentX > 0) {
                // Свайп вправо - INVITE
                this.card.style.transform = `translateX(200%) rotate(15deg)`;
                setTimeout(() => this.acceptPlayer(), this.ANIMATION_DURATION);
            } else {
                // Свайп влево - SKIP
                this.card.style.transform = `translateX(-200%) rotate(-15deg)`;
                setTimeout(() => this.rejectPlayer(), this.ANIMATION_DURATION);
            }
        } else {
            // Возвращаем в центр
            this.resetCardPosition();
        }
    },
    
    resetCardPosition() {
        this.card.style.transform = 'translateX(0) rotate(0)';
        this.currentX = 0;
        
        // Прячем лейблы
        if (this.labelLeft) this.labelLeft.style.opacity = 0;
        if (this.labelRight) this.labelRight.style.opacity = 0;
        
        // Убираем классы фона
        this.card.classList.remove('right-swipe', 'left-swipe');
        
        // Через время убираем transition для следующего драга
        setTimeout(() => {
            this.card.style.transition = 'none';
        }, this.ANIMATION_DURATION);
    },
    
    acceptPlayer() {
        console.log('✅ Принят игрок:', this.currentPlayer);
        
        // Здесь будет вызов API для принятия
        // fetch('/api/match/respond', {...})
        
        // Загружаем следующего игрока
        this.loadNextPlayer();
    },
    
    rejectPlayer() {
        console.log('❌ Пропущен игрок:', this.currentPlayer);
        
        // Здесь будет вызов API для пропуска
        // fetch('/api/match/skip', {...})
        
        // Загружаем следующего игрока
        this.loadNextPlayer();
    },
    
    loadNextPlayer() {
        // Показываем загрузку
        if (this.loading) this.loading.classList.add('active');
        
        // Имитация загрузки с сервера
        setTimeout(() => {
            // В реальности здесь будет fetch запрос
            // fetch('/api/players/next')
            
            // Тестовые данные
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
            
            // Скрываем загрузку
            if (this.loading) this.loading.classList.remove('active');
        }, 500);
    },
    
    showPlayer(player) {
        this.currentPlayer = player;
        
        // Сбрасываем позицию карточки
        this.resetCardPosition();
        
        // Заполняем данные
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
        
        // Показываем/скрываем ссылки в зависимости от режима
        this.updateLinksVisibility();
    },
    
    updateLinksVisibility() {
        const steamContainer = document.querySelector('.swipe-steam-container');
        const faceitContainer = document.querySelector('.swipe-faceit-container');
        
        if (this.mode === 'FACEIT') {
            // В FACEIT показываем только Faceit ссылку
            if (steamContainer) steamContainer.style.display = 'none';
            if (faceitContainer) faceitContainer.style.display = 'block';
        } else {
            // В остальных режимах показываем только Steam ссылку
            if (steamContainer) steamContainer.style.display = 'block';
            if (faceitContainer) faceitContainer.style.display = 'none';
        }
    },
    
    showHintOnce() {
        if (!this.hint) return;
        
        // Проверяем, показывали ли подсказку
        const hintShown = localStorage.getItem('swipeHintShown');
        
        if (!hintShown) {
            // Показываем подсказку
            this.hint.classList.remove('fade-out');
            
            // Через 2 секунды прячем
            setTimeout(() => {
                this.hint.classList.add('fade-out');
            }, 2000);
            
            // Запоминаем, что показали
            localStorage.setItem('swipeHintShown', 'true');
        } else {
            // Сразу прячем
            this.hint.classList.add('fade-out');
        }
    },
    
    // Метод для вызова из других модулей (например, после поиска)
    startSwipe(mode) {
        this.mode = mode || 'PREMIER';
        this.playersQueue = [];
        this.loadNextPlayer();
    },
    
    // Очистка при выходе
    destroy() {
        // Убираем обработчики
        this.card.removeEventListener('pointerdown', this.onDragStart);
        this.card.removeEventListener('pointermove', this.onDragMove);
        this.card.removeEventListener('pointerup', this.onDragEnd);
        this.card.removeEventListener('pointercancel', this.onDragEnd);
    }
};

// Инициализация при загрузке страницы (опционально)
document.addEventListener('DOMContentLoaded', () => {
    // Можно не инициализировать сразу, а вызывать из search.js
    window.Swipe = Swipe;
});
