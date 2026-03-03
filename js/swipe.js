// ============================================
// СВАЙП-КАРТОЧКИ (только свайпы, без кнопок)
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
    playersQueue: [],
    mode: 'PREMIER',
    isInitialized: false,
    
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
    
    acceptPlayer() {
        console.log('✅ Принят игрок (свайп вправо):', this.currentPlayer);
        // Тут вызов API для принятия
        this.loadNextPlayer();
    },
    
    rejectPlayer() {
        console.log('❌ Пропущен игрок (свайп влево):', this.currentPlayer);
        // Тут вызов API для пропуска
        this.loadNextPlayer();
    },
    
    loadNextPlayer() {
        if (this.loading) this.loading.classList.add('active');
        
        // Имитация загрузки
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
    }
};

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Swipe: DOM загружен');
    // Не инициализируем сразу, ждем вызова из search.js
    window.Swipe = Swipe;
});

// Также можно инициализировать если экран уже активен
if (document.getElementById('swipeScreen')?.classList.contains('active')) {
    console.log('Swipe экран уже активен, инициализируем');
    setTimeout(() => Swipe.init(), 100);
}
